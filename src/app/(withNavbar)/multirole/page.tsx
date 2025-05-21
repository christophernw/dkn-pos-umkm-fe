"use client";

import React, { useEffect } from "react";
import { SessionProvider, signOut } from "next-auth/react";
import Header from "./components/header";
import UserList from "./components/userList";
import { useAuth } from "@/contexts/AuthContext";
import AddUserButton from "./components/addUserButton";
import Script from "next/script";
import config from "@/src/config";
import router from "next/router";

const MultiRolePageContent: React.FC = () => {
  const { user, accessToken, logout } = useAuth();

  // In MultiRolePageContent component
  useEffect(() => {
    const validateSession = async () => {
      if (!accessToken) return;

      try {
        const res = await fetch(`${config.apiUrl}/auth/validate-token`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await res.json();

        if (!data.valid) {
          alert("Sesi Anda telah berakhir atau Anda telah dikeluarkan dari toko.");
          logout();
          await signOut({ redirect: false });
          router.push("/");
        } else if (data.user) {
          // Check for role mismatch between backend and frontend
          if (user?.role !== data.user.role || user?.toko_id !== data.user.toko_id) {
            console.log("Role/toko mismatch detected. Frontend:", user, "Backend:", data.user);
            alert("Informasi akun Anda telah berubah. Silakan login kembali.");
            logout();
            await signOut({ redirect: false });
            router.push("/");
          }
        }
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