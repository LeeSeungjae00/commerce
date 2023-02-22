import React, { ChangeEventHandler, useCallback, useEffect, useState } from 'react';
import { categories, products } from '@prisma/client';
import Image from 'next/image';
import { Input, Pagination, SegmentedControl, SegmentedControlItem, Select } from '@mantine/core';
import { CATEGORY_MAP, FILTERS, TAKE } from 'constants/products';
import { IconSearch } from '@tabler/icons-react';
import useDebounce from 'hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [activePage, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('-1');
  const [selectedFilter, setFilter] = useState<string | null>(FILTERS[0].value);
  const [keyword, setKeyword] = useState('');

  const debouncedKeyword = useDebounce<string>(keyword, 300);

  const { data: categories } = useQuery<{ items: categories[] }, unknown, SegmentedControlItem[]>(
    [`/api/get-categories`],
    () => fetch(`/api/get-categories`).then(res => res.json()),
    {
      select: data => data.items.map((item: categories) => ({ label: item.name, value: item.id.toString() })),
    },
  );

  const { data: total } = useQuery<{ items: number }, unknown, number>(
    [`/api/get-products-count?category=${selectedCategory}&contains=${debouncedKeyword}`],
    () => fetch(`/api/get-products-count?category=${selectedCategory}&contains=${debouncedKeyword}`).then(res => res.json()),
    {
      select: data => Math.ceil(data.items / TAKE),
    },
  );

  const { data: products } = useQuery<{ items: products[] }, unknown, products[]>(
    [`/api/get-products?skip=${TAKE * (activePage - 1)}&take=${TAKE}&category=${selectedCategory}&orderBy=${selectedFilter}&contains=${debouncedKeyword}`],
    () =>
      fetch(
        `/api/get-products?skip=${TAKE * (activePage - 1)}&take=${TAKE}&category=${selectedCategory}&orderBy=${selectedFilter}&contains=${debouncedKeyword}`,
      ).then(res => res.json()),
    {
      select: data => data.items,
    },
  );

  const handleChage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  return (
    <div className="mt-36 mb-36">
      <div className="mb-4">
        <Input icon={<IconSearch />} placeholder="검색할 단어" value={keyword} onChange={handleChage}></Input>
      </div>
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
      <div className="w-full flex mt-5">{total && <Pagination className="m-auto" page={activePage} onChange={setPage} total={total} />}</div>
    </div>
  );
}
