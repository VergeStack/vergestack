import { ApiError, ApiResponse, ApiResponseStatus } from '@vergestack/api';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition
} from 'react';
import { ApiContext } from '../providers';
import { ApiErrorWithMetadata } from '../types';
import { isSuccessStatus } from '../utils';

export type UseActionOptions<OutputType> = {
  initialData?: OutputType;
  onStart?: () => void;
  onError?: (errors: ApiErrorWithMetadata[]) => void;
  onSuccess?: (data: OutputType) => void;
  onComplete?: () => void;
};

type ActionState<OutputType> = {
  data?: OutputType;
  status?: ApiResponseStatus;
  errors: ApiErrorWithMetadata[];
};

export function useAction<InputType, OutputType>(
  actionHandler: (
    inputData: InputType | FormData
  ) => Promise<ApiResponse<OutputType>>,
  optionsObject?: UseActionOptions<OutputType>
) {
  const localOptions = useRef(optionsObject);
  localOptions.current = optionsObject;
  const globalOptions = useContext(ApiContext);

  const [hasJS, setHasJS] = useState(false);
  const [isPending, startTransition] = useTransition();
  const registeredPathsRef = useRef<Set<string>>(new Set<string>());

  const [state, setState] = useState<ActionState<OutputType>>({
    data: localOptions.current?.initialData,
    status: undefined,
    errors: []
  });

  const isPendingRef = useRef(false);

  useEffect(() => {
    setHasJS(true);
  }, []);

  useEffect(() => {
    isPendingRef.current = isPending;
  }, [isPending]);

  const execute = useCallback(
    async (inputData: InputType | FormData) => {
      if (isPendingRef.current) return;

      const options = {
        ...globalOptions.options,
        ...localOptions.current
      };

      options.onStart?.();

      startTransition(async () => {
        const actionResponse = await actionHandler(inputData);
        const newRawErrors = actionResponse.errors ?? [];
        const newState = {
          data: actionResponse.data,
          status: actionResponse.status,
          errors: newRawErrors.map((err: ApiError) => ({
            ...err,
            isReasonRegistered: err.reason
              ? registeredPathsRef.current.has(err.reason)
              : undefined
          }))
        };
        setState(newState);

        const isSuccess = isSuccessStatus(newState.status);
        const isError = !isSuccess && newState.status !== undefined;

        if (isSuccess) {
          options.onSuccess?.(newState.data as OutputType);
        } else if (isError) {
          options.onError?.(newState.errors);
        }

        options.onComplete?.();
      });
    },
    [actionHandler, isPendingRef]
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    execute(formData);
  }

  const handlers = {
    action: actionHandler,
    onSubmit: hasJS ? handleSubmit : undefined
  };

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
    handlers,
    getFormError
  };
}
