'use client';
import { useEffect } from 'react';

import fluidCursor from '@/hooks/use-FluidCursor';

const FluidCursor = () => {
  useEffect(() => {
    fluidCursor();
  }, []);

  return (
    <div className="fixed top-0 left-0 z-0 pointer-events-none">
      <canvas id="fluid" className="h-screen w-screen" aria-hidden="true" role="presentation" />
    </div>
  );
};
export default FluidCursor;
