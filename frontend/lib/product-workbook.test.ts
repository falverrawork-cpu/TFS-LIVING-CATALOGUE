import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { importProductWorkbook } from "./product-workbook";

describe("product workbook import", () => {
  it("creates one collection card for a new Excel collection name", async () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([
      { "Product ID": "NEW-001", "Product Name": "First chair", Collection: "Summer Chairs" },
      { "Product ID": "NEW-002", "Product Name": "Second chair", Collection: "Summer Chairs" },
    ]), "Products");
    const bytes = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    const file = new File([bytes], "products.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

    const result = await importProductWorkbook(file, []);

    expect(result.collections).toHaveLength(1);
    expect(result.collections[0].name).toBe("Summer Chairs");
    expect(result.collections[0].products).toHaveLength(2);
  });

  it("imports MRP and TRP values", async () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([
      { "Product ID": "NEW-003", "Product Name": "Third chair", Collection: "Summer Chairs", "MRP (INR)": 25000, "TRP (INR)": 22000 },
    ]), "Products");
    const bytes = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    const file = new File([bytes], "products.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

    const result = await importProductWorkbook(file, []);

    expect(result.products[0].product.price).toBe(25000);
    expect(result.products[0].product.trp).toBe(22000);
  });
});
