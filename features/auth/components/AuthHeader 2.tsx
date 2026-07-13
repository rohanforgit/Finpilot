interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-start mb-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-heading font-bold text-lg">F</span>
        </div>
        <span className="font-heading font-bold text-xl tracking-tight">FinPilot</span>
      </div>
      <h1 className="text-3xl font-heading font-bold mb-2 tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
  );
}
