// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getProductsCount(category: number) {
  const where =
    category && category !== -1
      ? {
          where: {
            category_id: category,
          },
        }
      : undefined;
  try {
    const response = prisma.products.count(where);
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
  const { category } = req.query;
  try {
    const products = await getProductsCount(Number(category));
    res.status(200).json({ items: products, message: `Success` });
  } catch (error) {
    return res.status(400).json({ message: 'Fail' });
  }
}
