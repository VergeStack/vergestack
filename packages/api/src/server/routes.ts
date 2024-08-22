import { NextRequest, NextResponse } from 'next/server';
import { ZodType } from 'zod';
import { ApiResponse } from '../types';
import { execute } from './common';

export function wrapRoute<InputType, OutputType>(
  inputSchema: ZodType<InputType>,
  outputSchema: ZodType<OutputType>,
  fn: (body: InputType) => Promise<OutputType>
): (request: NextRequest) => Promise<NextResponse<ApiResponse<OutputType>>> {
  return async function (
    request: NextRequest
  ): Promise<NextResponse<ApiResponse<OutputType>>> {
    const inputData = await request.json();
    const apiResponse = await execute(inputSchema, outputSchema, fn, inputData);
    return NextResponse.json(apiResponse, { status: apiResponse.status });
  };
}
