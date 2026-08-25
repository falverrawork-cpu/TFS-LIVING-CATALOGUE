import type { Product } from "@/types/catalogue";

const matchKey = (value: string) => value.toLowerCase().replace(/\.[^.]+$/, "").replace(/[^a-z0-9]/g, "");

export function matchProductForImage(fileName: string, products: Product[]) {
  const fileKey = matchKey(fileName);
  return products.find((product) => matchKey(product.productCode) === fileKey);
}
