import CountControl from '@/components/CountControl';
import ProductList from '@/components/ProductList';
import styled from '@emotion/styled';
import { Button } from '@mantine/core';
import { Cart as CartType, OrderItem, products } from '@prisma/client';
import { IconRefresh, IconShoppingCartOff, IconX } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { CATEGORY_MAP, TAKE } from 'constants/products';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { ORDER_QUERY_KEY } from './my';

interface CartItem extends CartType {
  name: string;
  price: number;
  image_url: string;
}

export const CART_QUERYKEY = `/api/get-cart`;

export default function Cart() {
  const session = useSession();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<{ items: [] }, unknown, CartItem[]>([CART_QUERYKEY], () =>
    fetch(CART_QUERYKEY)
      .then(res => res.json())
      .then(res => res.items),
  );

  const { mutate: addOrder } = useMutation<unknown, unknown, Omit<OrderItem, 'id'>[], any>(
    items =>
      fetch(`/api/add-order`, {
        method: 'POST',
        body: JSON.stringify({ items }),
      }).then(data => data.json().then(res => res.items)),
    {
      onMutate: () => {
        queryClient.invalidateQueries([ORDER_QUERY_KEY]);
      },
      onSuccess: () => {
        router.push('/my');
      },
    },
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
    // TODO: ???????????? ?????? ??????
    if (!data) return;
    addOrder(
      data?.map(cart => ({
        productId: cart.productId,
        price: cart.price,
        amount: cart.amount,
        quantity: cart.quantity,
      })),
    );
  };

  return (
    <div>
      <span className="text-2xl mb-3">Cart ({data ? data.length : 0})</span>
      {isLoading ? (
        <div className="h-full w-full flex justify-center items-center">???????????? ???</div>
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
                          <IconShoppingCartOff></IconShoppingCartOff> ??????????????? ???????????????.
                        </div>
                      ) : (
                        <div className="h-full w-full flex justify-center items-center flex-col">
                          ???????????? ???????????????.
                          <Button style={{ backgroundColor: 'black' }} radius="xl" size="md" onClick={() => router.push('/auth/login')}>
                            ?????????
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
                      <span>??????</span>
                      <span>{amount.toLocaleString('ko-kr')} ???</span>
                    </Row>
                    <Row>
                      <span>?????????</span>
                      <span>{dilveryAmount.toLocaleString('ko-kr')} ???</span>
                    </Row>
                    <Row>
                      <span>?????? ??????</span>
                      <span>{discountAmount.toLocaleString('ko-kr')} ???</span>
                    </Row>
                    <Row>
                      <span className="font-semibold">?????? ??????</span>
                      <span className="font-semibold text-red-500">{(amount + dilveryAmount - discountAmount).toLocaleString('ko-kr')} ???</span>
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
                      ????????????
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>??????????????? ???????????? ????????????</>
          )}
        </>
      )}

      <div className="mt-32">
        <p>????????????</p>
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

        queryClient.setQueryData<CartType[]>(
          [CART_QUERYKEY],
          old =>
            old?.map(c => {
              if (c.id !== item.id) {
                return c;
              }
              return item;
            }) || [],
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

        queryClient.setQueryData<CartType[]>([CART_QUERYKEY], old => old?.filter(c => c.id !== id) || []);

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
      alert('?????? ????????? ???????????????.');
      return;
    }
    updateCart({ ...props, quantity, amount });
  };

  const handleDelete = () => {
    // TODO: ?????????????????? ?????? ?????? ??????
    deleteCart(props.id);
  };

  return (
    <div className="flex w-full p-4 border-b-2">
      <Image src={props.image_url} width={195} height={155} alt={props.name} onClick={() => router.push(`/products/${props.productId}`)}></Image>
      <div className="flex flex-col ml-4">
        <span className="font-semibold mb-2">{props.name}</span>
        <span className="mb-auto">??????: {props.price.toLocaleString('ko-kr')} ???</span>
        <div className="flex items-center space-x-4">
          <CountControl value={quantity} setValue={setQuantity} min={0} max={20}></CountControl>
          <IconRefresh onClick={handleUpdate}></IconRefresh>
        </div>
      </div>
      <div className="flex ml-auto space-x-4">
        <span>{amount.toLocaleString('ko-kr')} ???</span>
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
