# @vergestack/api-react

React hooks and utilities for [@vergestack/api](https://www.npmjs.com/package/@vergestack/api), providing seamless integration of server actions with React components.

## Features

- 🎣 Type-safe React hooks
- 🎯 Form handling utilities
- ⚡ Automatic loading states
- 🚦 Built-in error handling
- 🌍 Global configuration support

## Installation

```bash
npm install @vergestack/api @vergestack/api-react zod
```

## Basic Usage

### useAction Hook

The `useAction` hook provides a simple way to integrate server actions with React components:

```tsx
import { useAction } from '@vergestack/api-react';
import { greetingAction } from './actions';

function GreetingComponent() {
  const { data, errors, executeForm } = useAction(greetingAction);

  return (
    <>
      <form action={executeForm}>
        <input name="name" />
        <button type="submit">Greet</button>
      </form>

      {data && <p>Response: {data}</p>}
      {errors && <p>Errors: {errors.map((e) => e.message).join(', ')}</p>}
    </>
  );
}
```

### Hook Options

Configure the hook behavior with local options:

```tsx
const { execute } = useAction(myServerAction, {
  initialData: defaultValue,
  onStart: () => {
    console.log('Action started');
  },
  onSuccess: (data) => {
    console.log('Success:', data);
  },
  onError: (errors) => {
    console.error('Errors:', errors);
  },
  onComplete: () => {
    console.log('Action completed');
  }
});
```

### Global Configuration

Use the `ApiProvider` to set global configuration options:

```tsx
import { ApiProvider } from '@vergestack/api-react';

function App() {
  return (
    <ApiProvider
      value={{
        options: {
          onError: (errors) => {
            // Global error handling
            console.error('API Error:', errors);
          },
          onSuccess: (data) => {
            // Global success handling
            console.log('Success:', data);
          }
        }
      }}
    >
      {/* Your app components */}
    </ApiProvider>
  );
}
```

### Form Error Handling

The hook provides utilities for handling form-specific errors:

```tsx
function ErrorField({ text }: { text?: string }) {
  if (!text) return null;
  return <p className="error">{text}</p>;
}

function FormComponent() {
  const { executeForm, getFormError } = useAction(submitFormAction);

  return (
    <form action={executeForm}>
      <div>
        <input name="username" />
        <ErrorField text={getFormError('username')} />
      </div>

      <div>
        <input name="email" />
        <ErrorField text={getFormError('email')} />
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}
```

For detailed API documentation, visit the [documentation site](https://vergestack.com/docs/api).

## License

MIT © [Adam Mikacich](https://github.com/AdamMikacich)
