"use client"

import React, { useState } from 'react'
import { Header } from './module-element/Header'
import { Modal } from '@/src/components/elements/modal/Modal'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import Head from 'next/head'

export default function SettingsPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { logout} = useAuth();

  const handleSignOut = async () => {
    logout();
    await signOut({ redirect: false });
    router.push("/");
  };
  
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
    <div>
      <Header/>
      <div className="flex flex-col gap-2">
        <Link href={'/multirole'}>
          <div className="bg-white rounded-xl py-3 px-4 border">
            <p>Pengaturan Pengguna</p>
          </div>
        </Link>
        <button onClick={() => setIsModalOpen(true)} className="bg-white rounded-xl py-3 px-4 border">
          <p className="text-left">Logout</p>
        </button>
      </div>
      {isModalOpen && 
          <Modal onClose={() => setIsModalOpen(false)}>
              <div className="p-2 text-center">
                <h1 className="text-base font-medium mb-4">Apakah anda yakin ingin Logout?</h1>
                <div className="flex justify-center gap-3">
                  <button 
                    onClick={handleSignOut}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm py-1.5 px-4 rounded transition-colors"
                  >
                    Ya
                  </button>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm py-1.5 px-4 rounded transition-colors"
                  >
                    Tidak
                  </button>
                </div>
              </div>
          </Modal>
      }
    </div>
    </>
  )
}