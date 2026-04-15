import{a as d,f as m,c as S,b as T,s as q,d as O}from"./BhxVAyZt.js";import{p as N,g as e,d as W,r as y,b as z,u as v,f as C,t as B,e as Q}from"./BVwrKYFG.js";import{p as D,r as U,l as V,b as X,i as j}from"./AYkmf9zX.js";import{d as Y,t as A,f as Z,e as G,B as $,i as H,j as E,c as ee,a as ae,s as M}from"./7k1y1Y6e.js";import{P as te,g as J}from"./C_jr69VV.js";import{s as se}from"./B-QN7h4W.js";import{I as ne}from"./CZUOPdaP.js";var re=m("<div><!></div>");function oe(p,a){N(a,!0);let h=D(a,"class",3,""),u=D(a,"elevate",3,1),c=U(a,["$$slots","$$events","$$legacy","children","class","elevate"]);const w=v(()=>["shadow-none","shadow-sm","shadow","shadow-md","shadow-lg","shadow-xl","shadow-2xl"][typeof u()=="string"?parseInt(u()):u()]);var l=re();Y(l,r=>({class:r,...c}),[()=>A("rounded-surface bg-surface border border-frame text-surface-contrast overflow-hidden",e(w),h())]);var n=W(l);Z(n,()=>a.children),y(l),d(p,l),z()}function F(p,a){const h=V(a,["children","$$slots","$$events","$$legacy"]);/**
 * @license lucide-svelte v0.561.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * ---
 *
 * The MIT License (MIT) (for portions derived from Feather)
 *
 * Copyright (c) 2013-2023 Cole Bemis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */const u=[["path",{d:"m9 18 6-6-6-6"}]];ne(p,X({name:"chevron-right"},()=>h,{get iconNode(){return u},children:(c,w)=>{var l=S(),n=C(l);se(n,a,"default",{}),d(c,l)},$$slots:{default:!0}}))}var le=m('<hr class="my-1 bg-frame h-px border-0"/>');function K(p,a){N(a,!0);let h=v(()=>a.config);const u=v(()=>e(h).some(c=>c.chevron??!!c.submenu));te(p,{children:(c,w)=>{const l=v(J);oe(c,{class:"shadow-2xl p-1 flex flex-col gap-0",children:(n,r)=>{var f=S(),i=C(f);G(i,17,()=>e(h),H,(_,t)=>{var k=S(),L=C(k);{var I=g=>{var o=le();d(g,o)},P=g=>{const o=v(()=>e(t).chevron??("submenu"in e(t)&&!!e(t).submenu));{let s=v(()=>A("w-full justify-between",e(t).warning&&"text-error")),x=v(()=>e(u)?e(o)?E(F):E(F).class("invisible"):void 0);$(g,{ghost:!0,compact:!0,get class(){return e(s)},get icon(){return e(t).icon},get label(){return e(t).label},get disabled(){return e(t).disabled},get endIcon(){return e(x)},onclick:b=>{e(t).submenu?e(l).open.component(K,{config:e(t).submenu},{anchor:b,align:"side",offset:-8},e(t).submenu):e(t).onclick?e(t).onclick(b,e(l)):e(t).resolveWith!==void 0&&e(l).resolveRoot(e(t).resolveWith)}})}};j(L,g=>{e(t).separator?g(I):g(P,-1)})}d(_,k)}),d(n,f)},$$slots:{default:!0}})},$$slots:{default:!0}}),z()}var ce=m('<span class="text-muted-contrast select-none">/</span>'),ie=m('<button type="button" class="px-1.5 py-0.5 text-xs text-muted-contrast hover:text-canvas-contrast hover:bg-secondary rounded transition-colors cursor-pointer leading-none" aria-label="Show hidden breadcrumb items">…</button>'),de=m('<a class="text-muted-contrast hover:text-canvas-contrast transition-colors truncate max-w-32"> </a>'),ue=m('<span class="text-canvas-contrast font-medium truncate max-w-48"> </span>'),fe=m("<!> <!>",1),ve=m('<nav aria-label="Breadcrumb"></nav>');function we(p,a){N(a,!0);const h=J();function u(n){return!a.maxLabelLength||n.length<=a.maxLabelLength?n:n.slice(0,a.maxLabelLength)+"…"}const c=v(()=>()=>{if(!a.maxSegments||a.items.length<=a.maxSegments)return a.items;const n=a.items[0],r=a.items[a.items.length-1],f=a.items.slice(1,a.items.length-1);return[n,{collapsed:!0,hidden:f},r]});async function w(n,r){const f=r.map(i=>i.onclick?{label:i.label,onclick:_=>i.onclick(_)}:i.href?{label:i.label,onclick:()=>{window.location.href=i.href}}:{label:i.label,disabled:!0,resolveWith:null});await h.open.component(K,{config:f},{anchor:n.currentTarget,align:"left"})}var l=ve();G(l,21,()=>e(c)(),H,(n,r,f)=>{const i=v(()=>f===e(c)().length-1);var _=fe(),t=C(_);{var k=o=>{var s=ce();d(o,s)};j(t,o=>{f>0&&o(k)})}var L=Q(t,2);{var I=o=>{var s=ie();T("click",s,x=>w(x,e(r).hidden)),d(o,s)},P=o=>{var s=de(),x=W(s,!0);y(s),B(b=>{M(s,"href",e(r).href??"#"),M(s,"title",e(r).label),q(x,b)},[()=>u(e(r).label)]),T("click",s,function(...b){var R;(R=e(r).onclick)==null||R.apply(this,b)}),d(o,s)},g=o=>{var s=ue(),x=W(s,!0);y(s),B(b=>{M(s,"title",e(r).label),q(x,b)},[()=>u(e(r).label)]),d(o,s)};j(L,o=>{e(r).collapsed?o(I):(e(r).href||e(r).onclick)&&!e(i)?o(P,1):o(g,-1)})}d(n,_)}),y(l),B(n=>ae(l,1,n),[()=>ee(A("flex items-center gap-1 text-sm",a.class))]),d(p,l),z()}O(["click"]);export{we as B};
