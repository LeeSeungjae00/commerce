import CountControl from '@/components/CountControl';
import ProductList from '@/components/ProductList';
import styled from '@emotion/styled';
import { Button } from '@mantine/core';
import { products } from '@prisma/client';
import { IconRefresh, IconX } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { CATEGORY_MAP, TAKE } from 'constants/products';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

interface CartItem {
  name: string;
  productId: number;
  price: number;
  quantity: number;
  amount: number;
  image_url: string;
}

export default function Cart() {
  const router = useRouter();
  const [data, setData] = useState<CartItem[]>([]);
  const amount = useMemo(() => {
    return data.map(item => item.amount).reduce((pre, cur) => pre + cur, 0);
  }, [data]);
  const dilveryAmount = 5000;
  const discountAmount = 0;

  useEffect(() => {
    const mockData: CartItem[] = [
      {
        name: '나이키 신발',
        productId: 502,
        price: 20000,
        quantity: 2,
        amount: 20000,
        image_url: 'https://picsum.photos/id/501/1000/600/',
      },
      {
        name: '나이키 빌딩',
        productId: 501,
        price: 51151,
        quantity: 2,
        amount: 102302,
        image_url: 'https://picsum.photos/id/500/1000/600/',
      },
    ];

    setData(mockData);
  }, []);

  const { data: products } = useQuery<{ items: products[] }, unknown, products[]>(
    [`/api/get-products?skip=0&take=3`],
    () => fetch(`/api/get-products?skip=0&take=3`).then(res => res.json()),
    {
      select: data => data.items,
    },
  );

  const handleOrder = () => {
    // TODO: 구매하기 기능 구현
    alert(`장바구니 구매 ${JSON.stringify(data)}`);
  };

  return (
    <div>
      <span className="text-2xl mb-3">Cart ({data.length})</span>
      <div className="flex">
        <div className="flex flex-col p-4 space-y-4 flex-1">
          {data.length > 0 ? data.map((item, idx) => <Item key={idx} {...item}></Item>) : <div>장바구니가 비었습니다.</div>}
        </div>
        <div className="px-4">
          <div className="flex flex-col p-4 space-y-4" style={{ minWidth: 300, border: '1px solid gray' }}>
            <div>Info</div>
            <Row>
              <span>금액</span>
              <span>{amount.toLocaleString('ko-kr')} 원</span>
            </Row>
            <Row>
              <span>배송비</span>
              <span>{dilveryAmount.toLocaleString('ko-kr')} 원</span>
            </Row>
            <Row>
              <span>할인 금액</span>
              <span>{discountAmount.toLocaleString('ko-kr')} 원</span>
            </Row>
            <Row>
              <span className="font-semibold">결제 금액</span>
              <span className="font-semibold text-red-500">{(amount + dilveryAmount - discountAmount).toLocaleString('ko-kr')} 원</span>
            </Row>
            <Button
              style={{ backgroundColor: 'black' }}
              radius="xl"
              size="md"
              styles={{
                root: { paddingRight: 14, height: 48 },
              }}
              onClick={handleOrder}
            >
              구매하기
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-32">
        <p>추천상품</p>
        {products && <ProductList products={products}></ProductList>}
      </div>
    </div>
  );
}

const Item = (props: CartItem) => {
  const router = useRouter();
  const [quantity, setQuantity] = useState<number | undefined>(props.quantity);
  const [amount, setAmount] = useState<number>(props.amount);
  useEffect(() => {
    if (quantity != null) {
      setAmount(quantity * props.price);
    }
  }, [quantity, props.price]);

  const handleUpdate = () => {
    // TODO: 장바구니에서 삭제 기능 구현
    alert(`장바구니에서 ${props.name} 삭제`);
  };

  const handleDelete = () => {
    // TODO: 장바구니에서 삭제 기능 구현
    alert(`장바구니에서 ${props.name} 삭제`);
  };

  return (
    <div className="flex w-full p-4 border-b-2">
      <Image src={props.image_url} width={195} height={155} alt={props.name} onClick={() => router.push(`/products/${props.productId}`)}></Image>
      <div className="flex flex-col ml-4">
        <span className="font-semibold mb-2">{props.name}</span>
        <span className="mb-auto">가격: {props.price.toLocaleString('ko-kr')} 원</span>
        <div className="flex items-center space-x-4">
          <CountControl value={quantity} setValue={setQuantity} max={20}></CountControl>
          <IconRefresh onClick={handleUpdate}></IconRefresh>
        </div>
      </div>
      <div className="flex ml-auto space-x-4">
        <span>{amount.toLocaleString('ko-kr')} 원</span>
        <IconX onClick={handleDelete}></IconX>
      </div>
    </div>
  );
};

const Row = styled.div`
  display: flex;
  * ~ * {
    margin-left: auto;
  }
`;
