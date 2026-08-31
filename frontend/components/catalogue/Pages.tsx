import type { CSSProperties } from "react";
import type { PageSpec, Product } from "@/types/catalogue";
import type { TypographyPreset } from "@/lib/catalogue/typography";
import { aboutDefaultStyles, toCss, toExactCss, toLogoCss, type ContentStyle } from "@/lib/catalogue/layout-presets";
const money = (n: number) => `Rs. ${n.toLocaleString("en-IN")}/-`;
const hasValue = (value: unknown) => value !== undefined && value !== null && value !== "" && Number(value) !== 0;
const discountPercent = (mrp: number, trp?: number) => {
  if (!hasValue(mrp) || !hasValue(trp) || trp! >= mrp) return null;
  return Math.round(((mrp - trp!) / mrp) * 100);
};
const dimensionLine = (unit: "CM" | "INCH", length: number, width: number, height: number) => {
  const values = [["L", length], ["W", width], ["H", height]].filter(([, value]) => hasValue(value));
  return values.length ? `${unit} - ${values.map(([label, value]) => `${label} ${value}`).join(" × ")}` : null;
};
export function Logo({
  variant = "black",
  large = false,
  monochrome = false,
}: {
  variant?: "black" | "white";
  large?: boolean;
  monochrome?: boolean;
}) {
  return (
    <div className={`brand-logo ${large ? "brand-logo-large" : "page-logo"} ${monochrome || variant === "white" ? "brand-logo-monochrome" : ""}`}>
      <img
        src={`/brand/tfs-living-${variant}.png`}
        alt="TFS Living - Your Furniture, Your Story"
      />
    </div>
  );
}
export function Folio({ page, totalPages }: { page: number; totalPages: number }) {
  return (
    <div className="folio">
      Page {page} of {totalPages}
    </div>
  );
}
export function ProductCard({
  p,
  styles = {},
}: {
  p: Product;
  styles?: Record<string, ContentStyle>;
}) {
  const discount = discountPercent(p.price, p.trp);
  const dimensions = [
    dimensionLine("CM", p.lengthCm, p.widthCm, p.heightCm),
    dimensionLine("INCH", p.lengthInch, p.widthInch, p.heightInch),
  ].filter(Boolean);
  return (
    <div className="product-card">
      {p.primaryImage && <div className="product-photo"><img src={p.primaryImage} alt={p.productName} />{discount !== null && <span className="discount-badge"><span>{discount}% OFF</span></span>}</div>}
      {p.productCode && <div className="pcode" style={toCss(styles.productId)}>{p.productCode}</div>}
      {p.productName && <h3 style={toCss(styles.productName)}>{p.productName}</h3>}
      {hasValue(p.trp) && <strong className="trp" style={{ ...toCss(styles.price ? { ...styles.price, fontSize: styles.price.fontSize * 1.1, fontWeight: 800 } : undefined), fontWeight: 800 }}>Our Price: {money(p.trp!)}</strong>}
      {hasValue(p.price) && <strong className="mrp" style={{ ...toCss(styles.price ? { ...styles.price, fontSize: styles.price.fontSize * .78, fontWeight: 400 } : undefined), color: "#777", fontWeight: 400 }}>MRP: <span className="mrp-price">{money(p.price)}</span></strong>}
      {dimensions.length > 0 && <div className="dims" style={toCss(styles.dimensions)}>{dimensions.map((line) => <div key={line}>{line}</div>)}</div>}
    </div>
  );
}
export function CataloguePage({
  spec,
  typography,
  contentStyles = {},
  coverImage,
  backCoverImage,
  totalPages = 18,
}: {
  spec: PageSpec;
  typography?: TypographyPreset;
  contentStyles?: Record<string, ContentStyle>;
  coverImage?: string;
  backCoverImage?: string;
  totalPages?: number;
}) {
  const pageStyle = {
    "--type-scale": typography?.scale ?? 2,
    "--type-leading": typography?.lineHeight ?? 1,
    "--type-tracking": `${typography?.letterSpacing ?? 0}em`,
  } as CSSProperties;
  if (spec.type === "cover")
    return (
      <div className="page cover" style={pageStyle}>
        <img
          className="cover-bg"
          src={
            coverImage ||
            "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1600&q=90"
          }
        />
        <div className="cover-copy">
          <h1 style={toExactCss(contentStyles.coverTitle ?? { ...aboutDefaultStyles.pageTitle, fontSize: 120, fontWeight: 700 })}>
            Product
            <br />
            Catalogue
          </h1>
          <div className="year" style={{...toExactCss(contentStyles.coverYear ?? { ...aboutDefaultStyles.pageTitle, fontSize: 72, fontWeight: 500 }),width:"100%",marginLeft:"auto",marginRight:0,textAlign:"right"}}>
            2026
          </div>
        </div>
        <div className="cover-brand" style={toLogoCss(contentStyles.logo)}>
          <Logo variant="white" large />
          <small style={toCss(contentStyles.brandLine)}>
            YOUR FURNITURE · YOUR STORY
          </small>
        </div>
        <Folio page={spec.page} totalPages={totalPages} />
      </div>
    );
  if (spec.type === "index")
    return (
      <div className="page index-page" style={pageStyle}>
        <Logo />
        <h2 className="orange-title" style={toExactCss(contentStyles.pageTitle ?? { ...aboutDefaultStyles.pageTitle, fontSize: 72, fontWeight: 700 })}>
          iNDEX
        </h2>
        <div className="index-list">
          {spec.indexEntries?.map((x) => (
            <div className="index-row" key={x.label}>
              <span style={toCss(contentStyles.indexName)}>
                {x.label.toUpperCase()}
              </span>
              <span style={toCss(contentStyles.indexPage)}>
                PAGE {String(x.page).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>
        <Folio page={spec.page} totalPages={totalPages} />
      </div>
    );
  if (spec.type === "about")
    {const aboutStyles={...aboutDefaultStyles,...contentStyles};return (
      <div className="page" style={pageStyle}>
        <Logo variant="white" monochrome />
        <img
          className="about-image"
          src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1600&q=90"
        />
        <div className="about-top">
          <h2 style={toExactCss(aboutStyles.pageTitle)}>
            ABOUT
            <br />
            US
          </h2>
          <h3 style={toExactCss(aboutStyles.brandTitle)}>TFS LIVING</h3>
          <p className="about-description" style={{ ...toExactCss(aboutStyles.description), color: "#ffffff" }}>
            At TFS Living, we believe furniture gives every space its character and comfort. Our curated collection combines style, quality, functionality, and timeless design. From sofas and beds to dining tables, chairs, and accent furniture, every piece is thoughtfully selected. We create furniture that complements modern lifestyles and reflects individual personalities. Our aim is to make every home feel beautiful, comfortable, and truly personal. TFS Living — Designed for Living. Made to Belong.
          </p>
        </div>
        <Folio page={spec.page} totalPages={totalPages} />
      </div>
    );}
  if (spec.type === "collection-cover")
    return (
      <div className="page" style={pageStyle}>
        <Logo variant="white" monochrome />
        <div className="collection-top">
          <small style={toExactCss(contentStyles.collectionLabel ?? { ...aboutDefaultStyles.pageTitle, fontSize: 36, fontWeight: 400 })}>
            COLLECTION :
          </small>
          <h2 style={toExactCss(contentStyles.collectionTitle ?? { ...aboutDefaultStyles.pageTitle, fontSize: 120, fontWeight: 800, paddingTop: 14 })}>
            {spec.title?.toUpperCase()}
          </h2>
        </div>
        <div className="collection-products">
          {spec.products?.map((p) => (
            <ProductCard key={p.id} p={p} styles={contentStyles} />
          ))}
        </div>
        <Folio page={spec.page} totalPages={totalPages} />
      </div>
    );
  if (spec.type === "product-grid")
    return (
      <div className="page product-grid-page" style={pageStyle}>
        <div className="products-grid">
          {spec.products?.map((p) => (
            <ProductCard key={p.id} p={p} styles={contentStyles} />
          ))}
        </div>
        <Folio page={spec.page} totalPages={totalPages} />
      </div>
    );
  if (spec.type === "highlight" && spec.product)
    { const dimensions = [dimensionLine("CM", spec.product.lengthCm, spec.product.widthCm, spec.product.heightCm), dimensionLine("INCH", spec.product.lengthInch, spec.product.widthInch, spec.product.heightInch)].filter(Boolean); const priceStyle = contentStyles.price ?? { ...aboutDefaultStyles.pageTitle, fontSize: 67, fontWeight: 700 }; return (
      <div className="page highlight" style={pageStyle}>
        {(spec.product.highlightImage || spec.product.primaryImage) && <img className="highlight-bg" src={spec.product.highlightImage || spec.product.primaryImage} />}
        <Logo variant="white" />
        {spec.product.productCode && <div className="highlight-id" style={toExactCss(contentStyles.productId ?? { ...aboutDefaultStyles.pageTitle, fontSize: 35, fontWeight: 400 })}>{spec.product.productCode}</div>}
        <div className="highlight-copy">
          {spec.product.productName && <h2 style={toExactCss(contentStyles.productName ?? { ...aboutDefaultStyles.pageTitle, fontSize: 67, fontWeight: 700 })}>{spec.product.productName}</h2>}
          {hasValue(spec.product.trp) && <strong className="trp" style={{ ...toExactCss({ ...priceStyle, fontSize: priceStyle.fontSize * 1.1, fontWeight: 800 }), fontWeight: 800 }}>Our Price: {money(spec.product.trp!)}</strong>}
          {hasValue(spec.product.price) && <strong className="mrp" style={{ ...toExactCss({ ...priceStyle, fontSize: priceStyle.fontSize * .78, fontWeight: 400 }), color: "#d0d0d0", fontWeight: 400 }}>MRP: <span className="mrp-price">{money(spec.product.price)}</span></strong>}
          {dimensions.length > 0 && <div className="dims" style={toExactCss(contentStyles.dimensions ?? { ...aboutDefaultStyles.pageTitle, fontSize: 29, fontWeight: 400 })}>{dimensions.map((line) => <div key={line}>{line}</div>)}</div>}
        </div>
        <Folio page={spec.page} totalPages={totalPages} />
      </div>
    ); }
  if (spec.type === "back-cover")
    return (
      <div className="page back" style={pageStyle}>
        <img
          className="back-bg"
          src={
            backCoverImage ||
            "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=90"
          }
        />
        <Logo variant="white" monochrome />
        <div className="back-orange">
          <div className="back-brand" style={toLogoCss(contentStyles.logo)}>
            <Logo variant="white" large monochrome />
          </div>
          <div className="back-details">
            <p style={toCss(contentStyles.companyDetails)}>
            TFS LIVING
            <br />
            Shop No. 16–20, 2nd Floor, Home Square
            <br />
            Salugara, Sevoke Road, Siliguri, West Bengal.
            </p>
            <div className="contacts contacts-single" style={toCss(contentStyles.contactDetails)}>
            <div>
              Phone No: 8001156000
            </div>
            </div>
          </div>
        </div>
        <Folio page={spec.page} totalPages={totalPages} />
      </div>
    );
  return <div className="page empty">Page unavailable</div>;
}
