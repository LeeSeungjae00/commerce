import { useCallback, useEffect, useState } from 'react';
import { products } from '@prisma/client';
import Image from 'next/image';
import { Pagination } from '@mantine/core';
import { CATEGORY_MAP, TAKE } from 'constants/products';

export default function Products() {
  const [activePage, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [products, setProducts] = useState<products[]>([]);

  useEffect(() => {
    fetch(`/api/get-products-count`)
      .then(res => res.json())
      .then(res => setTotal(Math.ceil(res.items / TAKE)));
    fetch(`/api/get-products?skip=0&take=${TAKE}`)
      .then(res => res.json())
      .then(res => setProducts(res.items));
    return () => {};
  }, []);

  useEffect(() => {
    const skip = TAKE * (activePage - 1);
    fetch(`/api/get-products?skip=${skip}&take=${TAKE}`)
      .then(res => res.json())
      .then(res => setProducts(res.items));
  }, [activePage]);

  return (
    <div className="px-36 mt-36 mb-36">
      <div className="grid grid-cols-3 gap-5">
        {products &&
          products.map(item => (
            <div key={item.id} style={{ maxWidth: 310 }}>
              <Image
                className="rounded"
                alt={item.name}
                src={item.image_url ?? ''}
                width={300}
                height={200}
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP0dPesBwADFAFamsrLhQAAAABJRU5ErkJggg=="
              ></Image>
              <div className="flex">
                <span>{item.name}</span>
                <span className="ml-auto">{item.price.toLocaleString('ko-KR')}원</span>
              </div>
              <span className="text-zinc-400">{CATEGORY_MAP[item.category_id]}</span>
            </div>
          ))}
      </div>
      <div className="w-full flex mt-5">
        <Pagination className="m-auto" page={activePage} onChange={setPage} total={10} />
      </div>
    </div>
  );
}
