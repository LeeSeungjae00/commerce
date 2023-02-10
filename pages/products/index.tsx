import { useCallback, useEffect, useState } from 'react';
import { products } from '@prisma/client';
import Image from 'next/image';
import { CATEGORY_MAP, TAKE } from 'constants/products';

export default function Products() {
  const [skip, setSkip] = useState(0);
  const [products, setProducts] = useState<products[]>([]);

  useEffect(() => {
    fetch(`/api/get-products?skip=0&take=${TAKE}`)
      .then(res => res.json())
      .then(res => setProducts(res.items));
    return () => {};
  }, []);

  const getProducts = useCallback(() => {
    const next = skip + TAKE;
    fetch(`/api/get-products?skip=${next}&take=${TAKE}`)
      .then(res => res.json())
      .then(res => {
        console.log(res);
        setProducts(products => [...products, ...res.items]);
      });
    setSkip(next);
  }, [skip]);

  return (
    <div className="px-36 mt-36 mb-36">
      <div className="grid grid-cols-3 gap-5">
        {products &&
          products.map(item => (
            <div key={item.id}>
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
      <button className="w-full rounded mt-20 bg-zinc-200 p-4" onClick={getProducts}>
        더보기
      </button>
    </div>
  );
}
