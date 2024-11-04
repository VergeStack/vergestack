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
npm i @vergestack/api @vergestack/api-react zod
```

## Basic Usage

### useAction Hook

The `useAction` hook provides a simple way to integrate server actions with React components, with built-in progressive enhancement support:

```tsx
import { useAction } from '@vergestack/api-react';
import { greetingAction } from './actions';

function GreetingComponent() {
  const { data, errors, handlers } = useAction(greetingAction);

  return (
    <>
      <form {...handlers}>
        <input name="name" />
        <button type="submit">Greet</button>
      </form>

      {data && <p>Response: {data}</p>}
      {errors && <p>Errors: {errors.map((e) => e.message).join(', ')}</p>}
    </>
  );
}
```

The `{...handlers}` spread syntax provides:

- Client-side form handling with JavaScript enabled
- Automatic fallback to native form submission when JavaScript is disabled
- Supports both the native <form> element and the new Next.js <Form> element

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
  const { handlers, getFormError } = useAction(submitFormAction);

  return (
    <form {...handlers}>
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
