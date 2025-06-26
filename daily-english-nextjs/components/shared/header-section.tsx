interface HeaderSectionProps {
  label?: string;
  title: string;
  subtitle?: string;
}

export function HeaderSection({ label, title, subtitle }: HeaderSectionProps) {
  return (
    <div className="flex flex-col items-center text-center">
      {label ? (
        <div className="text-gradient_indigo-purple mb-4 font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
          {label}
        </div>
      ) : null}
      <h2 className="font-heading text-3xl md:text-4xl lg:text-[40px] text-white">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-6 text-balance text-lg text-gray-300">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
