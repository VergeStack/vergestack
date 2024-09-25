import { ApiResponse, ErrorMessage } from '@vergestack/api';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiContext } from '../providers';

export function useAction<InputType, OutputType>(
  actionHandler: (inputData: InputType) => Promise<ApiResponse<OutputType>>
) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorMessage[]>([]);
  const [supressedErrorPaths, setSupressedErrorPaths] = useState<Set<string>>(
    new Set<string>()
  );
  const [data, setData] = useState<OutputType | null>(null);
  const [status, setStatus] = useState<StatusCodes | null>(null);

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
      } catch (err) {
        console.error(err);

        setErrors([{ message: ReasonPhrases.INTERNAL_SERVER_ERROR }]);
        setData(null);
        setStatus(StatusCodes.INTERNAL_SERVER_ERROR);
      } finally {
        setLoading(false);
      }
    },
    [actionHandler]
  );

  const { handlers } = useContext(ApiContext);

  useEffect(() => {
    if (errors.length > 0) {
      errors.forEach((err) => {
        const supressed =
          err.path !== undefined && supressedErrorPaths.has(err.path);

        handlers.onError(err, supressed);
      });
    }
  }, [errors, handlers]);

  const ok = useMemo(() => status === StatusCodes.OK, [status]);

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
      if (!supressedErrorPaths.has(name)) {
        setSupressedErrorPaths(new Set([...supressedErrorPaths, name]));
      }

      return errors.find((err) => err.path === name)?.message;
    },
    [errors, supressedErrorPaths]
  );

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
