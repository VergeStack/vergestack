'use client';

import { useAction } from '@vergestack/api/dist/client';
import { useEffect } from 'react';
import { errorAction } from './action';

export default function Home() {
  const { data, execute, loading, errors } = useAction(errorAction);

  useEffect(() => {
    execute('world');
  }, [execute]);

  return (
    <>
      <p id="data">{loading ? 'Loading...' : data}</p>
      <p id="error">{JSON.stringify(errors)}</p>
    </>
  );
}
