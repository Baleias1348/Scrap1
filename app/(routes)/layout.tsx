// Temporary until deps installed
declare const React: any;

import { TopNav } from "./_components/nav";

export default function RoutesLayout({ children }: { children: any }) {
  return (
    <div className="min-h-screen">
      <TopNav />
      <div className="mx-auto max-w-6xl">
        {children}
      </div>
    </div>
  );
}