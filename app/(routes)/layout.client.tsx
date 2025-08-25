"use client";
import * as React from 'react';
import { ModelConfigProvider } from '../../src/lib/ai/ModelConfigProvider';

export default function RoutesNavLayout({ children }: { children: any }) {
  return (
    <ModelConfigProvider>
      <div className="min-h-screen">
        <nav className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-4 py-3 flex gap-4">
            <a className="font-semibold" href="/">Scraping Hub</a>
            <a className="text-sm text-muted-foreground hover:underline" href="/(routes)/dashboard">Dashboard</a>
            <a className="text-sm text-muted-foreground hover:underline" href="/(routes)/scraper">Scraper</a>
            <a className="text-sm text-muted-foreground hover:underline" href="/(routes)/results">Resultados</a>
          </div>
        </nav>
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </div>
    </ModelConfigProvider>
  );
}