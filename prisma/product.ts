import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const productDate: Prisma.productsCreateInput[] = new Array(100).fill(0).map((_, index) => ({
  name: `Dark Jean ${index + 1}`,
  category_id: 1,
  contents: `{"blocks":[{"key":"7qk8k","text":"this a dark jean","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":7,"length":4,"style":"BOLD"}],"entityRanges":[],"data":{}},{"key":"4mr5n","text":"Hello world ${
    index + 1
  } ","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}`,
  image_url: `https://picsum.photos/id/${1000 + index}/1000/600/`,
  price: Math.floor(Math.random() * (100000 - 20000)) + 20000,
}));

async function main() {
  await prisma.products.deleteMany({});

  for (const p of productDate) {
    const product = await prisma.products.create({
      data: p,
    });
    console.log(`Create id ${product.id}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    // process.exit(1);
  });
