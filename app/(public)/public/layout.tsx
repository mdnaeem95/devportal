export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Subtle gradient glow */}
      <div className="gradient-glow fixed inset-x-0 top-0 h-75 pointer-events-none opacity-50" />
      
      {children}
    </div>
  );
}