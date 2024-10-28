'use client';

import { successFormAction } from '@/app/actions';
import { useAction } from '@vergestack/api-react';

export default function Home() {
  const { data, executeForm, errors } = useAction(successFormAction);

  return (
    <form action={executeForm}>
      <p id="data">{!data ? 'No data' : data}</p>
      <p id="error">{JSON.stringify(errors)}</p>
      <input type="text" name="name" />
      <button type="submit">Execute</button>
    </form>
  );
}
