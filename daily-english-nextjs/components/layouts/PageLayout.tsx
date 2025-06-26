'use client';

import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'pricing';
}

/**
 * Shared page layout component with animated gradient background
 * @param {PageLayoutProps} props - Component props
 * @returns {JSX.Element} Page layout wrapper
 */
export default function PageLayout({ children, className = '', variant = 'default' }: PageLayoutProps) {
  return (
    <div className={`relative min-h-screen overflow-hidden ${className}`}>
      {/* Gradient Background */}
      <div className={`absolute inset-0 ${
        variant === 'pricing' 
          ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900' 
          : 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900'
      }`}>
        <div className="absolute inset-0 bg-animated-dots opacity-30" />
      </div>

      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {variant === 'pricing' ? (
          <>
            <div 
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-3xl opacity-15 animate-pulse" 
              style={{ animationDuration: '7s' }}
            />
            <div 
              className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl opacity-15 animate-pulse" 
              style={{ animationDelay: '3s', animationDuration: '9s' }}
            />
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full blur-3xl opacity-20 animate-pulse" 
              style={{ animationDelay: '5s', animationDuration: '11s' }}
            />
          </>
        ) : (
          <>
            <div 
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl opacity-15 animate-pulse" 
              style={{ animationDuration: '6s' }}
            />
            <div 
              className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur-3xl opacity-15 animate-pulse" 
              style={{ animationDelay: '2s', animationDuration: '8s' }}
            />
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full blur-3xl opacity-20 animate-pulse" 
              style={{ animationDelay: '4s', animationDuration: '10s' }}
            />
          </>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}