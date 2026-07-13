import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { FloatingActionButton } from "@/components/FloatingActionButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex selection:bg-primary/20">
      <Sidebar />
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-6 md:p-10 relative overflow-hidden">
          {/* Subtle background glow for the dashboard area */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
          {children}
          <FloatingActionButton />
        </main>
      </div>
    </div>
  );
}
