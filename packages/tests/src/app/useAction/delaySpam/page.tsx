'use client';

import { delayAction } from '@/app/actions';
import { useAction } from '@vergestack/api-react';
import { useState } from 'react';

export default function Home() {
  const { data, execute, isPending } = useAction(delayAction);
  const [callCount, setCallCount] = useState(0);

  const handleClick = () => {
    execute('world');
    setCallCount((prev) => prev + 1);
  };

  return (
    <>
      <p id="data">{isPending ? 'Pending...' : data}</p>
      <p id="callCount">Call count: {callCount}</p>
      <button onClick={handleClick}>Execute</button>
    </>
  );
}
