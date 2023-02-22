import CountControl from '@/components/CountControl';
import styled from '@emotion/styled';
import { IconRefresh, IconX } from '@tabler/icons-react';
import Image from 'next/image';
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
        productId: 100,
        price: 20000,
        quantity: 2,
        amount: 20000,
        image_url: 'https://picsum.photos/id/501/1000/600/',
      },
      {
        name: '나이키 빌딩',
        productId: 111,
        price: 51151,
        quantity: 2,
        amount: 102302,
        image_url: 'https://picsum.photos/id/500/1000/600/',
      },
    ];

    setData(mockData);
  }, []);

  return (
    <div>
      <span className="text-2xl mb-3">Cart ({data.length})</span>
      <div className="flex">
        <div className="flex flex-col p-4 space-y-4 flex-1">
          {data.map((item, idx) => (
            <Item key={idx} {...item}></Item>
          ))}
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
          </div>
        </div>
      </div>
    </div>
  );
}

const Item = (props: CartItem) => {
  const [quantity, setQuantity] = useState<number | undefined>(props.quantity);
  const [amount, setAmount] = useState<number>(props.amount);
  useEffect(() => {
    if (quantity != null) {
      setAmount(quantity * props.price);
    }
  }, [quantity, props.price]);
  return (
    <div className="flex w-full p-4 border-b-2">
      <Image src={props.image_url} width={195} height={155} alt={props.name}></Image>
      <div className="flex flex-col ml-4">
        <span className="font-semibold mb-2">{props.name}</span>
        <span className="mb-auto">가격: {props.price.toLocaleString('ko-kr')} 원</span>
        <div className="flex items-center space-x-4">
          <CountControl value={quantity} setValue={setQuantity} max={20}></CountControl>
          <IconRefresh></IconRefresh>
        </div>
      </div>
      <div className="flex ml-auto space-x-4">
        <span>{amount.toLocaleString('ko-kr')} 원</span>
        <IconX></IconX>
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
