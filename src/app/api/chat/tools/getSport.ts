
import { tool } from "ai";
import { z } from "zod";


export const getSports = tool({
  description:
    "This tool will show Muhammad Ali's favorite sports and activities",
  parameters: z.object({}),
  execute: async () => {
    return "Here are the sports and activities I enjoy: Cricket (Advanced), Gym (Hard), Snooker (Intermediate), and Tekken (Casual).";
  },
});