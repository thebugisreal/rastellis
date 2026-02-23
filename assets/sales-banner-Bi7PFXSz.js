import{r}from"./index-BWeMscSV.js";import{i}from"./intersection-watcher-CQpC-SnO.js";import{d as n}from"./delay-offset-WNpokWIU.js";import{s as m}from"./shouldAnimate-UBwZO_aC.js";import"./media-queries-CokWIw5y.js";const e={saleAmount:".animation--sale-amount",sectionBlockItems:".animation--section-blocks > *",saleItems:`.sale-promotion .sale-promotion__type,
  .sale-promotion .sale-promotion__unit-currency,
  .sale-promotion .sale-promotion__unit-percent,
  .sale-promotion .sale-promotion__unit-off,
  .sale-promotion .sale-promotion__amount,
  .sale-promotion .sale-promotion__per-month,
  .sale-promotion .sale-promotion__per-year,
  .sale-promotion .sale-promotion__terms,
  .sale-promotion .sales-banner__button`},l=o=>{const s=[e.saleAmount,e.saleItems],a=[e.sectionBlockItems];n(o,s),n(o,a,1);const t=i(o);return{destroy(){t==null||t.destroy()}}};r("sales-banner",{onLoad(){m(this.container)&&(this.animateSalesBanner=l(this.container))},onUnload(){var o;(o=this.animateSalesBanner)==null||o.destroy()}});
