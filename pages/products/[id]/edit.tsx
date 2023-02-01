import CustomEditor from '@/components/Editor';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Carousel from 'nuka-carousel';
import React, { useEffect, useState } from 'react';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

const images = [
  {
    original: 'https://picsum.photos/id/1018/1000/600/',
    thumbnail: 'https://picsum.photos/id/1018/250/150/',
  },
  {
    original: 'https://picsum.photos/id/1015/1000/600/',
    thumbnail: 'https://picsum.photos/id/1015/250/150/',
  },
  {
    original: 'https://picsum.photos/id/1019/1000/600/',
    thumbnail: 'https://picsum.photos/id/1019/250/150/',
  },
  {
    original: 'https://picsum.photos/id/1016/1000/600/',
    thumbnail: 'https://picsum.photos/id/1016/250/150/',
  },
  {
    original: 'https://picsum.photos/id/1013/1000/600/',
    thumbnail: 'https://picsum.photos/id/1013/250/150/',
  },
  {
    original: 'https://picsum.photos/id/1012/1000/600/',
    thumbnail: 'https://picsum.photos/id/1012/250/150/',
  },
  {
    original: 'https://picsum.photos/id/1011/1000/600/',
    thumbnail: 'https://picsum.photos/id/1011/250/150/',
  },
];

export default function Products() {
  const [index, setIndex] = useState(0);

  const router = useRouter();
  const { id: productId } = router.query;
  const [editorState, setEditorState] = useState<EditorState | undefined>(undefined);

  useEffect(() => {
    if (productId) {
      fetch(`/api/get-product?id=${productId}`)
        .then(res => res.json())
        .then(res => {
          if (res.items.contents) {
            setEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(res.items.contents))));
          } else {
            setEditorState(EditorState.createEmpty());
          }
        });
    }
    return () => {};
  }, [productId]);

  const handleSave = () => {
    if (editorState) {
      fetch(`/api/update-product`, {
        method: 'POST',
        body: JSON.stringify({
          id: productId,
          contents: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
        }),
      })
        .then(res => res.json())
        .then(res => {
          alert('저장 성공');
        });
    }
  };

  return (
    <>
      <Carousel animation="fade" autoplay withoutControls wrapAround speed={10} slideIndex={index}>
        {images.map(item => (
          <Image key={item.original} src={item.original} alt="image" width={1000} height={600} layout="responsive"></Image>
        ))}
      </Carousel>
      <div style={{ display: 'flex' }}>
        {images.map((item, idx) => (
          <div key={idx} onClick={() => setIndex(idx)}>
            <Image src={item.original} alt="image" width={100} height={60}></Image>
          </div>
        ))}
      </div>
      {editorState != null && <CustomEditor editorState={editorState} onEditorStateChange={setEditorState} onSave={handleSave}></CustomEditor>}
    </>
  );
}
