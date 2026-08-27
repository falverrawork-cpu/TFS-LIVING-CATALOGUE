import * as XLSX from "xlsx";
import type { Collection, Product } from "@/types/catalogue";

export const workbookColumns = [
  "Product ID", "Product Name", "Collection", "MRP (INR)", "TRP (INR)",
  "Length (cm)", "Width (cm)", "Height (cm)",
  "Length (inch)", "Width (inch)", "Height (inch)",
  "Primary Image URL", "Highlight Image URL", "Display Order", "Active", "Show in Product Grid",
] as const;

type WorkbookRow = Record<string, unknown>;
export type ImportedProduct = { product: Product; action: "create" | "update"; rowNumber: number };
export type ImportResult = { collections: Collection[]; products: ImportedProduct[]; created: number; updated: number; errors: string[] };

const text = (value: unknown) => String(value ?? "").trim();
const numberValue = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const booleanValue = (value: unknown, fallback = true) => {
  if (typeof value === "boolean") return value;
  const normalized = text(value).toLowerCase();
  if (["yes", "true", "1", "active"].includes(normalized)) return true;
  if (["no", "false", "0", "inactive"].includes(normalized)) return false;
  return fallback;
};
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function downloadProductTemplate() {
  const example = {
    "Product ID": "TFSL-NEW-001", "Product Name": "New Product Name", Collection: "New Arrivals",
    "MRP (INR)": 24999, "TRP (INR)": 21999, "Length (cm)": 74, "Width (cm)": 66, "Height (cm)": 76,
    "Length (inch)": 29, "Width (inch)": 26, "Height (inch)": 30,
    "Primary Image URL": "", "Highlight Image URL": "", "Display Order": 1,
    Active: "Yes", "Show in Product Grid": "Yes",
  };
  const workbook = XLSX.utils.book_new();
  const products = XLSX.utils.json_to_sheet([example], { header: [...workbookColumns] });
  products["!cols"] = workbookColumns.map((column) => ({ wch: Math.max(column.length + 2, 16) }));
  XLSX.utils.book_append_sheet(workbook, products, "Products");
  const instructions = XLSX.utils.aoa_to_sheet([
    ["TFS Living product import template"],
    ["Edit the example row or add rows beneath it, then upload this workbook in Excel Import."],
    ["Product ID is required and unique. Existing IDs update; new IDs create products."],
    ["Product Name and Collection are required. Missing image URLs keep the existing image when updating."],
    ["Active and Show in Product Grid accept Yes/No, True/False, or 1/0."],
  ]);
  instructions["!cols"] = [{ wch: 110 }];
  XLSX.utils.book_append_sheet(workbook, instructions, "Instructions");
  XLSX.writeFile(workbook, "TFS-Living-Product-Import-Template.xlsx");
}

export async function importProductWorkbook(file: File, current: Collection[]): Promise<ImportResult> {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error("The workbook does not contain a worksheet.");
  const rows = XLSX.utils.sheet_to_json<WorkbookRow>(sheet, { defval: "" });
  const next = structuredClone(current);
  const products = next.flatMap((collection) => collection.products);
  const codes = new Set<string>();
  const errors: string[] = [];
  const importedProducts: ImportedProduct[] = [];
  let created = 0;
  let updated = 0;

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const productCode = text(row["Product ID"]);
    const productName = text(row["Product Name"]);
    const collectionName = text(row.Collection);
    const normalizedCode = productCode.toLowerCase();
    if (!productCode || !productName || !collectionName) {
      errors.push(`Row ${rowNumber}: Product ID, Product Name and Collection are required.`);
      return;
    }
    if (codes.has(normalizedCode)) {
      errors.push(`Row ${rowNumber}: duplicate Product ID ${productCode}.`);
      return;
    }
    codes.add(normalizedCode);
    const existing = products.find((product) => product.productCode.toLowerCase() === normalizedCode);
    let collection = next.find((item) => item.name.toLowerCase() === collectionName.toLowerCase());
    if (!collection) {
      const collectionSlug = slug(collectionName) || `collection-${next.length + 1}`;
      let collectionId = `collection-${collectionSlug}`;
      let suffix = 2;
      while (next.some((item) => item.id === collectionId)) collectionId = `collection-${collectionSlug}-${suffix++}`;
      collection = { id: collectionId, name: collectionName, slug: collectionSlug, displayOrder: next.length + 1, isActive: true, products: [] };
      next.push(collection);
    }
    const primaryImage = text(row["Primary Image URL"]);
    const highlightImage = text(row["Highlight Image URL"]);
    const values: Omit<Product, "id"> = {
      productCode, productName, collectionId: collection.id, collectionName,
      price: numberValue(row["MRP (INR)"] ?? row["Price (INR)"]), trp: numberValue(row["TRP (INR)"]),
      lengthCm: numberValue(row["Length (cm)"]),
      widthCm: numberValue(row["Width (cm)"]), heightCm: numberValue(row["Height (cm)"]),
      lengthInch: numberValue(row["Length (inch)"]), widthInch: numberValue(row["Width (inch)"]),
      heightInch: numberValue(row["Height (inch)"]),
      primaryImage: primaryImage || existing?.primaryImage || "https://placehold.co/1200x900/f2f0ea/777?text=Product+image",
      highlightImage: highlightImage || existing?.highlightImage,
      displayOrder: numberValue(row["Display Order"], collection.products.length + 1),
      isActive: booleanValue(row.Active), isHighlighted: existing?.isHighlighted ?? false,
      showInProductGrid: booleanValue(row["Show in Product Grid"]),
    };
    if (existing) {
      const oldCollection = next.find((item) => item.products.some((product) => product.id === existing.id));
      if (oldCollection) oldCollection.products = oldCollection.products.filter((product) => product.id !== existing.id);
      Object.assign(existing, values);
      collection.products.push(existing);
      importedProducts.push({ product: existing, action: "update", rowNumber });
      updated += 1;
    } else {
      const product = { id: `product-${slug(productCode)}-${Date.now()}-${index}`, ...values };
      collection.products.push(product);
      products.push(product);
      importedProducts.push({ product, action: "create", rowNumber });
      created += 1;
    }
  });
  return { collections: next, products: importedProducts, created, updated, errors };
}
