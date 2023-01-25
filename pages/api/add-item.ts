// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@notionhq/client';

const notion = new Client({
  auth: 'secret_HpxBEZ7eQGmGu9sGAJzyA8oDRxNbFAU8Z7efMueKiH9',
});
//www.notion.so/93bb7f3a391d4550aef6e467a7659081?v=1730a27d60e54d40963941331242e87e

const databaseId = '93bb7f3a391d4550aef6e467a7659081';

async function addItem(name: string) {
  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        title: [
          {
            text: {
              content: name,
            },
          },
        ],
      },
    });
    console.log(response);
  } catch (e) {
    console.error(JSON.stringify(e));
  }
}

type message = {
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<message>) {
  const { name } = req.query;

  if (name === null) {
    return res.status(400).json({ message: 'No name' });
  }

  try {
    await addItem(String(name));
    res.status(200).json({ message: `Success ${name} added` });
  } catch (error) {
    return res.status(400).json({ message: 'Fail added' });
  }
}
