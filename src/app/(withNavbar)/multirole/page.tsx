"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import Header from "./components/header";
import UserList from "./components/userList";
import { useAuth } from "@/contexts/AuthContext";
import AddUserButton from "./components/addUserButton";
import Head from "next/head";

const MultiRolePageContent: React.FC = () => {
  const { user } = useAuth();

  const isPemilikOrPengelola = user?.role === "Pemilik" || user?.role === "Pengelola"; 

  return (
    <>
        <Head>
            <script
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
            </Head> 
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
