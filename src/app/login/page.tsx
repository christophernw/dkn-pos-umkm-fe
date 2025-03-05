"use client"
import React from 'react'
import { signIn } from 'next-auth/react'

export default function LoginPage() {
    async function googleLogin() {
        await signIn("google")
    }

    return (
        <div>
            <button type="button" className="bg-white w-full flex gap-5 justify-center" onClick={googleLogin}>
                Sign in via Google
            </button>
        </div>
  )
}
