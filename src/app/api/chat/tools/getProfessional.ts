import { tool } from 'ai';
import { z } from 'zod';

export const getProfessional = tool({
  description:
    "Gives a comprehensive overview of my professional experience, current role, and career achievements. Use this tool when the user asks about my work experience, current position, or professional background.",
  parameters: z.object({}),
  execute: async () => {
    return `## Professional Experience Overview

### Current Role: Lead Full Stack Developer at Arthur (2020 - Present)
**Company**: [Arthur Digital](https://www.arthur.digital/)

**Key Achievements:**
- 🚀 **Team Leadership**: Spearheaded team of engineers to build scalable systems, delivering 20+ features on time, boosting deployment speed by 50%
- ☁️ **Cloud Architecture**: Architected cloud native apps on AWS/GCP, enabling zero downtime migrations, cutting vendor lock-in by 70%
- 🤖 **AI Integration**: Deployed LLMs and RAG pipelines, reducing latency by 35% and improving query accuracy by 40% for 100K+ users
- ⚡ **Real-time Systems**: Built real time speech pipelines and chatbots for 5K concurrent users at <200ms latency, enhancing engagement by 55%
- 📈 **High Performance**: Engineered high throughput APIs for 1M+ requests/hour, ensuring 99.99% uptime during 10x traffic spikes
- 📊 **AI Analytics**: Developed AI-driven meeting analytics, reducing note taking time by 60% and increasing team productivity by 45%
- 🔧 **Performance Optimization**: Optimized full-stack performance (DB, logic, network, caching), cutting latency by 60%, reducing page load times by 45%

### Previous Experience

**Software Engineer at TazteqPk (2018 - 2020)**
- As the first hire, pioneered the ERP product by building scalable, responsive UI modules for Inventory, HRM, Reporting, and Sales
- Improved onboarding by 30% and boosted overall efficiency by 40% across departments

**Web Developer at Whitehats (2016 - 2018)**
- Built scalable, SEO optimized UI with multi tenant flows and real time interactions
- Boosted visibility by 30% and enabled 15+ features
- Enhanced front end speed for instant load times, lifting engagement by 35%

### Education
**BS in Computer Science** - University of Lahore (2011 - 2015)

### Core Expertise
- **Languages**: JavaScript, TypeScript, Node.js, Python, Golang
- **Frontend**: React, Next.js, Angular, HTML, CSS, Tailwind CSS
- **Backend**: Express, Fastify, Go Fiber, Flask, FastAPI
- **AI & Data**: LLMs (OpenAI, Hugging Face), RAG pipelines, semantic search, chatbot development, speech processing, AI automations, agentic AI
- **Cloud & Infrastructure**: AWS (S3, Lambda, DynamoDB), GCP, Docker, Redis, GitHub Actions
- **Databases**: MongoDB, PostgreSQL (ORMs and native drivers)
- **Architecture**: Scalable systems, Microservices, Serverless, Event-driven & real-time systems (WebSockets, Pub/Sub)
- **Monitoring**: Prometheus, Grafana, ELK Stack, Splunk, Datadog, Sentry

📬 **Contact Information:**
- Email: aliiqbal208@gmail.com
- Phone: +92 300 2081994
- Website: [themuhammadali.dev](https://themuhammadali.dev/)
- LinkedIn: [linkedin.com/in/aliiqbal208](https://www.linkedin.com/in/aliiqbal208/)
- GitHub: [github.com/aliiqbal208](https://github.com/aliiqbal208)

Ready to discuss opportunities and collaborations! 🚀
    `;
  },
});
