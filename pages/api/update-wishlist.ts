// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

const prisma = new PrismaClient();

async function updateWishlist(userId: string, productId: string) {
  try {
    const wishlist = await prisma.wishList.findUnique({
      where: {
        userId,
      },
    });

    const originwishlist = wishlist?.productIds != null && wishlist.productIds !== '' ? wishlist.productIds.split(',') : [];
    const isWished = originwishlist.includes(productId);

    const newWishlist = isWished ? originwishlist.filter(item => item != productId) : [...originwishlist, productId];

    const response = await prisma.wishList.upsert({
      where: {
        userId,
      },
      update: {
        productIds: newWishlist.join(','),
      },
      create: {
        userId,
        productIds: newWishlist.join(','),
      },
    });

    return response?.productIds.split(',');
  } catch (e) {
    console.error(JSON.stringify(e));
  }
}

type res = {
  items?: any;
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<res>) {
  const session: any = await unstable_getServerSession(req, res, authOptions);
  const { productId } = JSON.parse(req.body);

  if (session == null) {
    res.status(200).json({ items: [], message: `no Session` });
    return;
  }

  try {
    const wishlist = await updateWishlist(String(session.id), String(productId));
    res.status(200).json({ items: wishlist, message: `Success` });
  } catch (error) {
    return res.status(400).json({ message: 'Fail' });
  }
}
