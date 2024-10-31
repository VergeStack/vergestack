import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import type { NextRequest } from 'next/server';
import { ZodType } from 'zod';
import { ApiResponse, GenericError } from '../types';

export type ApiHandlerParams<InputType> = {
  input: InputType | FormData;
  request?: NextRequest;
};

export type ApiHandler<InputType, OutputType> = (params: {
  input: InputType;
  request?: NextRequest;
}) => Promise<OutputType>;

export async function execute<InputType, OutputType>(
  inputSchema: ZodType<InputType>,
  outputSchema: ZodType<OutputType>,
  fn: ApiHandler<InputType, OutputType>,
  params: ApiHandlerParams<InputType>
): Promise<ApiResponse<OutputType>> {
  let unparsedInput: InputType;
  if (params.input instanceof FormData) {
    const formData = Object.fromEntries(params.input.entries());
    unparsedInput = formData as InputType;
  } else {
    unparsedInput = params.input;
  }

  const { error: inputErrors, data: inputData } =
    inputSchema.safeParse(unparsedInput);

  if (inputErrors) {
    return {
      errors: inputErrors.issues.map((issue) => ({
        message: issue.message,
        reason: issue.path.join('/')
      })),
      status: StatusCodes.BAD_REQUEST
    };
  }

  try {
    const handlerResponse = await fn({
      input: inputData,
      request: params.request
    });

    const response = outputSchema.parse(handlerResponse);

    const status = StatusCodes.OK;
    return { status, data: response };
  } catch (err) {
    if (err instanceof GenericError) {
      return {
        status: err.status,
        errors: [
          {
            message: err.message,
            reason: err.reason
          }
        ]
      };
    }

    console.error(err);

    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      errors: [{ message: ReasonPhrases.INTERNAL_SERVER_ERROR }]
    };
  }
}
