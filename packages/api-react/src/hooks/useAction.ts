import { ApiResponse } from '@vergestack/api';
import {
  useActionState,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef
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

type ActionState<OutputType> = ApiResponse<OutputType> | null;

export function useAction<InputType, OutputType>(
  actionHandler: (
    previousState: ActionState<OutputType>,
    inputData: InputType | FormData
  ) => Promise<ApiResponse<OutputType>>,
  optionsObject?: UseActionOptions<OutputType>
) {
  // local options are stored in a ref so component re-renders don't cause an infinite loop
  const localOptions = useRef(optionsObject);
  localOptions.current = optionsObject;
  // global options are stored in context so we can access them from anywhere
  const globalOptions = useContext(ApiContext);

  const [state, action, isPending] = useActionState(actionHandler, null);
  const reasonsRef = useRef<Set<string>>(new Set<string>());

  const getError = useCallback(
    (name: string): string | undefined => {
      if (!reasonsRef.current.has(name)) {
        reasonsRef.current.add(name);
      }

      const firstError = state?.errors?.find(
        (err) => 'reason' in err && err.reason === name
      );

      return firstError?.message;
    },
    [state]
  );

  const isSuccess = useMemo(
    () => state !== null && isSuccessStatus(state.status),
    [state]
  );
  const isError = useMemo(
    () => state !== null && !isSuccessStatus(state.status),
    [state]
  );

  useEffect(() => {
    if (isPending) {
      globalOptions.options.onStart?.();
      localOptions.current?.onStart?.();
    } else if (isSuccess) {
      globalOptions.options.onSuccess?.(state?.data as OutputType);
      localOptions.current?.onSuccess?.(state?.data as OutputType);
    } else if (isError) {
      globalOptions.options.onError?.(state.errors);
      localOptions.current?.onError?.(state.errors);
    }
  }, [state, isPending, isSuccess, isError]);

  return {
    data: state?.data,
    status: state?.status,
    errors: state?.errors || [],
    isPending,
    isSuccess,
    isError,
    action,
    getError
  };
}
