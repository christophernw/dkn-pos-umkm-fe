import { Navbar } from "@/src/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <main className="w-full sm:w-[402px] min-h-screen bg-[#EDF1F9] flex flex-col">
        <div className="flex-grow p-3 pb-32">
          {children}
        </div>
        <Navbar />
    </main>
  );
}