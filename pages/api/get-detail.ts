// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@notionhq/client';

const notion = new Client({
  auth: 'secret_HpxBEZ7eQGmGu9sGAJzyA8oDRxNbFAU8Z7efMueKiH9',
});

async function getDetail(pageId: string, propertyId: string) {
  try {
    const response = await notion.pages.properties.retrieve({
      page_id: pageId,
      property_id: propertyId,
    });
    return response;
  } catch (e) {
    console.error(JSON.stringify(e));
  }
}

type res = {
  detail?: any;
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<res>) {
  try {
    const { pageId, propertyId } = req.query;
    const response = await getDetail(String(pageId), String(propertyId));
    res.status(200).json({ detail: response, message: `Success` });
  } catch (error) {
    return res.status(400).json({ message: 'Fail' });
  }
}
