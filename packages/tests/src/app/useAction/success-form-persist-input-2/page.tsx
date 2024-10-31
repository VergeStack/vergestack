'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { greet } from './actions';

function useFormAction<T>(
  action: (prevState: T, formData: FormData) => Promise<T>,
  initialState: Awaited<T>
) {
  const [data, formAction, isActionPending] = useActionState<T, FormData>(
    action,
    initialState
  );
  const [hasJS, setHasJS] = useState(false);
  const [isTransitionPending, startTransition] = useTransition();

  const isPending = isActionPending || isTransitionPending;

  useEffect(() => {
    setHasJS(true);
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  }

  const handlers = {
    action: formAction,
    onSubmit: hasJS ? handleSubmit : undefined
  };

  return {
    data,
    isPending,
    handlers
  };
}

export default function Home() {
  const { data, handlers, isPending } = useFormAction<string>(greet, 'test');

  return (
    <form {...handlers}>
      <p>Is Pending: {isPending ? 'true' : 'false'}</p>
      <p>Data: {data}</p>
      <input type="text" name="name" />
      <button type="submit">Execute</button>
    </form>
  );
}
