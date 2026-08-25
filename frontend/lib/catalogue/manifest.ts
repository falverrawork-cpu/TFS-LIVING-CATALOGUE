import type { Collection, HighlightConfig, PageSpec, Product } from "@/types/catalogue";
export const chunk = <T,>(items:T[], size:number) => Array.from({length:Math.ceil(items.length/size)},(_,i)=>items.slice(i*size,i*size+size));
export function buildCollectionPages(collection:Collection, highlights:HighlightConfig[] = []):Omit<PageSpec,"page">[] {
  const active=collection.products.filter(p=>p.isActive).sort((a,b)=>a.displayOrder-b.displayOrder);
  const grid=active.filter(p=>p.showInProductGrid);
  const pages:Omit<PageSpec,"page">[]=[{type:"collection-cover",title:collection.name,collectionId:collection.id,products:grid.slice(0,2)}];
  const relevant=highlights.filter(h=>active.some(p=>p.id===h.productId));
  const addHighlights=(placement:HighlightPlacement, afterGrid?:number)=>relevant.filter(h=>h.placement===placement && (placement!=="after-grid"||h.afterGrid===afterGrid)).forEach(h=>{const p=active.find(x=>x.id===h.productId); if(p) pages.push({type:"highlight",collectionId:collection.id,product:h.highlightImage?{...p,highlightImage:h.highlightImage}:p});});
  addHighlights("after-opener");
  chunk(grid.slice(2),4).forEach((products,i)=>{pages.push({type:"product-grid",collectionId:collection.id,title:collection.name,products}); addHighlights("after-grid",i+1);});
  addHighlights("end");
  return pages;
}
export function buildCatalogueManifest(collections:Collection[], highlights:HighlightConfig[]=[]):PageSpec[] {
  const selected=collections.filter(c=>c.isActive).sort((a,b)=>a.displayOrder-b.displayOrder);
  const body=selected.flatMap(c=>buildCollectionPages(c,highlights));
  const fixedBeforeIndex=1, fixedAfterIndex=1, back=1;
  let indexPages=1;
  for(let i=0;i<3;i++){const firstCollectionPage=fixedBeforeIndex+indexPages+fixedAfterIndex+1; const entries=selected.map(c=>({label:c.name,page:firstCollectionPage+body.findIndex(p=>p.type==="collection-cover"&&p.collectionId===c.id)})); indexPages=Math.max(1,Math.ceil(entries.length/12));}
  const firstCollectionPage=fixedBeforeIndex+indexPages+fixedAfterIndex+1;
  const entries=selected.map(c=>({label:c.name,page:firstCollectionPage+body.findIndex(p=>p.type==="collection-cover"&&p.collectionId===c.id)}));
  const specs:Omit<PageSpec,"page">[]=[{type:"cover"},...chunk(entries,12).map(indexEntries=>({type:"index" as const,indexEntries})),{type:"about"},...body,{type:"back-cover"}];
  return specs.map((p,i)=>({...p,page:i+1}));
}
type HighlightPlacement = HighlightConfig["placement"];
export function cataloguePageKey(page:PageSpec){
  if(page.type==="highlight")return `highlight:${page.product?.id??page.page}`;
  if(page.type==="product-grid")return `grid:${page.collectionId}:${page.products?.map(p=>p.id).join(",")}`;
  if(page.type==="collection-cover")return `collection:${page.collectionId}`;
  if(page.type==="index")return `index:${page.indexEntries?.map(x=>x.label).join(",")??page.page}`;
  return page.type;
}
export function orderCatalogueManifest(base:PageSpec[],order:string[]){
  if(!order.length)return base;
  const byKey=new Map(base.map(page=>[cataloguePageKey(page),page]));
  const arranged=order.map(key=>byKey.get(key)).filter((page):page is PageSpec=>Boolean(page));
  const present=new Set(arranged.map(cataloguePageKey));
  for(const page of base){
    const key=cataloguePageKey(page);if(present.has(key))continue;
    const baseIndex=base.findIndex(item=>cataloguePageKey(item)===key);let insertion=arranged.length;
    for(let i=baseIndex-1;i>=0;i--){const prior=arranged.findIndex(item=>cataloguePageKey(item)===cataloguePageKey(base[i]));if(prior>=0){insertion=prior+1;break}}
    arranged.splice(insertion,0,page);present.add(key);
  }
  const numbered=arranged.map((page,index)=>({...page,page:index+1}));
  const collectionPages=new Map(numbered.filter(page=>page.type==="collection-cover").map(page=>[page.title,page.page]));
  return numbered.map(page=>page.type==="index"?{...page,indexEntries:page.indexEntries?.map(entry=>({...entry,page:collectionPages.get(entry.label)??entry.page}))}:page);
}
export function validateManifest(pages:PageSpec[]){return {valid:pages.every((p,i)=>p.page===i+1),warnings:pages.filter(p=>p.products?.some(x=>x.productName.length>38)).flatMap(p=>p.products!.filter(x=>x.productName.length>38).map(x=>`${x.productCode} product name may overflow.`))};}
