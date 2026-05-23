import { RoleGuard } from "@/components/role-guard";
import { ParentAIFloatingAssistant } from "@/components/parent/ParentAIFloatingAssistant";

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allow={["parent"]}>
      <div className="mx-auto max-w-7xl bg-[#f8fafc] px-4 py-5 sm:px-6 sm:py-8 min-h-[calc(100vh-4.5rem)]">
        {children}
      </div>
      <ParentAIFloatingAssistant />
    </RoleGuard>
  );
}
