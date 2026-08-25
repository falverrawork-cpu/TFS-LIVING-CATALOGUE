import type {PageSpec} from "@/types/catalogue";

export type TypographyPreset={id:string;name:string;scale:number;lineHeight:number;letterSpacing:number};
export type PageTypographyMap=Record<PageSpec["type"],string>;
export type TypographySettings={presets:TypographyPreset[];pagePresets:PageTypographyMap};

export const pageTypes:PageSpec["type"][]=["cover","index","about","collection-cover","product-grid","highlight","back-cover"];
export const defaultTypographySettings:TypographySettings={
  presets:[
    {id:"compact",name:"Compact",scale:0.88,lineHeight:0.96,letterSpacing:-0.01},
    {id:"balanced",name:"Balanced",scale:1,lineHeight:1,letterSpacing:0},
    {id:"editorial",name:"Editorial",scale:1.12,lineHeight:0.94,letterSpacing:-0.02}
  ],
  pagePresets:{cover:"editorial",index:"balanced",about:"balanced","collection-cover":"editorial","product-grid":"balanced",highlight:"editorial","back-cover":"balanced"}
};

export function typographyFor(type:PageSpec["type"],settings:TypographySettings){
  return settings.presets.find(p=>p.id===settings.pagePresets[type])??settings.presets[0]??defaultTypographySettings.presets[1];
}
