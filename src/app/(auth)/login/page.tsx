"use client"
import React from 'react'
import { signIn } from 'next-auth/react'
import { GoogleIcon } from '@/public/icons/GoogleIcon'

export default function LoginPage() {
    async function googleLogin() {
        await signIn("google")
    }

    return (
        <div className="flex justify-center items-center h-full p-3">
            <div className="bg-white rounded-xl flex flex-col items-center p-8 mx-2 space-y-4 border">
                <div className="flex flex-col items-center gap-2">
                    <p className="text-[#3554C1] font-bold text-lg">Masuk ke LANCAR</p>
                    <div className="rounded-full bg-[#5382DE] py-[2px] px-4 w-10"/>
                </div>
                <p className="text-center text-sm text-[#939393]">Silahkan masuk dengan akun yang terdaftar di LANCAR</p>
                <div className="rounded-lg border px-6 py-2">
                    <button onClick={googleLogin} className="flex gap-3 items-center">
                        <GoogleIcon className="w-6 h-6"/>
                        <p className="font-bold text-xs">Masuk dengan Google</p>
                    </button>
                </div>
            </div>
        </div>
  )
}
