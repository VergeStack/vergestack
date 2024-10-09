import { ApiError, ApiResponse, ApiResponseStatus } from '@vergestack/api';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { z } from 'zod';
import { ApiContext } from '../providers';
import { ApiErrorWithMetadata } from '../types';
import { defaultOnError, isSuccessStatus } from '../utils';

export type UseRouteOptions<InputType, OutputType> = {
  initialData?: OutputType;
  onError?: (errors: ApiErrorWithMetadata[]) => void;
  onSuccess?: (data: OutputType) => void;
  onComplete?: () => void;
  inputSchema?: z.ZodType<InputType>;
  outputSchema?: z.ZodType<OutputType>;
};

export function useRoute<InputType = unknown, OutputType = unknown>(
  endpoint: string,
  optionsObject?: UseRouteOptions<InputType, OutputType>
) {
  const localOptions = useRef(optionsObject);
  localOptions.current = optionsObject;
  const globalOptions = useContext(ApiContext);

  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState<ApiErrorWithMetadata[]>([]);
  const registeredPathsRef = useRef<Set<string>>(new Set<string>());
  const [data, setData] = useState<OutputType | undefined>(
    localOptions.current?.initialData
  );
  const [status, setStatus] = useState<ApiResponseStatus | undefined>();

  const execute = useCallback(
    async (inputData: InputType): Promise<void> => {
      if (isPending) return;
      setIsPending(true);

      let newErrors: ApiErrorWithMetadata[] = [];
      let newData: OutputType | undefined;
      let newStatus: StatusCodes = StatusCodes.INTERNAL_SERVER_ERROR;

      try {
        // Validate input data if schema is provided
        const validatedInput = localOptions.current?.inputSchema
          ? localOptions.current.inputSchema.parse(inputData)
          : inputData;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(validatedInput)
        });

        const result: ApiResponse<unknown> = await response.json();

        // Validate output data if schema is provided
        const validatedOutput = localOptions.current?.outputSchema
          ? localOptions.current.outputSchema.parse(result.data)
          : (result.data as OutputType);

        newData = validatedOutput;
        newStatus = result.status;

        const newRawErrors = result.errors ?? [];
        newErrors = newRawErrors.map((err: ApiError) => ({
          ...err,
          isReasonRegistered: err.reason
            ? registeredPathsRef.current.has(err.reason)
            : undefined
        }));
      } catch (err) {
        console.error(err);

        newErrors = [
          {
            message:
              err instanceof Error
                ? err.message
                : ReasonPhrases.INTERNAL_SERVER_ERROR
          }
        ];
        newStatus = StatusCodes.INTERNAL_SERVER_ERROR;
      }

      setErrors(newErrors);
      setData(newData);
      setStatus(newStatus);

      try {
        if (isSuccessStatus(newStatus)) {
          if (localOptions.current?.onSuccess) {
            localOptions.current.onSuccess(newData as OutputType);
          } else if (globalOptions.options.onSuccess) {
            globalOptions.options.onSuccess(newData as OutputType);
          }
        } else {
          if (localOptions.current?.onError) {
            localOptions.current.onError(newErrors);
          } else if (globalOptions.options.onError) {
            globalOptions.options.onError(newErrors);
          } else {
            defaultOnError(newErrors);
          }
        }
      } finally {
        setIsPending(false);
      }

      if (localOptions.current?.onComplete) {
        localOptions.current.onComplete();
      } else if (globalOptions.options.onComplete) {
        globalOptions.options.onComplete();
      }
    },
    [endpoint, localOptions, globalOptions]
  );

  const executeForm = useCallback(
    async (formData: FormData): Promise<void> => {
      const inputData: {
        [key: string]: FormDataEntryValue;
      } = {};

      for (const [key, value] of formData.entries()) {
        inputData[key] = value;
      }

      await execute(inputData as InputType);
    },
    [execute]
  );

  const getFormError = useCallback(
    (name: string): string | undefined => {
      if (!registeredPathsRef.current.has(name)) {
        registeredPathsRef.current.add(name);
      }

      return errors.find((err) => 'reason' in err && err.reason === name)
        ?.message;
    },
    [errors]
  );

  const isSuccess = useMemo(
    () => status !== undefined && isSuccessStatus(status),
    [status]
  );
  const isError = useMemo(
    () => status !== undefined && !isSuccessStatus(status),
    [status]
  );

  return {
    isPending,
    isSuccess,
    isError,
    errors,
    data,
    status,
    execute,
    executeForm,
    getFormError
  };
}
