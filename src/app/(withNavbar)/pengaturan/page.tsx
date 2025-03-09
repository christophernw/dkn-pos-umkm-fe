import React from 'react'
import { Header } from './module-element/Header'
import Link from 'next/link'

export default function SettingsPage() {
  
  return (
    <div>
      <Header/>
      <div>
        <Link href={'/multirole'}>
          <div className="bg-white rounded-xl py-3 px-4 border">
            <p>Pengaturan Pengguna</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
