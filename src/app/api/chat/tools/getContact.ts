import { tool } from 'ai';
import { z } from 'zod';

export const getContact = tool({
  description:
    'This tool show a my contact informations.',
  parameters: z.object({}),
  execute: async () => {
    return `You can reach me at:\n\n- Email: aliiqbal208@gmail.com\n- LinkedIn: https://www.linkedin.com/in/aliiqbal208/\n- Website: https://themuhammadali.dev/`;
  },
});
