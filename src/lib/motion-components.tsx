'use client';

import { motion } from 'framer-motion';
import { forwardRef } from 'react';

// Custom motion div component that accepts className
type MotionDivProps = {
  className?: string;
  children?: React.ReactNode;
  initial?: any;
  animate?: any;
  variants?: any;
  whileHover?: any;
  whileTap?: any;
  whileInView?: any;
  exit?: any;
  transition?: any;
  style?: any;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  onTap?: () => void;
  onAnimationComplete?: () => void;
  layout?: boolean;
  layoutId?: string;
  key?: string | number;
};

const MotionDivBase = forwardRef<HTMLDivElement, MotionDivProps>(({ className, children, ...props }, ref) => {
  return <div ref={ref} className={className} {...props}>{children}</div>;
});

MotionDivBase.displayName = 'MotionDiv';

export const MotionDiv = motion(MotionDivBase);

// Custom motion button component
type MotionButtonProps = {
  className?: string;
  children?: React.ReactNode;
  initial?: any;
  animate?: any;
  variants?: any;
  whileHover?: any;
  whileTap?: any;
  whileInView?: any;
  exit?: any;
  transition?: any;
  style?: any;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  onTap?: () => void;
  onAnimationComplete?: () => void;
  layout?: boolean;
  layoutId?: string;
  key?: string | number;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
};

const MotionButtonBase = forwardRef<HTMLButtonElement, MotionButtonProps>(({ className, children, ...props }, ref) => {
  return <button ref={ref} className={className} {...props}>{children}</button>;
});

MotionButtonBase.displayName = 'MotionButton';

export const MotionButton = motion(MotionButtonBase);

// Custom motion p component
type MotionPProps = {
  className?: string;
  children?: React.ReactNode;
  initial?: any;
  animate?: any;
  variants?: any;
  whileHover?: any;
  whileTap?: any;
  whileInView?: any;
  exit?: any;
  transition?: any;
  style?: any;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  onTap?: () => void;
  onAnimationComplete?: () => void;
  layout?: boolean;
  layoutId?: string;
  key?: string | number;
};

const MotionPBase = forwardRef<HTMLParagraphElement, MotionPProps>(({ className, children, ...props }, ref) => {
  return <p ref={ref} className={className} {...props}>{children}</p>;
});

MotionPBase.displayName = 'MotionP';

export const MotionPWithMotion = motion(MotionPBase);
