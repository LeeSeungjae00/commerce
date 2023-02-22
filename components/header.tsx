import { IconHome, IconShoppingCart, IconUser } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  return (
    <div className="mt-12 mb-12">
      <div className="w-full flex h-50 items-center">
        <IconHome onClick={() => router.push('/')}></IconHome>
        <span className="m-auto"></span>
        <IconShoppingCart onClick={() => router.push('/cart')} className="mr-4"></IconShoppingCart>
        {session ? (
          <Image onClick={() => router.push('/my')} style={{ borderRadius: '50%' }} src={session.user?.image!} width={30} height={30} alt="profile" />
        ) : (
          <IconUser onClick={() => router.push('/auth/login')}></IconUser>
        )}
      </div>
    </div>
  );
}
