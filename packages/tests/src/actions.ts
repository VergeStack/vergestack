import { createAction } from '@vergestack/api';
import { z } from 'zod';

export const greetingAction = createAction()
  .input(z.string())
  .output(z.string())
  .handler(async (name) => {
    return `Hello, ${name}!`;
  });
