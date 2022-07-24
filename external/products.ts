import axios from "axios";

export interface Product {
  id: number;
  title: string;
  price: number;
}

export interface ProductsExternalResponse {
  products: Product[];
  total: number;
  skip: string;
  limit: number;
}

export interface FetchProductsExternalInput {
  limit: string;
  page: string;
}

export const fetchProductsExternal = async (
  params: FetchProductsExternalInput
) => {
  const { limit, page } = params;
  console.log({ limit, page });
  const skip = (parseInt(limit, 10) * parseInt(page, 10)).toString();
  const response = await axios.get<ProductsExternalResponse>(
    `https://dummyjson.com/products?limit=${limit}&skip=${skip}&select=title,price`
  );
  return response.data.products;
};
