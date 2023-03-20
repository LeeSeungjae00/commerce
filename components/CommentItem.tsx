import styled from '@emotion/styled';
import { IconStar } from '@tabler/icons-react';
import { CommentItemType } from 'pages/products/[id]';
import CustomEditor from './Editor';
import { EditorState, convertFromRaw } from 'draft-js';
import { format } from 'date-fns';

export default function CommentItem({ item }: { item: CommentItemType }) {
  return (
    <Wrapper>
      <div className="flex justify-between">
        <div style={{ display: 'flex' }}>
          {Array.from({ length: 5 }).map((_, idx) => (
            <IconStar key={idx} fill={idx < item.rate ? '#ffde09' : '#cccccc'}></IconStar>
          ))}
        </div>
        <span className="text-zinc-400">{format(new Date(item.updateAt), 'yyyy년 M월 d일')}</span>
      </div>
      <span className="text-xs text-zinc-300">
        {item.price.toLocaleString('ko-kr')}원 * {item.quantity}개 = {item.amount.toLocaleString('ko-kr')}원
      </span>
      {item.contents && <CustomEditor noPadding readOnly editorState={EditorState.createWithContent(convertFromRaw(JSON.parse(item.contents)))}></CustomEditor>}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  border: 1px solid black;
  border-radius: 8px;
  padding: 8px;
`;
