// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@notionhq/client';

const notion = new Client({
  auth: 'secret_HpxBEZ7eQGmGu9sGAJzyA8oDRxNbFAU8Z7efMueKiH9',
});

const databaseId = '93bb7f3a391d4550aef6e467a7659081';

async function getItems() {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: 'Price',
          direction: 'descending',
        },
      ],
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

export default async function handler(_: NextApiRequest, res: NextApiResponse<res>) {
  try {
    const response = await getItems();
    res.status(200).json({ items: response?.results, message: `Success` });
  } catch (error) {
    return res.status(400).json({ message: 'Fail' });
  }
}
