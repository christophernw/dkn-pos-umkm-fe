import { NegativeIcon } from '@/public/icons/NegativeIcon'
import { PlusIcon } from '@/public/icons/PlusIcon'
import React from 'react'
import Image from 'next/image'

export default function BarangSection() {
  return (
    <div className="h-[550px] overflow-y-scroll flex flex-col gap-3">
              <div className="bg-white flex rounded-2xl p-2 gap-3">
                <div className="w-28 h-28 relative rounded-2xl overflow-hidden">
                  <Image
                    src={
                      "/images/placeholder.svg"
                    }
                    alt="produk"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-between">
                  <div>
                    <p className="text-sm">Roti Tawar</p>
                    <p className="text-[10px] text-[#818898]">Lorem ipsum dolor sit amet lorem ipsum dolor sit amet</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[#3554C1] font-medium">Rp20.000</p>
                    <div className="flex bg-[#ECEFF3] rounded-full gap-2 justify-center items-center p-1">
                      <div className="bg-white rounded-full p-1">
                        <NegativeIcon />
                      </div>
                      <p>10</p>
                      <div className="bg-white rounded-full p-1">
                        <PlusIcon stroke='black' width={16} height={16}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white flex rounded-2xl p-2 gap-3">
                <div className="w-28 h-28 relative rounded-2xl overflow-hidden">
                  <Image
                    src={
                      "/images/placeholder.svg"
                    }
                    alt="produk"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-between">
                  <div>
                    <p className="text-sm">Roti Tawar</p>
                    <p className="text-[10px] text-[#818898]">Lorem ipsum dolor sit amet lorem ipsum dolor sit amet</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[#3554C1] font-medium">Rp20.000</p>
                    <div className="flex bg-[#ECEFF3] rounded-full gap-2 justify-center items-center p-1">
                      <div className="bg-white rounded-full p-1">
                        <NegativeIcon />
                      </div>
                      <p>10</p>
                      <div className="bg-white rounded-full p-1">
                        <PlusIcon stroke='black' width={16} height={16}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white flex rounded-2xl p-2 gap-3">
                <div className="w-28 h-28 relative rounded-2xl overflow-hidden">
                  <Image
                    src={
                      "/images/placeholder.svg"
                    }
                    alt="produk"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-between">
                  <div>
                    <p className="text-sm">Roti Tawar</p>
                    <p className="text-[10px] text-[#818898]">Lorem ipsum dolor sit amet lorem ipsum dolor sit amet</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[#3554C1] font-medium">Rp20.000</p>
                    <div className="flex bg-[#ECEFF3] rounded-full gap-2 justify-center items-center p-1">
                      <div className="bg-white rounded-full p-1">
                        <NegativeIcon />
                      </div>
                      <p>10</p>
                      <div className="bg-white rounded-full p-1">
                        <PlusIcon stroke='black' width={16} height={16}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white flex rounded-2xl p-2 gap-3">
                <div className="w-28 h-28 relative rounded-2xl overflow-hidden">
                  <Image
                    src={
                      "/images/placeholder.svg"
                    }
                    alt="produk"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-between">
                  <div>
                    <p className="text-sm">Roti Tawar</p>
                    <p className="text-[10px] text-[#818898]">Lorem ipsum dolor sit amet lorem ipsum dolor sit amet</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[#3554C1] font-medium">Rp20.000</p>
                    <div className="flex bg-[#ECEFF3] rounded-full gap-2 justify-center items-center p-1">
                      <div className="bg-white rounded-full p-1">
                        <NegativeIcon />
                      </div>
                      <p>10</p>
                      <div className="bg-white rounded-full p-1">
                        <PlusIcon stroke='black' width={16} height={16}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white flex rounded-2xl p-2 gap-3">
                <div className="w-28 h-28 relative rounded-2xl overflow-hidden">
                  <Image
                    src={
                      "/images/placeholder.svg"
                    }
                    alt="produk"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-between">
                  <div>
                    <p className="text-sm">Roti Tawar</p>
                    <p className="text-[10px] text-[#818898]">Lorem ipsum dolor sit amet lorem ipsum dolor sit amet</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[#3554C1] font-medium">Rp20.000</p>
                    <div className="flex bg-[#ECEFF3] rounded-full gap-2 justify-center items-center p-1">
                      <div className="bg-white rounded-full p-1">
                        <NegativeIcon />
                      </div>
                      <p>10</p>
                      <div className="bg-white rounded-full p-1">
                        <PlusIcon stroke='black' width={16} height={16}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  )
}
