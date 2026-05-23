import { RoleGuard } from "@/components/role-guard";

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allow={["pediatrician", "nurse"]}>
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
        {children}
      </div>
    </RoleGuard>
  );
}
