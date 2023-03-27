import AutoSizeImage from '@/components/AutoSizeImageWrapper';
import CustomEditor from '@/components/Editor';
import { Slider } from '@mantine/core';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

export default function CommentEdit() {
  const router = useRouter();
  const { orderItemId } = router.query;
  const [rate, setRate] = useState(5);
  const [editorState, setEditorState] = useState<EditorState | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (orderItemId) {
      fetch(`/api/get-comment?orderItemId=${orderItemId}`)
        .then(res => res.json())
        .then(res => {
          if (res.items.contents) {
            setEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(res.items.contents))));
            setRate(res.items.rate);
            console.log(res.items);
            res.items.images && setImages(res.items.images.split(','));
          } else {
            setEditorState(EditorState.createEmpty());
          }
        });
    }
    return () => {};
  }, [orderItemId]);

  const handleChange = () => {
    if (inputRef?.current?.files && inputRef.current.files.length > 0) {
      for (let i = 0; i < inputRef.current.files.length; i++) {
        const fd = new FormData();

        fd.append('image', inputRef.current.files[i], inputRef.current.files[i].name);

        fetch(`https://api.imgbb.com/1/upload?expiration=15552000&key=960ec0343dcb37ca0e21ff7ffdfdbb1f`, {
          method: 'POST',
          body: fd,
        })
          .then(res => res.json())
          .then(data => {
            setImages(prev => Array.from(new Set([...prev, data.data.image.url])));
          })
          .catch(e => {
            console.log(e);
          });
      }
    }
  };

  const handleSave = () => {
    if (editorState) {
      fetch(`/api/update-comment`, {
        method: 'POST',
        body: JSON.stringify({
          orderItemId: Number(orderItemId),
          rate,
          contents: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
          images: images.join(','),
        }),
      })
        .then(res => res.json())
        .then(() => {
          alert('저장 성공');
          router.back();
        });
    }
  };
  return (
    <>
      {editorState != null && <CustomEditor editorState={editorState} onEditorStateChange={setEditorState} onSave={handleSave} />}
      <Slider
        value={rate}
        onChange={setRate}
        defaultValue={5}
        min={1}
        max={5}
        step={1}
        marks={[{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 }]}
      />
      <input type="file" accept="image/*" ref={inputRef} multiple onChange={handleChange}></input>
      <div className="flex">{images.length > 0 && images.map((image, idx) => <AutoSizeImage size={50} key={idx} src={image}></AutoSizeImage>)}</div>
    </>
  );
}
