import { tool } from 'ai';
import { z } from 'zod';

export const getPresentation = tool({
  description:
    'This tool returns a concise personal introduction of Muhammad Ali. It is used to answer the question "Who are you?" or "Tell me about yourself"',
  parameters: z.object({}),
  execute: async () => {
    return {
      presentation:
        "I'm Muhammad Ali, a Senior Software Engineer specializing in architecting scalable systems and AI‑driven solutions. I lead teams to deliver production‑ready platforms that boost efficiency and user engagement, working across modern web frameworks with Node.js, Python and Go, and cloud platforms like AWS and GCP. Recently at Arthur, I've built real‑time speech pipelines, chatbots and high‑throughput APIs (99.99% uptime), and previously shipped ERP and multi‑tenant web platforms; I hold a BS in Computer Science from the University of Lahore.",
    };
  },
});
