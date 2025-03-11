import HeaderProduk from '@/src/components/HeaderProduk';
import React, { Suspense } from 'react' 
// rafce

const DaftarProduk = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading header...</div>}>
              <HeaderProduk />
            </Suspense>
    </div>
  );
}

export default DaftarProduk 

