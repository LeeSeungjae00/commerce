import styled from '@emotion/styled';
import Image from 'next/image';

export default function AutoSizeImage({ src, size = 200 }: { src: string; size?: number }) {
  return (
    <AutoSizeIamgeWrapper size={size}>
      <Image src={src} alt="" sizes="contain" fill style={{ objectFit: 'contain' }} />
    </AutoSizeIamgeWrapper>
  );
}

const AutoSizeIamgeWrapper = styled.div<{ size: number }>`
  width: ${props => (props.size ? `${props.size}px` : `200px`)};
  height: ${props => (props.size ? `${props.size}px` : `200px`)};
  position: relative;
  overflow: hidden;
`;
