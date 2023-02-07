export const TAKE = 9;

export const CATEGORY_MAP = ['Senkers', 'T-Shirt', 'Pants', 'Cap', 'Hoodie'];

export const FILTERS = [
  { label: '최신순', value: 'lastest' },
  { label: '가격 높은 순', value: 'expensive' },
  { label: '가격 낮은 순', value: 'cheap' },
];

export const getOrderBy = (orderBy?: string) => {
  if (!orderBy) return undefined;
  switch (orderBy) {
    case 'latest':
      return { orderBy: { createAt: 'desc' } };
    case 'expensive':
      return { orderBy: { price: 'desc' } };
    case 'cheap':
      return { orderBy: { price: 'asc' } };
  }
};
