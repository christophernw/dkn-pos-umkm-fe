import HeaderProduk from '@/src/components/HeaderProduk'
import ProductCard from '@/src/components/ProductCard';
import React from 'react' 

const SemuaBarang = () => {
  return (
    <div className=''>
      <HeaderProduk />
      <main>
        <ProductCard />
      </main>
      <div className='fixed bottom-4 flex justify-end px-4 pb-24'>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-4xl just flex items-center justify-center h-14 w-14 font-medium rounded-full shadow-md">
          +
        </button>
      </div>
    </div>
  );
};

export default SemuaBarang