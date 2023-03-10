// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

const prisma = new PrismaClient();

async function getComment(userId: string, orderItemId: number) {
  try {
    const response = await prisma.comment.findUnique({
      where: {
        orderItemId,
      },
    });
    //productIds : '1,2,3'

    if (response?.userId === userId) return response;

    return { message: 'userId is not matched' };
  } catch (e) {
    console.error(JSON.stringify(e));
  }
}

type res = {
  items?: any;
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<res>) {
  const { orderItemId } = req.query;
  const session: any = await unstable_getServerSession(req, res, authOptions);
  if (session == null) {
    res.status(400).json({ items: [], message: `no Session` });
    return;
  }

  if (orderItemId == null) {
    res.status(400).json({ items: [], message: `no orderItemId` });
    return;
  }

  try {
    const wishlist = await getComment(String(session.id), Number(orderItemId));
    res.status(200).json({ items: wishlist, message: `Success` });
  } catch (error) {
    return res.status(400).json({ message: 'Fail' });
  }
}
