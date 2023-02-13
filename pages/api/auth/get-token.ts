// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwtDecode from 'jwt-decode';

const prisma = new PrismaClient();

async function getToken(credential: string) {
  const decoded = jwtDecode(credential);
  try {
    console.log(decoded);
    return decoded;
  } catch (e) {
    console.error(JSON.stringify(e));
  }
}

type res = {
  items?: any;
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<res>) {
  const { credential } = req.query;
  try {
    const items = await getToken(String(credential));
    res.status(200).json({ items, message: `Success` });
  } catch (error) {
    return res.status(400).json({ message: 'Fail' });
  }
}
