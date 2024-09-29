import { ErrorMessage } from '@vergestack/api';

export type ApiContextType = {
  /**
   * Called when an error occurs.
   *
   * @param err - The error message and optional path.
   * @param supressed - Whether the error was supressed. This is true when an error path is registered by getFormError. This way form errors can be rendered on the page instead of bubbling up into a global error handler.
   */
  handlers: {
    onError: (err: ErrorMessage, supressed: boolean) => void;
  };
};
