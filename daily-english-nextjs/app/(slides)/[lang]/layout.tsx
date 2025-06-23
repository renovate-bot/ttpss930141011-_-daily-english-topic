export default function SlideRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout creates an independent layout hierarchy for slides
  // It bypasses the main [lang]/layout.tsx which contains AppHeader
  // Ensure full screen coverage with no extra spacing
  return (
    <div className="h-screen w-screen bg-slate-800 overflow-hidden">
      {children}
    </div>
  );
}