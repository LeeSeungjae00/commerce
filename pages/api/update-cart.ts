// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Cart, PrismaClient } from '@prisma/client';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

const prisma = new PrismaClient();

async function updateCart(item: Cart) {
  try {
    const response = await prisma.cart.update({
      where: {
        id: item.id,
      },
      data: {
        quantity: item.quantity,
        amount: item.amount,
      },
    });
    console.log(response);

    return response;
  } catch (e) {
    console.error(e);
  }
}

type res = {
  items?: any;
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<res>) {
  const session: any = await unstable_getServerSession(req, res, authOptions);
  const { item } = JSON.parse(req.body);

  if (session == null || session.id !== item.userId) {
    res.status(401).json({ items: [], message: `no Session or Invalid Session` });
    return;
  }

  try {
    const cart = await updateCart(item);
    res.status(200).json({ items: cart, message: `Success` });
  } catch (error) {
    return res.status(400).json({ message: 'Fail' });
  }
}
