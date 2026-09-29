type SectionHeadingProps = {
  title: string;
  description?: string;
};

export function SectionHeading({ title, description }: SectionHeadingProps) {
  return (
    <div className="mb-6">
      <h2 className="text-[1.35rem] font-bold tracking-tight text-foreground sm:text-2xl">
        {title}
      </h2>
      <div className="mt-3 h-1 w-12 rounded-full bg-gradient-to-r from-accent to-accent/40" />
      {description ? (
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">{description}</p>
      ) : null}
    </div>
  );
}
