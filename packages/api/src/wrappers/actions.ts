import { z, ZodType } from 'zod';
import { ApiResponse } from '../types';
import { execute } from './common';

export function wrapAction<InputType, OutputType>(
  inputSchema: ZodType<InputType>,
  outputSchema: ZodType<OutputType>,
  fn: (input: InputType) => Promise<OutputType>
): (inputData: InputType) => Promise<ApiResponse<OutputType>> {
  return async function (
    inputData: InputType
  ): Promise<ApiResponse<OutputType>> {
    return execute(inputSchema, outputSchema, fn, inputData);
  };
}

class ActionCreator<InputType = unknown, OutputType = unknown> {
  inputSchema?: ZodType<InputType>;
  outputSchema?: ZodType<OutputType>;
  handlerFunc?: (input: InputType) => Promise<OutputType>;

  constructor() {
    this.inputSchema = z.any();
    this.outputSchema = z.any();
    this.handlerFunc = undefined;
  }

  input<T>(inputSchema: ZodType<T>): ActionCreator<T, OutputType> {
    const creator = new ActionCreator<T, OutputType>();
    creator.inputSchema = inputSchema;
    creator.outputSchema = this.outputSchema;
    creator.handlerFunc = this.handlerFunc as
      | ((input: T) => Promise<OutputType>)
      | undefined;
    return creator;
  }

  output<T>(outputSchema: ZodType<T>): ActionCreator<InputType, T> {
    const creator = new ActionCreator<InputType, T>();
    creator.inputSchema = this.inputSchema;
    creator.outputSchema = outputSchema;
    creator.handlerFunc = this.handlerFunc as
      | ((input: InputType) => Promise<T>)
      | undefined;
    return creator;
  }

  handler(
    handlerFunc: (input: InputType) => Promise<OutputType>
  ): (inputData: InputType) => Promise<ApiResponse<OutputType>> {
    if (!this.inputSchema || !this.outputSchema) {
      throw new Error('Input and output schemas must be defined');
    }

    return wrapAction<InputType, OutputType>(
      this.inputSchema,
      this.outputSchema,
      handlerFunc
    );
  }
}

type ActionCreatorReducedScope = Pick<
  ActionCreator,
  'handler' | 'input' | 'output'
>;

export function createAction(): ActionCreatorReducedScope {
  return new ActionCreator();
}
