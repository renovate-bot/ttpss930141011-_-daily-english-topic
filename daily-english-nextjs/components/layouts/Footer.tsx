'use client';

import React from 'react';
import Link from 'next/link';
import { type Locale } from '@/i18n-config';

interface FooterProps {
  lang: Locale;
}

/**
 * Shared footer component
 * @param {FooterProps} props - Component props
 * @returns {JSX.Element} Footer component
 */
export default function Footer({ lang }: FooterProps) {
  return (
    <footer className="relative z-10 bg-black/20 backdrop-blur-lg py-8 border-t border-white/10">
      <div className="container mx-auto px-6 text-gray-300">
        <div className="flex flex-wrap justify-center space-x-6">
          <a 
            href="https://github.com/ttpss930141011/daily-english-topic" 
            className="hover:text-white transition-colors"
          >
            <i className="fab fa-github mr-1"></i>GitHub
          </a>
          <Link href={`/${lang}/about`} className="hover:text-white transition-colors">
            About
          </Link>
          <Link href={`/${lang}/privacy`} className="hover:text-white transition-colors">
            Privacy
          </Link>
          <Link href={`/${lang}/terms`} className="hover:text-white transition-colors">
            Terms
          </Link>
        </div>
        <p className="mt-4 text-center text-sm">
          Updated on {new Date().toLocaleDateString()} • Powered by Reddit API & Azure OpenAI
        </p>
      </div>
    </footer>
  );
}