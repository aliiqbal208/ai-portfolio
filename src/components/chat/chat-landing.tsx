'use client';

import { Award, Code, Mail, MessageSquare } from 'lucide-react';
import { MotionDiv, MotionButton } from '@/lib/motion-components';

interface ChatLandingProps {
  submitQuery: (query: string) => void;
  hasReachedLimit?: boolean;
}

const ChatLanding: React.FC<ChatLandingProps> = ({ submitQuery, hasReachedLimit = false }) => {
  // Suggested questions that the user can click on
  const suggestedQuestions = [
    {
      icon: <MessageSquare className="h-4 w-4" />,
      text: 'Who are you?',
    },
    {
      icon: <Code className="h-4 w-4" />,
      text: 'What projects have you worked on?',
    },
    {
      icon: <Award className="h-4 w-4" />,
      text: 'What are your skills?',
    },
    {
      icon: <Mail className="h-4 w-4" />,
      text: 'How can I contact you?',
    },
  ];

  // Animation variants for staggered animation
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
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <MotionDiv
      className="flex w-full flex-col items-center px-4 py-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Welcome message */}
      <MotionDiv className="mb-8 text-center" variants={itemVariants}>
        <h2 className="mb-3 text-2xl font-semibold">
            I'm Muhammad Ali's digital twin
        </h2>
        <p className="text-muted-foreground mx-auto max-w-md">
          The first portfolio that fit YOU needs.
        </p>
      </MotionDiv>

      {/* Suggested questions */}
      <MotionDiv
        className="w-full max-w-md space-y-3"
        variants={containerVariants}
      >
        {suggestedQuestions.map((question, index) => (
          <MotionButton
            key={index}
            className={`flex w-full items-center rounded-lg px-4 py-3 transition-colors ${
              hasReachedLimit 
                ? 'bg-gray-100 cursor-not-allowed opacity-50' 
                : 'bg-accent hover:bg-accent/80'
            }`}
            onClick={() => !hasReachedLimit && submitQuery(question.text)}
            variants={itemVariants}
            whileHover={!hasReachedLimit ? { scale: 1.02 } : {}}
            whileTap={!hasReachedLimit ? { scale: 0.98 } : {}}
            disabled={hasReachedLimit}
          >
            <span className="bg-background mr-3 rounded-full p-2">
              {question.icon}
            </span>
            <span className="text-left">{question.text}</span>
          </MotionButton>
        ))}
      </MotionDiv>
    </MotionDiv>
  );
};

export default ChatLanding;
