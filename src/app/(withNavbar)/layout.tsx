import { Navbar } from "@/src/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <main className="w-full sm:w-[402px] min-h-screen bg-[#EDF1F9]">
        <Navbar />
        <div className="h-full pb-32 p-3">
            {children}
        </div>
    </main>
  );
}