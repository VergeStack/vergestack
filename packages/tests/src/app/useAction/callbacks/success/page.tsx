'use client';

import { useAction } from '@vergestack/api-react';
import { successAction } from './action';

export default function Home() {
  const { data, execute, errors } = useAction(successAction, {
    onSuccess: (data) => {
      fetch('/log', {
        method: 'POST',
        body: JSON.stringify({ type: 'onSuccess', data })
      });
    },
    onError: (error) => {
      fetch('/log', {
        method: 'POST',
        body: JSON.stringify({ type: 'onError', error })
      });
    },
    onComplete: () => {
      fetch('/log', {
        method: 'POST',
        body: JSON.stringify({ type: 'onComplete' })
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
