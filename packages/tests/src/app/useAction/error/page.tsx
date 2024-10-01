'use client';

import { useAction } from '@vergestack/api-react';
import { useEffect, useState } from 'react';
import { errorAction } from './action';

export default function Home() {
  const { data, execute, isPending, errors } = useAction(errorAction);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    execute('world');
    setTriggered(true);
  }, [execute]);

  return (
    <>
      <p id="data">{isPending ? 'Pending...' : data}</p>
      <p id="error">{JSON.stringify(errors)}</p>
      <p id="triggered">{`${triggered}`}</p>
    </>
  );
}
