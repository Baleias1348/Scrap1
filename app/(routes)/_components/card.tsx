// Temporary until deps installed
declare const React: any;

export function Card({ title, subtitle, value }: { title: string; subtitle?: string; value: string | number }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-sm text-muted-foreground">{title}</div>
      {subtitle ? <div className="text-xs text-muted-foreground/80">{subtitle}</div> : null}
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}