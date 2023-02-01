import { EditorProps } from 'react-draft-wysiwyg';
import dynamic from 'next/dynamic';
import styled from '@emotion/styled';
import { EditorState } from 'draft-js';
import { Dispatch, SetStateAction } from 'react';
import Button from './Button';

const Editor = dynamic<EditorProps>(() => import('react-draft-wysiwyg').then(module => module.Editor), {
  ssr: false,
});

interface CustomEditorInterface {
  editorState: EditorState;
  readOnly?: boolean;
  onEditorStateChange?: Dispatch<SetStateAction<EditorState | undefined>>;
  onSave?: () => void;
}

export default function CustomEditor({ editorState, readOnly = false, onSave, onEditorStateChange }: CustomEditorInterface) {
  return (
    <Wrapper>
      <Editor
        readOnly={readOnly}
        toolbarHidden={readOnly}
        editorState={editorState}
        toolbarClassName="editorToolbar-hidden"
        wrapperClassName="wrapper-class"
        editorClassName="editor-class"
        onEditorStateChange={onEditorStateChange}
        // toolbar={{
        //   options: ['inline', 'list', 'extAlign', 'link'],
        // }}
        localization={{
          locale: 'ko',
        }}
      />
      {!readOnly && <Button onClick={onSave}>SAVE</Button>}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: 16px;
`;
