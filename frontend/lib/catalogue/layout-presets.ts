import type {CSSProperties} from "react";
import type {PageSpec} from "@/types/catalogue";

export type ContentStyle={fontSize:number;fontWeight:number;paddingTop:number;paddingRight:number;paddingBottom:number;paddingLeft:number;marginTop:number;marginRight:number;marginBottom:number;marginLeft:number;textAlign?:CSSProperties["textAlign"];translateY?:number};
export type LayoutPreset={id:string;name:string;styles:Record<string,ContentStyle>;pageNumbers:number[]};
export type LayoutPresetState={presets:LayoutPreset[]};

export const defaultContentStyle:ContentStyle={fontSize:10,fontWeight:400,paddingTop:0,paddingRight:0,paddingBottom:0,paddingLeft:0,marginTop:0,marginRight:0,marginBottom:0,marginLeft:0};
export const defaultLayoutState:LayoutPresetState={presets:[{id:"standard",name:"TFS Standard",styles:{},pageNumbers:[]}]};

export const contentOptions:Record<PageSpec["type"],{key:string;label:string;defaultSize:number;defaultWeight:number}[]>={
  cover:[{key:"coverTitle",label:"Catalogue title",defaultSize:120,defaultWeight:700},{key:"coverYear",label:"Catalogue year",defaultSize:72,defaultWeight:500},{key:"logo",label:"Logo",defaultSize:96,defaultWeight:400}],
  index:[{key:"pageTitle",label:"Page title",defaultSize:72,defaultWeight:700},{key:"indexName",label:"Collection name",defaultSize:10,defaultWeight:800},{key:"indexPage",label:"Page number",defaultSize:10,defaultWeight:800}],
  about:[{key:"pageTitle",label:"About title",defaultSize:72,defaultWeight:700},{key:"brandTitle",label:"Brand title",defaultSize:28,defaultWeight:700},{key:"description",label:"Description",defaultSize:22,defaultWeight:400}],
  "collection-cover":[{key:"collectionLabel",label:"Collection label",defaultSize:36,defaultWeight:400},{key:"collectionTitle",label:"Collection name",defaultSize:120,defaultWeight:800},{key:"productId",label:"Product ID",defaultSize:8,defaultWeight:500},{key:"productName",label:"Product name",defaultSize:12,defaultWeight:600},{key:"price",label:"MRP / TRP",defaultSize:11,defaultWeight:600},{key:"dimensions",label:"Dimensions",defaultSize:8,defaultWeight:400}],
  "product-grid":[{key:"productId",label:"Product ID",defaultSize:8,defaultWeight:500},{key:"productName",label:"Product name",defaultSize:12,defaultWeight:600},{key:"price",label:"MRP / TRP",defaultSize:11,defaultWeight:600},{key:"dimensions",label:"Dimensions",defaultSize:8,defaultWeight:400}],
  highlight:[{key:"productId",label:"Product ID",defaultSize:35,defaultWeight:400},{key:"productName",label:"Product name",defaultSize:67,defaultWeight:700},{key:"price",label:"MRP / TRP",defaultSize:67,defaultWeight:700},{key:"dimensions",label:"Dimensions",defaultSize:29,defaultWeight:400}],
  "back-cover":[{key:"logo",label:"Logo",defaultSize:100,defaultWeight:400},{key:"companyDetails",label:"Company details",defaultSize:10,defaultWeight:400},{key:"contactDetails",label:"Contact details",defaultSize:7,defaultWeight:400}]
};

export function initialStyle(type:PageSpec["type"],key:string){const option=contentOptions[type].find(x=>x.key===key);const baseSize=option?.defaultSize??10;return {...defaultContentStyle,fontSize:baseSize,fontWeight:option?.defaultWeight??400}}
function spacingCss(style:ContentStyle):CSSProperties{const css:CSSProperties={};if(style.paddingTop||style.paddingRight||style.paddingBottom||style.paddingLeft)css.padding=`${style.paddingTop}px ${style.paddingRight}px ${style.paddingBottom}px ${style.paddingLeft}px`;if(style.marginTop||style.marginRight||style.marginBottom||style.marginLeft)css.margin=`${style.marginTop}px ${style.marginRight}px ${style.marginBottom}px ${style.marginLeft}px`;return css}
export function toCss(style?:ContentStyle):CSSProperties|undefined{return style?{fontSize:`${Number((style.fontSize*2).toFixed(1))}px`,fontWeight:style.fontWeight,textAlign:style.textAlign,transform:style.translateY?`translateY(${style.translateY}px)`:undefined,...spacingCss(style)}:undefined}
export function toExactCss(style?:ContentStyle):CSSProperties|undefined{return style?{fontSize:`${style.fontSize}px`,fontWeight:style.fontWeight,textAlign:style.textAlign,transform:style.translateY?`translateY(${style.translateY}px)`:undefined,...spacingCss(style)}:undefined}
export function toLogoCss(style?:ContentStyle):CSSProperties|undefined{return style?{"--logo-width":`${style.fontSize}mm`,...spacingCss(style)} as CSSProperties:undefined}
export const aboutDefaultStyles:Record<string,ContentStyle>={pageTitle:{...defaultContentStyle,fontSize:72,fontWeight:700},brandTitle:{...defaultContentStyle,fontSize:28,fontWeight:700,paddingTop:30},description:{...defaultContentStyle,fontSize:22,fontWeight:400,paddingTop:18}};
export function presetForPage(state:LayoutPresetState,page:number){return state.presets.find(p=>p.pageNumbers.includes(page))}
