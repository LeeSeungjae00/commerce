import { products } from '@prisma/client';
import { CATEGORY_MAP } from 'constants/products';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function ProductList({ products }: { products: products[] }) {
  const router = useRouter();
  return (
    <div className="grid grid-cols-3 gap-5">
      {products &&
        products.map(item => (
          <div
            key={item.id}
            style={{ maxWidth: 310 }}
            onClick={() => {
              router.push(`/products/${item.id}`);
            }}
          >
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
            <span className="text-zinc-400">{CATEGORY_MAP[item.category_id - 1]}</span>
          </div>
        ))}
    </div>
  );
}
