import CustomEditor from '@/components/Editor';
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
    console.log(orderItemId);
    if (orderItemId) {
      fetch(`/api/get-comment?id=${orderItemId}`)
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
          orderItemId,
          rate,
          contents: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
        }),
      })
        .then(res => res.json())
        .then(res => {
          alert('저장 성공');
        });
    }
  };
  return <>{editorState != null && <CustomEditor editorState={editorState} onEditorStateChange={setEditorState} onSave={handleSave} />}</>;
}
