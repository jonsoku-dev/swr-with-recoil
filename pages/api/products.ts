// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import {
  fetchProductsExternal,
  ProductsResponse,
} from "../../external/products";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProductsResponse>
) {
  const limit = (req.query.limit as string | undefined) ?? "10";
  const page = req.query.page as string;
  const products = await fetchProductsExternal({ limit, page });
  res.status(200).json(products);
}
