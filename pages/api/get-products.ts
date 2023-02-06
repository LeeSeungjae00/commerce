// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getProducts(skip: number, take: number, category: number) {
  const where =
    category && category !== -1
      ? {
          where: {
            category_id: category,
          },
        }
      : undefined;
  try {
    const response = prisma.products.findMany({
      skip,
      take,
      ...where,
      orderBy: {
        price: 'asc',
      },
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
    const { skip, take, category } = req.query;
    if (skip == null || take == null) {
      res.status(400).json({ message: `no skip or take` });
      return;
    }
    const products = await getProducts(Number(skip), Number(take), Number(category));
    res.status(200).json({ items: products, message: `Success` });
  } catch (error) {
    return res.status(400).json({ message: 'Fail' });
  }
}
