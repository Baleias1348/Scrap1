// Temporary until deps installed
declare const React: any;

export function TopNav() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-6xl px-4 py-3 flex gap-4">
        <a className="font-semibold" href="/">Scraping Hub</a>
        <a className="text-sm text-muted-foreground hover:underline" href="/(routes)/dashboard">Dashboard</a>
        <a className="text-sm text-muted-foreground hover:underline" href="/(routes)/scraper">Scraper</a>
        <a className="text-sm text-muted-foreground hover:underline" href="/(routes)/results">Resultados</a>
      </div>
    </nav>
  );
}