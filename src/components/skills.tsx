'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Cpu, Database, Cloud, BarChart3 } from 'lucide-react';
import { MotionDiv } from '@/lib/motion-components';

const Skills = () => {
  const skillsData = [
    {
      category: 'Programming Languages',
      icon: <Code className="h-5 w-5" />,
      skills: [
        'JavaScript',
        'TypeScript',
        'Node.js',
        'Python',
        'Golang',
      ],
      color: 'bg-blue-50 text-blue-600 border border-blue-200',
    },
    {
      category: 'Frontend Frameworks',
      icon: <Code className="h-5 w-5" />,
      skills: [
        'React',
        'Next.js',
        'Angular',
      ],
      color: 'bg-cyan-50 text-cyan-600 border border-cyan-200',
    },
    {
      category: 'Backend Frameworks',
      icon: <Cpu className="h-5 w-5" />,
      skills: [
        'Express',
        'Fastify',
        'Go Fiber',
        'Flask',
        'FastAPI',
      ],
      color: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    },
    {
      category: 'AI & Data',
      icon: <Cpu className="h-5 w-5" />,
      skills: [
        'OpenAI',
        'Hugging Face',
        'LLMs',
        'RAG Pipelines',
        'Semantic Search',
        'Chatbot Development',
        'Speech Processing',
        'AI Automations',
        'Agentic AI',
        'MCP',
      ],
      color: 'bg-purple-50 text-purple-600 border border-purple-200',
    },
    {
      category: 'Cloud & Infrastructure',
      icon: <Cloud className="h-5 w-5" />,
      skills: [
        'AWS',
        'S3',
        'Lambda',
        'DynamoDB',
        'GCP',
        'Docker',
        'Redis',
        'GitHub Actions',
      ],
      color: 'bg-orange-50 text-orange-600 border border-orange-200',
    },
    {
      category: 'Databases',
      icon: <Database className="h-5 w-5" />,
      skills: [
        'MongoDB',
        'PostgreSQL',
        'ORMs',
        'Native Drivers',
      ],
      color: 'bg-green-50 text-green-600 border border-green-200',
    },
    {
      category: 'Architecture & Systems',
      icon: <BarChart3 className="h-5 w-5" />,
      skills: [
        'Scalable Systems',
        'Microservices',
        'Serverless',
        'Event-driven Systems',
        'Real-time Systems',
        'Kafka',
        'WebSockets',
        'Pub/Sub',
      ],
      color: 'bg-indigo-50 text-indigo-600 border border-indigo-200',
    },
    {
      category: 'Monitoring & Observability',
      icon: <BarChart3 className="h-5 w-5" />,
      skills: [
        'Prometheus',
        'Grafana',
        'ELK Stack',
        'Splunk',
        'Datadog',
        'Sentry',
      ],
      color: 'bg-red-50 text-red-600 border border-red-200',
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.19, 1, 0.22, 1] },
    },
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  return (
    <MotionDiv
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
      className="mx-auto w-full max-w-5xl rounded-4xl"
    >
      <Card className="w-full border-none px-0 pb-12 shadow-none">
        <CardHeader className="px-0 pb-1">
          <CardTitle className="text-primary px-0 text-4xl font-bold">
            Skills & Expertise
          </CardTitle>
        </CardHeader>

        <CardContent className="px-0">
          <MotionDiv
            className="space-y-8 px-0"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {skillsData.map((section, index) => (
              <MotionDiv
                key={index}
                className="space-y-3 px-0"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2">
                  {section.icon}
                  <h3 className="text-accent-foreground text-lg font-semibold">
                    {section.category}
                  </h3>
                </div>

                <MotionDiv
                  className="flex flex-wrap gap-2"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {section.skills.map((skill, idx) => (
                    <MotionDiv
                      key={idx}
                      variants={badgeVariants}
                      whileHover={{
                        scale: 1.04,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <Badge className={`border px-3 py-1.5 font-normal`}>
                        {skill}
                      </Badge>
                    </MotionDiv>
                  ))}
                </MotionDiv>
              </MotionDiv>
            ))}
          </MotionDiv>
        </CardContent>
      </Card>
    </MotionDiv>
  );
};

export default Skills;
