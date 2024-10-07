'use client';

import { ApiProvider, useAction } from '@vergestack/api-react';
import { successAction } from '../../global/success/action';

export default function Home() {
  return (
    <ApiProvider
      value={{
        options: {
          onSuccess: (data) => {
            fetch('/log', {
              method: 'POST',
              body: JSON.stringify({ type: 'globalOnSuccess', data })
            });
          },
          onError: (errors) => {
            fetch('/log', {
              method: 'POST',
              body: JSON.stringify({ type: 'globalOnError', errors })
            });
          },
          onComplete: () => {
            fetch('/log', {
              method: 'POST',
              body: JSON.stringify({ type: 'globalOnComplete' })
            });
          }
        }
      }}
    >
      <LocalOverrideComponent />
    </ApiProvider>
  );
}

function LocalOverrideComponent() {
  const { data, execute, errors } = useAction(successAction, {
    onSuccess: (data) => {
      fetch('/log', {
        method: 'POST',
        body: JSON.stringify({ type: 'localOnSuccess', data })
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
