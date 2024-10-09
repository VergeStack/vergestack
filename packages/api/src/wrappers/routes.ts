import { NextRequest, NextResponse } from 'next/server';
import { z, ZodType } from 'zod';
import { ApiError } from '../types';
import { execute } from './common';

type ApiResponseOrErrors<OutputType> = NextResponse<OutputType | ApiError[]>;

export function wrapRoute<InputType, OutputType>(
  inputSchema: ZodType<InputType>,
  outputSchema: ZodType<OutputType>,
  fn: (body: InputType) => Promise<OutputType>
): (request: NextRequest) => Promise<ApiResponseOrErrors<OutputType>> {
  return async function (
    request: NextRequest
  ): Promise<ApiResponseOrErrors<OutputType>> {
    const inputData = await request.json();
    const { errors, data, status } = await execute(
      inputSchema,
      outputSchema,
      fn,
      inputData
    );
    if (errors) {
      return NextResponse.json(errors, { status });
    }
    return NextResponse.json(data, { status });
  };
}

class RouteCreator<InputType = unknown, OutputType = unknown> {
  inputSchema?: ZodType<InputType>;
  outputSchema?: ZodType<OutputType>;
  handlerFunc?: (input: InputType) => Promise<OutputType>;

  constructor() {
    this.inputSchema = z.any();
    this.outputSchema = z.any();
    this.handlerFunc = undefined;
  }

  input<T>(inputSchema: ZodType<T>): RouteCreator<T, OutputType> {
    const creator = new RouteCreator<T, OutputType>();
    creator.inputSchema = inputSchema;
    creator.outputSchema = this.outputSchema;
    creator.handlerFunc = this.handlerFunc as
      | ((input: T) => Promise<OutputType>)
      | undefined;
    return creator;
  }

  output<T>(outputSchema: ZodType<T>): RouteCreator<InputType, T> {
    const creator = new RouteCreator<InputType, T>();
    creator.inputSchema = this.inputSchema;
    creator.outputSchema = outputSchema;
    creator.handlerFunc = this.handlerFunc as
      | ((input: InputType) => Promise<T>)
      | undefined;
    return creator;
  }

  handler(
    handlerFunc: (input: InputType) => Promise<OutputType>
  ): (request: NextRequest) => Promise<ApiResponseOrErrors<OutputType>> {
    if (!this.inputSchema || !this.outputSchema) {
      throw new Error('Input and output schemas must be defined');
    }

    return wrapRoute<InputType, OutputType>(
      this.inputSchema,
      this.outputSchema,
      handlerFunc
    );
  }
}

type RouteCreatorReducedScope = Pick<
  RouteCreator,
  'handler' | 'input' | 'output'
>;

export function createRoute(): RouteCreatorReducedScope {
  return new RouteCreator();
}
