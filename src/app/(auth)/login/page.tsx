"use client"

import React from 'react'
import { signIn, signOut } from 'next-auth/react'
import { GoogleIcon } from '@/public/icons/GoogleIcon'
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import config from '@/src/config';
import Script from 'next/script';

export default function LoginPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { setAuthData, logout } = useAuth();

    
    useEffect(() => {
        if (session) {
            
            setLoading(true);
            fetch(`${config.apiUrl}/auth/process-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user: session.user }),
            })
            .then(response => response.json())
            .then(data => {
                // Check if user is BPR
                if (data.user && data.user.is_bpr) {
                    // Set auth data for BPR user
                    setAuthData({
                        user: data.user,
                        access: data.access,
                        refresh: data.refresh
                    });
                    // Redirect to BPR homepage
                    router.push('/bpr');
                } 
                // Check if user has a toko (was not removed)
                else if (data.user && data.user.toko_id) {
                    // Normal user with a toko - proceed with login
                    setAuthData({
                        user: data.user,
                        access: data.access,
                        refresh: data.refresh
                    });
                    router.push('/');
                } else {
                    // User without a toko (removed or brand new)
                    // First set auth data so they have a valid token
                    setAuthData({
                        user: data.user,
                        access: data.access,
                        refresh: data.refresh
                    });
                    
                    // Redirect to home page - they'll be treated like a new user
                    router.push('/');
                }
            })
            .catch(error => {
                console.error('Authentication error:', error);
            })
            .finally(() => {
                setLoading(false);
            });
        }
    }, [session, router]);

    async function googleLogin() {
        await signIn("google", { callbackUrl: "/login", redirect: false })
    }

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
        <div className="flex justify-center items-center h-full p-3">
            <div className="bg-white rounded-xl flex flex-col items-center p-8 mx-2 space-y-4 border">
                <div className="flex flex-col items-center gap-2">
                    <p className="text-[#3554C1] font-bold text-lg">Masuk ke LANCAR</p>
                    <div className="rounded-full bg-[#5382DE] py-[2px] px-4 w-10"/>
                </div>
                <p className="text-center text-sm text-[#939393]">Silahkan masuk dengan akun yang terdaftar di LANCAR</p>
                <div className="rounded-lg border px-6 py-2">
                    <button 
                        onClick={googleLogin} 
                        className="flex gap-3 items-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <span>Loading...</span>
                        ) : (
                            <>
                                <GoogleIcon className="w-6 h-6"/>
                                <p className="font-bold text-xs">Masuk dengan Google</p>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
        </>
    );
}