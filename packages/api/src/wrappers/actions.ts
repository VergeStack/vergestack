import { z, ZodType } from 'zod';
import { ApiResponse } from '../types';
import { ApiHandler, execute } from './common';

export type GeneratedActionHandler<InputType, OutputType> = (
  input: InputType
) => Promise<ApiResponse<OutputType>>;

export function wrapAction<InputType, OutputType>(
  inputSchema: ZodType<InputType>,
  outputSchema: ZodType<OutputType>,
  fn: ApiHandler<InputType, OutputType>
): GeneratedActionHandler<InputType, OutputType> {
  return async function (input: InputType): Promise<ApiResponse<OutputType>> {
    return execute(inputSchema, outputSchema, fn, { input });
  };
}

class ActionCreator<InputType = unknown, OutputType = unknown> {
  inputSchema: ZodType<InputType>;
  outputSchema: ZodType<OutputType>;
  handlerFunc?: ApiHandler<InputType, OutputType>;

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
      | ApiHandler<T, OutputType>
      | undefined;
    return creator;
  }

  output<T>(outputSchema: ZodType<T>): ActionCreator<InputType, T> {
    const creator = new ActionCreator<InputType, T>();
    creator.inputSchema = this.inputSchema;
    creator.outputSchema = outputSchema;
    creator.handlerFunc = this.handlerFunc as
      | ApiHandler<InputType, T>
      | undefined;
    return creator;
  }

  handler(
    handlerFunc: ApiHandler<InputType, OutputType>
  ): GeneratedActionHandler<InputType, OutputType> {
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
