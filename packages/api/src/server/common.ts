import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { ZodType } from 'zod';
import { ApiError, ApiResponse } from '../types';

export async function execute<InputType, OutputType>(
  inputSchema: ZodType<InputType>,
  outputSchema: ZodType<OutputType>,
  fn: (input: InputType) => Promise<OutputType>,
  inputData: InputType
): Promise<ApiResponse<OutputType>> {
  const { error: inputErrors, data: input } = inputSchema.safeParse(inputData);

  if (inputErrors) {
    console.log(inputErrors.issues);
    return {
      errors: inputErrors.issues.map((issue) => ({
        message: issue.message,
        path: issue.path.join('/')
      })),
      status: StatusCodes.BAD_REQUEST
    };
  }

  try {
    const handlerResponse = await fn(input);
    const response = outputSchema.parse(handlerResponse);

    const status = StatusCodes.OK;
    return { status, data: response };
  } catch (err) {
    if (err instanceof ApiError) {
      return {
        status: err.status,
        errors: [
          {
            message: err.message,
            path: err.path
          }
        ]
      };
    }

    const status = StatusCodes.INTERNAL_SERVER_ERROR;
    return {
      status,
      errors: [{ message: ReasonPhrases.INTERNAL_SERVER_ERROR }]
    };
  }
}
