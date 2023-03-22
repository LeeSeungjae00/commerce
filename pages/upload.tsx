import Button from '@/components/Button';
import styled from '@emotion/styled';
import Image from 'next/image';
import { useRef, useState } from 'react';

export default function ImageUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState('');

  const handleUpload = () => {
    if (inputRef?.current?.files && inputRef.current.files.length > 0) {
      const fd = new FormData();

      fd.append('image', inputRef.current.files[0], inputRef.current.files[0].name);

      fetch(`https://api.imgbb.com/1/upload?expiration=15552000&key=960ec0343dcb37ca0e21ff7ffdfdbb1f`, {
        method: 'POST',
        body: fd,
      })
        .then(res => res.json())
        .then(data => {
          console.log(data);
          setImage(data.data.image.url);
        })
        .catch(e => {
          console.log(e);
        });
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" ref={inputRef}></input>
      <Button onClick={handleUpload}>업로드</Button>
      {image !== '' && (
        <AutoSizeIamgeWrapper>
          <Image src={image} alt="" width={200} height={200}></Image>
        </AutoSizeIamgeWrapper>
      )}
    </div>
  );
}

const AutoSizeIamgeWrapper = styled.div`
  width: 200px;
  height: 200px;
  position: relative;
  overflow: hidden;
`;
