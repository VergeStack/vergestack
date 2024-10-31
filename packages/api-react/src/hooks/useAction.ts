import { ApiResponseStatus } from '@vergestack/api';
import {
  useActionState,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
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
  data: OutputType | undefined;
  status: ApiResponseStatus | undefined;
  errors: ApiErrorWithMetadata[];
};

export function useAction<InputType, OutputType>(
  actionHandler: (
    prevState: ActionState<OutputType>,
    inputData: InputType
  ) => Promise<ActionState<OutputType>>,
  optionsObject?: UseActionOptions<OutputType>
) {
  const localOptions = useRef(optionsObject);
  localOptions.current = optionsObject;
  const globalOptions = useContext(ApiContext);

  const [hasJS, setHasJS] = useState(false);
  const registeredPathsRef = useRef<Set<string>>(new Set<string>());

  const [state, dispatchAction, isPending] = useActionState<
    ActionState<OutputType>,
    InputType
  >(actionHandler, {
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

  const { status } = state;
  const isSuccess = useMemo(
    () => status !== undefined && isSuccessStatus(status),
    [status]
  );
  const isError = useMemo(
    () => status !== undefined && !isSuccessStatus(status),
    [status]
  );

  useEffect(() => {
    const options = {
      ...globalOptions.options,
      ...localOptions.current
    };

    if (isPending) {
      options.onStart?.();
    } else {
      if (isSuccess) {
        options.onSuccess?.(state.data as OutputType);
      } else {
        options.onError?.(state.errors);
      }

      options.onComplete?.();
    }
  }, [localOptions, globalOptions, isPending, isSuccess, state]);

  const execute = useCallback(
    async (inputData: InputType) => {
      if (isPendingRef.current) return;

      dispatchAction(inputData);
    },
    [dispatchAction, isPendingRef]
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    execute(formData as InputType);
  }

  const handlers = {
    action: dispatchAction,
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
