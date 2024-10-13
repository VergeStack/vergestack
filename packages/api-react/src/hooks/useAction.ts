import { ApiError, ApiResponse, ApiResponseStatus } from '@vergestack/api';
import { StatusCodes } from 'http-status-codes';
import { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { ApiContext } from '../providers';
import { ApiErrorWithMetadata } from '../types';
import { defaultOnError, isSuccessStatus } from '../utils';

export type UseActionOptions<OutputType> = {
  initialData?: OutputType;
  onError?: (errors: ApiErrorWithMetadata[]) => void;
  onSuccess?: (data: OutputType) => void;
  onComplete?: () => void;
};

type ActionState<OutputType> = {
  data: OutputType | undefined;
  status: ApiResponseStatus | undefined;
  errors: ApiErrorWithMetadata[];
};

export function useAction<InputType, OutputType>(
  actionHandler: (inputData: InputType) => Promise<ApiResponse<OutputType>>,
  optionsObject?: UseActionOptions<OutputType>
) {
  const localOptions = useRef(optionsObject);
  localOptions.current = optionsObject;
  const globalOptions = useContext(ApiContext);

  const [isPending, setIsPending] = useState(false);
  const registeredPathsRef = useRef<Set<string>>(new Set<string>());
  const [state, setState] = useState<ActionState<OutputType>>({
    data: localOptions.current?.initialData,
    status: undefined,
    errors: []
  });

  const execute = useCallback(
    async (inputData: InputType): Promise<void> => {
      async function triggerAction() {
        let newState: ActionState<OutputType> = {
          data: undefined,
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          errors: []
        };

        const result = await actionHandler(inputData);

        const newRawErrors = result.errors ?? [];

        newState = {
          data: result.data,
          status: result.status,
          errors: newRawErrors.map((err: ApiError) => ({
            ...err,
            isReasonRegistered: err.reason
              ? registeredPathsRef.current.has(err.reason)
              : undefined
          }))
        };

        setState(newState);

        const options = {
          ...globalOptions.options,
          ...localOptions.current
        };

        try {
          if (newState.status && isSuccessStatus(newState.status)) {
            options.onSuccess?.(newState.data as OutputType);
          } else {
            if (options.onError) {
              options.onError(newState.errors);
            } else {
              defaultOnError(newState.errors);
            }
          }
        } finally {
          setIsPending(false);
        }

        options.onComplete?.();
      }

      setIsPending((currentIsPending) => {
        if (currentIsPending) return true;

        triggerAction();

        return true;
      });
    },
    [actionHandler, localOptions, globalOptions, registeredPathsRef]
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

      return state.errors.find((err) => 'reason' in err && err.reason === name)
        ?.message;
    },
    [state.errors]
  );

  const { status } = state;
  const isSuccess = useMemo(
    () => status !== undefined && isSuccessStatus(status),
    [status]
  );
  const isError = useMemo(
    () => status !== undefined && !isSuccessStatus(status),
    [status]
  );

  return {
    ...state,
    isPending,
    isSuccess,
    isError,
    execute,
    executeForm,
    getFormError
  };
}
