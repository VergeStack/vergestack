'use client';

import { delayAction } from '@/app/actions';
import { useAction } from '@vergestack/api-react';
import { useEffect } from 'react';

export default function Home() {
  const { data, execute, isPending, errors } = useAction(delayAction);

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
