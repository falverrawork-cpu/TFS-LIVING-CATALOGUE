"use client";
import { useEffect, useMemo, useState } from "react";
import { CataloguePage } from "@/components/catalogue/Pages";
import { buildCatalogueManifest, orderCatalogueManifest } from "@/lib/catalogue/manifest";
import { collections, highlights as defaultHighlights } from "@/lib/demo-data";
import { defaultLayoutState, presetForPage, type LayoutPresetState } from "@/lib/catalogue/layout-presets";
import type { Collection, HighlightConfig } from "@/types/catalogue";

type CatalogueMedia = { coverImage: string; backCoverImage: string };
type ExportSettings = { collections?: Collection[]; layout?: LayoutPresetState; media?: CatalogueMedia; highlights?: HighlightConfig[]; pageOrder?: string[] };

declare global {
  interface Window { __CATALOGUE_EXPORT__?: ExportSettings }
}

export default function CataloguePrintPage() {
  const [layout, setLayout] = useState<LayoutPresetState>(defaultLayoutState);
  const [media, setMedia] = useState<CatalogueMedia>({ coverImage: "", backCoverImage: "" });
  const [highlightState, setHighlightState] = useState<HighlightConfig[]>(defaultHighlights);
  const [pageOrder, setPageOrder] = useState<string[]>([]);
  const [catalogueCollections, setCatalogueCollections] = useState<Collection[]>(collections);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const exported = window.__CATALOGUE_EXPORT__;
    if (exported) {
      if (exported.collections) setCatalogueCollections(exported.collections);
      if (exported.layout) setLayout(exported.layout);
      if (exported.media) setMedia(exported.media);
      if (exported.highlights) setHighlightState(exported.highlights);
      if (exported.pageOrder) setPageOrder(exported.pageOrder);
      setReady(true);
      return;
    }
    try { const value = localStorage.getItem("tfs-catalogue-layout-presets"); if (value) setLayout(JSON.parse(value)); } catch {}
    try { const value = localStorage.getItem("tfs-catalogue-media"); if (value) setMedia(JSON.parse(value)); } catch {}
    try { const value = localStorage.getItem("tfs-catalogue-highlights"); if (value) setHighlightState(JSON.parse(value)); } catch {}
    try { const value = localStorage.getItem("tfs-catalogue-page-order"); if (value) setPageOrder(JSON.parse(value)); } catch {}
    setReady(true);
  }, []);
  const manifest = useMemo(() => orderCatalogueManifest(buildCatalogueManifest(catalogueCollections, highlightState), pageOrder), [catalogueCollections, highlightState, pageOrder]);
  if (!ready) return <main>Preparing catalogue...</main>;
  return <main id="catalogue-ready" className="print-catalogue">{manifest.map((spec) => <CataloguePage key={spec.page} spec={spec} totalPages={manifest.length} contentStyles={presetForPage(layout, spec.page)?.styles} coverImage={media.coverImage} backCoverImage={media.backCoverImage} />)}</main>;
}
