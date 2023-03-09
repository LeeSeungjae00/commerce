import ProductList from '@/components/ProductList';
import { products } from '@prisma/client';
import { useQuery } from 'react-query';

export default function WishList() {
  const { data: products } = useQuery<{ items: products[] }, unknown, products[]>(
    ['/api/get-wishlists'],
    () => fetch(`/api/get-wishlists`).then(res => res.json()),
    {
      select: data => data.items,
    },
  );
  return (
    <div>
      <p className="text-2xl">내가 찜한 상품</p>
      <div className="mt-32">{products && <ProductList products={products}></ProductList>}</div>
    </div>
  );
}
