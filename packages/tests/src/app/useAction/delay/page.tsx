'use client';

import { useAction } from '@vergestack/api/dist/client';
import { useEffect } from 'react';
import { delayAction } from './action';

export default function Home() {
  const { data, execute, loading, errors } = useAction(delayAction);

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
