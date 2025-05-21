"use client";

import React, { useEffect } from "react";
import { SessionProvider, signOut } from "next-auth/react";
import Header from "./components/header";
import UserList from "./components/userList";
import { useAuth } from "@/contexts/AuthContext";
import AddUserButton from "./components/addUserButton";
import Script from "next/script";
import config from "@/src/config"
import { useRouter } from 'next/navigation';;

const MultiRolePageContent: React.FC = () => {
  const { user, accessToken, logout } = useAuth();
  const router = useRouter()
  // In MultiRolePageContent component
  useEffect(() => {
    const validateSession = async () => {
      if (!accessToken) return;

      try {
        // Get current user info
        const userInfoResponse = await fetch(`${config.apiUrl}/auth/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        
        if (!userInfoResponse.ok) {
          // If we can't get user info, user has likely been kicked
          alert("Sesi Anda telah berakhir atau Anda telah dikeluarkan dari toko.");
          logout();
          await signOut({ redirect: true });
          router.push("/");
          return;
        }
        
        const userInfo = await userInfoResponse.json();
        
        // Compare with current frontend user data
        if (user?.toko_id !== userInfo.toko_id || user?.role !== userInfo.role) {
          alert("Informasi akun Anda telah berubah. Silakan login kembali.");
          logout();
          await signOut({ redirect: true });
          router.push("/");
          return;
        }
        
        // Continue with other validation if needed
      } catch (err) {
        console.error("Gagal validasi sesi:", err);
        logout();
        await signOut({ redirect: false });
        router.push("/");
      }
    };

    validateSession();
  }, [accessToken, user, logout, router]);

  // Updated condition to exclude BPR users
  const isPemilikOrPengelola = 
    (user?.role === "Pemilik" || user?.role === "Pengelola") && 
    !user?.is_bpr;

  return (
    <>
        <Script
        id="maze-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function (m, a, z, e) {
              var s, t;
              try {
                t = m.sessionStorage.getItem('maze-us');
              } catch (err) {}

              if (!t) {
                t = new Date().getTime();
                try {
                  m.sessionStorage.setItem('maze-us', t);
                } catch (err) {}
              }

              s = a.createElement('script');
              s.src = z + '?apiKey=' + e;
              s.async = true;
              a.getElementsByTagName('head')[0].appendChild(s);
              m.mazeUniversalSnippetApiKey = e;
            })(window, document, 'https://snippet.maze.co/maze-universal-loader.js', 'e31b53f6-c7fd-47f2-85df-d3c285f18b33');
          `,
        }}
      />
    <div className="relative min-h-screen pt-4 mt-4">
      <Header />
      <UserList />
      {isPemilikOrPengelola && <AddUserButton />}
    </div>
    </>
  );
};

const MultiRolePage: React.FC = () => (
  <SessionProvider>
    <MultiRolePageContent />
  </SessionProvider>
);

export default MultiRolePage;