"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  BookOpen,
  Boxes,
  ChevronLeft,
  ChevronRight,
  Download,
  FileClock,
  FileSpreadsheet,
  Image,
  LayoutDashboard,
  Package,
  Palette,
  Pencil,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { collections, highlights } from "@/lib/demo-data";
import { downloadProductTemplate, importProductWorkbook, type ImportResult } from "@/lib/product-workbook";
import { matchProductForImage } from "@/lib/image-matching";
import { buildCatalogueManifest, cataloguePageKey, orderCatalogueManifest } from "@/lib/catalogue/manifest";
import { CataloguePage } from "@/components/catalogue/Pages";
import {
  contentOptions,
  defaultLayoutState,
  initialStyle,
  presetForPage,
  type ContentStyle,
  type LayoutPresetState,
} from "@/lib/catalogue/layout-presets";
import type { Collection, HighlightConfig, PageSpec, Product } from "@/types/catalogue";
type NumericContentStyleKey = "fontSize" | "fontWeight" | "paddingTop" | "paddingRight" | "paddingBottom" | "paddingLeft" | "marginTop" | "marginRight" | "marginBottom" | "marginLeft";
const nav = [
  ["Dashboard", LayoutDashboard],
  ["Products", Package],
  ["Collections", Boxes],
  ["Excel Import", FileSpreadsheet],
  ["Images", Image],
  ["Catalogues", BookOpen],
  ["Highlight Pages", Palette],
  ["Brand Settings", Settings],
  ["Export History", FileClock],
  ["Users / Settings", Users],
] as const;
type CatalogueMedia = { coverImage: string; backCoverImage: string };
const defaultCatalogueMedia: CatalogueMedia = {
  coverImage:
    "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1600&q=90",
  backCoverImage:
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=90",
};
export function CatalogueStudio() {
  const [tab, setTab] = useState("Dashboard");
  const [highlightState, setHighlightState] = useState<HighlightConfig[]>(highlights);
  const [catalogueCollections, setCatalogueCollections] = useState<Collection[]>(collections);
  useEffect(() => {
    const saved = localStorage.getItem("tfs-catalogue-highlights");
    if (saved) try { setHighlightState(JSON.parse(saved)); } catch { localStorage.removeItem("tfs-catalogue-highlights"); }
    const savedProducts = localStorage.getItem("tfs-catalogue-products");
    if (savedProducts) try { setCatalogueCollections(JSON.parse(savedProducts)); } catch { localStorage.removeItem("tfs-catalogue-products"); }
  }, []);
  const updateCollections = (next: Collection[]) => {
    setCatalogueCollections(next);
    localStorage.setItem("tfs-catalogue-products", JSON.stringify(next));
  };
  const updateHighlights = (next: HighlightConfig[]) => {
    setHighlightState(next);
    try {
      localStorage.setItem("tfs-catalogue-highlights", JSON.stringify(next));
    } catch (error) {
      console.error("Unable to persist highlight settings", error);
    }
  };
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">tfs</div>
          <div>
            <b>TFS Living</b>
            <small>Catalogue Studio</small>
          </div>
        </div>
        <nav className="nav">
          {nav.map(([label, Icon]) => (
            <button
              key={label}
              className={tab === label ? "active" : ""}
              onClick={() => setTab(label)}
            >
              <Icon size={17} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="avatar">VA</div>
          <div>
            <b style={{ fontSize: 12 }}>Varun Admin</b>
            <small style={{ display: "block", color: "#888" }}>
              Administrator
            </small>
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="search">
            <Search size={17} />
            <input placeholder="Search products, catalogues..." />
          </div>
          <div className="top-actions">
            <button className="btn" onClick={() => setTab("Excel Import")}>
              <Upload size={15} />
              Import Excel
            </button>
            <button
              className="btn primary"
              onClick={() => setTab("Catalogues")}
            >
              <Plus size={15} />
              New catalogue
            </button>
          </div>
        </header>
        <div className="content">
          {tab === "Dashboard" ? (
            <Dashboard setTab={setTab} collections={catalogueCollections} />
          ) : tab === "Products" ? (
            <Products collections={catalogueCollections} onChange={updateCollections} />
          ) : tab === "Collections" ? (
            <Collections collections={catalogueCollections} onChange={updateCollections} />
          ) : tab === "Excel Import" ? (
            <Import collections={catalogueCollections} onImport={updateCollections} setTab={setTab} />
          ) : tab === "Catalogues" ? (
            <Catalogues setTab={setTab} highlightState={highlightState} collections={catalogueCollections} />
          ) : tab === "Images" ? (
            <Images collections={catalogueCollections} onChange={updateCollections} />
          ) : tab === "Highlight Pages" ? (
            <Highlights value={highlightState} onChange={updateHighlights} collections={catalogueCollections} />
          ) : tab === "Brand Settings" ? (
            <SettingsPage />
          ) : tab === "Export History" ? (
            <Exports />
          ) : (
            <Placeholder title={tab} />
          )}
        </div>
      </main>
    </div>
  );
}
function Head({
  eyebrow,
  title,
  desc,
  action,
}: {
  eyebrow: string;
  title: string;
  desc: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="pagehead">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      {action}
    </div>
  );
}
function Dashboard({ setTab, collections }: { setTab: (s: string) => void; collections: Collection[] }) {
  const products = collections.flatMap((c) => c.products);
  return (
    <>
      <Head
        eyebrow="Overview"
        title="Good morning, Varun"
        desc="Everything you need to keep the 2026 catalogue moving."
      />
      <div className="stats">
        {[
          ["Total products", products.length, Package],
          ["Active collections", collections.length, Boxes],
          ["Missing images", 0, Image],
          [
            "Catalogue pages",
            buildCatalogueManifest(collections, highlights).length,
            BookOpen,
          ],
        ].map(([l, n, I]: any) => (
          <div className="stat" key={l}>
            <div className="stat-top">
              <span>{l}</span>
              <span className="stat-icon">
                <I size={17} />
              </span>
            </div>
            <strong>{n}</strong>
            <small>Ready for catalogue</small>
          </div>
        ))}
      </div>
      <div className="grid2">
        <div className="panel">
          <h2>Fast catalogue workflow</h2>
          <div className="workflow">
            {[
              "Import data",
              "Match images",
              "Build catalogue",
              "Export PDF",
            ].map((x, i) => (
              <div className="flow-item" key={x}>
                <div className="flow-num">{i + 1}</div>
                <b>{x}</b>
                <small>
                  {i === 0
                    ? "Excel or CSV"
                    : i === 1
                      ? "By product ID"
                      : i === 2
                        ? "Auto paginate"
                        : "Print quality"}
                </small>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <h2>Recent activity</h2>
          <div className="activity">
            <div className="activity-row">
              <span className="dot" />
              <div>
                <b>Collection 2026 updated</b>
                <small>12 minutes ago</small>
              </div>
            </div>
            <div className="activity-row">
              <span className="dot" />
              <div>
                <b>24 products validated</b>
                <small>Yesterday</small>
              </div>
            </div>
            <div className="activity-row">
              <span className="dot" />
              <div>
                <b>High quality PDF exported</b>
                <small>2 days ago</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="panel"
        style={{
          marginTop: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div className="eyebrow">Active catalogue</div>
          <h2 style={{ margin: "5px 0" }}>TFS Living Collection 2026</h2>
          <p style={{ color: "#777", margin: 0 }}>
            5 collections · {products.length} products · Draft
          </p>
        </div>
        <button className="btn primary" onClick={() => setTab("Catalogues")}>
          Open builder <ChevronRight size={15} />
        </button>
      </div>
    </>
  );
}
function Products({ collections, onChange }: { collections: Collection[]; onChange: (next: Collection[]) => void }) {
  const [editing, setEditing] = useState<Product | null>(null);
  const products = collections.flatMap((collection) => [...collection.products].sort((a, b) => a.displayOrder - b.displayOrder));
  const normalize = (items: Product[]) => [...items].sort((a, b) => a.displayOrder - b.displayOrder).map((product, index) => ({ ...product, displayOrder: index + 1 }));
  const saveProduct = () => {
    if (!editing) return;
    const destination = collections.find((collection) => collection.id === editing.collectionId);
    if (!destination) return;
    const withoutProduct = collections.map((collection) => ({
      ...collection,
      products: normalize(collection.products.filter((product) => product.id !== editing.id)),
    }));
    const target = withoutProduct.find((collection) => collection.id === editing.collectionId);
    if (!target) return;
    const rank = Math.max(1, Math.min(Math.round(editing.displayOrder || 1), target.products.length + 1));
    const product = { ...editing, collectionId: target.id, collectionName: target.name, displayOrder: rank };
    target.products.splice(rank - 1, 0, product);
    target.products = normalize(target.products);
    onChange(withoutProduct);
    setEditing(null);
  };
  const deleteProduct = (product: Product) => {
    if (!window.confirm(`Delete ${product.productName} (${product.productCode})?`)) return;
    onChange(collections.map((collection) => ({
      ...collection,
      products: normalize(collection.products.filter((item) => item.id !== product.id)),
    })));
    if (editing?.id === product.id) setEditing(null);
  };
  const deleteAllProducts = () => {
    if (products.length === 0) return;
    if (!window.confirm(`Delete all ${products.length} products? This will empty every collection and cannot be undone.`)) return;
    onChange(collections.map((collection) => ({ ...collection, products: [] })));
    setEditing(null);
  };
  const rankingLimit = editing ? (collections.find((collection) => collection.id === editing.collectionId)?.products.filter((product) => product.id !== editing.id).length ?? 0) + 1 : 1;
  return (
    <>
      <Head
        eyebrow="Inventory"
        title="Products"
        desc="Search, filter and maintain every catalogue item."
        action={
          <div className="head-actions">
            <button className="btn danger-text" disabled={products.length === 0} onClick={deleteAllProducts}>
              <Trash2 size={15} />
              Delete all
            </button>
            <button className="btn primary">
              <Plus size={15} />
              Add product
            </button>
          </div>
        }
      />
      <div className="table-wrap">
        <div className="toolbar">
          <input placeholder="Search product ID or name" />
          <select>
            <option>All collections</option>
            {collections.map((c) => (
              <option key={c.id}>{c.name}</option>
            ))}
          </select>
          <select>
            <option>All statuses</option>
            <option>Active</option>
            <option>Missing image</option>
          </select>
        </div>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>ID</th>
              <th>Collection</th>
              <th>Rank</th>
              <th>Price</th>
              <th>Dimensions</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="product-cell">
                    <img src={p.primaryImage} />
                    <b>{p.productName}</b>
                  </div>
                </td>
                <td className="code">{p.productCode}</td>
                <td>{p.collectionName}</td>
                <td><span className="rank-badge">{p.displayOrder}</span></td>
                <td>₹{p.price.toLocaleString("en-IN")}</td>
                <td>
                  {p.lengthCm} × {p.widthCm} × {p.heightCm} cm
                </td>
                <td>
                  <span className="pill">Active</span>
                </td>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn" aria-label={`Edit ${p.productName}`} onClick={() => setEditing({ ...p })}><Pencil size={15} /></button>
                    <button className="icon-btn danger" aria-label={`Delete ${p.productName}`} onClick={() => deleteProduct(p)}><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <div className="editor-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}>
          <section className="product-editor" role="dialog" aria-modal="true" aria-labelledby="product-editor-title">
            <div className="product-editor-head">
              <div><div className="eyebrow">Product settings</div><h2 id="product-editor-title">Edit product</h2></div>
              <button className="btn" onClick={() => setEditing(null)}>Cancel</button>
            </div>
            <div className="product-editor-grid">
              <label><span>Product name</span><input value={editing.productName} onChange={(event) => setEditing({ ...editing, productName: event.target.value })} /></label>
              <label><span>Product ID</span><input value={editing.productCode} onChange={(event) => setEditing({ ...editing, productCode: event.target.value })} /></label>
              <label><span>Collection</span><select value={editing.collectionId} onChange={(event) => { const collection = collections.find((item) => item.id === event.target.value); if (collection) setEditing({ ...editing, collectionId: collection.id, collectionName: collection.name, displayOrder: collection.products.length + 1 }); }}>{collections.map((collection) => <option key={collection.id} value={collection.id}>{collection.name}</option>)}</select></label>
              <label><span>Rank in collection (1–{rankingLimit})</span><input type="number" min={1} max={rankingLimit} value={editing.displayOrder} onChange={(event) => setEditing({ ...editing, displayOrder: Number(event.target.value) })} /></label>
              <label><span>Price (INR)</span><input type="number" min={0} value={editing.price} onChange={(event) => setEditing({ ...editing, price: Number(event.target.value) })} /></label>
              <label className="wide"><span>Primary image URL</span><input value={editing.primaryImage} onChange={(event) => setEditing({ ...editing, primaryImage: event.target.value })} /></label>
              <label><span>Length (cm)</span><input type="number" min={0} value={editing.lengthCm} onChange={(event) => setEditing({ ...editing, lengthCm: Number(event.target.value) })} /></label>
              <label><span>Width (cm)</span><input type="number" min={0} value={editing.widthCm} onChange={(event) => setEditing({ ...editing, widthCm: Number(event.target.value) })} /></label>
              <label><span>Height (cm)</span><input type="number" min={0} value={editing.heightCm} onChange={(event) => setEditing({ ...editing, heightCm: Number(event.target.value) })} /></label>
            </div>
            <div className="product-editor-foot">
              <button className="btn danger-text" onClick={() => deleteProduct(editing)}><Trash2 size={15} /> Delete product</button>
              <button className="btn primary" disabled={!editing.productName.trim() || !editing.productCode.trim()} onClick={saveProduct}>Save changes</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
function Collections({ collections, onChange }: { collections: Collection[]; onChange: (next: Collection[]) => void }) {
  const [editing, setEditing] = useState<Collection | null>(null);
  const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const duplicateName = editing ? collections.some((collection) => collection.id !== editing.id && collection.name.trim().toLowerCase() === editing.name.trim().toLowerCase()) : false;
  const saveCollection = () => {
    if (!editing || !editing.name.trim() || duplicateName) return;
    const name = editing.name.trim();
    onChange(collections.map((collection) => collection.id === editing.id ? {
      ...collection,
      name,
      slug: slugify(name),
      isActive: editing.isActive,
      products: collection.products.map((product) => ({ ...product, collectionName: name })),
    } : collection));
    setEditing(null);
  };
  const deleteCollection = (collection: Collection) => {
    const productWarning = collection.products.length ? ` Its ${collection.products.length} product${collection.products.length === 1 ? "" : "s"} will also be deleted.` : "";
    if (!window.confirm(`Delete the ${collection.name} collection?${productWarning}`)) return;
    onChange(collections.filter((item) => item.id !== collection.id).map((item, index) => ({ ...item, displayOrder: index + 1 })));
    if (editing?.id === collection.id) setEditing(null);
  };
  const deleteAllCollections = () => {
    if (collections.length === 0) return;
    const productCount = collections.reduce((total, collection) => total + collection.products.length, 0);
    if (!window.confirm(`Delete all ${collections.length} collections and all ${productCount} products inside them? This cannot be undone.`)) return;
    onChange([]);
    setEditing(null);
  };
  return (
    <>
      <Head
        eyebrow="Organisation"
        title="Collections"
        desc="The first two ordered products automatically appear on each collection opener."
        action={
          <div className="head-actions">
            <button className="btn danger-text" disabled={collections.length === 0} onClick={deleteAllCollections}><Trash2 size={15} /> Delete all</button>
            <button className="btn primary"><Plus size={15} /> New collection</button>
          </div>
        }
      />
      <div className="collection-grid">
        {collections.map((c) => (
          <div className="collection-card" key={c.id}>
            <div className="collection-art">
              <h3>{c.name}</h3>
            </div>
            <div className="collection-meta">
              <span>{c.products.length} products</span>
              <div className="collection-actions">
                <button className="icon-btn" aria-label={`Edit ${c.name}`} onClick={() => setEditing({ ...c, products: [...c.products] })}><Pencil size={14} /></button>
                <button className="icon-btn danger" aria-label={`Delete ${c.name}`} onClick={() => deleteCollection(c)}><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {editing && (
        <div className="editor-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}>
          <section className="product-editor collection-editor" role="dialog" aria-modal="true" aria-labelledby="collection-editor-title">
            <div className="product-editor-head">
              <div><div className="eyebrow">Collection settings</div><h2 id="collection-editor-title">Edit collection</h2></div>
              <button className="btn" onClick={() => setEditing(null)}>Cancel</button>
            </div>
            <div className="product-editor-grid collection-editor-grid">
              <label><span>Collection name</span><input autoFocus value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} /></label>
              <label><span>Status</span><select value={editing.isActive ? "active" : "inactive"} onChange={(event) => setEditing({ ...editing, isActive: event.target.value === "active" })}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
            </div>
            {duplicateName && <p className="field-error">A collection with this name already exists.</p>}
            <div className="product-editor-foot">
              <button className="btn danger-text" onClick={() => deleteCollection(editing)}><Trash2 size={15} /> Delete collection</button>
              <button className="btn primary" disabled={!editing.name.trim() || duplicateName} onClick={saveCollection}>Save changes</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
function Import({ collections, onImport, setTab }: { collections: Collection[]; onImport: (next: Collection[]) => void; setTab: (tab: string) => void }) {
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState<{ created: number; updated: number; errors: string[]; fileName: string } | null>(null);
  const [pending, setPending] = useState<(ImportResult & { fileName: string }) | null>(null);
  const chooseWorkbook = async (file?: File) => {
    if (!file) return;
    setWorking(true);
    try {
      const imported = await importProductWorkbook(file, collections);
      setPending({ ...imported, fileName: file.name });
      setResult(null);
    } catch (error) {
      setPending(null);
      setResult({ created: 0, updated: 0, errors: [error instanceof Error ? error.message : "The workbook could not be read."], fileName: file.name });
    } finally {
      setWorking(false);
    }
  };
  const updatePendingPhoto = (productId: string, primaryImage: string) => {
    setPending((current) => current ? {
      ...current,
      collections: current.collections.map((collection) => ({
        ...collection,
        products: collection.products.map((product) => product.id === productId ? { ...product, primaryImage } : product),
      })),
      products: current.products.map((item) => item.product.id === productId ? { ...item, product: { ...item.product, primaryImage } } : item),
    } : current);
  };
  const choosePhoto = (productId: string, file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const image = new window.Image();
      image.onload = () => {
        const maxSide = 1600;
        const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.naturalWidth * scale);
        canvas.height = Math.round(image.naturalHeight * scale);
        canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
        updatePendingPhoto(productId, canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };
  const confirmImport = () => {
    if (!pending || pending.products.length === 0) return;
    onImport(pending.collections);
    setResult({ created: pending.created, updated: pending.updated, errors: pending.errors, fileName: pending.fileName });
    setPending(null);
  };
  return (
    <>
      <Head
        eyebrow="Bulk management"
        title="Excel import"
        desc="Files are parsed and validated before anything is written."
        action={
          <button className="btn" onClick={downloadProductTemplate}>
            <Download size={15} />
            Download template
          </button>
        }
      />
      <div className="import-steps">
        <span className="import-step active" />
        <span className={`import-step ${pending ? "active" : ""}`} />
        <span className={`import-step ${result ? "active" : ""}`} />
      </div>
      <div className="dropzone">
        <div className="drop-icon">
          <FileSpreadsheet />
        </div>
        <h2>Drop your product workbook here</h2>
        <p>.xlsx, .xls or .csv · Product ID is the unique match key</p>
        <label className="btn primary">
          {working ? "Importing…" : "Choose workbook"}
          <input type="file" accept=".xlsx,.xls,.csv" hidden disabled={working} onChange={(event) => { void chooseWorkbook(event.target.files?.[0]); event.currentTarget.value = ""; }} />
        </label>
      </div>
      {pending && (
        <section className="import-review">
          <div className="import-review-head">
            <div>
              <div className="eyebrow">Review before adding</div>
              <h2>{pending.products.length} product{pending.products.length === 1 ? "" : "s"} ready</h2>
              <p>{pending.fileName} · Products will be placed in the collections shown on each card.</p>
            </div>
            <div className="import-review-actions">
              <button className="btn" onClick={() => setPending(null)}>Cancel</button>
              <button className="btn primary" disabled={pending.products.length === 0} onClick={confirmImport}>Add {pending.products.length} products</button>
            </div>
          </div>
          {pending.errors.length > 0 && (
            <div className="import-errors">
              <b>{pending.errors.length} row{pending.errors.length === 1 ? "" : "s"} held back</b>
              {pending.errors.slice(0, 6).map((error) => <div key={error}>{error}</div>)}
            </div>
          )}
          <div className="import-product-grid">
            {pending.products.map(({ product, action, rowNumber }) => (
              <article className="import-product-card" key={`${product.id}-${rowNumber}`}>
                <div className="import-product-photo">
                  <img src={product.primaryImage} alt={product.productName} />
                  <label className="photo-edit">
                    <Image size={14} /> Replace photo
                    <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(event) => { choosePhoto(product.id, event.target.files?.[0]); event.currentTarget.value = ""; }} />
                  </label>
                </div>
                <div className="import-product-copy">
                  <div className="import-product-flags">
                    <span className={`pill ${action === "update" ? "orange" : ""}`}>{action === "create" ? "NEW" : "UPDATE"}</span>
                    <span className="collection-chip">{product.collectionName}</span>
                  </div>
                  <h3>{product.productName}</h3>
                  <p className="code">{product.productCode}</p>
                  <strong>₹{product.price.toLocaleString("en-IN")}</strong>
                  <small>{product.lengthCm} × {product.widthCm} × {product.heightCm} cm</small>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
      <div className="grid2">
        <div className="panel">
          <h2>Safe update rules</h2>
          <p style={{ color: "#777", lineHeight: 1.6 }}>
            New IDs create products. Existing IDs update in place. Duplicate IDs
            and invalid rows are held back with row-level messages. Missing rows
            never delete products.
          </p>
        </div>
        <div className="panel">
          <h2>{result ? "Import complete" : pending ? "Waiting for confirmation" : "Last import"}</h2>
          {result ? <>
            <p style={{ color: "#777" }}>{result.fileName}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className="pill">{result.created} NEW</span>
              <span className="pill orange">{result.updated} UPDATED</span>
              {result.errors.length > 0 && <span className="pill">{result.errors.length} HELD BACK</span>}
            </div>
            {result.errors.length > 0 && <div style={{ marginTop: 14, color: "#9b3b2d", fontSize: 13 }}>{result.errors.slice(0, 6).map((error) => <div key={error}>{error}</div>)}</div>}
            {(result.created > 0 || result.updated > 0) && <button className="btn primary" style={{ marginTop: 16 }} onClick={() => setTab("Products")}>View catalogue products</button>}
          </> : <p style={{ color: "#777" }}>{pending ? "Review the product cards above, replace any photos, then confirm the import." : "No workbook imported in this session."}</p>}
        </div>
      </div>
    </>
  );
}
type PendingImageMatch = { product: Product; fileName: string; image: string };
function Images({ collections, onChange }: { collections: Collection[]; onChange: (next: Collection[]) => void }) {
  const [working, setWorking] = useState(false);
  const [matches, setMatches] = useState<PendingImageMatch[]>([]);
  const [unmatched, setUnmatched] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const products = collections.flatMap((collection) => collection.products);
  const compressImage = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.onload = () => {
      const image = new window.Image();
      image.onerror = () => reject(new Error(`Could not open ${file.name}`));
      image.onload = () => {
        const maxSide = 1400;
        const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.naturalWidth * scale);
        canvas.height = Math.round(image.naturalHeight * scale);
        canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
  const chooseImages = async (files: FileList | File[]) => {
    const selected = Array.from(files).filter((file) => /^image\/(jpeg|png|webp)$/i.test(file.type));
    if (!selected.length) return;
    setWorking(true);
    setMessage("");
    const nextMatches: PendingImageMatch[] = [];
    const nextUnmatched: string[] = [];
    const matchedIds = new Set<string>();
    for (const file of selected) {
      const product = matchProductForImage(file.name, products);
      if (!product || matchedIds.has(product.id)) {
        nextUnmatched.push(file.name);
        continue;
      }
      try {
        nextMatches.push({ product, fileName: file.name, image: await compressImage(file) });
        matchedIds.add(product.id);
      } catch {
        nextUnmatched.push(file.name);
      }
    }
    setMatches(nextMatches);
    setUnmatched(nextUnmatched);
    setWorking(false);
  };
  const confirmMatches = () => {
    if (!matches.length) return;
    const images = new Map(matches.map((match) => [match.product.id, match.image]));
    onChange(collections.map((collection) => ({
      ...collection,
      products: collection.products.map((product) => images.has(product.id) ? { ...product, primaryImage: images.get(product.id)! } : product),
    })));
    setMessage(`${matches.length} product photo${matches.length === 1 ? "" : "s"} updated.`);
    setMatches([]);
    setUnmatched([]);
  };
  return (
    <>
      <Head
        eyebrow="Media library"
        title="Bulk image matching"
        desc="File names are matched to product IDs automatically."
      />
      <div className="dropzone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void chooseImages(event.dataTransfer.files); }}>
        <div className="drop-icon">
          <Image />
        </div>
        <h2>Drop product photographs here</h2>
        <p>JPG, PNG or WEBP · use names such as TFSL-001.jpg</p>
        <label className="btn primary">
          <Upload size={15} />
          {working ? "Matching images…" : "Select images"}
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden disabled={working} onChange={(event) => { if (event.target.files) void chooseImages(event.target.files); event.currentTarget.value = ""; }} />
        </label>
      </div>
      {message && <div className="image-match-success">{message}</div>}
      {(matches.length > 0 || unmatched.length > 0) && (
        <section className="import-review image-match-review">
          <div className="import-review-head">
            <div><div className="eyebrow">Review matches</div><h2>{matches.length} matched · {unmatched.length} unmatched</h2><p>Only matched products will be updated.</p></div>
            <div className="import-review-actions"><button className="btn" onClick={() => { setMatches([]); setUnmatched([]); }}>Cancel</button><button className="btn primary" disabled={!matches.length} onClick={confirmMatches}>Update {matches.length} photos</button></div>
          </div>
          {unmatched.length > 0 && <div className="import-errors"><b>Unmatched files</b><div>{unmatched.join(", ")}</div><small>Rename each file to a Product ID, such as TFSL-001.jpg.</small></div>}
          <div className="import-product-grid">
            {matches.map((match) => <article className="import-product-card" key={match.product.id}><div className="import-product-photo"><img src={match.image} alt={match.product.productName} /></div><div className="import-product-copy"><span className="pill">MATCHED</span><h3>{match.product.productName}</h3><p className="code">{match.product.productCode}</p><small>{match.fileName}</small></div></article>)}
          </div>
        </section>
      )}
    </>
  );
}
function Catalogues({ setTab, highlightState, collections }: { setTab: (s: string) => void; highlightState: HighlightConfig[]; collections: Collection[] }) {
  const [preview, setPreview] = useState(false);
  const [configure, setConfigure] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const baseManifest = useMemo(
    () => buildCatalogueManifest(collections, highlightState),
    [collections, highlightState],
  );
  const [pageOrder, setPageOrder] = useState<string[]>([]);
  const manifest = useMemo(() => orderCatalogueManifest(baseManifest, pageOrder), [baseManifest, pageOrder]);
  const [page, setPage] = useState(1);
  const [layoutState, setLayoutState] =
    useState<LayoutPresetState>(defaultLayoutState);
  const [media, setMedia] = useState<CatalogueMedia>(defaultCatalogueMedia);
  useEffect(() => {
    const saved = localStorage.getItem("tfs-catalogue-layout-presets");
    if (saved)
      try {
        setLayoutState(JSON.parse(saved));
      } catch {
        localStorage.removeItem("tfs-catalogue-layout-presets");
      }
    const savedMedia = localStorage.getItem("tfs-catalogue-media");
    if (savedMedia)
      try {
        setMedia(JSON.parse(savedMedia));
      } catch {
        localStorage.removeItem("tfs-catalogue-media");
      }
    try { const savedOrder = localStorage.getItem("tfs-catalogue-page-order"); if (savedOrder) setPageOrder(JSON.parse(savedOrder)); } catch { localStorage.removeItem("tfs-catalogue-page-order"); }
  }, []);
  const movePage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= manifest.length) return;
    const next = manifest.map(cataloguePageKey);
    [next[index], next[target]] = [next[target], next[index]];
    setPageOrder(next);
    localStorage.setItem("tfs-catalogue-page-order", JSON.stringify(next));
  };
  const downloadCatalogue = async () => {
    setExporting(true);
    setExportError("");
    try {
      const exportRoot = document.querySelector<HTMLElement>(".in-page-print");
      if (!exportRoot) throw new Error("The catalogue pages are not ready.");
      await Promise.all(Array.from(exportRoot.querySelectorAll<HTMLImageElement>("img")).map((image) =>
        image.complete ? Promise.resolve() : new Promise<void>((resolve) => {
          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", () => resolve(), { once: true });
        }),
      ));
      await document.fonts.ready;
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const pages = Array.from(exportRoot.querySelectorAll<HTMLElement>(".page"));
      if (!pages.length) throw new Error("No catalogue pages were found.");
      exportRoot.style.visibility = "visible";
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      try {
        for (let index = 0; index < pages.length; index += 1) {
          const canvas = await html2canvas(pages[index], {
            backgroundColor: "#ffffff",
            scale: 1.5,
            useCORS: true,
            logging: false,
          });
          if (index > 0) pdf.addPage("a4", "portrait");
          pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, 210, 297, `page-${index + 1}`, "FAST");
        }
      } finally {
        exportRoot.style.visibility = "";
      }
      pdf.save("TFS-Living-Catalogue-2026.pdf");
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "PDF generation failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };
  if (preview) {
    const spec = manifest[page - 1];
    const preset = presetForPage(layoutState, page);
    return (
      <>
      <div className="preview-shell">
        <aside className="thumbs">
          <button
            className="btn"
            style={{ width: "100%", marginBottom: 12 }}
            onClick={() => setPreview(false)}
          >
            <ChevronLeft size={14} />
            Builder
          </button>
          {manifest.map((p) => (
            <div
              key={p.page}
              className={`thumb ${page === p.page ? "active" : ""}`}
              onClick={() => setPage(p.page)}
            >
              <div className="thumb-page">{p.page}</div>
              <span>{p.type.replace("-", " ")}</span>
            </div>
          ))}
        </aside>
        <div className="stage">
          <div className="stagebar">
            <button
              className="btn"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft size={15} />
              Previous
            </button>
            <b>
              Page {page} / {manifest.length}
            </b>
            <button
              className="btn primary"
              onClick={downloadCatalogue}
              disabled={exporting}
            >
              <Download size={15} />
              {exporting ? "Creating PDF..." : "Download PDF"}
            </button>
            <button
              className="btn"
              disabled={page === manifest.length}
              onClick={() => setPage(page + 1)}
            >
              Next
              <ChevronRight size={15} />
            </button>
          </div>
          {exportError && <div className="export-error">{exportError}</div>}
          <CataloguePage
            spec={spec}
            totalPages={manifest.length}
            contentStyles={preset?.styles}
            coverImage={media.coverImage}
            backCoverImage={media.backCoverImage}
          />
        </div>
      </div>
      <main className="in-page-print" aria-hidden="true">
        {manifest.map((printSpec) => (
          <CataloguePage
            key={printSpec.page}
            spec={printSpec}
            totalPages={manifest.length}
            contentStyles={presetForPage(layoutState, printSpec.page)?.styles}
            coverImage={media.coverImage}
            backCoverImage={media.backCoverImage}
          />
        ))}
      </main>
      </>
    );
  }
  return (
    <>
      <Head
        eyebrow="Design engine"
        title="Catalogues"
        desc="Automatic layouts, page numbers and index entries from live product data."
        action={
          <button className="btn primary">
            <Plus size={15} />
            Create catalogue
          </button>
        }
      />
      <div className="catalogue-card">
        <div>
          <h3>TFS Living Collection 2026</h3>
          <p>
            Draft · {collections.length} collections · {manifest.length} pages ·
            Updated today
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={() => setConfigure(true)}>
            <SlidersHorizontal size={15} />
            Configure
          </button>
          <button className="btn primary" onClick={() => setPreview(true)}>
            <BookOpen size={15} />
            Preview
          </button>
        </div>
      </div>
      {configure && (
        <>
          <CatalogueMediaPanel
            media={media}
            onChange={(next) => {
              setMedia(next);
              localStorage.setItem("tfs-catalogue-media", JSON.stringify(next));
            }}
          />
          <PageLayoutEditor
            manifest={manifest}
            savedState={layoutState}
            onCancel={() => setConfigure(false)}
            onSave={(state) => {
              setLayoutState(state);
              localStorage.setItem(
                "tfs-catalogue-layout-presets",
                JSON.stringify(state),
              );
              setConfigure(false);
            }}
          />
        </>
      )}
      <div className="panel">
        <h2>Generated page plan</h2>
        {manifest.map((p, index) => (
          <div
            key={p.page}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 0",
              borderTop: "1px solid #eee",
            }}
          >
            <span className="code">{String(p.page).padStart(2, "0")}</span>
            <span style={{ textTransform: "capitalize" }}>
              {p.type.replace("-", " ")}
            </span>
            <span style={{ marginLeft: "auto", color: "#888" }}>{p.title}</span>
            <div style={{ display: "grid", gap: 4 }}>
              <button className="btn" aria-label={`Move page ${p.page} up`} disabled={index === 0} onClick={() => movePage(index, -1)} style={{ padding: "4px 9px" }}>↑</button>
              <button className="btn" aria-label={`Move page ${p.page} down`} disabled={index === manifest.length - 1} onClick={() => movePage(index, 1)} style={{ padding: "4px 9px" }}>↓</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
function PageLayoutEditor({
  manifest,
  savedState,
  onCancel,
  onSave,
}: {
  manifest: PageSpec[];
  savedState: LayoutPresetState;
  onCancel: () => void;
  onSave: (state: LayoutPresetState) => void;
}) {
  const [state, setState] = useState<LayoutPresetState>(() =>
    structuredClone(savedState),
  );
  const [page, setPage] = useState(1);
  const [presetId, setPresetId] = useState(state.presets[0]?.id ?? "");
  const spec = manifest[page - 1];
  const options = contentOptions[spec.type];
  const [contentKey, setContentKey] = useState(options[0]?.key ?? "");
  const preset =
    state.presets.find((p) => p.id === presetId) ?? state.presets[0];
  const option = options.find((x) => x.key === contentKey) ?? options[0];
  const style =
    preset?.styles[contentKey] ?? initialStyle(spec.type, contentKey);
  const selectPage = (value: number) => {
    setPage(value);
    const nextSpec = manifest[value - 1];
    setContentKey(contentOptions[nextSpec.type][0]?.key ?? "");
    const assigned = presetForPage(state, value);
    if (assigned) setPresetId(assigned.id);
  };
  const updateStyle = (field: NumericContentStyleKey, value: number) =>
    setState({
      ...state,
      presets: state.presets.map((p) =>
        p.id === preset.id
          ? {
              ...p,
              styles: {
                ...p.styles,
                [contentKey]: { ...style, [field]: value },
              },
            }
          : p,
      ),
    });
  const alignHighlightNameAndPrice = (textAlign: "left" | "right") => {
    const productName = preset.styles.productName ?? initialStyle("highlight", "productName");
    const price = preset.styles.price ?? initialStyle("highlight", "price");
    const dimensions = preset.styles.dimensions ?? initialStyle("highlight", "dimensions");
    setState({
      ...state,
      presets: state.presets.map((p) => p.id === preset.id ? {
        ...p,
        styles: {
          ...p.styles,
          productName: { ...productName, textAlign },
          price: { ...price, textAlign },
          dimensions: { ...dimensions, textAlign },
        },
      } : p),
    });
  };
  const moveHighlightNameAndPrice = (amount: number) => {
    const productName = preset.styles.productName ?? initialStyle("highlight", "productName");
    const price = preset.styles.price ?? initialStyle("highlight", "price");
    const currentOffset = productName.translateY ?? price.translateY ?? 0;
    const translateY = currentOffset + amount;
    setState({
      ...state,
      presets: state.presets.map((p) => p.id === preset.id ? {
        ...p,
        styles: {
          ...p.styles,
          productName: { ...productName, translateY },
          price: { ...price, translateY },
        },
      } : p),
    });
  };
  const togglePage = (number: number) =>
    setState({
      ...state,
      presets: state.presets.map((p) =>
        p.id === preset.id
          ? {
              ...p,
              pageNumbers: p.pageNumbers.includes(number)
                ? p.pageNumbers.filter((n) => n !== number)
                : [...p.pageNumbers, number],
            }
          : { ...p, pageNumbers: p.pageNumbers.filter((n) => n !== number) },
      ),
    });
  const newPreset = () => {
    const id = `preset-${Date.now()}`;
    setState({
      ...state,
      presets: [
        ...state.presets,
        { id, name: "Custom page preset", styles: {}, pageNumbers: [] },
      ],
    });
    setPresetId(id);
  };
  return (
    <div className="config-panel page-editor">
      <div className="config-head">
        <div>
          <div className="eyebrow">Catalogue configuration</div>
          <h2>Page content style editor</h2>
          <p>
            Select a page and content field, then tune it against the live
            preview.
          </p>
        </div>
        <button className="btn" onClick={newPreset}>
          <Plus size={14} />
          New preset
        </button>
      </div>
      <div className="editor-toolbar">
        <label>
          Page
          <select
            value={page}
            onChange={(e) => selectPage(Number(e.target.value))}
          >
            {manifest.map((p) => (
              <option key={p.page} value={p.page}>
                Page {p.page} · {p.type.replaceAll("-", " ")}
                {p.title ? ` · ${p.title}` : ""}
              </option>
            ))}
          </select>
        </label>
        <label>
          Preset
          <select
            value={presetId}
            onChange={(e) => setPresetId(e.target.value)}
          >
            {state.presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Preset name
          <input
            value={preset.name}
            onChange={(e) =>
              setState({
                ...state,
                presets: state.presets.map((p) =>
                  p.id === preset.id ? { ...p, name: e.target.value } : p,
                ),
              })
            }
          />
        </label>
      </div>
      <div className="editor-body">
        <div className="content-list">
          <h3>Page content</h3>
          {options.map((item) => (
            <button
              key={item.key}
              className={contentKey === item.key ? "active" : ""}
              onClick={() => setContentKey(item.key)}
            >
              {item.label}
            </button>
          ))}
          {spec.type === "highlight" && <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #e8e6e1" }}>
            <h3 style={{ marginBottom: 9 }}>Name + price position</h3>
            <div style={{ display: "grid", gap: 8 }}>
              <button className="btn" onClick={() => moveHighlightNameAndPrice(-10)}>Shift up</button>
              <button className="btn" onClick={() => moveHighlightNameAndPrice(10)}>Shift down</button>
            </div>
            <h3 style={{ margin: "16px 0 9px" }}>Name + price + dimensions alignment</h3>
            <div style={{ display: "grid", gap: 8 }}>
              <button className="btn primary" onClick={() => alignHighlightNameAndPrice("right")}>Align right</button>
              <button className="btn" onClick={() => alignHighlightNameAndPrice("left")}>Align left</button>
            </div>
          </div>}
        </div>
        <div className="live-page">
          <CataloguePage spec={spec} totalPages={manifest.length} contentStyles={preset.styles} />
        </div>
        <div className="property-panel">
          <h3>{option?.label}</h3>
          <NumberField
            label={contentKey === "logo" ? "Logo width" : "Font size"}
            value={style.fontSize}
            suffix={contentKey === "logo" ? "mm" : "px"}
            min={5}
            max={contentKey === "logo" ? 160 : 72}
            onChange={(v) => updateStyle("fontSize", v)}
          />
          {contentKey !== "logo" && <label>
            Font weight
            <select
              value={style.fontWeight}
              onChange={(e) =>
                updateStyle("fontWeight", Number(e.target.value))
              }
            >
              {[300, 400, 500, 600, 700, 800, 900].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>}
          <BoxControls
            title="Padding"
            style={style}
            prefix="padding"
            update={updateStyle}
          />
          <BoxControls
            title="Margin"
            style={style}
            prefix="margin"
            update={updateStyle}
          />
        </div>
      </div>
      <div className="apply-pages">
        <h3>Apply preset to pages</h3>
        <div>
          {manifest.map((p) => (
            <label key={p.page}>
              <input
                type="checkbox"
                checked={preset.pageNumbers.includes(p.page)}
                onChange={() => togglePage(p.page)}
              />
              <span>{p.page}</span>
              <small>{p.type.replaceAll("-", " ")}</small>
            </label>
          ))}
        </div>
      </div>
      <div className="config-actions">
        <button className="btn" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn primary" onClick={() => onSave(state)}>
          Save preset & assignments
        </button>
      </div>
    </div>
  );
}
function NumberField({
  label,
  value,
  suffix,
  min = -40,
  max = 100,
  onChange,
}: {
  label: string;
  value: number;
  suffix?: string;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      {label}
      <span className="number-input">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {suffix && <small>{suffix}</small>}
      </span>
    </label>
  );
}
function CatalogueMediaPanel({
  media,
  onChange,
}: {
  media: CatalogueMedia;
  onChange: (media: CatalogueMedia) => void;
}) {
  const upload = (key: keyof CatalogueMedia, file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange({ ...media, [key]: String(reader.result) });
    reader.readAsDataURL(file);
  };
  return (
    <div className="config-panel media-panel">
      <div className="config-head">
        <div>
          <div className="eyebrow">Catalogue imagery</div>
          <h2>Cover & end slide photos</h2>
          <p>Upload or replace the two full-width catalogue photographs.</p>
        </div>
        <span className="pill orange">Saved automatically</span>
      </div>
      <div className="media-grid">
        <div>
          <img src={media.coverImage} alt="Current catalogue cover" />
          <div>
            <b>Cover slide photo</b>
            <label className="btn">
              <Upload size={14} />
              Replace photo
              <input
                hidden
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => upload("coverImage", e.target.files?.[0])}
              />
            </label>
          </div>
        </div>
        <div>
          <img src={media.backCoverImage} alt="Current end slide" />
          <div>
            <b>End slide photo</b>
            <label className="btn">
              <Upload size={14} />
              Replace photo
              <input
                hidden
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => upload("backCoverImage", e.target.files?.[0])}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
function BoxControls({
  title,
  style,
  prefix,
  update,
}: {
  title: string;
  style: ContentStyle;
  prefix: "padding" | "margin";
  update: (field: NumericContentStyleKey, value: number) => void;
}) {
  return (
    <fieldset>
      <legend>{title}</legend>
      <div className="box-grid">
        {(["Top", "Right", "Bottom", "Left"] as const).map((side) => {
          const field = `${prefix}${side}` as NumericContentStyleKey;
          return (
            <NumberField
              key={side}
              label={side}
              value={style[field]}
              suffix="px"
              onChange={(v) => update(field, v)}
            />
          );
        })}
      </div>
    </fieldset>
  );
}
function Highlights({ value, onChange, collections }: { value: HighlightConfig[]; onChange: (next: HighlightConfig[]) => void; collections: Collection[] }) {
  const products = collections.flatMap((collection) => collection.products);
  const available = products.filter((product) => !value.some((item) => item.productId === product.id));
  const [selectedId, setSelectedId] = useState(available[0]?.id ?? "");
  const [drafts, setDrafts] = useState<Record<string, HighlightConfig>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const addHighlight = () => {
    const productId = selectedId || available[0]?.id;
    if (!productId) return;
    onChange([...value, { productId, placement: "after-grid", afterGrid: 1, textPosition: "bottom-left", overlayDarkness: 28 }]);
    const remaining = available.filter((product) => product.id !== productId);
    setSelectedId(remaining[0]?.id ?? "");
  };
  const updateDraft = (config: HighlightConfig, patch: Partial<HighlightConfig>) =>
    setDrafts((current) => ({ ...current, [config.productId]: { ...(current[config.productId] ?? config), ...patch } }));
  const saveDraft = (productId: string) => {
    const draft = drafts[productId];
    if (!draft) return;
    setSavingId(productId);
    window.setTimeout(() => {
      onChange(value.map((item) => item.productId === productId ? { ...draft } : item));
      setDrafts((current) => { const next = { ...current }; delete next[productId]; return next; });
      setSavingId(null);
      setSavedId(productId);
      setShowSaved(true);
      window.setTimeout(() => setSavedId((current) => current === productId ? null : current), 1400);
      window.setTimeout(() => setShowSaved(false), 2600);
    }, 450);
  };
  const chooseImage = (productId: string, file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const config = value.find((item) => item.productId === productId);
      if (!config) return;
      const source = String(reader.result);
      const image = new window.Image();
      image.onload = () => {
        const maxSide = 1800;
        const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.naturalWidth * scale);
        canvas.height = Math.round(image.naturalHeight * scale);
        canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
        updateDraft(config, { highlightImage: canvas.toDataURL("image/jpeg", 0.82) });
      };
      image.src = source;
    };
    reader.readAsDataURL(file);
  };
  return (
    <>
      <Head
        eyebrow="Editorial"
        title="Highlight pages"
        desc="Select an uploaded product, place its highlight page, and replace its full-page image."
      />
      <div className="panel" style={{ marginBottom: 16 }}>
        <h2>Add product highlight</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <select className="btn" style={{ flex: 1, textAlign: "left" }} value={selectedId} onChange={(event) => setSelectedId(event.target.value)} disabled={!available.length}>
            {available.length ? available.map((product) => <option key={product.id} value={product.id}>{product.productCode} — {product.productName} ({product.collectionName})</option>) : <option>All products are highlighted</option>}
          </select>
          <button className="btn primary" onClick={addHighlight} disabled={!available.length}><Plus size={15} /> Add highlight</button>
        </div>
      </div>
      {value.map((config) => {
        const product = products.find((item) => item.id === config.productId);
        if (!product) return null;
        const draft = drafts[config.productId] ?? config;
        const hasChanges = Boolean(drafts[config.productId]);
        return <div className={`catalogue-card highlight-card ${savedId === config.productId ? "saved" : ""}`} key={config.productId} style={{ alignItems: "flex-start", gap: 20 }}>
          <div className="product-cell" style={{ flex: 1, alignItems: "flex-start" }}>
            <img src={draft.highlightImage || product.highlightImage || product.primaryImage} style={{ width: 120, height: 150, objectFit: "cover" }} />
            <div style={{ flex: 1 }}>
              <h3>{product.productName}</h3>
              <p>{product.productCode} · {product.collectionName}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                <select className="btn" value={draft.placement} onChange={(event) => updateDraft(config, { placement: event.target.value as HighlightConfig["placement"] })}>
                  <option value="after-opener">After collection opener</option>
                  <option value="after-grid">After product grid</option>
                  <option value="end">End of collection</option>
                </select>
                {draft.placement === "after-grid" && <label className="btn">Grid page <input type="number" min={1} value={draft.afterGrid ?? 1} onChange={(event) => updateDraft(config, { afterGrid: Math.max(1, Number(event.target.value)) })} style={{ width: 48, border: 0, background: "transparent" }} /></label>}
                <label className="btn"><Image size={15} /> Change highlight image<input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(event) => chooseImage(config.productId, event.target.files?.[0])} /></label>
                {draft.highlightImage && <button className="btn" onClick={() => updateDraft(config, { highlightImage: undefined })}>Use product image</button>}
                <button className={`btn primary save-highlight ${savingId === config.productId ? "saving" : ""}`} disabled={!hasChanges || savingId === config.productId} onClick={() => saveDraft(config.productId)}>{savingId === config.productId ? "Saving…" : savedId === config.productId ? "Saved ✓" : "Save changes"}</button>
                <button className="btn" onClick={() => onChange(value.filter((item) => item.productId !== config.productId))}>Remove</button>
              </div>
            </div>
          </div>
          <span className="pill orange">FEATURED</span>
        </div>;
      })}
      {!value.length && <div className="panel" style={{ color: "#777" }}>No highlight pages yet. Select a product above to add one.</div>}
      {showSaved && <div className="save-toast" role="status"><span>✓</span><div><b>Changes saved</b><small>Highlight preview and PDF have been updated.</small></div></div>}
    </>
  );
}
function SettingsPage() {
  return (
    <>
      <Head
        eyebrow="Design defaults"
        title="Brand settings"
        desc="Central values inherited by every new catalogue."
      />
      <div className="panel">
        <div className="grid2">
          <label>
            Brand name
            <input
              className="btn"
              defaultValue="TFS Living"
              style={{ display: "block", width: "100%", marginTop: 7 }}
            />
          </label>
          <label>
            Primary colour
            <input
              type="color"
              defaultValue="#f45124"
              style={{
                display: "block",
                width: "100%",
                height: 41,
                marginTop: 7,
                border: "1px solid #ddd",
              }}
            />
          </label>
        </div>
        <div style={{ marginTop: 18 }}>
          <label>
            About us description
            <textarea
              defaultValue="Premium furniture pieces combining European-inspired modern design with Indian craftsmanship."
              style={{
                display: "block",
                width: "100%",
                minHeight: 110,
                marginTop: 7,
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 12,
              }}
            />
          </label>
        </div>
        <button className="btn primary" style={{ marginTop: 18 }}>
          Save settings
        </button>
      </div>
    </>
  );
}
function Exports() {
  return (
    <>
      <Head
        eyebrow="Audit trail"
        title="Export history"
        desc="Every output retains its exact manifest and generation metadata."
      />
      <div className="catalogue-card">
        <div>
          <h3>TFS Living Collection 2026</h3>
          <p>Generated 13 Aug 2026, 4:30 PM · 24 products · 18 pages</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span className="pill">HIGH QUALITY</span>
          <button className="btn">
            <Download size={15} />
            Download
          </button>
        </div>
      </div>
    </>
  );
}
function Placeholder({ title }: { title: string }) {
  return (
    <>
      <Head
        eyebrow="Administration"
        title={title}
        desc="Role-aware configuration for the catalogue team."
      />
      <div className="panel">
        <Archive />
        <h2 style={{ marginTop: 14 }}>Production settings module</h2>
        <p style={{ color: "#777" }}>
          This screen is backed by the normalized user and role model in the
          database schema.
        </p>
      </div>
    </>
  );
}
