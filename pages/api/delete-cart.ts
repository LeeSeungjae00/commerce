// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

const prisma = new PrismaClient();

async function deleteCart(id: number) {
  try {
    const response = await prisma.cart.delete({
      where: {
        id,
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
  const { id } = JSON.parse(req.body);

  if (session == null) {
    res.status(401).json({ items: [], message: `no Session` });
    return;
  }

  try {
    const cart = await deleteCart(id);
    res.status(200).json({ items: cart, message: `Success` });
  } catch (error) {
    return res.status(400).json({ message: 'Fail' });
  }
}
