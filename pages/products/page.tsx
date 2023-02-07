import { useCallback, useEffect, useState } from 'react';
import { categories, products } from '@prisma/client';
import Image from 'next/image';
import { Pagination, SegmentedControl, SegmentedControlItem, Select } from '@mantine/core';
import { CATEGORY_MAP, FILTERS, TAKE } from 'constants/products';

export default function Products() {
  const [activePage, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [products, setProducts] = useState<products[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('-1');
  const [categories, setCategories] = useState<SegmentedControlItem[]>([]);
  const [selectedFilter, setFilter] = useState<string | null>(FILTERS[0].value);

  useEffect(() => {
    fetch(`/api/get-categories`)
      .then(res => res.json())
      .then(res => setCategories(res.items.map((item: categories) => ({ label: item.name, value: item.id.toString() }))));
  }, []);

  useEffect(() => {
    fetch(`/api/get-products-count?category=${selectedCategory}`)
      .then(res => res.json())
      .then(res => setTotal(Math.ceil(res.items / TAKE)));
    return () => {};
  }, [selectedCategory]);

  useEffect(() => {
    const skip = TAKE * (activePage - 1);
    fetch(`/api/get-products?skip=${skip}&take=${TAKE}&category=${selectedCategory}&orderBy=${selectedFilter}`)
      .then(res => res.json())
      .then(res => setProducts(res.items));
  }, [activePage, selectedCategory, selectedFilter]);

  return (
    <div className="px-36 mt-36 mb-36">
      <div className="mb-4">
        <Select data={FILTERS} value={selectedFilter} onChange={setFilter}></Select>
      </div>
      {categories && (
        <div className="w-full flex mb-5">
          <SegmentedControl value={selectedCategory} onChange={setSelectedCategory} data={[{ label: 'ALL', value: '-1' }, ...categories]} color="dark" />
        </div>
      )}
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
              <span className="text-zinc-400">{CATEGORY_MAP[item.category_id - 1]}</span>
            </div>
          ))}
      </div>
      <div className="w-full flex mt-5">
        <Pagination className="m-auto" page={activePage} onChange={setPage} total={total} />
      </div>
    </div>
  );
}
