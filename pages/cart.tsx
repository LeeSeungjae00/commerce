import CountControl from '@/components/CountControl';
import ProductList from '@/components/ProductList';
import styled from '@emotion/styled';
import { Button } from '@mantine/core';
import { Cart as CartType, products } from '@prisma/client';
import { IconRefresh, IconShoppingCartOff, IconX } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CATEGORY_MAP, TAKE } from 'constants/products';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

interface CartItem extends CartType {
  name: string;
  price: number;
  image_url: string;
}

const CART_QUERYKEY = `/api/get-cart`;

export default function Cart() {
  const session = useSession();
  const { data, isLoading } = useQuery<{ items: [] }, unknown, CartItem[]>([CART_QUERYKEY], () =>
    fetch(CART_QUERYKEY)
      .then(res => res.json())
      .then(res => res.items),
  );

  const dilveryAmount = data && data.length > 0 ? 5000 : 0;
  const discountAmount = 0;
  const router = useRouter();

  const amount = useMemo(() => {
    if (data == null) return 0;
    return data.map(item => item.amount).reduce((pre, cur) => pre + cur, 0);
  }, [data]);

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
      <span className="text-2xl mb-3">Cart ({data ? data.length : 0})</span>
      {isLoading ? (
        <div className="h-full w-full flex justify-center items-center">불러오는 중</div>
      ) : (
        <>
          {data ? (
            <>
              <div className="flex">
                <div className="flex flex-col p-4 space-y-4 flex-1">
                  {data.length > 0 ? (
                    data.map((item, idx) => <Item key={idx} {...item}></Item>)
                  ) : (
                    <>
                      {session.data ? (
                        <div className="h-full w-full flex justify-center items-center">
                          <IconShoppingCartOff></IconShoppingCartOff> 장바구니가 비었습니다.
                        </div>
                      ) : (
                        <div className="h-full w-full flex justify-center items-center flex-col">
                          로그인이 필요합니다.
                          <Button style={{ backgroundColor: 'black' }} radius="xl" size="md" onClick={() => router.push('/auth/login')}>
                            로그인
                          </Button>
                        </div>
                      )}
                    </>
                  )}
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
            </>
          ) : (
            <>장바구니에 아무것도 없습니다</>
          )}
        </>
      )}

      <div className="mt-32">
        <p>추천상품</p>
        {products && <ProductList products={products}></ProductList>}
      </div>
    </div>
  );
}

const Item = (props: CartItem) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState<number | undefined>(props.quantity);
  const [amount, setAmount] = useState<number>(props.amount);
  useEffect(() => {
    if (quantity != null) {
      setAmount(quantity * props.price);
    }
  }, [quantity, props.price]);

  const { mutate: updateCart } = useMutation<unknown, unknown, CartType, any>(
    item =>
      fetch(`/api/update-cart`, {
        method: 'POST',
        body: JSON.stringify({ item }),
      }).then(data => data.json().then(res => res.items)),
    {
      onMutate: async item => {
        await queryClient.cancelQueries({ queryKey: [CART_QUERYKEY] });

        const previous = queryClient.getQueryData([CART_QUERYKEY]);

        queryClient.setQueryData<CartType[]>([CART_QUERYKEY], old =>
          old?.map(c => {
            if (c.id !== item.id) {
              return c;
            }
            return item;
          }),
        );

        return { previous };
      },
      onError: (error, _, context) => {
        queryClient.setQueriesData([CART_QUERYKEY], context.previous);
      },
      onSuccess: data => {
        queryClient.invalidateQueries([CART_QUERYKEY]);
      },
    },
  );

  const { mutate: deleteCart } = useMutation<unknown, unknown, number, any>(
    item =>
      fetch(`/api/delete-cart`, {
        method: 'POST',
        body: JSON.stringify({ id: props.id }),
      }).then(data => data.json().then(res => res.items)),
    {
      onMutate: async id => {
        await queryClient.cancelQueries({ queryKey: [CART_QUERYKEY] });

        const previous = queryClient.getQueryData([CART_QUERYKEY]);

        queryClient.setQueryData<CartType[]>([CART_QUERYKEY], old => old?.filter(c => c.id !== id));

        return { previous };
      },
      onError: (error, _, context) => {
        queryClient.setQueriesData([CART_QUERYKEY], context.previous);
      },
      onSuccess: data => {
        queryClient.invalidateQueries([CART_QUERYKEY]);
      },
    },
  );

  const handleUpdate = () => {
    if (quantity == null) {
      alert('최소 수량을 입력하세요.');
      return;
    }
    updateCart({ ...props, quantity, amount });
  };

  const handleDelete = () => {
    // TODO: 장바구니에서 삭제 기능 구현
    deleteCart(props.id);
  };

  return (
    <div className="flex w-full p-4 border-b-2">
      <Image src={props.image_url} width={195} height={155} alt={props.name} onClick={() => router.push(`/products/${props.productId}`)}></Image>
      <div className="flex flex-col ml-4">
        <span className="font-semibold mb-2">{props.name}</span>
        <span className="mb-auto">가격: {props.price.toLocaleString('ko-kr')} 원</span>
        <div className="flex items-center space-x-4">
          <CountControl value={quantity} setValue={setQuantity} min={0} max={20}></CountControl>
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
