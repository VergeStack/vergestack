'use client';

import { successAction } from '@/app/actions';
import { useAction } from '@vergestack/api-react';

export default function Home() {
  const { data, execute, isPending, errors } = useAction(successAction, {
    initialData: 'Initial Data'
  });

  return (
    <>
      <p id="data">{isPending ? 'Pending...' : data}</p>
      <p id="error">{JSON.stringify(errors)}</p>
      <button onClick={() => execute('Updated Data')}>Update Data</button>
    </>
  );
}
