
import { tool } from "ai";
import { z } from "zod";


export const getSports = tool({
  description:
    "This tool will show some photos of Muhammad Ali doing sports",
  parameters: z.object({}),
  execute: async () => {
    return "Here my best pictures of me doing sports!";
  },
});