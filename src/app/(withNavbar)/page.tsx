import Link from "next/link"

export default function Home() {
  return (
    <div className="max-w-md mx-auto min-h-screen pb-8">
      {/* Header */}
      <header className="flex justify-between items-center p-4 ">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-navy-700"
          >
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <h1 className="text-lg font-semibold text-navy-700">Warung Rifda Kurnia</h1>
        </div>
        <button className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-navy-700"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
      </header>

      {/* Main Menu */}
      <div className="grid grid-cols-3 gap-4 px-4 py-6 ">
        <Link href="/semuaBarang" className="flex flex-col items-center">
          <div className="bg-white p-3 rounded-full shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-navy-700"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <span className="mt-2 text-sm text-gray-700">Inventory</span>
        </Link>
        <Link href="#" className="flex flex-col items-center">
          <div className="bg-white p-3 rounded-full shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-navy-700"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <span className="mt-2 text-sm text-gray-700">Catat</span>
        </Link>
        <Link href="#" className="flex flex-col items-center">
          <div className="bg-white p-3 rounded-full shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-navy-700"
            >
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <span className="mt-2 text-sm text-gray-700">Pinjam</span>
        </Link>
      </div>

      {/* Dummy Pemasukan dan Pengeluaran */}
      <div className="relative -mx-3">
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gray-50"></div>
        <div className="relative grid grid-cols-2 gap-4 p-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500">Pemasukan</div>
            <div className="text-2xl font-bold mt-1">Rp50.000</div>
            <div className="flex items-center mt-1">
              <span className="text-green-500 text-xs">+2.3% vs bulan lalu</span>
              <svg
                className="w-4 h-4 text-green-500 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-500">Pengeluaran</div>
            <div className="text-2xl font-bold mt-1">Rp20.000</div>
            <div className="flex items-center mt-1">
              <span className="text-red-500 text-xs">+2.3% vs bulan lalu</span>
              <svg
                className="w-4 h-4 text-red-500 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
        
      {/* Quick Actions */}
      <div className="bg-gray-50 -mx-3">
        <div className="grid grid-cols-3 gap-4 px-4 mb-6">
          <Link href="/tambahProduk" className="flex flex-col items-center">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-gray-700"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
            </div>
            <span className="mt-2 text-xs text-center text-gray-700">Tambah Barang</span>
          </Link>
          <Link href="#" className="flex flex-col items-center">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-gray-700"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <span className="mt-2 text-xs text-center text-gray-700">Riwayat Pinjaman</span>
          </Link>
          <Link href="#" className="flex flex-col items-center">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-gray-700"
              >
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
              </svg>
            </div>
            <span className="mt-2 text-xs text-center text-gray-700">Laporan Keuangan</span>
          </Link>
        </div>
          
        {/* Dummy stok menipis */}
        <div className="px-4 mb-2">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Stok Menipis</h2>
            <Link href="#" className="text-sm text-gray-500">
              Lihat Semua
            </Link>
          </div>

          <div className="space-y-3 pb-4">
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-orange-500 mt-0.5"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <div>
                    <h3 className="font-medium">Roti Nadhira</h3>
                    <p className="text-sm text-gray-500">Tersisa 5 pcs</p>
                  </div>
                </div>
                <button className="bg-white text-sm py-1 px-3 rounded-md shadow-sm border border-gray-200">
                  Tambah Stok
                </button>
              </div>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-red-500 mt-0.5"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <div>
                    <h3 className="font-medium">Donat Dipta</h3>
                    <p className="text-sm text-gray-500">Tersisa 3 pcs</p>
                  </div>
                </div>
                <button className="bg-white text-sm py-1 px-3 rounded-md shadow-sm border border-gray-200">
                  Tambah Stok
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}