# @vergestack/api

A type-safe API layer for Next.js applications, providing utilities for server actions and API routes with built-in validation.

## Features

- 🔒 Type-safe server actions and API routes
- ✨ Built-in input/output validation using Zod
- 🎯 Streamlined error handling
- 🔄 React hooks for seamless client integration
- 📝 Comprehensive TypeScript support

## Installation

```bash
npm install @vergestack/api @vergestack/api-react zod
```

## Basic Usage

### Server Actions

Create type-safe server actions with input validation:

```typescript
'use server';

import { createAction } from '@vergestack/api';
import { z } from 'zod';

export const greetingAction = createAction()
  .input(z.object({ name: z.string() }))
  .output(z.string())
  .handler(async ({ input }) => {
    return `Hello, ${input.name}!`;
  });
```

Use the action in your React components:

```tsx
import { useAction } from '@vergestack/api-react';
import { greetingAction } from './actions';

export function GreetingComponent() {
  const { data, errors, executeForm } = useAction(greetingAction);

  return (
    <>
      <form action={executeForm}>
        <input name="name" />
        <button type="submit">Greet</button>
      </form>

      {data && <p>Greeting: {data}</p>}
      {errors && <p>Errors: {errors.map((e) => e.message).join(', ')}</p>}
    </>
  );
}
```

### API Routes

Create type-safe API routes with automatic validation:

```typescript
import { createRoute } from '@vergestack/api';
import { z } from 'zod';

export const GET = createRoute()
  .input(z.object({ name: z.string() }))
  .output(z.object({ greeting: z.string() }))
  .handler(async ({ input }) => {
    return { greeting: `Hello, ${input.name}!` };
  });
```

### Error Handling

The package includes built-in error types for common scenarios:

```typescript
import { NotFoundError, UnauthorizedError } from '@vergestack/api';

export const userAction = createAction()
  .input(z.object({ userId: z.string() }))
  .output(z.object({ name: z.string() }))
  .handler(async ({ input }) => {
    const user = await getUser(input.userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!isAuthorized(user)) {
      throw new UnauthorizedError('Not authorized');
    }

    return { name: user.name };
  });
```

For detailed API documentation, visit our [documentation site](https://vergestack.com/docs/api).

## License

MIT © [Adam Mikacich](https://github.com/AdamMikacich)
