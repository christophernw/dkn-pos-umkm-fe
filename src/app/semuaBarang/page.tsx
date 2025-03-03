import HeaderProduk from '@/src/components/HeaderProduk'
import ProductCard from '@/src/components/ProductCard';
import React from 'react' 

const semuaBarang = () => {
  return (
    <div className='relative min-h-screen'>
      <HeaderProduk />
      <main>
        <ProductCard />
      </main>
      <section className='my-5'>
        <div className="flex space-x-1 justify-center">
          <button className="rounded-md border border-slate-300 py-2 px-3 text-center text-sm transition-all shadow-sm hover:shadow-lg hover:text-white hover:bg-blue-700 hover:border-blue-700 focus:text-white focus:bg-blue-700 focus:border-blue-700 active:border-blue-600 active:text-white active:bg-blue-600 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2">
              Prev
          </button>
          <button className="min-w-9 rounded-md bg-blue-700 py-2 px-3 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-blue-700 focus:shadow-none active:bg-blue-600 hover:bg-blue-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2">
              1
          </button>
          <button className="min-w-9 rounded-md border border-slate-300 py-2 px-3 text-center text-sm transition-all shadow-sm hover:shadow-lg hover:text-white hover:bg-blue-700 hover:border-blue-700 focus:text-white focus:bg-blue-700 focus:border-blue-700 active:border-blue-600 active:text-white active:bg-blue-600 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2">
              2
          </button>
          <button className="min-w-9 rounded-md border border-slate-300 py-2 px-3 text-center text-sm transition-all shadow-sm hover:shadow-lg hover:text-white hover:bg-blue-700 hover:border-blue-700 focus:text-white focus:bg-blue-700 focus:border-blue-700 active:border-blue-600 active:text-white active:bg-blue-600 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2">
              3
          </button>
          <button className="min-w-9 rounded-md border border-slate-300 py-2 px-3 text-center text-sm transition-all shadow-sm hover:shadow-lg hover:text-white hover:bg-blue-700 hover:border-blue-700 focus:text-white focus:bg-blue-700 focus:border-blue-700 active:border-blue-600 active:text-white active:bg-blue-600 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2">
              Next
          </button>
        </div>
      </section>
      <div className='fixed bottom-4 flex justify-end px-4'>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-4xl just flex items-center justify-center h-14 w-14 font-medium rounded-full shadow-md">
          +
        </button>
      </div>
    </div>
  );
};

export default semuaBarang