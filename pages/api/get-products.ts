// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getProducts(skip: number, take: number) {
  try {
    const response = prisma.products.findMany({
      skip,
      take,
    });
    return response;
  } catch (e) {
    console.error(JSON.stringify(e));
  }
}

type res = {
  items?: any;
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<res>) {
  try {
    const { skip, take } = req.query;
    if (skip == null || take == null) {
      res.status(400).json({ message: `no skip or take` });
      return;
    }
    const products = await getProducts(Number(skip), Number(take));
    res.status(200).json({ items: products, message: `Success` });
  } catch (error) {
    return res.status(400).json({ message: 'Fail' });
  }
}
