// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Cart, OrderItem, PrismaClient } from '@prisma/client';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

const prisma = new PrismaClient();

async function addCart(userId: string, items: Omit<OrderItem, 'id'>[], orderInfo?: { receover: string; address: string; phoneNumber: string }) {
  try {
    let orderItemIds = [];
    for (const item of items) {
      const orderItem = await prisma.orderItem.create({
        data: {
          ...item,
        },
      });
      orderItemIds.push(orderItem.id);
    }

    const response = await prisma.orders.create({
      data: {
        userId,
        orderItemIds: orderItemIds.join(','),
        ...orderInfo,
        status: 0,
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
  const { items, orderInfo } = JSON.parse(req.body);

  if (session == null) {
    res.status(200).json({ items: [], message: `no Session` });
    return;
  }

  try {
    const cart = await addCart(String(session.id), items, orderInfo);
    res.status(200).json({ items: cart, message: `Success` });
  } catch (error) {
    return res.status(400).json({ message: 'Fail' });
  }
}
