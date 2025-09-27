export interface ContentfulProductFields {
  sku: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  color: string;
  price: number;
  currency: string;
  stock: number;
}

export interface ContentfulEntry<T> {
  sys: {
    id: string;
  };
  fields: T;
}

export interface ContentfulApiResponse<T> {
  sys: {
    type: 'Array';
  };
  total: number;
  skip: number;
  limit: number;
  items: ContentfulEntry<T>[];
}
