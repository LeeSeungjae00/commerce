// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwtDecode from 'jwt-decode';

const prisma = new PrismaClient();

async function signUp(credential: string) {
  const decoded: { name: string; email: string; picture: string } = jwtDecode(credential);
  try {
    const response = await prisma.user.upsert({
      where: {
        email: decoded.email,
      },
      update: {
        name: decoded.name,
        image: decoded.picture,
      },
      create: {
        name: decoded.name,
        email: decoded.email,
        image: decoded.picture,
      },
    });
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
  const { credential } = req.query;
  try {
    const items = await signUp(String(credential));
    res.status(200).json({ items, message: `Success` });
  } catch (error) {
    return res.status(400).json({ message: 'Fail' });
  }
}
