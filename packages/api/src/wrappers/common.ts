import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { ZodType } from 'zod';
import { ApiResponse, GenericError } from '../types';

export type ApiHandler<InputType, OutputType> = (
  input: InputType
) => Promise<OutputType>;

export async function execute<InputType, OutputType>(
  inputSchema: ZodType<InputType>,
  outputSchema: ZodType<OutputType>,
  fn: ApiHandler<InputType, OutputType>,
  inputData: InputType
): Promise<ApiResponse<OutputType>> {
  const { error: inputErrors, data: input } = inputSchema.safeParse(inputData);

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
    const handlerResponse = await fn(input);
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

    const status = StatusCodes.INTERNAL_SERVER_ERROR;
    return {
      status,
      errors: [{ message: ReasonPhrases.INTERNAL_SERVER_ERROR }]
    };
  }
}
