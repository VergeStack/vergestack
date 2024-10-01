'use client';

import { useAction } from '@vergestack/api-react';
import { useEffect } from 'react';
import { successAction } from './action';

export default function Home() {
  const { data, execute, isPending, errors } = useAction(successAction);

  useEffect(() => {
    execute('world');
  }, [execute]);

  return (
    <>
      <p id="data">{isPending ? 'Pending...' : data}</p>
      <p id="error">{JSON.stringify(errors)}</p>
    </>
  );
}
