import { Badge } from '@/components/ui/badge';

interface PageHeroProps {
  badge: string;
  badgeClassName?: string;
  title: string;
  description: string;
}

export function PageHero({ badge, badgeClassName, title, description }: PageHeroProps) {
  return (
    <div className="flex flex-col items-center text-center mb-10 space-y-4">
      <Badge
        variant="secondary"
        className={`px-4 py-1.5 text-sm font-normal rounded-full ${badgeClassName ?? 'border-primary/20 bg-primary/5 text-primary'}`}
      >
        {badge}
      </Badge>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="text-muted-foreground text-lg max-w-2xl">{description}</p>
    </div>
  );
}
