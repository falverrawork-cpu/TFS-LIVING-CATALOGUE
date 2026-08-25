import { describe, expect, it } from "vitest";
import { matchProductForImage } from "./image-matching";
import type { Product } from "@/types/catalogue";

const product = { productCode: "TFSL-001" } as Product;

describe("bulk image matching", () => {
  it("matches product IDs regardless of filename separators or case", () => {
    expect(matchProductForImage("tfsl_001.JPG", [product])).toBe(product);
  });

  it("does not guess when a filename has no matching product ID", () => {
    expect(matchProductForImage("chair-front.jpg", [product])).toBeUndefined();
  });
});
