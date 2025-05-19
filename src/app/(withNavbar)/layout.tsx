'use client'

import { Navbar } from "@/src/components/layout/Navbar";
import { BPRNavbar } from "@/src/components/layout/BPRNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="w-full sm:w-[420px] min-h-screen bg-[#EDF1F9] flex flex-col">
        <div className="flex-grow p-5 pb-32">
          {children}
        </div>
        <NavbarWrapper />
    </main>
  );
}

// Client component for navbar selection
function NavbarWrapper() {
  "use client";
  
  const { user } = useAuth();
  const pathname = usePathname();
  
  // If in BPR section or user is BPR, show BPR navbar
  if (user?.is_bpr || pathname.startsWith('/bpr')) {
    return <BPRNavbar />;
  }
  
  // Otherwise show regular navbar
  return <Navbar />;
}