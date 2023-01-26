// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getProducts() {
  try {
    const response = prisma.products.findMany();

    console.log(response);
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
    const products = await getProducts();
    res.status(200).json({ items: products, message: `Success` });
  } catch (error) {
    return res.status(400).json({ message: 'Fail' });
  }
}
