// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

const prisma = new PrismaClient();

async function getCart(userId: string) {
  try {
    const cart = await prisma.$queryRaw`
      SELECT c.id, userId, quantity, amount, price, name, image_url 
      from Cart as c JOIN products as p 
      WHERE c.productId = p.id AND c.userId=${userId}`;

    return cart;
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
  if (session == null) {
    res.status(200).json({ items: [], message: `no Session` });
    return;
  }

  try {
    const wishlist = await getCart(String(session.id));
    res.status(200).json({ items: wishlist, message: `Success` });
  } catch (error) {
    return res.status(400).json({ message: 'Fail' });
  }
}
