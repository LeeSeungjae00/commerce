import CountControl from '@/components/CountControl';
import CustomEditor from '@/components/Editor';
import { Button } from '@mantine/core';
import { Cart, OrderItem, products } from '@prisma/client';
import { IconHeart, IconHeartBroken, IconHeartFilled, IconHeartbeat, IconShoppingCart } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { CATEGORY_MAP } from 'constants/products';
import { format } from 'date-fns';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Carousel from 'nuka-carousel';
import { CART_QUERYKEY } from 'pages/cart';
import { ORDER_QUERY_KEY } from 'pages/my';
import React, { useEffect, useState } from 'react';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const product = await fetch(`http://localhost:3737/api/get-product?id=${context.params?.id}`)
    .then(res => res.json())
    .then(res => res.items);

  return {
    props: { product: { ...product, images: [product.image_url, product.image_url] } },
  };
}

const WISHLIST_QUERYKEY = '/api/get-wishlist';

export default function Product(props: { product: products & { images: string[] } }) {
  const [index, setIndex] = useState(0);
  const { data: session } = useSession();
  const [quantity, setQintity] = useState<number | undefined>(1);

  const router = useRouter();
  const queryClient = useQueryClient();
  const { id: productId } = router.query;
  const [editorState] = useState<EditorState | undefined>(() =>
    props.product?.contents ? EditorState.createWithContent(convertFromRaw(JSON.parse(props.product.contents))) : EditorState.createEmpty(),
  );

  const { data: wishlist } = useQuery([WISHLIST_QUERYKEY], () =>
    fetch(WISHLIST_QUERYKEY)
      .then(res => res.json())
      .then(res => res.items),
  );

  const { mutate } = useMutation<unknown, unknown, string, any>(
    (productId: string) =>
      fetch(`/api/update-wishlist`, {
        method: 'POST',
        body: JSON.stringify({ productId }),
      }).then(data => data.json().then(res => res.items)),
    {
      onMutate: async productId => {
        await queryClient.cancelQueries({ queryKey: [WISHLIST_QUERYKEY] });

        const previous = queryClient.getQueryData([WISHLIST_QUERYKEY]);

        queryClient.setQueryData<string[]>([WISHLIST_QUERYKEY], old => {
          if (!old) return [];
          if (old.includes(productId)) {
            return old.filter(item => item != productId);
          } else {
            return [...old, productId];
          }
        });

        return { previous };
      },
      onError: (error, _, context) => {
        queryClient.setQueriesData([WISHLIST_QUERYKEY], context.previous);
      },
      onSuccess: () => {
        queryClient.invalidateQueries([WISHLIST_QUERYKEY]);
      },
    },
  );

  const { mutate: addCart } = useMutation<unknown, unknown, Omit<Cart | 'id', 'userId'>, any>(
    item =>
      fetch(`/api/add-cart`, {
        method: 'POST',
        body: JSON.stringify({ item }),
      }).then(data => data.json().then(res => res.items)),
    {
      onMutate: () => {
        queryClient.invalidateQueries([CART_QUERYKEY]);
      },
      onSuccess: () => {
        router.push('/cart');
      },
    },
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

  const validate = (type: 'cart' | 'order') => {
    if (quantity == null) {
      alert('?????? ????????? ?????? ?????????.');
      return;
    }

    if (type === 'order') {
      addOrder([
        {
          productId: product.id,
          quantity: quantity,
          amount: product.price * quantity,
          price: product.price,
        },
      ]);
    }
    if (type === 'cart') {
      addCart({
        productId: product.id,
        quantity: quantity,
        amount: product.price * quantity,
      });
    }
  };

  const { product } = props;

  const isWished = wishlist != null && productId != null ? wishlist.includes(productId) : false;

  return (
    <>
      {product != null && productId != null ? (
        <>
          <div className="flex flex-row">
            <div style={{ maxWidth: 600, marginRight: 52 }}>
              <Carousel animation="fade" withoutControls wrapAround speed={10} slideIndex={index}>
                {product.images.map((url, idx) => (
                  <Image
                    key={`${url}-carousel-${idx}`}
                    src={url}
                    alt="image"
                    width={600}
                    height={360}
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP0dPesBwADFAFamsrLhQAAAABJRU5ErkJggg=="
                  ></Image>
                ))}
              </Carousel>

              <div className="flex space-x-4 mt-2">
                {product.images.map((url, idx) => (
                  <div key={`${url}-thumb-${idx}`} onClick={() => setIndex(idx)}>
                    <Image
                      src={url}
                      alt="image"
                      width={100}
                      height={60.16}
                      placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP0dPesBwADFAFamsrLhQAAAABJRU5ErkJggg=="
                    ></Image>
                  </div>
                ))}
              </div>
              {editorState != null && <CustomEditor editorState={editorState} readOnly></CustomEditor>}
            </div>
            <div style={{ maxWidth: 600 }} className="flex flex-col space-y-6">
              <div className="text-lg text-zinc-400">{CATEGORY_MAP[product.category_id - 1]}</div>
              <div className="text-4xl font-semibold">{product.name}</div>
              <div className="text-lg">{product.price.toLocaleString('ko-kr')}???</div>
              <div>
                <CountControl min={1} max={200} value={quantity} setValue={setQintity}></CountControl>
              </div>
              <div className="flex space-x-3">
                <Button
                  leftIcon={<IconShoppingCart></IconShoppingCart>}
                  style={{ backgroundColor: 'black', flex: 1 }}
                  radius="xl"
                  size="md"
                  styles={{
                    root: { paddingRight: 14, height: 48 },
                  }}
                  onClick={() => {
                    if (session == null) {
                      alert('???????????? ???????????????');
                      router.push(`/auth/login`);
                      return;
                    }
                    validate('cart');
                  }}
                >
                  ????????????
                </Button>
                <Button
                  disabled={!wishlist}
                  leftIcon={isWished ? <IconHeartFilled></IconHeartFilled> : <IconHeart></IconHeart>}
                  style={{ backgroundColor: isWished ? 'red' : 'gray', flex: 1 }}
                  radius="xl"
                  size="md"
                  styles={{
                    root: { paddingRight: 14, height: 48 },
                  }}
                  onClick={() => {
                    if (session == null) {
                      alert('???????????? ???????????????');
                      router.push(`/auth/login`);
                      return;
                    }
                    mutate(String(productId));
                  }}
                >
                  ?????????
                </Button>
              </div>
              <Button
                style={{ backgroundColor: 'black' }}
                radius="xl"
                size="md"
                styles={{
                  root: { paddingRight: 14, height: 48 },
                }}
                onClick={() => {
                  if (session == null) {
                    alert('???????????? ???????????????');
                    router.push(`/auth/login`);
                    return;
                  }
                  validate('order');
                }}
              >
                ????????????
              </Button>
              <div className="text-sm text-zinc-300">??????: {format(new Date(product.createdAt), 'yyyy??? m??? d???')}</div>
            </div>
          </div>
        </>
      ) : (
        <div>?????????</div>
      )}
    </>
  );
}
