import { NotesIcon } from '@/public/icons/notesIcon'
import { OptionsIcon } from '@/public/icons/OptionsIcon'
import React from 'react'

export const TransactionHeader = () => {
  return (
     <div className="justify-between flex">
        <div className="flex p-1 bg-white rounded-full items-center gap-2 w-fit">
            <div className="bg-primary-indigo rounded-full p-2">
                <NotesIcon />
            </div>
            <p className="pr-3">Transaksi</p>
        </div>
        <div className="bg-white rounded-full p-3">
            <OptionsIcon />
        </div>
    </div>
  )
}
