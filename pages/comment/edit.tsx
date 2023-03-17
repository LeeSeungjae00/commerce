import CustomEditor from '@/components/Editor';
import { Slider } from '@mantine/core';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

export default function CommentEdit() {
  const router = useRouter();
  const { orderItemId } = router.query;
  const [rate, setRate] = useState(5);
  const [editorState, setEditorState] = useState<EditorState | undefined>(undefined);

  useEffect(() => {
    if (orderItemId) {
      fetch(`/api/get-comment?orderItemId=${orderItemId}`)
        .then(res => res.json())
        .then(res => {
          if (res.items.contents) {
            setEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(res.items.contents))));
            setRate(res.items.rate);
          } else {
            setEditorState(EditorState.createEmpty());
          }
        });
    }
    return () => {};
  }, [orderItemId]);

  const handleSave = () => {
    if (editorState) {
      fetch(`/api/update-comment`, {
        method: 'POST',
        body: JSON.stringify({
          orderItemId: Number(orderItemId),
          rate,
          contents: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
        }),
      })
        .then(res => res.json())
        .then(res => {
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
    </>
  );
}
