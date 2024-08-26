import { ApiResponse, ErrorMessage } from '@vergestack/api';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { useCallback, useContext, useMemo, useState } from 'react';
import { ApiContext } from '../providers';

export function useAction<InputType, OutputType>(
  actionHandler: (inputData: InputType) => Promise<ApiResponse<OutputType>>
) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorMessage[]>([]);
  const [data, setData] = useState<OutputType | null>(null);
  const [status, setStatus] = useState<StatusCodes | null>(null);
  const [registeredPaths, setRegisteredPaths] = useState<Set<string>>(
    new Set<string>()
  );

  const { handlers } = useContext(ApiContext);

  const execute = useCallback(
    async (inputData: InputType): Promise<void> => {
      if (loading) return;
      setLoading(true);
      setStatus(null);

      try {
        const result = await actionHandler(inputData);

        setErrors(result.errors ?? []);
        setData(result.data ? result.data : null);
        setStatus(result.status);

        result.errors?.forEach((err) => {
          if (err.path && registeredPaths.has(err.path)) {
            return;
          }

          const suffix = err.path ? ` at path ${err.path}` : '';
          handlers.onError(`${err.message}${suffix}`);
        });
      } catch (err) {
        console.error(err);

        setErrors([{ message: ReasonPhrases.INTERNAL_SERVER_ERROR }]);
        setData(null);
        setStatus(StatusCodes.INTERNAL_SERVER_ERROR);
        handlers.onError(ReasonPhrases.INTERNAL_SERVER_ERROR);
      } finally {
        setLoading(false);
      }
    },
    [actionHandler]
  );

  const executeForm = async (formData: FormData): Promise<void> => {
    const inputData: {
      [key: string]: FormDataEntryValue;
    } = {};

    for (const [key, value] of formData.entries()) {
      inputData[key] = value;
    }

    await execute(inputData as InputType);
  };

  const getFormError = useCallback(
    (name: string): string | undefined => {
      if (!registeredPaths.has(name)) {
        setRegisteredPaths(new Set([...registeredPaths, name]));
      }

      return errors.find((err) => err.path === name)?.message;
    },
    [errors, registeredPaths, setRegisteredPaths]
  );

  const ok = useMemo(() => status === StatusCodes.OK, [status]);

  return {
    loading,
    errors,
    data,
    status,
    ok,
    execute,
    executeForm,
    getFormError
  };
}
