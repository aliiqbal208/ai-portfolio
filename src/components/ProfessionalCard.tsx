'use client';

import { MotionDiv } from '@/lib/motion-components';
import { Briefcase, Globe, Award } from 'lucide-react';

const ProfessionalCard = () => {
  const openMail = () => {
    window.open('mailto:aliiqbal208@gmail.com', '_blank');
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-accent mx-auto mt-8 w-full max-w-4xl rounded-3xl px-6 py-8 font-sans sm:px-10 md:px-16 md:py-12"
    >
      {/* Header */}
      <div className="mb-6 flex flex-col items-center sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar placeholder */}
          <div className="bg-muted h-16 w-16 overflow-hidden rounded-full shadow-md">
            <img
              src="/profil-ali.png"
              alt="Muhammad Ali's avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-foreground text-2xl font-semibold">
              Muhammad Ali
            </h2>
            <p className="text-muted-foreground text-sm">
              Senior Software Engineer
            </p>
          </div>
        </div>

        {/* Status badge */}
        <div className="mt-4 flex items-center gap-2 sm:mt-0">
          <span className="flex items-center gap-1 rounded-full border border-blue-500 px-3 py-0.5 text-sm font-medium text-blue-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
            </span>
            Available
          </span>
        </div>
      </div>

      {/* Professional Info */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex items-start gap-3">
          <Briefcase className="mt-1 h-5 w-5 text-blue-500" />
          <div>
            <p className="text-foreground text-sm font-medium">Current Role</p>
            <p className="text-muted-foreground text-sm">
              Lead Full Stack Developer at Arthur (2020 - Present)
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Globe className="mt-1 h-5 w-5 text-green-500" />
          <div>
            <p className="text-foreground text-sm font-medium">Location</p>
            <p className="text-muted-foreground text-sm">
              Lahore, Pakistan 🇵🇰
            </p>
          </div>
        </div>

        {/* Key Achievements */}
        <div className="flex items-start gap-3 sm:col-span-2">
          <Award className="mt-1 h-5 w-5 text-purple-500" />
          <div className="w-full">
            <p className="text-foreground text-sm font-medium">Key Achievements at Arthur</p>
            <div className="text-muted-foreground grid grid-cols-1 gap-y-1 text-sm sm:grid-cols-2">
              <ul className="decoration-none list-disc pl-4">
                <li>Spearheaded team of engineers, delivered 20+ features on time</li>
                <li>Architected cloud native apps on AWS/GCP, cutting vendor lock-in by 70%</li>
                <li>Deployed LLMs and RAG pipelines for 100K+ users, improving accuracy by 40%</li>
                <li>Built real-time speech pipelines for 5K concurrent users at &lt;200ms latency</li>
              </ul>
              <ul className="list-disc pl-4">
                <li>Engineered APIs for 1M+ requests/hour (99.99% uptime during 10x traffic spikes)</li>
                <li>Developed AI-driven meeting analytics, reducing note-taking by 60%</li>
                <li>Optimized full-stack performance, cutting latency by 60%</li>
                <li>
                  <a
                    href="/chat?query=What%20are%20your%20skills%3F%20Give%20me%20a%20list%20of%20your%20soft%20and%20hard%20skills."
                    className="cursor-pointer items-center text-blue-500 underline"
                  >
                    See more achievements
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Core Expertise */}
      <div className="mt-10">
        <p className="text-foreground mb-2 text-lg font-semibold">
          Core Expertise
        </p>
        <div className="text-foreground grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="font-medium mb-2">Programming & Frameworks</p>
            <p className="text-muted-foreground">
              JavaScript, TypeScript, Node.js, Python, Golang, React, Next.js, Angular, Express, Fastify, Go Fiber, Flask, FastAPI
            </p>
          </div>
          <div>
            <p className="font-medium mb-2">AI & Cloud Infrastructure</p>
            <p className="text-muted-foreground">
              LLMs (OpenAI, Hugging Face), RAG pipelines, AWS, GCP, Docker, MongoDB, PostgreSQL, Microservices, Serverless
            </p>
          </div>
          <div>
            <p className="font-medium mb-2">Architecture & Systems</p>
            <p className="text-muted-foreground">
              Scalable systems, Event-driven & real-time systems (WebSockets, Pub/Sub), High-throughput APIs
            </p>
          </div>
          <div>
            <p className="font-medium mb-2">Monitoring & Observability</p>
            <p className="text-muted-foreground">
              Prometheus, Grafana, ELK Stack, Splunk, Datadog, Sentry, Performance optimization
            </p>
          </div>
        </div>
      </div>

      {/* Professional Philosophy */}
      <div className="mt-8">
        <p className="text-foreground mb-2 text-lg font-semibold">Professional Philosophy</p>
        <p className="text-foreground text-sm">
          Senior Software Engineer with expertise in architecting scalable systems and AI-driven solutions. 
          Skilled in leading teams to deliver production-ready platforms, boosting efficiency and user engagement. 
          Proficient in modern web frameworks, cloud platforms (AWS/GCP), and high-performance systems. 
          Passionate about driving innovation and solving complex challenges to deliver impactful, user-centric systems. 🚀
        </p>
      </div>

      {/* Contact button */}
      <div className="mt-10 flex justify-center">
        <button
          onClick={openMail}
          className="cursor-pointer rounded-full bg-black px-6 py-3 font-semibold text-white transition-colors duration-300 hover:bg-zinc-800"
        >
          Contact me
        </button>
      </div>
    </MotionDiv>
  );
};

export default ProfessionalCard;
