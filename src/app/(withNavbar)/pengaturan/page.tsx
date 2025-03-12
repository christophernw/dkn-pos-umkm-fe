"use client"

import React, { useState } from 'react'
import { Header } from './module-element/Header'
import Link from 'next/link'
import { Modal } from '@/src/components/elements/modal/Modal'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };
  
  return (
    <div>
      <Header/>
      <div className="flex flex-col gap-2">
        <div onClick={() => setIsModalOpen(true)} className="bg-white rounded-xl py-3 px-4 border">
          <p>Logout</p>
        </div>
      </div>
      {isModalOpen && 
          <Modal onClose={() => setIsModalOpen(false)}>
              <h1>Apakah anda yakin ingin Logout?</h1>
              <div className="flex gap-8">
                <button onClick={handleSignOut}>Ya</button>
                <button onClick={() => setIsModalOpen(false)}>Tidak</button>
              </div>
          </Modal>
      }
    </div>
  )
}
