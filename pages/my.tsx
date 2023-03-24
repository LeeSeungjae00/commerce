import CountControl from '@/components/CountControl';
import styled from '@emotion/styled';
import { Badge, Button } from '@mantine/core';
import { Cart as CartType, OrderItem, Orders } from '@prisma/client';
import { IconShoppingCartOff, IconX } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

interface OrderItemDetail extends OrderItem {
  name: string;
  image_url: string;
}

interface OrderDetail extends Orders {
  orderItems: OrderItemDetail[];
}

const ORDER_STATUS_MAP = ['주문취소', '주문대기', '결제대기', '결제완료', '배송대기', '배송중', '배송완료', '환불대기', '환불완료', '반품대기', '반품완료'];

export const ORDER_QUERY_KEY = `/api/get-order`;

export default function MyPage() {
  const session = useSession();
  const router = useRouter();
  const { data, isLoading } = useQuery<{ items: OrderDetail[] }, unknown, OrderDetail[]>([ORDER_QUERY_KEY], () =>
    fetch(ORDER_QUERY_KEY)
      .then(res => res.json())
      .then(res => res.items),
  );

  return (
    <div>
      <span className="text-2xl mb-3">주문내역 ({data ? data.length : 0})</span>
      {isLoading ? (
        <div className="h-full w-full flex justify-center items-center">불러오는 중</div>
      ) : (
        <>
          {data ? (
            <>
              <div className="flex">
                <div className="flex flex-col p-4 space-y-4 flex-1">
                  {data.length > 0 ? (
                    data.map((item, idx) => <DetailItem key={idx} {...item}></DetailItem>)
                  ) : (
                    <>
                      {session.data ? (
                        <div className="h-full w-full flex justify-center items-center">
                          <IconShoppingCartOff></IconShoppingCartOff> 주문내역이 아무것도 없습니다.
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
              </div>
            </>
          ) : (
            <>장바구니에 아무것도 없습니다</>
          )}
        </>
      )}
    </div>
  );
}

const DetailItem = (props: OrderDetail) => {
  const queryClient = useQueryClient();
  const { mutate: updateOrderStatus } = useMutation<unknown, unknown, number, any>(
    status =>
      fetch(`/api/update-order-status`, {
        method: 'POST',
        body: JSON.stringify({ id: props.id, status, userId: props.userId }),
      }).then(data => data.json().then(res => res.items)),
    {
      onMutate: async status => {
        await queryClient.cancelQueries({ queryKey: [ORDER_QUERY_KEY] });

        const previous = queryClient.getQueryData([ORDER_QUERY_KEY]);

        queryClient.setQueryData<CartType[]>(
          [ORDER_QUERY_KEY],
          old =>
            old?.map(c => {
              if (c.id === props.id) {
                return { ...c, status };
              }
              return c;
            }) || [],
        );

        return { previous };
      },
      onError: (error, _, context) => {
        queryClient.setQueriesData([ORDER_QUERY_KEY], context.previous);
      },
      onSuccess: data => {
        queryClient.invalidateQueries([ORDER_QUERY_KEY]);
      },
    },
  );

  const handlePayment = () => {
    updateOrderStatus(5);
  };

  const handleCancel = () => {
    updateOrderStatus(-1);
  };
  return (
    <div className="flex w-full p-4 border-2 flex-col">
      <div className="flex">
        <Badge color={props.status < 1 ? 'red' : ''} className="mb-2">
          {ORDER_STATUS_MAP[props.status + 1]}
        </Badge>
        <IconX className="ml-auto" onClick={handleCancel}></IconX>
      </div>
      {props.orderItems.map((orderItem, idx) => (
        <Item key={idx} {...orderItem} status={props.status}></Item>
      ))}
      <div className="flex mt-4">
        <div className="flex flex-col">
          <span className="mb-2">주문 정보:</span>
          <span>받는사람: {props.receiver ?? '입력필요'}</span>
          <span>주소: {props.address ?? '입력필요'}</span>
          <span>연락처: {props.phoneNumber ?? '입력필요'}</span>
        </div>
        <div className="flex flex-col ml-auto mr-4 text-right">
          <span className="mb-2 font-semibold">
            합계 금액:
            <span className="text-red-500">
              {props.orderItems
                .map(item => item.amount)
                .reduce((pre, cur) => pre + cur, 0)
                .toLocaleString('ko-kr')}
            </span>
          </span>
          <span className="text-zinc-400 mt-auto mb-auto">주문일자: {format(new Date(props.createAt), 'yyyy년 M월 d일')}</span>
          <Button style={{ backgroundColor: 'black', color: 'white' }} onClick={handlePayment}>
            결제 처리
          </Button>
        </div>
      </div>
    </div>
  );
};

const Item = (props: OrderItemDetail & { status: number }) => {
  const router = useRouter();
  const [quantity, setQuantity] = useState<number | undefined>(props.quantity);
  const [amount, setAmount] = useState<number>(props.amount);
  useEffect(() => {
    if (quantity != null) {
      setAmount(quantity * props.price);
    }
  }, [quantity, props.price]);

  const handleComment = () => {
    router.push(`/comment/edit?orderItemId=${props.id}`);
  };

  return (
    <div className="flex w-full p-4 border-b-2">
      <Image src={props.image_url} width={195} height={155} alt={props.name} onClick={() => router.push(`/products/${props.productId}`)}></Image>
      <div className="flex flex-col ml-4">
        <span className="font-semibold mb-2">{props.name}</span>
        <span className="mb-auto">가격: {props.price.toLocaleString('ko-kr')} 원</span>
        <div className="flex items-center space-x-4">
          <CountControl value={quantity} setValue={setQuantity} min={0} max={20}></CountControl>
        </div>
      </div>
      <div className="flex ml-auto space-x-4 flex-col">
        <span>{amount.toLocaleString('ko-kr')} 원</span>
        {props.status === 5 && (
          <Button style={{ backgroundColor: 'black', color: 'white', marginTop: 'auto' }} onClick={handleComment}>
            {' '}
            후기 작성
          </Button>
        )}
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
