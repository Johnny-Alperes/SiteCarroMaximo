import Header from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 font-mono text-zinc-100">
      <Header />
      <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
