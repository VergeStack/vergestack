import { ApiError, ApiResponse, ApiResponseStatus } from '@vergestack/api';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ApiErrorWithMetadata } from '../types';

export type UseActionOptions<OutputType> = {
  initialData?: OutputType;
  onError?: (errors: ApiErrorWithMetadata[]) => void;
  onSuccess?: (data: OutputType) => void;
  onComplete?: () => void;
};

function isSuccessStatus(status: ApiResponseStatus): boolean {
  return status >= 200 && status < 300;
}

export function useAction<InputType, OutputType>(
  actionHandler: (inputData: InputType) => Promise<ApiResponse<OutputType>>,
  optionsObject?: UseActionOptions<OutputType>
) {
  const options = useRef(optionsObject);
  options.current = optionsObject;

  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState<ApiErrorWithMetadata[]>([]);
  const registeredPathsRef = useRef<Set<string>>(new Set<string>());
  const [data, setData] = useState<OutputType | undefined>(
    options?.current?.initialData
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
        const result = await actionHandler(inputData);

        const newRawErrors = result.errors ?? [];

        newErrors = newRawErrors.map((err: ApiError) => ({
          ...err,
          isReasonRegistered: err.reason
            ? registeredPathsRef.current.has(err.reason)
            : undefined
        }));
        newData = result.data;
        newStatus = result.status;
      } catch (err) {
        console.error(err);

        newErrors = [
          {
            message: ReasonPhrases.INTERNAL_SERVER_ERROR
          }
        ];
        newStatus = StatusCodes.INTERNAL_SERVER_ERROR;
      }

      setErrors(newErrors);
      setData(newData);
      setStatus(newStatus);

      if (isSuccessStatus(newStatus)) {
        options?.current?.onSuccess?.(newData as OutputType);
      } else {
        options?.current?.onError?.(newErrors);
      }

      setIsPending(false);

      options?.current?.onComplete?.();
    },
    [actionHandler, options]
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
