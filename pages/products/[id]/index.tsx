import CustomEditor from '@/components/Editor';
import { Button } from '@mantine/core';
import { products } from '@prisma/client';
import { IconHeart, IconHeartBroken, IconHeartFilled, IconHeartbeat, IconShoppingCart } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CATEGORY_MAP } from 'constants/products';
import { format } from 'date-fns';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Carousel from 'nuka-carousel';
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

  const { mutate, isLoading } = useMutation<unknown, unknown, string, any>(
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

  const validate = (type: 'cart' | 'order') => {
    alert('장바구니로 이동');
    router.push('/cart');
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
              <div className="text-lg">{product.price.toLocaleString('ko-kr')}원</div>
              <div className="flex space-x-3">
                <Button
                  leftIcon={<IconShoppingCart></IconShoppingCart>}
                  style={{ backgroundColor: 'black' }}
                  radius="xl"
                  size="md"
                  styles={{
                    root: { paddingRight: 14, height: 48 },
                  }}
                  onClick={() => {
                    if (session == null) {
                      alert('로그인이 필요합니다');
                      router.push(`/auth/login`);
                      return;
                    }
                    validate('cart');
                  }}
                >
                  장바구니
                </Button>
                <Button
                  disabled={!wishlist}
                  // loading={isLoading}
                  leftIcon={isWished ? <IconHeartFilled></IconHeartFilled> : <IconHeart></IconHeart>}
                  style={{ backgroundColor: isWished ? 'red' : 'gray' }}
                  radius="xl"
                  size="md"
                  styles={{
                    root: { paddingRight: 14, height: 48 },
                  }}
                  onClick={() => {
                    if (session == null) {
                      alert('로그인이 필요합니다');
                      router.push(`/auth/login`);
                      return;
                    }
                    mutate(String(productId));
                  }}
                >
                  찜하기
                </Button>
              </div>
              <div className="text-sm text-zinc-300">등록: {format(new Date(product.createdAt), 'yyyy년 m월 d일')}</div>
            </div>
          </div>
        </>
      ) : (
        <div>로딩중</div>
      )}
    </>
  );
}
