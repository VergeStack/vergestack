import { z, ZodType } from 'zod';
import { ApiResponse } from '../types';
import { ApiHandler, execute } from './common';

type GeneratedGenericActionHandler<InputType, OutputType> = (
  input: InputType
) => Promise<ApiResponse<OutputType>>;

type GeneratedFormActionHandler<OutputType> = (
  input: FormData
) => Promise<ApiResponse<OutputType>>;

export type GeneratedActionHandler<InputType, OutputType> =
  | GeneratedGenericActionHandler<InputType, OutputType>
  | GeneratedFormActionHandler<OutputType>;

type ActionType = 'generic' | 'form';

class ActionCreator<InputType = unknown, OutputType = unknown> {
  actionType: ActionType = 'generic';
  inputSchema: ZodType<InputType>;
  outputSchema: ZodType<OutputType>;
  handlerFunc?: ApiHandler<InputType, OutputType>;

  constructor() {
    this.inputSchema = z.any();
    this.outputSchema = z.any();
    this.handlerFunc = undefined;
  }

  type(actionType: ActionType): ActionCreator<InputType, OutputType> {
    this.actionType = actionType;
    return this;
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
    if (this.actionType === 'form') {
    }

    return async function (input: InputType): Promise<ApiResponse<OutputType>> {
      return execute(this.inputSchema, this.outputSchema, handlerFunc, {
        input
      });
    };
  }
}

type ActionCreatorReducedScope = Pick<
  ActionCreator,
  'handler' | 'input' | 'output'
>;

export function createAction(): ActionCreatorReducedScope {
  return new ActionCreator();
}
