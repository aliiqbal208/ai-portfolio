import Image from 'next/image';
import { ChevronRight, Link } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Enhanced project content array with all projects
const PROJECT_CONTENT = [
  {
    title: 'Arthur Web App',
    description:
      'Cloud-agnostic PWA React app for Arthur VR with org/team/user management, RBAC, onboarding flows, real-time AV and 3D/WebGL, built as a scalable monorepo deployed on AWS and GCP.',
    techStack: [
      'TypeScript',
      'React',
      'Redux',
      'TailwindCSS',
      'TanStack React Query',
      'i18next',
      'Monorepo (Lerna + Yarn Workspaces)',
      'Webpack',
      'Jest',
      'Cypress',
      'Agora RTC',
      'WebGL/Unity',
      'Three.js',
      'Stripe payments',
      'AWS',
      'GCP',
      'PWA',
    ],
    date: '2025',
    links: [
      {
        name: 'App Link',
        url: 'https://portal.arthur.digital/login',
      },
    ],
    images: [
      {
        src: '/arthur-room.png',
        alt: 'Arthur Room page',
      },
      {
        src: '/room-joining.png',
        alt: 'Room Joining page',
      },
      {
        src: '/room-overview.png',
        alt: 'Room Overview page',
      },
    ],
  },
  {
    title: 'Remar VT',
    description:
      'Developed ReMar VT, a SaaS e-learning platform for nursing education delivering interactive video training. Built with React, TypeScript, Redux, and Material-UI in a monorepo architecture supporting students, admins, and institutions. Integrated Stripe for payments, role-based access, and real-time notifications. My role covered frontend development, state management, and subscription workflows, delivering a scalable, enterprise-grade LMS for healthcare professionals with secure auth, responsive design, seamless user experience, and comprehensive testing for reliability.',
    techStack: [
      'React',
      'Typescript',
      'Javascript',
      'Redux',
      'Material-UI',
      'Stripe',
    ],
    date: '2023',
    links: [
      {
        name: 'App URL',
        url: 'https://vt.remarnurse.com/',
      },
    ],
    images: [
      {
        src: '/vt-remar.png',
        alt: 'VT remar landing page',
      },
    ],
  },
  {
    title: 'Vyoo',
    description:
      'Vyoo is a community management platform designed to help creators and community managers build, engage, and monetize their online communities. It offers tools for content creation, member management, event organization, and analytics to foster a thriving community environment.',
    techStack: [
      'React',
      'TypeScript',
      'Redux',
      'TailwindCSS',
      'Nest.js',
      'Express',
      'MongoDB',
      'AWS',
      'Stripe',
    ],
    date: '2022',
    links: [
      {
        name: 'App URL',
        url: 'https://www.vyoo.me/',
      },
    ],
    images: [
      {
        src: '/vyoo.png',
        alt: 'Vyoo landing page',
      },
    ],
  },
];

// Define interface for project prop
interface ProjectProps {
  title: string;
  description?: string;
  techStack?: string[];
  date?: string;
  links?: { name: string; url: string }[];
  images?: { src: string; alt: string }[];
}

const ProjectContent = ({ project }: { project: ProjectProps }) => {
  // Find the matching project data
  const projectData = PROJECT_CONTENT.find((p) => p.title === project.title);

  if (!projectData) {
    return <div>Project details not available</div>;
  }

  return (
    <div className="space-y-10">
      {/* Header section with description */}
      <div className="rounded-3xl bg-[#F5F5F7] p-8 dark:bg-[#1D1D1F]">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
            <span>{projectData.date}</span>
          </div>

          <p className="text-secondary-foreground font-sans text-base leading-relaxed md:text-lg">
            {projectData.description}
          </p>

          {/* Tech stack */}
          <div className="pt-4">
            <h3 className="mb-3 text-sm tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
              Technologies
            </h3>
            <div className="flex flex-wrap gap-2">
              {projectData.techStack.map((tech, index) => (
                <span
                  key={index}
                  className="rounded-full bg-neutral-200 px-3 py-1 text-sm text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Links section */}
      {projectData.links && projectData.links.length > 0 && (
        <div className="mb-24">
          <div className="mb-4 flex items-center gap-2 px-6">
            <h3 className="text-sm tracking-wide text-neutral-500 dark:text-neutral-400">
              Links
            </h3>
            <Link className="text-muted-foreground w-4" />
          </div>
          <Separator className="my-4" />
          <div className="space-y-3">
            {projectData.links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-xl bg-[#F5F5F7] p-4 transition-colors hover:bg-[#E5E5E7] dark:bg-neutral-800 dark:hover:bg-neutral-700"
              >
                <span className="font-light capitalize">{link.name}</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Images gallery */}
      {projectData.images && projectData.images.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {projectData.images.map((image, index) => (
              <div
                key={index}
                className="relative aspect-video overflow-hidden rounded-2xl"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const data = [
  {
    category: 'Enterprise SaaS',
    title: 'Arthur Web App',
    src: '/arthur-room.png',
    content: <ProjectContent project={{ title: 'Arthur Web App' }} />,
  },
  {
    category: 'EdTech Platform',
    title: 'ReMar VT E-Learning Platform',
    src: '/vt-remar.png',
    content: <ProjectContent project={{ title: 'Remar VT' }} />,
  },
  {
    category: 'Community Management',
    title: 'Vyoo - Community Management Platform',
    src: '/vyoo.png',
    content: <ProjectContent project={{ title: 'Vyoo' }} />,
  },
];
