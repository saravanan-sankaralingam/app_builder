export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Builder has its own layout - no AppLayout wrapper
  return <>{children}</>;
}
