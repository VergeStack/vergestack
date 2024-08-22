'use client';

import { greetingAction } from '@/actions';
import { useAction } from '@vergestack/api';
import { useEffect } from 'react';

export default function Home() {
  const { data, execute, loading } = useAction(greetingAction);

  useEffect(() => {
    async function handleAction() {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await execute('world');
    }
    handleAction();
  }, [execute]);

  return (
    <>
      <p>{loading ? 'Loading...' : data}</p>
    </>
  );
}
