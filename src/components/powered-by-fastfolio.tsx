'use client';

import { Code, Heart, Github } from 'lucide-react';

export function PoweredByFastfolio() {
  return (
    <div className="flex items-center justify-center gap-1.5 pb-4 md:pb-0 text-xs text-gray-500">
      <Code className="w-3 h-3" />
      <span>with</span>
      <Heart className="w-3 h-3 text-red-500" />
      <span>by</span>
      <a
        href="https://github.com/aliiqbal208"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-gray-700 hover:text-gray-900 transition-colors underline decoration-gray-300 hover:decoration-gray-500"
        aria-label="My GitHub"
      >
        MuHaMMaD Ali
      </a>
      <span>using</span>
      <Github className="w-3 h-3" />
    </div>
  );
}