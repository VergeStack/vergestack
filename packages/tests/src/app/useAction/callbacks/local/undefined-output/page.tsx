'use client';

import { undefinedOutputAction } from '@/app/actions';
import { useAction } from '@vergestack/api-react';

export default function Home() {
  const { data, execute, errors } = useAction(undefinedOutputAction, {
    onSuccess: (data) => {
      fetch('/log', {
        method: 'POST',
        body: JSON.stringify({ type: 'onSuccess', data })
      });
    }
  });

  return (
    <>
      <p id="data">{!data ? 'No data' : data}</p>
      <p id="error">{JSON.stringify(errors)}</p>
      <button onClick={() => execute('world')}>Execute</button>
    </>
  );
}
