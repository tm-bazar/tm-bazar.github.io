/* =====================================================
   EMINE BAZAR — приложение (телефон + компьютер)
   ===================================================== */

/* ===== НАСТРОЙКИ ===== */
// Ссылка на сервер (Apps Script → Развернуть → URL веб-приложения).
// Пока пусто — сайт работает в ДЕМО-режиме с примерами товаров.
const API_URL = "https://script.google.com/macros/s/AKfycbzE_x0tb5oQer_5hM41pVzWz0jUbtDN3jem04JUckEBTNhcsVAWOy0zlwo_c2vzWGQP/exec";
const APP_NAME = "TM Bazar";
const APP_VER = "60";   // номер версии — виден внизу профиля

// Нейросеть для поиска по фото (загружается в браузере только когда нужна)
const CDN_TF = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js";
const CDN_MN = "https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js";

const CATS = ["auto","realty","electronics","shoes","home","personal","appliances","jobs","rent","kids","build","sport","business","services","buy","med","animals","free"]
  .map(id => ({id, e: {shoes:"👟",electronics:"📱",realty:"🏠",home:"🛋️",auto:"🚗",personal:"👜",appliances:"🧺",jobs:"💼",rent:"🔑",kids:"🧸",build:"🔨",sport:"⚽",business:"🏭",services:"🛠️",buy:"🛒",med:"🩺",animals:"🐑",free:"🎁"}[id]}));
// Ашхабад + 5 велаятов
const CITIES = ["Aşgabat","Ahal","Mary","Daşoguz","Türkmenabat","Türkmenbaşy"];
// Связь с администратором (забытый PIN и любые вопросы) — IMO
const ADMIN_PHONE = "64389009";
const PAGE = 24;
const MAX_PHOTOS = 10;
const NO_COND = {realty:1, services:1, animals:1, food:1};

/* ===== МЕЛОЧИ ===== */
// append/replaceChildren без «null» в тексте
for (const P of [Element.prototype, DocumentFragment.prototype]) for (const m of ["append","prepend","replaceChildren"]){
  const orig = P[m]; P[m] = function(...a){ return orig.apply(this, a.filter(x => x != null && x !== false)); };
}
const $ = id => document.getElementById(id);
function h(tag, attrs, ...kids){
  const el = document.createElement(tag);
  if (attrs) for (const k in attrs){
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === "text") el.textContent = v;
    else if (k === "html") el.innerHTML = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const c of kids.flat()){ if (c == null || c === false) continue; el.append(c.nodeType ? c : document.createTextNode(String(c))); }
  return el;
}
function lsGet(k, d){ try{ const v = localStorage.getItem("bz_"+k); return v == null ? d : JSON.parse(v); }catch(e){ return d; } }
function lsSet(k, v){ try{ if (v == null) localStorage.removeItem("bz_"+k); else localStorage.setItem("bz_"+k, JSON.stringify(v)); }catch(e){} }
const sleep = ms => new Promise(r => setTimeout(r, ms));
function fmt(n){ return (Math.round((+n||0)*100)/100).toLocaleString("ru-RU",{maximumFractionDigits:2}).replace(/ /g," "); }
function priceEl(n, cls, suf, cat){
  if (!(+n > 0)) return h("div",{class:"price"+(cls?" "+cls:"")+" nego"}, cat && PRICE_FREE[cat] ? t("freePrice") : t("negotiable"));
  return h("div",{class:"price"+(cls?" "+cls:"")}, fmt(n), h("small",{text:"TMT"}), suf ? h("small",{class:"suf",text:" "+suf}) : null);
}
function phoneFmt(p){ p=String(p||""); return "+993 "+p.slice(0,2)+" "+p.slice(2,4)+" "+p.slice(4,6)+" "+p.slice(6); }
function digits(x){ return String(x||"").replace(/\D/g,"").replace(/^993(?=\d{8}$)/,""); }
function validPhone(p){ return /^(6[1-5]|71)\d{6}$/.test(p); }
function catOf(id){ return CATS.find(c => c.id === id) || CATS[CATS.length-1]; }
function catName(id){ return t("cat_"+id); }
function initials(n){ return String(n||"?").trim().slice(0,1).toUpperCase(); }
function ago(iso){
  const d = new Date(iso); if (isNaN(d)) return "";
  const s = (Date.now() - d) / 1000;
  if (s < 60) return t("now");
  if (s < 3600) return t("minAgo",{n:Math.floor(s/60)});
  if (s < 86400) return t("hAgo",{n:Math.floor(s/3600)});
  if (s < 86400*7) return t("dAgo",{n:Math.floor(s/86400)});
  return d.toLocaleDateString(locale(),{day:"numeric",month:"short"});
}
function hm(iso){ const d=new Date(iso); return isNaN(d)?"":d.toLocaleTimeString(locale(),{hour:"2-digit",minute:"2-digit"}); }
function dayName(iso){ const d=new Date(iso); return isNaN(d)?"":d.toLocaleDateString(locale(),{day:"numeric",month:"long"}); }
function locale(){ return S.lang === "en" ? "en-GB" : S.lang === "tm" ? "tk-TM" : "ru-RU"; }

const IC = {
  big:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="3"/></svg>',
  search:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  cam:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.6"/></svg>',
  home:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9h-6v-6H9v6H3z"/></svg>',
  grid:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/></svg>',
  chat:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  user:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.5-6.5 8-6.5s7 2 8 6.5"/></svg>',
  heart:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 20s-7.5-4.6-9-9.5C2 7 4.3 4.5 7.2 4.5c2 0 3.4 1.1 4.8 3 1.4-1.9 2.8-3 4.8-3C19.7 4.5 22 7 21 10.5 19.5 15.4 12 20 12 20z"/></svg>',
  back:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  phone:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/></svg>',
  send:'<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20l18-8L3 4v6l12 2-12 2z"/></svg>',
  img:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/></svg>',
  edit:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
  trash:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
  flag:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 21V4h11l-2 4 2 4H5"/></svg>',
  store:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 9l1.5-5h13L20 9M4 9h16v11H4zM4 9c0 2 3.5 2 4 0 .5 2 3.5 2 4 0 .5 2 3.5 2 4 0 .5 2 4 2 4 0"/></svg>',
  rows:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/></svg>',
  plus:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  imo:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3c5 0 9 3.6 9 8s-4 8-9 8c-1 0-2-.1-2.9-.4L4 20l1.4-3.8A7.6 7.6 0 013 11c0-4.4 4-8 9-8z"/><path d="M8.5 9.5v4M12 9.5v4M15.5 9.5v4" stroke-linecap="round"/></svg>'
};
const icon = (k, cls) => h("span",{class:cls||null,style:{display:"inline-grid"},html:IC[k]});

/* ===== СОСТОЯНИЕ ===== */
const S = {
  lang: lsGet("lang", (navigator.language||"").startsWith("tk") ? "tm" : (navigator.language||"").startsWith("en") ? "en" : "ru"),
  token: lsGet("token", null), user: lsGet("user", null),
  adminToken: null,
  catalog: lsGet("catalog", []), catalogAt: 0, catalogLoading: null, tiles: lsGet("tiles", {}),
  vectors: null, vectorsAt: 0,
  favs: new Set(lsGet("favs", [])),
  unread: 0, pollAt: "",
  sort: "rec", city: "", mall: "",
  homeCat: "",
  balance: 0, vipPrices: {}, shopVip: "",        // баланс продавца (TMT) и цены VIP: {7: 20, 15: 35, 30: 60}                      // категория, выбранная на главной («» — все)
  expDays: lsGet("expDays", 0),
  malls: lsGet("malls", null),       // торговые центры и рынки по велаятам (с сервера)     // срок жизни объявления (дней); 0 — сервер ещё без этой функции
  photoSearch: null,
  pendingFiles: null,
  timers: []
};
const isDemo = !API_URL;

/* ===== СВЯЗЬ С СЕРВЕРОМ ===== */
async function call(action, data){
  const d = Object.assign({action}, data || {});
  if (S.token && d.token === undefined) d.token = S.token;
  if (S.adminToken) d.adminToken = S.adminToken;
  let r;
  try{
    if (isDemo) r = await Mock.run(JSON.parse(JSON.stringify(d)));
    else {
      const res = await fetch(API_URL, {method:"POST", body: JSON.stringify(d)});
      r = await res.json();
    }
  }catch(e){ console.error(e); return {ok:false, error:"net"}; }
  if (r && r.error === "auth" && d.token && action !== "adminData") logout(true);
  return r || {ok:false, error:"net"};
}
function errText(r){ return t("e_"+(r && r.error || "net")) || t("e_net"); }

async function loadCatalog(force){
  if (!force && S.catalogAt && Date.now() - S.catalogAt < 60000) return S.catalog;
  if (S.catalogLoading) return S.catalogLoading;
  S.catalogLoading = call("catalog").then(r => {
    S.catalogLoading = null;
    if (r.ok){ r.products.forEach(migrateProduct); S.catalog = r.products; S.catalogAt = Date.now(); lsSet("catalog", r.products.slice(0, 300)); S.tiles = r.tiles || {}; lsSet("tiles", S.tiles); setExpDays(r.expDays); S.srvInfo = {vipVer: r.vipVer || 0, malls: !!r.malls, expDays: r.expDays || 0}; if (r.malls){ S.malls = r.malls; lsSet("malls", r.malls); } updateBadge(); }
    // сервер не ответил — показываем сохранённые товары и говорим об этом (раз за сеанс)
    else if (!S.catalogWarned){ S.catalogWarned = true; toast(t("catalogOld") + (r.error && r.error !== "net" ? " (" + r.error + ")" : "")); }
    return S.catalog;
  });
  return S.catalogLoading;
}
async function loadVectors(){
  if (S.vectors && Date.now() - S.vectorsAt < 5*60000) return S.vectors;
  const r = await call("vectors");
  if (r.ok){
    S.vectors = r.items.map(([id, vs, vm]) => ({id, s: Vision.decode(vs), m: Vision.decode(vm)}));
    S.vectorsAt = Date.now();
  }
  return S.vectors || [];
}
// старые объявления → новые категории
const OLD_SUB = {smartphones:"mobiles", buttonphones:"mobiles", audio:"speakers", elecacc:"components"};
const OLD_CAT = {
  phones:      s => ["electronics", OLD_SUB[s] || s || "mobiles"],
  clothes:     s => s === "kids" ? ["kids","kidsclothes"] : ["personal", s === "men" ? "menclothes" : "womenclothes"],
  shoes:       s => ["shoes", s === "kids" ? "kidsshoes" : s === "men" ? "menshoes" : s === "women" ? "womenshoes" : s],
  furniture:   s => ["home","furniture"],
  carpets:     s => ["home", s === "carpets" ? "carpets" : "textile"],
  garden:      s => ["home","garden"],
  food:        s => ["home","food"],
  beauty:      s => ["personal", s === "perfume" ? "perfume" : "cosmetics"],
  jewelry:     s => ["personal", ["gold","silver","watches","bijou"].includes(s) ? s : "bijou"],
  books:       s => ["sport","books"],
  moto:        s => ["auto","moto"],
  autoparts:   s => ["auto", s === "tires" ? "tires" : s === "caracc" ? "caracc" : "parts"],
  other:       s => ["home","other"]
};
function migrateProduct(p){
  if (!p) return p;
  if (OLD_CAT[p.cat]){ const [c, sb] = OLD_CAT[p.cat](p.sub); p.cat = c; p.sub = sb; }
  if ((p.cat === "personal" && (p.sub === "womenshoes" || p.sub === "menshoes")) || (p.cat === "kids" && p.sub === "kidsshoes")) p.cat = "shoes";
  else if (p.cat === "electronics" && OLD_SUB[p.sub]) p.sub = OLD_SUB[p.sub];
  else if (p.cat === "realty" && p.sub === "cottage") p.sub = "house";
  if (SUBS[p.cat] && p.sub && !SUBS[p.cat].includes(p.sub)) p.sub = "";
  return p;
}
function byId(id){ return S.catalog.find(p => p.id === id); }

/* ===== ПОИСК НАЗВАНИЙ: «Камри» = «Camry», «Хайландер» = «Highlander», регистр не важен ===== */
const TRL = {а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"e",ж:"j",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"ts",ч:"ch",ш:"sh",щ:"sh",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya",
  ç:"ch",ş:"sh",ž:"j",ň:"n",ý:"y",ü:"u",ö:"o",ä:"a"};
const skelCache = new Map();
// «скелет» слова: латиница, похожие звуки слиты, без гласных
function skel(x){
  const k = String(x || ""); if (skelCache.has(k)) return skelCache.get(k);
  let s = k.toLowerCase().replace(/[а-яёçşžňýüöä]/g, c => TRL[c] != null ? TRL[c] : c);
  s = s.replace(/igh/g,"i").replace(/gh/g,"g").replace(/ph/g,"f").replace(/ck/g,"k").replace(/tch|ch|sh/g,"s")
    .replace(/c(?=[eiy])/g,"s").replace(/[cq]/g,"k").replace(/x/g,"ks").replace(/w/g,"v").replace(/z/g,"s").replace(/dj/g,"j")
    .replace(/[^a-z0-9]/g,"").replace(/[aeiouy]/g,"").replace(/(.)\1+/g,"$1");
  if (skelCache.size > 5000) skelCache.clear();
  skelCache.set(k, s); return s;
}
// одно слово поиска найдено в тексте?
function looseHas(hay, w){
  if (hay.includes(w)) return true;
  const sk = skel(w); if (!sk) return false;
  if (sk.length >= 3) return skel(hay).includes(sk);
  return hay.split(/[\s,·()/-]+/).some(x => { const k = x && skel(x); return !!k && (sk.length > 1 ? k.startsWith(sk) : k === sk); });
}
// одно и то же название? («camry », «Камри» и «Camry» — да)
function sameName(a, b){
  if (a === b) return true;
  const x = String(a || "").trim().toLowerCase(), y = String(b || "").trim().toLowerCase();
  if (!x || !y) return false;
  if (x === y) return true;
  const sx = skel(x), sy = skel(y);
  return sx.length >= 2 && sx === sy;
}
// привести введённую модель к названию из списка («toyota camry» → «Camry»)
// подпись выбранных моделей: «Camry, Highlander»
function modelLabel(v){ return Array.isArray(v) ? v.join(", ") : (v || ""); }
// объявление подходит под выбранную модель (или под одну из нескольких)
function modelIn(p, v){
  const a = p.attrs || {}, m = canonName(modelsOf(p.sub, a.brand).concat(CAR_MODELS[a.brand] || []), a.model, a.brand);
  return (Array.isArray(v) ? v : [v]).some(x => sameName(m, x));
}
function canonName(list, v, brand){
  let s = String(v || "").trim(); if (!s || !list || !list.length) return s;
  if (brand){ const b = String(brand).toLowerCase(); if (s.toLowerCase().startsWith(b + " ")) s = s.slice(b.length + 1).trim(); }
  return list.find(m => m.toLowerCase() === s.toLowerCase()) || list.find(m => sameName(m, s)) || s;
}

/* ===== VIP и срок объявления ===== */
function setExpDays(n){ n = +n || 0; if (n !== S.expDays){ S.expDays = n; lsSet("expDays", n); } }
function isVip(p){ return !!(p && p.vip && new Date(p.vip) > Date.now()); }
// когда объявление удалится (мс); 0 — неизвестно
function expAt(p){ if (!S.expDays || !p) return 0; const x = new Date(p.exp || 0).getTime(); return isNaN(x) ? 0 : x; }
function expSoon(p){ const x = expAt(p); return !!x && x - Date.now() < 3 * 864e5; }
function expText(p){
  const ms = expAt(p) - Date.now();
  if (ms <= 0) return t("expGone");
  const hTot = Math.floor(ms / 36e5);
  return hTot >= 24 ? t("expLeft",{d:Math.floor(hTot/24), h:hTot%24}) : t("expLeftH",{h:hTot, m:Math.floor(ms/6e4)%60});
}
// магазины из каталога: VIP-магазин — у кого есть хотя бы одно VIP-объявление
// магазины, у которых есть товары под выбор: категория, велаят, ТЦ
function shopsList(cat, city, mall){
  const m = {};
  S.catalog.forEach(p => {
    if (cat && p.cat !== cat) return;
    if (city && p.city !== city) return;
    if (mall && (p.attrs || {}).mall !== mall) return;
    const x = m[p.user] || (m[p.user] = {id:p.user, name:p.sellerName, logo:p.sellerLogo, stype:p.stype, city:p.city, n:0, vip:false, thumb:"", cats:new Set(), malls:new Set()});
    x.cats.add(p.cat); if ((p.attrs || {}).mall) x.malls.add(p.attrs.mall);
    x.n++; if (isVip(p)){ x.vip = true; if (!x.thumb) x.thumb = p.thumb; }
    if (!x.thumb && p.thumb) x.thumb = p.thumb;
  });
  return Object.values(m).sort((a,b) => (b.vip - a.vip) || (b.n - a.n));
}

function saveAuth(r){
  S.token = r.token; S.user = r.user;
  lsSet("token", r.token); lsSet("user", r.user);
  startPoll();
}
// выйти — только после «Да»
async function logoutAsk(){
  const yes = await sheet((box, close) => box.append(h("h2",{text:"🚪 "+t("logoutQ")}), h("p",{text:t("logoutSub")}),
    h("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}},
      h("button",{class:"btn ghost",text:t("no"),onclick:()=>close(false)}),
      h("button",{class:"btn",text:t("yesLogout"),onclick:()=>close(true)}))));
  if (yes) logout();
}
// удалить аккаунт: предупреждаем, что пропадут все товары, VIP и монеты
async function deleteAccountAsk(){
  const r = await call("me");
  const prods = r.ok ? r.products : [], vipN = prods.filter(isVip).length, bal = r.ok ? +r.balance || 0 : 0, shopVip = r.ok && r.shopVip;
  const ok1 = await sheet((box, close) => box.append(h("h2",{text:"⚠️ "+t("delAccQ")}),
    h("div",{class:"warn",style:{background:"#fde8e8",color:"#9b1c1c",marginBottom:"12px"}}, h("span",{text:"🗑"}),
      h("div",null, h("b",{text:t("delAccWarn")}),
        h("ul",{class:"del-list"},
          h("li",{text:t("delAccGoods",{n:prods.length})}),
          vipN || shopVip ? h("li",{text:t("delAccVip",{n:vipN})}) : null,
          bal ? h("li",{text:t("delAccBal",{b:coins(bal)})}) : null,
          h("li",{text:t("delAccChats")})))),
    h("p",{text:t("delAccNoUndo")}),
    h("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}},
      h("button",{class:"btn ghost",text:t("no"),onclick:()=>close(false)}),
      h("button",{class:"btn",style:{background:"#c62828"},text:t("yesDelete"),onclick:()=>close(true)}))));
  if (!ok1) return;
  // второй шаг: точно?
  const ok2 = await sheet((box, close) => box.append(h("h2",{text:t("delAccSure")}),
    h("p",{text:t("delAccLast",{n:prods.length})}),
    h("div",{style:{display:"grid",gap:"10px"}},
      h("button",{class:"btn block",style:{background:"#c62828"},text:"🗑 "+t("delAccFinal"),onclick:()=>close(true)}),
      h("button",{class:"btn block ghost",text:t("cancel"),onclick:()=>close(false)}))));
  if (!ok2) return;
  const b = busy(t("wait"));
  const x = await call("deleteAccount");
  b.done();
  if (!x.ok) return toast(x.error === "server" ? t("delAccOld") : errText(x));
  S.catalogAt = 0; logout(true); toast(t("delAccDone")); go("/");
}
function logout(silent){
  S.token = null; S.user = null; S.unread = 0;
  lsSet("token", null); lsSet("user", null);
  updateBadge();
  if (!silent) go("/");
}

/* ===== ПЕРЕВОД ===== */
function t(k, vars){
  let s = (T[S.lang] && T[S.lang][k]) ?? T.ru[k] ?? "";
  s = s.replace(/\{app\}/g, APP_NAME);
  if (vars) for (const v in vars) s = s.replace(new RegExp("\\{"+v+"\\}","g"), vars[v]);
  return s;
}
function setLang(l){ S.lang = l; lsSet("lang", l); document.documentElement.lang = l === "tm" ? "tk" : l; renderTabbar(); route(); }
function langSwitch(){
  return h("div",{class:"langs"}, ...[["tm","TM"],["ru","RU"],["en","EN"]].map(([l,n]) =>
    h("button",{class:S.lang===l?"on":null,text:n,onclick:()=>setLang(l)})));
}

/* ===== РОУТЕР ===== */
/* Кнопка «Назад» на телефоне.
   Путь по экранам хранится в navStack. В истории браузера под текущей записью лежит запас записей:
   каждое «Назад» уходит на запись ниже, а приложение само показывает предыдущий экран.
   Важно: Chrome разрешает добавить только ОДНУ запись на одно касание экрана. Если сайт добавит запись
   без касания (или вторую за то же касание) — Chrome перестаёт доверять ВСЕМ записям сайта и «Назад» выходит.
   Поэтому: одно касание = одна запись, а после «Назад» ничего не добавляется.
   На любом экране «Назад» — шаг назад до главного меню; на главном меню — вопрос «Выйти из приложения?». */
const TOP_PAGES = ["/fav", "/sell", "/chats", "/me", "/cats"];
const SPARE = 60;                                // предел записей (обычно касаний больше, чем экранов)
const curPath = () => location.hash.slice(1) || "/";
const navStack = [];
let topP = 0;                                    // номер текущей записи; ниже неё topP записей запаса
function setUrl(path){ history.replaceState({tm:"g", p:topP}, "", "#"+path); }
function go(path){
  path = path || "/";
  if (path === curPath()){ if (!navStack.length) navStack.push(path); route(); return; }
  if (path === "/") navStack.length = 0;
  else if (TOP_PAGES.includes(path)){ navStack.length = 0; navStack.push("/"); }
  else { const i = navStack.lastIndexOf(path); if (i >= 0) navStack.length = i; }
  // выбор марки/модели — промежуточные экраны: после выбора «Назад» ведёт сразу к категориям
  if (/^\/c\/\w+\/list$/.test(path)) for (let i = navStack.length - 1; i >= 0; i--) if (/^\/(brands|models)\//.test(navStack[i])) navStack.splice(i, 1);
  navStack.push(path);
  setUrl(path); route();
}
function back(fallback){
  if (navStack.length > 1){ navStack.pop(); setUrl(navStack[navStack.length-1]); route(); }
  else { navStack.length = 0; go(fallback || "/"); }
}
const curScreen = () => navStack[navStack.length-1] || "/";
// пополнить запас — одна запись на одно касание экрана
let lastRefillAt = 0;
function refill(){
  if (leaving || !history.state || history.state.tm !== "g" || topP >= SPARE) return;
  const now = Date.now(); if (now - lastRefillAt < 400) return;   // touchend и click от одного касания — одна запись
  lastRefillAt = now;
  topP++; history.pushState({tm:"g", p:topP}, "", "#"+curScreen());
}
document.addEventListener("touchend", refill, true);
document.addEventListener("click", refill, true);
document.addEventListener("keydown", e => { if (e.key !== "Escape") refill(); }, true);
let lastBackAt = 0, exitOpen = false, leaving = false;
function leaveApp(){
  leaving = true;
  const p = topP;
  history.go(-(p + 1));                          // уйти со всех записей приложения
  setTimeout(() => { if (!document.hidden){ if (p) history.go(-p); try{ window.close(); }catch(e){} } }, 350);
}
function onPop(e){
  const st = e.state;
  if (!st || st.tm !== "g"){ if (!st) route(); return; }
  if (leaving) return;
  topP = st.p;
  const now = Date.now(), dup = now - lastBackAt < 350; lastBackAt = now;
  if (dup){ setUrl(curScreen()); return; }       // одно нажатие пришло дважды — второе не считаем
  if (exitOpen){ closeSheet(true); return; }     // «Назад» при открытом вопросе = выйти
  if (sheetEl){ closeSheet(undefined); setUrl(curScreen()); return; }
  const atHome = navStack.length <= 1 && curScreen() === "/";
  if (atHome){ navStack.length = 0; navStack.push("/"); setUrl("/"); askExit(); return; }   // вопрос — только на главном меню
  const was = navStack.pop();
  if (/\/list$/.test(was) && S.browse) S.browse.f = {};   // из списка объявлений — к категориям, без выбранной марки
  setUrl(curScreen()); route();
}
function askExit(){
  exitOpen = true;
  sheet((box, close) => box.append(
    h("h2",{text:t("exitQ")}), h("p",{style:{color:"var(--mut)",fontSize:"14px",margin:"4px 0 0"},text:t("exitSub")}),
    h("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginTop:"14px"}},
      h("button",{class:"btn ghost",text:t("exitNo"),onclick:()=>close(false)}),
      h("button",{class:"btn",text:t("exitYes"),onclick:()=>close(true)})))).then(yes => {
    exitOpen = false;
    if (yes) leaveApp();
  });
}
// ссылки внутри приложения (#/...) — через свой переход, без лишних записей в истории
document.addEventListener("click", e => {
  if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
  const a = e.target.closest && e.target.closest('a[href^="#"]');
  if (!a || a.target) return;
  e.preventDefault(); go(a.getAttribute("href").slice(1));
});
function stopTimers(){ S.timers.forEach(clearInterval); S.timers = []; }

const ROUTES = [
  [/^\/?$/, () => viewHome()],
  [/^\/q\/(.*)$/, m => viewHome(decodeURIComponent(m[1]))],
  [/^\/c\/(\w+)\/list$/, m => viewBrowse(m[1], true)],
  [/^\/c\/(\w+)$/, m => viewBrowse(m[1])],
  [/^\/brands\/(\w+)\/(\w+)$/, m => viewMakes(m[1], m[2])],
  [/^\/deal\/(\w+)\/(\w+)$/, m => viewDeals(m[1], m[2])],
  [/^\/models\/(\w+)\/(\w+)\/(.+)$/, m => viewModels(m[1], m[2], decodeURIComponent(m[3]))],
  [/^\/cats$/, () => viewBrowse("")],
  [/^\/shops$/, () => viewShops(false)],
  [/^\/shops\/vip$/, () => viewShops(true)],
  [/^\/p\/(\w+)$/, m => viewProduct(m[1])],
  [/^\/u\/(\w+)$/, m => S.user && S.token && S.user.id === m[1] && !S.adminToken ? viewMyShop(m[1]) : viewShop(m[1])],
  [/^\/u\/(\w+)\/view$/, m => viewShop(m[1])],
  [/^\/photo$/, () => viewPhoto()],
  [/^\/fav$/, () => viewFav()],
  [/^\/chats$/, () => viewChats()],
  [/^\/chat\/(\w+)$/, m => viewChat(m[1])],
  [/^\/me$/, () => viewMe()],
  [/^\/sell$/, () => viewSell()],
  [/^\/edit\/(\w+)$/, m => viewSell(m[1])],
  [/^\/profile$/, () => viewProfile()],
  [/^\/rules$/, () => viewRules()],
  [/^\/topup$/, () => viewTopUp()],
  [/^\/support$/, () => viewTopUp(true)],
  [/^\/admin$/, () => viewAdmin()]
];
function route(){
  if (updateReady && curPath() === "/") return maybeReload();
  stopTimers();
  S.cardExtra = null;   // кнопка «VIP» на карточках — только в своём магазине
  closeSheet();
  const path = decodeURI(location.hash.slice(1)) || "/";
  document.body.classList.remove("no-tab", "has-fab");
  for (const [re, fn] of ROUTES){
    const m = path.match(re);
    if (m){ fn(m); window.scrollTo(0, 0); return; }
  }
  go("/");
}
function page(...kids){ const app = $("app"); app.replaceChildren(...kids); return app; }
function setTab(name, show){
  $("tabbar").hidden = show === false;
  document.body.classList.toggle("no-tab", show === false);
  document.querySelectorAll("#tabbar a").forEach(a => a.classList.toggle("on", a.dataset.tab === name));
}
function topBar(title, opts){
  opts = opts || {};
  return h("div",{class:"bar"},
    h("button",{class:"icon-btn","aria-label":t("back"),html:IC.back,onclick:()=>opts.onBack ? opts.onBack() : back()}),
    h("h1",{text:title}), opts.right || null);
}

/* ===== ТАББАР ===== */
function renderTabbar(){
  const tabs = [["home","/",IC.home,t("tHome")],["cats","/cats",IC.grid,t("tCats")],["add","/sell",IC.plus,t("tAdd")],
    ["chats","/chats",IC.chat,t("tChats")],["me","/me",IC.user,t("tMe")]];
  $("tabbar").replaceChildren(h("div",{class:"wrap"}, ...tabs.map(([k,href,ic,label]) =>
    h("a",{href:"#"+href,"data-tab":k,class:k==="add"?"cam":null,onclick:k==="add"?(()=>{ S.sellPreset = null; }):null},
      k === "add" ? h("span",{class:"c",html:ic}) : h("span",{html:ic}),
      h("span",{text:label}),
      k === "chats" ? h("span",{class:"badge",id:"badge",hidden:true}) : null,
      k === "me" ? h("span",{class:"badge dot",id:"badge-me",hidden:true}) : null))));
  updateBadge();
}
function updateBadge(){
  const b = $("badge"); if (!b) return;
  b.hidden = !S.unread; b.textContent = S.unread > 9 ? "9+" : S.unread;
  // красная точка на «Профиль»: свои объявления скоро удалятся
  const m = $("badge-me");
  if (m) m.hidden = !(S.user && (S.supportUnread || S.catalog.some(p => p.user === S.user.id && expSoon(p))));
}
let pollTimer = null;
function startPoll(){
  clearInterval(pollTimer);
  if (!S.token) return;
  const tick = async () => {
    if (document.hidden || !S.token) return;
    const r = await call("poll", {since: S.pollAt});
    if (r.ok && !r.same){ S.unread = r.unread || 0; S.pollAt = r.at || ""; updateBadge(); }
  };
  tick(); pollTimer = setInterval(tick, 30000);
}

/* ===== ОКНА (шторки) ===== */
let sheetEl = null, sheetResolve = null;
function sheet(build){
  closeSheet();
  return new Promise(resolve => {
    sheetResolve = resolve;
    const box = h("div",{class:"sheet",role:"dialog","aria-modal":"true"}, h("div",{class:"grab"}));
    const close = v => { closeSheet(v); };
    build(box, close);
    sheetEl = h("div",{class:"sheet-bg",onclick:e => { if (e.target === sheetEl) close(undefined); }}, box);
    document.body.append(sheetEl);
    // закрыть, потянув окно вниз
    let y0 = null, dy = 0;
    box.addEventListener("touchstart", e => { y0 = box.scrollTop <= 0 ? e.touches[0].clientY : null; dy = 0; box.style.transition = ""; }, {passive:true});
    box.addEventListener("touchmove", e => {
      if (y0 == null) return;
      dy = e.touches[0].clientY - y0;
      if (dy > 0){ box.style.transform = "translateY(" + dy + "px)"; if (e.cancelable) e.preventDefault(); }
    }, {passive:false});
    box.addEventListener("touchend", () => {
      if (y0 == null) return; y0 = null;
      if (dy > 90) close(undefined);
      else { box.style.transition = "transform .15s"; box.style.transform = ""; }
    });
    const f = box.querySelector("input:not([type=checkbox]),textarea"); if (f && matchMedia("(min-width:640px)").matches) f.focus();
  });
}
document.addEventListener("keydown", e => { if (e.key === "Escape" && sheetEl) closeSheet(undefined); });
function closeSheet(v){
  if (sheetEl){ sheetEl.remove(); sheetEl = null; }
  if (sheetResolve){ const r = sheetResolve; sheetResolve = null; r(v); }
}
function toast(text, action){
  document.querySelectorAll(".toast").forEach(x => x.remove());
  const el = h("div",{class:"toast",role:"status"}, h("span",{text}), action ? h("button",{text:action.label,onclick:()=>{ el.remove(); action.fn(); }}) : null);
  document.body.append(el);
  setTimeout(() => el.remove(), action ? 6000 : 2600);
}
function busy(text){
  const bar = h("i",{style:{width:"0%"}});
  const pr = h("div",{class:"prog",hidden:true}, bar);
  const label = h("div",{text:text||t("wait")});
  const el = h("div",{class:"busy"}, h("div",null, h("div",{class:"spin"}), label, pr));
  document.body.append(el);
  return { set(txt, frac){ if (txt) label.textContent = txt; if (frac != null){ pr.hidden = false; bar.style.width = Math.round(frac*100)+"%"; } }, done(){ el.remove(); } };
}

/* ===== ПРОДАВЕЦ: логотип и тип ===== */
const STYPES = ["private","shop","online"];
function avaEl(name, logo, cls){
  return logo ? h("img",{class:"ava logo"+(cls?" "+cls:""),src:logo,alt:name||""}) : h("div",{class:"ava"+(cls?" "+cls:""),text:initials(name)});
}
function stypeBadge(st){
  if (!st) return null;
  return h("span",{class:"stype st-"+st,text:t("stype_"+st)});
}
// выбор логотипа (необязательно): квадратная картинка 400×400
function logoPicker(current){
  let data = null, removed = false;
  const prev = h("div",{class:"logo-prev"});
  const inp = h("input",{type:"file",accept:"image/*",hidden:true});
  const draw = src => prev.replaceChildren(src ? h("img",{src,alt:""}) : h("span",{html:IC.store}));
  const delBtn = h("button",{type:"button",class:"link",style:{color:"var(--mut)"},text:t("delete"),hidden:!current,onclick:()=>{ data = null; removed = true; draw(""); delBtn.hidden = true; }});
  inp.onchange = async () => {
    const f = inp.files[0]; inp.value = ""; if (!f) return;
    try{ const c = await compress(f, 400); data = c.b64; removed = false; draw(c.dataUrl); delBtn.hidden = false; }catch(e){ toast(t("e_photo")); }
  };
  draw(current || "");
  const el = h("div",{class:"logo-pick"}, prev,
    h("div",null, h("button",{type:"button",class:"btn sm ghost",text:t("pickLogo"),onclick:()=>inp.click()}), " ", delBtn,
      h("div",{class:"hint",text:t("logoHint")})), inp);
  return {el, changed: () => data != null || removed, data: () => data};
}

/* ===== ВИДЕО (TikTok / Instagram / YouTube) ===== */
function videoUrl(x){
  let s = String(x || "").trim();
  if (!s) return "";
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  return /^https?:\/\/([a-z0-9-]+\.)*(tiktok\.com|instagram\.com|instagr\.am|youtube\.com|youtu\.be)(\/|$)/i.test(s) && s.length <= 300 ? s : "";
}
function videoKind(u){ return /tiktok/i.test(u) ? "TikTok" : /instagr/i.test(u) ? "Instagram" : "YouTube"; }
function placeText(p){ const m = (p.attrs || {}).mall; return [p.city, m ? "🏬 " + m : "", p.place].filter(Boolean).join(" · "); }
/* ===== ТОРГОВЫЕ ЦЕНТРЫ И РЫНКИ (список ведёт администратор в админке; это — начальный) ===== */
const MALLS_DEFAULT = {
  "Aşgabat": ["Berkarar SDM","Aşgabat SDM (Ashgabat Mall)","Paýtagt SDM","Altyn Asyr bazary","Gündogar bazary","Teke bazary","Gülistan bazary (Rus bazary)","Mir bazary"],
  "Ahal": [], "Mary": [], "Daşoguz": [], "Türkmenabat": [], "Türkmenbaşy": []
};
function mallsOf(city){ const m = S.malls || MALLS_DEFAULT; return (m[city] || []).filter(Boolean); }

/* ===== ФОТО-ПЛИТКИ: категории, разделы, марки =====
   1) фото, которое поставил администратор (админка → «Картинки»);
   2) иначе — фото самого нового товара этой категории / раздела / марки;
   3) иначе — значок. */
// готовые фото верхних категорий (папка cats/ на сайте)
const CAT_PHOTO = {shoes:1, electronics:1, realty:1, home:1, auto:1, personal:1, appliances:1, jobs:1, rent:1, kids:1, build:1, sport:1, business:1, services:1, buy:1, med:1, animals:1, free:1};
// готовые фото разделов (папка subs/ на сайте)
const SUB_PHOTO = Object.fromEntries(["cars","trucks","buses","imported","special","moto","water","parts","tires","caracc","oils"].map(k => ["auto:"+k, 1]).concat(["flat","house","land","commercial","garage"].map(k => ["realty:"+k, 1])));
function tilePhoto(key){
  if (S.tiles && S.tiles[key]) return S.tiles[key];
  if (key.startsWith("cat:") && CAT_PHOTO[key.slice(4)]) return "cats/" + key.slice(4) + ".jpg";
  if (key.startsWith("sub:") && SUB_PHOTO[key.slice(4)]) return "subs/" + key.slice(4).replace(":", "-") + ".jpg";
  if (key.startsWith("brand:") && BRAND_LOGO[key.slice(6)]) return "brands/" + BRAND_LOGO[key.slice(6)] + ".webp";
  const [kind, a, b] = key.split(":");
  let p = null;
  if (kind === "cat") p = a === "all" ? S.catalog.find(x => x.thumb) : S.catalog.find(x => x.cat === a && x.thumb);
  else if (kind === "sub") p = S.catalog.find(x => x.cat === a && x.sub === b && x.thumb);
  else if (kind === "brand") p = S.catalog.find(x => x.cat === "auto" && (x.attrs || {}).brand === a && x.thumb) || S.catalog.find(x => (x.attrs || {}).brand === a && x.thumb);
  return p ? p.thumb : "";
}
function tileImg(key, fallback){
  const src = tilePhoto(key);
  return src ? h("b",{class:"ci ph"+(/^(cats|subs|brands)\//.test(src) ? " fit" : "")}, h("img",{src,alt:"",loading:"lazy"})) : fallback();
}
function catTile(id){ return tileImg("cat:"+id, () => catIcon(id)); }
// плитка с фото и подписью (разделы, марки)
function photoTile(key, label, on, onclick, count, iconId){
  return h("button",{type:"button",class:"pt"+(on?" on":""),onclick},
    tileImg(key, () => catIcon(iconId)),
    h("span",null, label, count != null ? h("small",{text:" "+count}) : null));
}

/* ===== СПИСОК МАРОК (сверху вниз, крупные эмблемы, серебристая шапка) ===== */
function makeLogo(b){
  if (b === "other") return h("span",{class:"mk-logo",style:{background:"#f1f2f4",color:"#59636e"},
    html:'<svg viewBox="0 0 48 48" width="30" height="30" fill="currentColor"><circle cx="12" cy="24" r="4.5"/><circle cx="24" cy="24" r="4.5"/><circle cx="36" cy="24" r="4.5"/></svg>'});
  const src = (S.tiles && S.tiles["brand:"+b]) || (BRAND_LOGO[b] ? "brands/" + BRAND_LOGO[b] + ".webp" : "");
  if (src) return h("span",{class:"mk-logo"}, h("img",{src,alt:b,loading:"lazy"}));
  const ini = b.replace(/[^A-Za-zА-Яа-яЁё0-9 ]/g," ").trim().split(/\s+/).map(w => w[0]).join("").slice(0,2).toUpperCase() || b.slice(0,2);
  return h("span",{class:"mk-logo mono"}, h("b",{text:ini}));
}
/* ===== МОДЕЛИ МАРОК (файл models.json: cars / trucks / buses / special) ===== */
let MODELS = null, modelsP = null, POP_MODELS = null;
function loadModels(){
  return modelsP || (modelsP = fetch("models.json").then(r => r.json()).then(d => {
    MODELS = d;
    if (!POP_MODELS) POP_MODELS = Object.assign({}, CAR_MODELS);
    // полные списки — и в подсказки при подаче объявления
    for (const b in d.cars) CAR_MODELS[b] = [...new Set([...(CAR_MODELS[b] || []), ...d.cars[b]])];
    return d;
  }).catch(() => { modelsP = null; return null; }));
}
function modelsOf(sub, b){
  const g = MODELS && MODELS[sub === "imported" ? "cars" : sub];
  return (g && g[b]) || [];
}
const modelSort = (x, y) => x.localeCompare(y, "en", {sensitivity:"base"});
function modelsHref(cat, sub, b){ return "/models/" + cat + "/" + sub + "/" + encodeURIComponent(b); }

// значок «Все марки»: мозаика из 4 эмблем
function anyLogo(opts){
  const pri = ["Toyota","Hyundai","Mercedes-Benz","BMW"];
  const has = b => BRAND_LOGO[b];
  const pick = [...pri.filter(b => opts.includes(b) && has(b)), ...opts.filter(b => !pri.includes(b) && has(b))].slice(0,4);
  if (pick.length < 4) return h("span",{class:"mk-logo mono"}, h("b",{text:"∗"}));
  return h("span",{class:"mk-logo mos"}, ...pick.map(b => h("img",{src:"brands/"+BRAND_LOGO[b]+".webp",alt:"",loading:"lazy"})));
}
// opts — список марок, counts — сколько объявлений, onPick(b|"") — выбор
function makeList(opts, counts, onPick, selected, withAny){
  const box = h("div",{class:"mk"});
  const q = h("input",{class:"inp mk-q",type:"search",placeholder:"🔍  "+t("searchMake")});
  const list = h("div");
  const row = b => h("button",{type:"button",class:"mk-row"+(selected===b?" on":""),onclick:()=>onPick(b)},
    makeLogo(b), h("span",{class:"mk-name",text:brandName(b)}),
    counts && counts[b] ? h("span",{class:"mk-n",text:String(counts[b])}) : null, h("span",{class:"ar",text:selected===b ? "✓" : "›"}));
  const draw = () => {
    const v = q.value.trim().toLowerCase();
    const pop = opts.filter(b => POPULAR_CARS.includes(b)), others = opts.filter(b => !POPULAR_CARS.includes(b));
    const parts = [];
    if (withAny && !v) parts.push(h("button",{type:"button",class:"mk-row"+(!selected?" on":""),onclick:()=>onPick("")},
      anyLogo(opts), h("span",{class:"mk-name",text:t("anyMake")}), h("span",{class:"ar",text:"›"})));
    if (v){ parts.push(...opts.filter(b => looseHas((brandName(b)+" "+b).toLowerCase(), v)).map(row)); }
    else {
      if (pop.length && others.length) parts.push(h("div",{class:"mk-h",text:t("popularMakes")}));
      parts.push(...pop.map(row));
      if (pop.length && others.length) parts.push(h("div",{class:"mk-h",text:t("allMakes")}));
      parts.push(...others.map(row));
    }
    list.replaceChildren(...parts);
  };
  q.oninput = draw; draw();
  box.append(q, list);
  return box;
}
async function viewMakes(cat, sub){
  setTab("home", false);
  // свежий список объявлений, чтобы цифры у марок были точными
  if (!S.catalogAt){ const here = location.hash; page(h("div",{class:"empty"}, h("div",{class:"spin"}))); await loadCatalog(); if (location.hash !== here) return; }
  const f = fieldsFor(cat, sub, {}).find(x => x.k === "brand");
  const opts = f ? optsOf(f, sub, {}) : CAR_BRANDS;
  const counts = {};
  S.catalog.filter(p => p.cat === cat && p.sub === sub).forEach(p => { const b = (p.attrs||{}).brand; if (b) counts[b] = (counts[b]||0) + 1; });
  const st = S.browse && S.browse.cat === cat ? S.browse : null;
  const pick = async b => {
    if (b && b !== "other" && VEHICLE_SUBS[sub]){
      await loadModels();
      if (modelsOf(sub, b).length) return go(modelsHref(cat, sub, b));
    }
    S.browse = {cat, sub, f: b ? {brand: b} : {}, r: st ? st.r || {} : {}}; go("/c/"+cat+"/list");
  };
  page(h("div",{class:"silver-head"},
      h("button",{class:"sh-back","aria-label":t("back"),html:IC.back,onclick:()=>back("/c/"+cat)}),
      h("div",null, h("small",{text:catName(cat)}), h("h1",{text:subName(sub)}))),
    h("div",{class:"wrap"}, makeList(opts, counts, pick, st && st.sub === sub ? (st.f||{}).brand : "", true),
      // внизу: показать все объявления раздела, не выбирая марку
      h("div",{class:"md-bar"}, h("button",{type:"button",class:"btn block md-show",onclick:()=>pick(""),
        text:t("showAllSub",{s:subName(sub), n:S.catalog.filter(p => p.cat === cat && p.sub === sub).length})}))));
}

/* ===== НЕДВИЖИМОСТЬ: после раздела — продажа / аренда / аренда комнат ===== */
function dealName(sub, d){ return t("dl_"+sub+"_"+d) || t("o_deal_"+d); }
function viewDeals(cat, sub){
  setTab("home", false);
  const f = fieldsFor(cat, sub, {}).find(x => x.k === "deal");
  const opts = f ? optsOf(f, sub, {}) : ["sale","rent"];
  const list = S.catalog.filter(p => p.cat === cat && p.sub === sub);
  const counts = {}; list.forEach(p => { const d = (p.attrs||{}).deal; if (d) counts[d] = (counts[d]||0) + 1; });
  const st = S.browse && S.browse.cat === cat ? S.browse : null;
  const cur = st && st.sub === sub ? (st.f||{}).deal || "" : null;
  const pick = d => { S.browse = {cat, sub, f: d ? {deal: d} : {}, r: st ? st.r || {} : {}}; go("/c/"+cat+"/list"); };
  const row = (d, name, n) => h("button",{type:"button",class:"mk-row md-row"+(d===""?" md-any":"")+(cur===d?" on":""),onclick:()=>pick(d)},
    h("span",{class:"mk-name",text:name}), n ? h("span",{class:"mk-n",text:String(n)}) : null,
    h("span",{class:"ar",text:cur===d ? "✓" : "›"}));
  page(h("div",{class:"silver-head"},
      h("button",{class:"sh-back","aria-label":t("back"),html:IC.back,onclick:()=>back("/c/"+cat)}),
      h("div",null, h("small",{text:catName(cat)}), h("h1",{text:subName(sub)}))),
    h("div",{class:"wrap"},
      h("div",{class:"dl-grid"}, ...opts.map(d => h("button",{type:"button",class:"dl-card"+(cur===d?" on":""),onclick:()=>pick(d)},
        h("img",{src:"deals/"+sub+"-"+d+".jpg",alt:"",loading:"lazy",onerror:e=>{ e.target.style.visibility="hidden"; }}),
        h("b",{text:dealName(sub, d)}), h("small",{text:counts[d] ? counts[d]+" "+t("dl_ads") : t("dl_none")})))),
      row("", t("dl_all"), list.length)));
}

/* ===== СПИСОК МОДЕЛЕЙ (после выбора марки, без эмблем) ===== */
async function viewModels(cat, sub, b){
  setTab("home", false);
  const here = location.hash;
  const wrap = h("div",{class:"wrap"});
  page(h("div",{class:"silver-head"},
      h("button",{class:"sh-back","aria-label":t("back"),html:IC.back,onclick:()=>back("/brands/"+cat+"/"+sub)}),
      h("div",null, h("small",{text:subName(sub)}), h("h1",{text:brandName(b)}))), wrap);
  await Promise.all([loadModels(), loadCatalog()]);
  if (location.hash !== here) return;
  const counts = {};
  const pop = (sub === "cars" || sub === "imported") ? ((POP_MODELS || CAR_MODELS)[b] || []) : [];
  const known = [...new Set([...modelsOf(sub, b), ...pop])];
  S.catalog.filter(p => p.cat === cat && p.sub === sub && (p.attrs||{}).brand === b)
    .forEach(p => { const m = canonName(known, (p.attrs||{}).model, b); if (m) counts[m] = (counts[m]||0) + 1; });
  const all = [...new Set([...known, ...Object.keys(counts)])].sort(modelSort);
  const st = S.browse && S.browse.cat === cat ? S.browse : null;
  const cur = st && st.sub === sub && (st.f||{}).brand === b ? st.f.model : null;
  // можно отметить несколько моделей галочками
  const sel = new Set(Array.isArray(cur) ? cur : cur ? [cur] : []);
  const show = ms => { const m = [...ms]; S.browse = {cat, sub, f: m.length ? {brand: b, model: m.length === 1 ? m[0] : m} : {brand: b}, r: st ? st.r || {} : {}}; go("/c/"+cat+"/list"); };
  const q = h("input",{class:"inp mk-q",type:"search",placeholder:"🔍  "+t("searchModel")});
  const list = h("div");
  const cnt = () => [...sel].reduce((a, m) => a + (counts[m] || 0), 0);
  const showBtn = h("button",{type:"button",class:"btn block md-show",onclick:()=>show(sel)});
  const bar = h("div",{class:"md-bar"}, showBtn);
  const upd = () => {
    bar.hidden = !sel.size;
    showBtn.textContent = t("showModels",{n: sel.size, c: cnt()});
    list.querySelectorAll(".md-row[data-m]").forEach(r => { const on = sel.has(r.dataset.m); r.classList.toggle("on", on); r.querySelector(".ck").textContent = on ? "☑" : "☐"; });
  };
  const row = m => h("button",{type:"button",class:"mk-row md-row","data-m":m,onclick:()=>{ sel.has(m) ? sel.delete(m) : sel.add(m); upd(); }},
    h("span",{class:"ck",text:"☐"}), h("span",{class:"mk-name",text:m}),
    counts[m] ? h("span",{class:"mk-n",text:String(counts[m])}) : null);
  const draw = () => {
    const v = q.value.trim().toLowerCase();
    const parts = [];
    if (v) parts.push(...all.filter(m => looseHas(m.toLowerCase(), v)).map(row));
    else {
      const total = Object.values(counts).reduce((a, x) => a + x, 0);
      parts.push(h("button",{type:"button",class:"mk-row md-row md-any"+(cur === "" || cur == null && st && (st.f||{}).brand === b ? " on" : ""),onclick:()=>show([])},
        h("span",{class:"mk-name",text:t("anyModel")}), total ? h("span",{class:"mk-n",text:String(total)}) : null,
        h("span",{class:"ar",text:"›"})));
      // сначала модели, которые уже продаются
      const have = all.filter(m => counts[m]);
      if (have.length) parts.push(h("div",{class:"mk-h",text:t("inSaleModels")}), ...have.map(row));
      const popIn = pop.filter(m => all.includes(m));
      if (popIn.length && all.length > popIn.length){
        parts.push(h("div",{class:"mk-h",text:t("popularModels")}), ...popIn.map(row), h("div",{class:"mk-h",text:t("allModels")}));
      }
      parts.push(...all.map(row));
    }
    list.replaceChildren(...parts);
    upd();
  };
  q.oninput = draw; draw();
  wrap.append(h("div",{class:"mk"}, q, list), bar);
}

/* ===== IMO ===== */
// У IMO нет ссылки «открыть чат с номером», поэтому: копируем номер и открываем приложение IMO.
async function openImo(phone){
  const num = "+993" + phone;
  try{ await navigator.clipboard.writeText(num); }catch(e){}
  toast(t("imoCopied",{n:phoneFmt(phone)}));
  const ua = navigator.userAgent;
  setTimeout(() => {
    if (/Android/i.test(ua)) location.href = "intent://#Intent;package=com.imo.android.imoim;end";
    else if (/iPhone|iPad|iPod/i.test(ua)) location.href = "imo://";
  }, 700);
}
function imoBtn(phone, label){
  return h("button",{class:"btn block ghost",style:{color:"#0f7bd8"},onclick:()=>openImo(phone)}, icon("imo"), label || t("writeImo"));
}
function adminContactSheet(reasonKey){
  return sheet((box) => {
    box.append(h("h2",{text:t(reasonKey === "forgotPin" ? "forgotPinQ" : "contactAdmin")}),
      h("p",{text:t(reasonKey === "forgotPin" ? "forgotPinHow" : "contactAdminSub")}),
      h("div",{style:{fontSize:"24px",fontWeight:"800",textAlign:"center",margin:"4px 0 16px"},text:phoneFmt(ADMIN_PHONE)}),
      h("div",{style:{display:"grid",gap:"10px"}},
        // чат с администратором прямо в приложении
        h("button",{class:"btn block",onclick:async()=>{ closeSheet(); if (await needAuth("authTitle")) go("/support"); }}, icon("chat"), t("chatAdmin")),
        imoBtn(ADMIN_PHONE, t("writeAdminImo")),
        h("a",{class:"btn block ghost",href:"tel:+993"+ADMIN_PHONE}, icon("phone"), t("call"))));
  });
}

/* ===== ВХОД / РЕГИСТРАЦИЯ ===== */
function rulesList(){
  return h("div",{class:"rules"}, h("ul",null, ...[1,2,3,4].map(i => h("li",{text:t("rule"+i)}))));
}
function smsCodeField(phoneIn, err, purpose){
  const input = h("input",{class:"inp",type:"text",inputmode:"numeric",maxlength:"4",placeholder:"••••",autocomplete:"one-time-code",style:{flex:"1"}});
  const btn = h("button",{type:"button",class:"btn ghost",text:t("getCode"),style:{whiteSpace:"nowrap"}});
  const hint = h("div",{class:"hint"});
  let timer = null;
  btn.onclick = async () => {
    const phone = digits(phoneIn.value);
    if (!validPhone(phone)) return err.textContent = t("e_phone");
    err.textContent = ""; btn.disabled = true;
    const r = await call("sendCode", {phone, purpose, token: null});
    if (!r.ok){ btn.disabled = false; return err.textContent = errText(r); }
    hint.textContent = t("codeSent",{phone}); input.focus();
    let left = 60; clearInterval(timer);
    btn.textContent = t("resendIn",{s:left});
    timer = setInterval(() => {
      left--;
      if (left <= 0 || !btn.isConnected){ clearInterval(timer); btn.disabled = false; btn.textContent = t("getCode"); }
      else btn.textContent = t("resendIn",{s:left});
    }, 1000);
  };
  const field = h("label",{class:"field"}, h("span",{text:t("smsCode")}),
    h("div",{style:{display:"flex",gap:"8px",alignItems:"center"}}, input, btn), hint);
  return {field, input};
}
function authSheet(reasonKey, startMode, startRole){
  return sheet((box, close) => {
    let mode = startMode || (lsGet("knownPhone") ? "login" : "reg");
    const body = h("div");
    const draw = () => {
      const err = h("div",{class:"err"});
      const phoneIn = h("input",{type:"tel",inputmode:"numeric",maxlength:"8",placeholder:"65 123456",autocomplete:"tel-national",value:lsGet("knownPhone","")||""});
      const pinIn = h("input",{class:"inp pin",type:"password",inputmode:"numeric",maxlength:"4",placeholder:"••••",autocomplete:mode==="reg"?"new-password":"current-password"});
      const phoneField = h("label",{class:"field"}, h("span",{text:t("phone")}), h("div",{class:"phone"}, h("b",{text:"+993"}), phoneIn));
      const seg = h("div",{class:"seg",style:{marginBottom:"16px"}},
        h("button",{class:mode==="reg"?"on":null,text:t("register"),onclick:()=>{ mode="reg"; draw(); }}),
        h("button",{class:mode==="login"?"on":null,text:t("login"),onclick:()=>{ mode="login"; draw(); }}));
      let submit;
      if (mode === "reset"){
        const sc = smsCodeField(phoneIn, err, "reset");
        submit = h("button",{class:"btn block",text:t("resetSave")});
        body.replaceChildren(seg,
          h("p",{class:"hint",style:{marginBottom:"12px"},text:t("resetSub")}),
          phoneField, sc.field,
          h("label",{class:"field"}, h("span",{text:t("pinNew")}), pinIn, h("div",{class:"hint",text:t("pinHint")})),
          err, submit,
          h("div",{style:{textAlign:"center",marginTop:"14px",display:"grid",gap:"10px"}},
            h("button",{class:"link",text:t("backToLogin"),onclick:()=>{ mode="login"; draw(); }}),
            h("button",{class:"link",text:t("askAdmin"),onclick:()=>adminContactSheet("forgotPin")})));
        submit.onclick = async () => {
          const phone = digits(phoneIn.value);
          if (!validPhone(phone)) return err.textContent = t("e_phone");
          if (!/^\d{4}$/.test(sc.input.value.trim())) return err.textContent = t("e_code");
          if (!/^\d{4}$/.test(pinIn.value)) return err.textContent = t("e_pin");
          submit.disabled = true;
          const r = await call("resetPin", {phone, code: sc.input.value.trim(), pin: pinIn.value, token: null});
          submit.disabled = false;
          if (!r.ok) return err.textContent = errText(r);
          lsSet("knownPhone", phone); saveAuth(r); toast(t("pinChanged")); close(true);
        };
      } else if (mode === "login"){
        submit = h("button",{class:"btn block",text:t("login")});
        body.replaceChildren(seg, phoneField, h("label",{class:"field"}, h("span",{text:t("pin4")}), pinIn), err, submit,
          h("div",{style:{textAlign:"center",marginTop:"14px"}},
            h("button",{class:"link",text:t("forgotPinQ"),onclick:()=>{ mode="reset"; draw(); }})));
        submit.onclick = async () => {
          const phone = digits(phoneIn.value);
          if (!validPhone(phone)) return err.textContent = t("e_phone");
          if (!/^\d{4}$/.test(pinIn.value)) return err.textContent = t("e_pin");
          submit.disabled = true;
          const r = await call("login", {phone, pin: pinIn.value, token: null});
          submit.disabled = false;
          if (!r.ok) return err.textContent = errText(r);
          lsSet("knownPhone", phone); saveAuth(r); toast(t("hello",{name:r.user.name})); close(true);
        };
      } else {
        let role = startRole || "buyer";
        const nameIn = h("input",{class:"inp",maxlength:"60",placeholder:t("namePh"),autocomplete:"name"});
        const nameLbl = h("span");
        const logo = logoPicker("");
        const logoField = h("div",{class:"field"}, h("span",{text:t("logoOpt")}), logo.el);
        const roleBox = h("div",{class:"roles"});
        const drawRole = () => {
          roleBox.replaceChildren(...["buyer","private","shop","online"].map(r => h("button",{type:"button",class:role===r?"on":null,onclick:()=>{ role = r; drawRole(); }},
            h("i",{text:{buyer:"🛍",private:"🙋",shop:"🏪",online:"🌐"}[r]}), t("role_"+r))));
          nameLbl.textContent = role === "shop" || role === "online" ? t("shopName") : t("yourName");
          nameIn.placeholder = role === "shop" || role === "online" ? t("namePh") : t("namePh2");
          logoField.hidden = !(role === "shop" || role === "online");
        };
        drawRole();
        const citySel = h("select",{class:"inp",required:true},
          h("option",{value:"",text:t("pickCity"),disabled:true,selected:true}), ...CITIES.map(c => h("option",{value:c,text:c})));
        const imo = h("input",{type:"checkbox",checked:true});
        const agree = h("input",{type:"checkbox"});
        submit = h("button",{class:"btn block",text:t("createAcc"),disabled:true});
        agree.onchange = () => submit.disabled = !agree.checked;
        const sc = smsCodeField(phoneIn, err, "reg"), codeIn = sc.input, codeField = sc.field;
        body.replaceChildren(seg,
          h("div",{class:"field"}, h("span",{text:t("whoAreYou")}), roleBox),
          h("label",{class:"field"}, nameLbl, nameIn),
          logoField,
          phoneField,
          codeField,
          h("label",{class:"field"}, h("span",{text:t("city")}), citySel),
          h("label",{class:"field"}, h("span",{text:t("pinNew")}), pinIn, h("div",{class:"hint",text:t("pinHint")})),
          h("label",{class:"check",style:{marginBottom:"14px"}}, imo, h("span",{text:t("hasImo")})),
          rulesList(),
          h("label",{class:"check"}, agree, h("span",{text:t("agree")})),
          err, submit);
        submit.onclick = async () => {
          const phone = digits(phoneIn.value), name = nameIn.value.trim();
          if (!name) return err.textContent = t("e_name");
          if (!validPhone(phone)) return err.textContent = t("e_phone");
          if (!citySel.value){ citySel.focus(); return err.textContent = t("e_city"); }
          if (!/^\d{4}$/.test(pinIn.value)) return err.textContent = t("e_pin");
          if (!/^\d{4}$/.test(codeIn.value.trim())) return err.textContent = t("e_code");
          submit.disabled = true;
          const r = await call("register", {name, phone, code: codeIn.value.trim(), city: citySel.value, imo: imo.checked, pin: pinIn.value, lang: S.lang, token: null,
            stype: role === "buyer" ? "" : role});
          submit.disabled = false;
          if (!r.ok) return err.textContent = errText(r);
          if (logo.data() && !logoField.hidden){
            const lr = await call("uploadLogo", {token: r.token, data: logo.data(), mime: "image/jpeg"});
            if (lr.ok) r.user.logo = lr.logo;
          }
          lsSet("knownPhone", phone); lsSet("rulesOk", 1); saveAuth(r); toast(t("welcome")); close(true);
        };
      }
      [phoneIn, pinIn].forEach(i => i.addEventListener("keydown", e => { if (e.key === "Enter") submit.click(); }));
    };
    draw();
    box.append(h("h2",{text:t(reasonKey || "authTitle")}), h("p",{text:t("authSub")}), body);
  });
}
async function needAuth(reasonKey){ if (S.token) return true; return !!(await authSheet(reasonKey)); }
async function needRules(){
  if (lsGet("rulesOk")) return true;
  return !!(await sheet((box, close) => {
    const agree = h("input",{type:"checkbox"});
    const ok = h("button",{class:"btn block",text:t("rulesBtn"),disabled:true,onclick:()=>{ lsSet("rulesOk",1); close(true); }});
    agree.onchange = () => ok.disabled = !agree.checked;
    box.append(h("h2",{text:t("rulesTitle")}), h("p",{text:t("rulesSub")}), rulesList(),
      h("label",{class:"check",style:{marginBottom:"16px"}}, agree, h("span",{text:t("agree")})), ok);
  }));
}

/* ===== КАРТОЧКА ТОВАРА В ЛЕНТЕ ===== */
function heartBtn(id, cls){
  const b = h("button",{class:(cls||"heart")+(S.favs.has(id)?" on":""),"aria-label":t("fav"),html:IC.heart});
  b.onclick = e => {
    e.preventDefault(); e.stopPropagation();
    if (S.favs.has(id)) S.favs.delete(id); else { S.favs.add(id); toast(t("favAdded")); }
    lsSet("favs", [...S.favs]);
    b.classList.toggle("on", S.favs.has(id));
  };
  return b;
}
function card(p, extra){
  return h("a",{class:"card"+(isVip(p)?" vip":""),href:"#/p/"+p.id},
    h("div",{class:"ph"}, isVip(p) ? h("span",{class:"vip-tag",text:"VIP"}) : null,
      p.thumb ? h("img",{src:p.thumb,alt:p.title,loading:"lazy",decoding:"async"}) : null,
      (p.cond === "used" && !NO_COND[p.cat]) || p.hasVideo ? h("div",{class:"tag-tl"},
        p.hasVideo ? h("span",{class:"tag vid",text:"▶ "+t("video")}) : null,
        p.cond === "used" && !NO_COND[p.cat] ? h("span",{class:"tag used",text:t("used")}) : null) : null,
      S.cardExtra ? S.cardExtra(p) : heartBtn(p.id),
      p.variants > 1 ? h("span",{class:"cnt",text:"🎨 "+t("nVariants",{n:p.variants})}) : p.photoCount > 1 ? h("span",{class:"cnt",text:"1/"+p.photoCount}) : null),
    h("div",{class:"bd"},
      h("div",{class:"tt",text:p.title}),
      priceEl(p.price, null, priceSuffix(p), p.cat),
      cardLine(p) ? h("div",{class:"car-line",text:cardLine(p)}) : null,
      h("div",{class:"mt"}, extra || null,
        p.rating ? h("span",{class:"rt"}, "★ "+p.rating.toFixed(1), h("small",{text:" ("+p.reviews+")"})) : null,
        h("span",{class:"mt-loc",text:"📍"+placeText(p)}), h("span",{text:"· "+ago(p.at)}))));
}
// карточка-строка (как в Aýterek): фото слева, справа цена, название, характеристики
function listCard(p){
  const a = p.attrs || {};
  const badges = [];
  if (a.exchange === "yes") badges.push(h("span",{class:"lb red",text:t("o_f_exchange")}));
  if (p.hasVideo) badges.push(h("span",{class:"lb dark",text:"▶ "+t("video")}));
  if (p.cond === "used" && !NO_COND[p.cat]) badges.push(h("span",{class:"lb amber",text:t("used")}));
  if (isVip(p)) badges.unshift(h("span",{class:"lb vip",text:"VIP"}));
  return h("a",{class:"lcard"+(isVip(p)?" vip":""),href:"#/p/"+p.id},
    h("div",{class:"lph"}, p.thumb ? h("img",{src:p.thumb,alt:p.title,loading:"lazy",decoding:"async"}) : null,
      badges.length ? h("div",{class:"lbs"}, ...badges) : null,
      p.photoCount > 1 ? h("span",{class:"cnt",text:"1/"+p.photoCount}) : null),
    h("div",{class:"lbd"},
      h("div",{class:"lrow"}, priceEl(p.price, null, priceSuffix(p), p.cat), S.cardExtra ? S.cardExtra(p) : heartBtn(p.id, "lheart")),
      h("div",{class:"ltt",text:p.title}),
      cardLine(p) ? h("div",{class:"car-line",text:cardLine(p)}) : null,
      h("div",{class:"lmt"}, p.rating ? h("span",{class:"rt",text:"★ "+p.rating.toFixed(1)}) : null,
        h("span",{class:"mt-loc",text:"📍"+placeText(p)}), h("span",{text:ago(p.at)}))));
}
// все фото объявления (для крупного вида) — один запрос на объявление, с запоминанием
const photoCache = {};
function productPhotos(id){
  return photoCache[id] || (photoCache[id] = call("product", {id}).then(r => r.ok && r.product ? (r.product.photos || []) : []));
}
let bigIO = null;
function bigObserver(){
  if (bigIO || !("IntersectionObserver" in window)) return bigIO;
  bigIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ bigIO.unobserve(e.target); e.target._more && e.target._more(); } }), {rootMargin:"300px"});
  return bigIO;
}
// крупная карточка: фото листаются вбок, следующее фото видно сбоку
function bigCard(p){
  const a = p.attrs || {};
  const open = () => go("/p/"+p.id);
  const first = p.thumb ? h("img",{src:p.thumb,alt:p.title,loading:"lazy",decoding:"async"}) : h("div",{class:"bc-empty"});
  const track = h("div",{class:"bc-track"+(p.photoCount > 1 ? " multi" : "")}, first);
  const cnt = p.photoCount > 1 ? h("span",{class:"cnt",text:"1/"+p.photoCount}) : null;
  let moved = false;
  track.addEventListener("pointerdown", () => { moved = false; });
  track.addEventListener("scroll", () => {
    moved = true;
    const w = track.firstElementChild ? track.firstElementChild.offsetWidth + 6 : 1;
    if (cnt) cnt.textContent = Math.min(p.photoCount, Math.round(track.scrollLeft / w) + 1) + "/" + p.photoCount;
  }, {passive:true});
  track.addEventListener("click", () => { if (!moved) open(); });
  const badges = [];
  if (a.exchange === "yes") badges.push(h("span",{class:"lb red",text:t("o_f_exchange")}));
  if (p.hasVideo) badges.push(h("span",{class:"lb dark",text:"▶ "+t("video")}));
  if (p.cond === "used" && !NO_COND[p.cat]) badges.push(h("span",{class:"lb amber",text:t("used")}));
  if (isVip(p)) badges.unshift(h("span",{class:"lb vip",text:"VIP"}));
  const el = h("div",{class:"bcard"+(isVip(p)?" vip":"")},
    h("div",{class:"bc-gal"}, track, S.cardExtra ? S.cardExtra(p) : heartBtn(p.id), cnt, badges.length ? h("div",{class:"lbs"}, ...badges) : null),
    h("a",{class:"bc-bd",href:"#/p/"+p.id},
      priceEl(p.price, null, priceSuffix(p), p.cat),
      h("div",{class:"bc-tt",text:p.title}),
      cardLine(p) ? h("div",{class:"car-line",text:cardLine(p)}) : null,
      h("div",{class:"lmt"}, h("span",{class:"mt-loc",text:"📍"+placeText(p)}), h("span",{text:ago(p.at)}))));
  if (p.photoCount > 1){
    el._more = () => productPhotos(p.id).then(ph => {
      ph.slice(0, 10).forEach((x, i) => {
        const src = x.url || x.thumb; if (!src) return;
        if (i === 0){ if (first.tagName === "IMG" && x.url) first.src = x.url; return; }
        track.append(h("img",{src,alt:p.title+" "+(i+1),loading:"lazy",decoding:"async"}));
      });
    });
    const io = bigObserver(); if (io) io.observe(el); else el._more();
  }
  return el;
}
function viewMode(){ const m = lsGet("view", "list"); return m === "grid" || m === "big" ? m : "list"; }
// выбор вида: три кнопки (плитка / крупно / список)
function viewSwitch(onPick){
  const cur = viewMode();
  return h("div",{class:"vsw"}, ...[["grid",IC.grid,t("vGrid")],["big",IC.big,t("vBig")],["list",IC.rows,t("vList")]].map(([k, ic, l]) =>
    h("button",{type:"button",class:"vsw-b"+(cur===k?" on":""),"aria-label":l,title:l,onclick:()=>{ lsSet("view", k); onPick(k); }}, h("span",{html:ic}), h("small",{text:l}))));
}
// маленький переключатель вида прямо над лентой (без всплывающего окна)
function viewMini(onPick){
  const cur = viewMode();
  return h("div",{class:"vmini"}, ...[["big",IC.big,t("vBig")],["grid",IC.grid,t("vGrid")],["list",IC.rows,t("vList")]].map(([k, ic, l]) =>
    h("button",{type:"button",class:cur===k?"on":null,"aria-label":l,title:l,onclick:()=>{ lsSet("view", k); onPick(k); }}, h("span",{html:ic}))));
}
// строка над лентой: велаят + вид
function listTools(onChange, noCity){
  return h("div",{class:"ltools"}, noCity ? h("div",{class:"sp"}) : cityPick(onChange), viewMini(onChange));
}
// лента с подгрузкой при прокрутке
function feed(list, emptyEl, extraFn, mode){
  const grid = h("div",{class: mode === "list" ? "lgrid" : mode === "big" ? "bgrid" : "grid"});
  const wrap = h("div",null, grid);
  if (!list.length){ wrap.replaceChildren(emptyEl || emptyBox("🔎", t("nothing"), t("nothingSub"))); return wrap; }
  let shown = 0, io = null;
  const more = h("button",{class:"more",text:t("showMore")});
  const add = () => {
    list.slice(shown, shown + PAGE).forEach(p => grid.append(mode === "list" ? listCard(p) : mode === "big" ? bigCard(p) : card(p, extraFn ? extraFn(p) : null)));
    shown += PAGE;
    if (shown >= list.length){ more.remove(); io && io.disconnect(); }
  };
  more.onclick = add;
  add();
  if (shown < list.length){
    wrap.append(more);
    if ("IntersectionObserver" in window){
      io = new IntersectionObserver(es => { if (es[0].isIntersecting) add(); }, {rootMargin:"600px"});
      io.observe(more);
    }
  }
  return wrap;
}
function emptyBox(emoji, title, sub, btn){
  return h("div",{class:"empty"}, h("div",{class:"big",text:emoji}), h("h3",{text:title}), sub ? h("p",{text:sub}) : null, btn || null);
}
function sortList(list){
  let l = S.city ? list.filter(p => p.city === S.city) : list.slice();
  if (S.sort === "cheap") l.sort((a,b) => a.price - b.price);
  else if (S.sort === "exp") l.sort((a,b) => b.price - a.price);
  else if (S.sort === "new") l.sort((a,b) => a.at < b.at ? 1 : -1);
  else l = recommend(l);
  if (S.sort === "rec" || S.sort === "new") l = l.filter(isVip).concat(l.filter(p => !isVip(p)));
  return l;
}
// «Рекомендуем»: свежие товары + чуть перемешаны, чтобы лента была живой (каждый день по-новому)
function recommend(list){
  const seed = Math.floor(Date.now() / 864e5);
  const score = p => {
    const ageDays = (Date.now() - new Date(p.at)) / 864e5;
    let x = 0; for (const ch of p.id + seed) x = (x * 31 + ch.charCodeAt(0)) % 9973;
    return -ageDays * 0.35 + (x / 9973) * 4 + (S.favs.has(p.id) ? 1 : 0) + (p.photoCount > 2 ? 0.5 : 0);
  };
  return list.map(p => [score(p), p]).sort((a,b) => b[0] - a[0]).map(x => x[1]);
}
// выбор велаята (сортировки «Для вас / Новые / Дешевле / Дороже» убраны — VIP всегда сверху)
function cityPick(onChange){
  const city = h("select",{class:"chip city-pick"+(S.city?" on":""),"aria-label":t("city")},
    h("option",{value:"",text:"📍 "+t("allCities")}), ...CITIES.map(c => h("option",{value:c,text:"📍 "+c,selected:S.city===c})));
  city.onchange = () => { S.city = city.value; onChange(); };
  return city;
}
function filterBar(onChange, noCity){ return listTools(onChange, noCity); }
function textMatch(p, words){
  const at = p.attrs || {};
  const sub = p.sub ? T.ru["sub_"+p.sub]+" "+T.tm["sub_"+p.sub]+" "+T.en["sub_"+p.sub] : "";
  const atxt = Object.values(at).map(v => Array.isArray(v) ? v.join(" ") : v).join(" ");
  const hay = (atxt+" "+p.title+" "+catName(p.cat)+" "+T.ru["cat_"+p.cat]+" "+T.tm["cat_"+p.cat]+" "+T.en["cat_"+p.cat]+" "+sub+" "+(at.brand||"")+" "+(at.model||"")+" "+(at.year||"")+" "+p.city+" "+(p.place||"")+" "+p.sellerName).toLowerCase();
  return words.every(w => looseHas(hay, w));
}

/* ===== ГЛАВНАЯ ===== */
function searchBox(q){
  const inp = h("input",{type:"search",enterkeyhint:"search",placeholder:t("searchPh"),value:q||"","aria-label":t("searchPh")});
  const run = () => { const v = inp.value.trim(); go(v ? "/q/"+encodeURIComponent(v) : "/"); };
  inp.addEventListener("keydown", e => { if (e.key === "Enter"){ inp.blur(); run(); } });
  return h("div",{class:"search"}, h("span",{html:IC.search}), inp,
    h("a",{class:"cam",href:"#/photo","aria-label":t("tPhoto"),html:IC.cam}),
    h("button",{class:"go",text:t("find"),onclick:run}));
}
function viewHome(q){
  setTab(q ? "" : "home");
  const words = (q || "").toLowerCase().split(/\s+/).filter(Boolean);
  const listBox = h("div"), catsBox = h("div"), stripBox = h("div"), placeBox = h("div",{class:"wrap"});
  // сверху: маленькие категории → поиск → велаят и торговый центр
  const head = h("div",{class:"top"}, h("div",{class:"wrap"},
    h("div",{class:"top-row"}, h("a",{class:"brand",href:"#/"}, h("i",{text:"🛍"}), APP_NAME), langSwitch())),
    q ? null : stripBox,
    h("div",{class:"wrap"}, searchBox(q)),
    placeBox);
  const draw = () => {
    let list = S.catalog;
    if (words.length) list = list.filter(p => textMatch(p, words));
    else if (S.homeCat) list = list.filter(p => p.cat === S.homeCat);
    if (S.city) list = list.filter(p => p.city === S.city);
    if (S.mall) list = list.filter(p => (p.attrs || {}).mall === S.mall);
    const sorted = sortList(list);
    if (!q){ stripBox.replaceChildren(homeCatStrip(draw)); catsBox.replaceChildren(homeShops(S.homeCat)); }
    placeBox.replaceChildren(placePick(draw));
    listBox.replaceChildren(
      h("div",{class:"sec"},
        q ? h("div",{class:"sec-h"}, h("h2",{text:t("results",{n:list.length})})) : null,
        h("div",{class:"ltools"}, h("small",{class:"lt-n",text:t("results",{n:list.length})}), viewMini(draw)),
        feed(sorted, !S.catalog.length && S.catalogLoading ? h("div",{class:"empty"}, h("div",{class:"spin"})) :
          q ? emptyBox("🔎", t("nothingQ",{q}), t("nothingSub"), h("a",{class:"btn soft",href:"#/photo",text:t("tryPhoto")})) :
          (S.city || S.mall) ? emptyBox("🔎", t("nothing"), t("nothingSub")) : null, null, viewMode())));
  };
  page(isDemo ? h("div",{class:"demo",text:t("demo")}) : null, head,
    h("div",{class:"wrap"}, catsBox, listBox));
  draw();
  loadCatalog().then(draw);
}
// главная: велаят и торговый центр / рынок (ТЦ — из выбранного велаята или все)
function placePick(onChange){
  const city = h("select",{class:"pp-sel"+(S.city?" on":""),"aria-label":t("city")},
    h("option",{value:"",text:"📍 "+t("allCities")}), ...CITIES.map(c => h("option",{value:c,text:"📍 "+c,selected:S.city===c})));
  city.onchange = () => { S.city = city.value; if (S.mall && S.city && !mallsOf(S.city).includes(S.mall)) S.mall = ""; onChange(); };
  const cities = S.city ? [S.city] : CITIES;
  // в списке — ТЦ из справочника и те, что указаны в объявлениях
  const used = {}; S.catalog.forEach(p => { const m = (p.attrs || {}).mall; if (m && (!S.city || p.city === S.city)) (used[p.city] = used[p.city] || new Set()).add(m); });
  const groups = cities.map(c => [c, [...new Set([...mallsOf(c), ...(used[c] || [])])].sort()]).filter(([, l]) => l.length);
  const mall = h("select",{class:"pp-sel"+(S.mall?" on":""),"aria-label":t("mallF")},
    h("option",{value:"",text:"🏬 "+t("mallAll")}),
    ...groups.map(([c, l]) => h("optgroup",{label:c}, ...l.map(m => h("option",{value:m,text:m,selected:S.mall===m})))));
  mall.onchange = () => {
    S.mall = mall.value;
    if (S.mall && !S.city){ const g = groups.find(([, l]) => l.includes(S.mall)); if (g) S.city = g[0]; }
    onChange();
  };
  return h("div",{class:"pp"}, city, mall);
}
// главная: VIP-магазины и все магазины (категории — во вкладке «Категории» внизу)
function shopTile(x){
  return h("a",{class:"shop-t"+(x.vip?" vip":""),href:"#/u/"+x.id},
    h("div",{class:"shop-ph"}, x.thumb ? h("img",{src:x.thumb,alt:"",loading:"lazy",decoding:"async"}) : null,
      x.vip ? h("span",{class:"vip-tag",text:"VIP"}) : null),
    avaEl(x.name, x.logo, "sm"),
    h("b",{text:x.name}), h("small",{text:t("nShopGoods",{n:x.n})+" · "+x.city}));
}
// цены VIP (в монетах): {shop: {7: 30, 15: 55, 30: 100}, item: 10, itemDays: 7}
function hasVipPrices(){ const v = S.vipPrices || {}; return +v.item > 0 || Object.values(v.shop || {}).some(x => +x > 0); }
function coins(n){ return fmt(n) + " " + t("coinsW"); }
function adminContactBtns(){
  return [h("div",{style:{fontSize:"18px",fontWeight:"700",textAlign:"center",margin:"4px 0 14px"},text:"☎️ "+phoneFmt(ADMIN_PHONE)}),
    h("div",{style:{display:"grid",gap:"10px"}},
      imoBtn(ADMIN_PHONE, t("writeAdminImo")),
      h("a",{class:"btn block ghost",href:"tel:+993"+ADMIN_PHONE}, icon("phone"), t("call")))];
}
// пополнить баланс — переписка с администратором в приложении (скриншот оплаты)
function topUpSheet(){ closeSheet(); go("/topup"); }
// спросить «списать N монет?»
function payConfirm(title, price, sub){
  return sheet((box, close) => box.append(h("h2",{text:title}),
    h("p",{text:t("payQ",{p:coins(price)})}), sub ? h("p",{class:"hint",text:sub}) : null,
    h("div",{class:"bal-line"}, "🪙 ", t("yourBal",{b:coins(S.balance)})),
    h("div",{style:{display:"grid",gap:"10px"}},
      h("button",{class:"btn block",text:t("payBal")+" · "+coins(price),onclick:()=>close(true)}),
      h("button",{class:"btn block ghost",text:t("cancel"),onclick:()=>close(false)}))));
}
// VIP-магазин: все объявления продавца жёлтые и выше всех; 7 / 15 / 30 дней
async function shopVipSheet(onDone){
  const pr = (S.vipPrices || {}).shop || {}, bal = +S.balance || 0;
  const opts = [7,15,30].filter(d => +pr[d] > 0);
  if (!opts.length) return vipInfoSheet();
  const days = await sheet((box, close) => box.append(h("h2",{text:"⭐ "+t("vipShopT")}), h("p",{text:t("vipShopAbout")}),
    S.shopVip && new Date(S.shopVip) > Date.now() ? h("div",{class:"bal-line"}, "⭐ ", t("vipUntil",{d:dayName(S.shopVip)})) : null,
    h("div",{class:"bal-line"}, "🪙 ", t("yourBal",{b:coins(bal)})),
    h("div",{style:{display:"grid",gap:"10px"}},
      ...opts.map(d => h("button",{class:"btn block vip-buy"+(bal < pr[d] ? " ghost" : ""),disabled:bal < pr[d] || null,onclick:()=>close(d)},
        h("span",{text:t("vipBuy",{d})}), h("b",{text:coins(pr[d])}))),
      opts.some(d => +pr[d] > bal) ? h("button",{class:"btn block soft",text:"🪙 "+t("needTopUp"),onclick:()=>{ close(0); topUpSheet(); }}) : null)));
  if (!days) return;
  if (!await payConfirm("⭐ "+t("vipShopT")+" · "+t("vipBuy",{d:days}), pr[days])) return;
  const r = await call("buyVip", {shop: true, days});
  if (!r.ok) return toast(errText(r));
  S.balance = r.balance; S.shopVip = r.shopVip; S.catalogAt = 0;
  S.catalog.forEach(p => { if (S.user && p.user === S.user.id && !(p.vip > r.shopVip)) p.vip = r.shopVip; });
  toast(t("vipBought",{d:dayName(r.shopVip)}));
  onDone && onDone();
}
// VIP только для одного объявления (из своего магазина)
async function itemVipSheet(p, onDone){
  const pr = S.vipPrices || {}, bal = +S.balance || 0, price = +pr.item || 0, days = pr.itemDays || 7;
  if (!price) return vipInfoSheet(p, onDone);
  const ok = await sheet((box, close) => box.append(h("h2",{text:"⭐ "+t("vipTitle")}),
    h("div",{class:"iv-prod"}, p.thumb ? h("img",{src:p.thumb,alt:""}) : null, h("b",{text:p.title})),
    h("p",{text:t("vipItemAbout",{d:days})}),
    isVip(p) ? h("div",{class:"bal-line"}, "⭐ ", t("vipUntil",{d:dayName(p.vip)})) : null,
    h("div",{class:"bal-line"}, "🪙 ", t("yourBal",{b:coins(bal)})),
    h("div",{style:{display:"grid",gap:"10px"}},
      h("button",{class:"btn block vip-buy"+(bal < price ? " ghost" : ""),disabled:bal < price || null,onclick:()=>close(true)},
        h("span",{text:(isVip(p) ? "＋ " : "")+t("vipBuy",{d:days})}), h("b",{text:coins(price)})),
      bal < price ? h("button",{class:"btn block soft",text:"🪙 "+t("needTopUp"),onclick:()=>{ close(false); topUpSheet(); }}) : null)));
  if (!ok) return;
  const r = await call("buyVip", {id: p.id});
  if (!r.ok) return toast(errText(r));
  S.balance = r.balance; p.vip = r.vip; const c = byId(p.id); if (c) c.vip = r.vip;
  S.catalogAt = 0; toast(t("vipBought",{d:dayName(r.vip)}));
  onDone && onDone();
}
// VIP одного объявления (10 монет на 7 дней) или всего магазина; если цен нет — связаться с администратором
async function vipInfoSheet(p, onDone){
  const pr = S.vipPrices || {};
  if (p && hasVipPrices()){
    const bal = +S.balance || 0, price = +pr.item || 0, days = pr.itemDays || 7;
    const what = await sheet((box, close) => box.append(h("h2",{text:"⭐ "+t("vipTitle")}), h("p",{text:t("vipAbout")}),
      h("div",{class:"bal-line"}, "🪙 ", t("yourBal",{b:coins(bal)})),
      h("div",{style:{display:"grid",gap:"10px"}},
        price ? h("button",{class:"btn block vip-buy"+(bal < price ? " ghost" : ""),disabled:bal < price || null,onclick:()=>close("item")},
          h("span",{text:t("vipItemBuy",{d:days})}), h("b",{text:coins(price)})) : null,
        h("button",{class:"btn block soft",onclick:()=>close("shop")}, "⭐ ", t("vipShopBtn")),
        bal < price ? h("button",{class:"btn block soft",text:"🪙 "+t("needTopUp"),onclick:()=>{ close(0); topUpSheet(); }}) : null)));
    if (what === "shop") return shopVipSheet(onDone);
    if (what !== "item") return;
    if (!await payConfirm("⭐ "+t("vipItemBuy",{d:days}), price, p.title)) return;
    const r = await call("buyVip", {id: p.id});
    if (!r.ok) return toast(errText(r));
    S.balance = r.balance; p.vip = r.vip; const c = byId(p.id); if (c) c.vip = r.vip;
    S.catalogAt = 0; toast(t("vipBought",{d:dayName(r.vip)}));
    onDone && onDone();
    return;
  }
  return sheet((box) => {
    box.append(h("h2",{text:"⭐ "+t("vipTitle")}), h("p",{text:t("vipAbout")}),
      p ? h("p",{text:t("vipHowTo")}) : h("p",{class:"hint",text:t("vipSeller")}),
      p ? h("div",{style:{fontSize:"24px",fontWeight:"800",textAlign:"center",margin:"0 0 14px"},text:p.id}) : null,
      ...adminContactBtns());
  });
}
// главная: маленькие категории с картинками («Все», «Обувь»…) — фильтруют VIP-магазины и ленту ниже
function homeCatStrip(redraw){
  const pick = id => { S.homeCat = id; redraw(); };
  const strip = h("div",{class:"cat-scroll home-strip"},
    h("button",{type:"button",class:"cs"+(!S.homeCat?" on":""),onclick:()=>pick("")}, catTile("all"), h("span",{text:t("allGoods")})),
    ...CATS.map(c => h("button",{type:"button",class:"cs"+(S.homeCat===c.id?" on":""),"data-c":c.id,onclick:()=>pick(c.id)},
      catTile(c.id), h("span",{text:catName(c.id)}))));
  // выбранная категория — в поле зрения
  requestAnimationFrame(() => { const on = strip.querySelector(".cs.on"); if (on && S.homeCat) strip.scrollLeft = on.offsetLeft - 12; });
  return strip;
}
// главная: VIP-магазины в один ряд, листаются пальцем вправо
// главная: один ряд круглых значков, листается вправо:
// ⭐ VIP-магазины → все VIP (с поиском), 🏪 Все магазины → все магазины (с поиском), дальше — сами магазины (VIP первыми)
function shopCircle(x){
  const pic = x.logo || x.thumb;
  return h("a",{class:"sc"+(x.vip?" vip":""),href:"#/u/"+x.id,onclick:()=>{ S.shopPre = {cat: S.homeCat || ""}; }},
    h("span",{class:"sc-ring"}, pic ? h("img",{src:pic,alt:"",loading:"lazy",decoding:"async"}) : h("i",{text:initials(x.name)}),
      x.vip ? h("em",{text:"VIP"}) : null),
    h("span",{class:"sc-t",text:x.name}));
}
function homeShops(cat){
  const vip = shopsList(cat, S.city, S.mall).filter(x => x.vip);
  return h("div",{class:"home-shops sc-row"},
    h("a",{class:"sc vip-all",href:"#/shops/vip"},
      h("span",{class:"sc-ring"}, h("i",{text:"⭐"}), vip.length ? h("b",{class:"sc-n",text:String(vip.length)}) : null),
      h("span",{class:"sc-t",text:t("vipShops")})),
    ...vip.map(shopCircle));
}
// список магазинов: круглое фото, название, сколько товаров
function shopLine(x){
  const pic = x.logo || x.thumb;
  return h("a",{class:"shop-line"+(x.vip?" vip":""),href:"#/u/"+x.id,onclick:()=>{ S.shopPre = {cat: S.homeCat || ""}; }},
    h("span",{class:"sc-ring"}, pic ? h("img",{src:pic,alt:"",loading:"lazy",decoding:"async"}) : h("i",{text:initials(x.name)})),
    h("span",{class:"sl-in"}, h("b",null, x.name, x.vip ? h("em",{class:"vip-tag-i",text:"VIP"}) : null),
      h("small",{text:t("nShopGoods",{n:x.n})+" · "+x.city+(x.malls && x.malls.size ? " · 🏬 "+[...x.malls].slice(0,2).join(", ") : "")}),
      x.cats && x.cats.size ? h("span",{class:"sl-cats"}, ...[...x.cats].slice(0,4).map(c => h("i",{text:catOf(c).e+" "+catName(c)}))) : null),
    h("span",{class:"ar",text:"›"}));
}
function viewShops(vipOnly){
  setTab("home");
  let q = "";
  const box = h("div",{class:"shops-list"}), stripBox = h("div"), placeBox = h("div");
  const qIn = h("input",{type:"search",enterkeyhint:"search",placeholder:t("searchShopName"),"aria-label":t("searchShopName")});
  qIn.oninput = () => { q = qIn.value.trim().toLowerCase(); drawList(); };
  const drawList = () => {
    const list = shopsList(S.homeCat, S.city, S.mall).filter(x => (!vipOnly || x.vip) && (!q || looseHas(String(x.name).toLowerCase(), q)));
    const any = S.homeCat || S.city || S.mall || q;
    box.replaceChildren(...(list.length ? list.map(shopLine) :
      [emptyBox(any ? "🔎" : "🏪", any ? t("shopsNone") : vipOnly ? t("vipNone") : t("shopsEmpty"))]));
  };
  const draw = () => { stripBox.replaceChildren(homeCatStrip(draw)); placeBox.replaceChildren(placePick(draw)); drawList(); };
  page(topBar((vipOnly ? "⭐ " : "") + t(vipOnly ? "vipShops" : "allShops"),
      {right: vipOnly ? h("button",{class:"btn sm ghost",text:"?",onclick:()=>vipInfoSheet()}) : null}),
    h("div",{class:"shops-top"}, stripBox,
      h("div",{class:"wrap"}, h("div",{class:"shops-q"}, h("div",{class:"search"}, h("span",{html:IC.search}), qIn))),
      h("div",{class:"wrap"}, placeBox)),
    h("div",{class:"wrap"}, box));
  draw(); loadCatalog().then(draw);
}
// (старое) категории крупными фото-карточками в 2 ряда
function homeCats(){
  return h("div",{class:"home-cats"},
    h("div",{class:"sec-h",style:{padding:"0 12px"}}, h("h2",{text:t("tCats")}), h("div",{class:"sp"}), h("a",{class:"lnk-red",href:"#/cats",text:t("allCats")})),
    h("div",{class:"pt-row big two-rows",style:{gridTemplateColumns:"repeat("+Math.ceil(CATS.length/2)+",108px)"}}, ...CATS.map(c => {
      const n = S.catalog.filter(p => p.cat === c.id).length;
      return photoTile("cat:"+c.id, catName(c.id), false, () => go("/c/"+c.id), n || null, c.id);
    })));
}
function catsRow(active){
  return h("div",{class:"cats"}, ...CATS.map(c =>
    h("a",{class:"cat"+(active===c.id?" on":""),href:"#/c/"+c.id}, h("b",{style:{background:c.c},text:c.e}), h("span",{text:catName(c.id)}))));
}
function viewBrowse(catId, listMode){
  setTab("cats");
  const st = S.browse = (S.browse && S.browse.cat === catId) ? S.browse : {cat: catId, sub: "", f: {}, r: {}};
  // компактный вид: категории скрыты, сверху — быстрые фильтры (после выбора марки/модели)
  const compact = !!(listMode && catId && st.sub);
  const subRow = h("div");
  const body = h("div",{class:"sec"});
  const topFilt = h("button",{class:"btn sm soft top-filt",onclick:()=>filtersSheet()});
  const catScroll = h("div",{class:"cat-scroll"},
    h("a",{class:"cs"+(!catId?" on":""),href:"#/cats"}, catTile("all"), h("span",{text:t("allGoods")})),
    ...CATS.map(c => h("a",{class:"cs"+(catId===c.id?" on":""),href:"#/c/"+c.id,"data-c":c.id},
      catTile(c.id), h("span",{text:catName(c.id)}))));
  const qBox = h("div",{class:"qchips"});
  const cTitle = h("div",{class:"bh-title"});
  const head = compact ? h("div",{class:"browse-head cmp"}, h("div",{class:"wrap"},
      h("div",{class:"top-row bh-row"},
        h("button",{class:"icon-btn","aria-label":t("back"),html:IC.back,onclick:()=>{ st.f = {}; go("/c/"+catId); }}), cTitle, topFilt),
      qBox)) :
    h("div",{class:"browse-head"},
    h("div",{class:"wrap"},
      h("div",{class:"top-row bh-row"}, catId ? h("button",{class:"icon-btn","aria-label":t("back"),html:IC.back,onclick:()=>go("/cats")}) : null,
        h("div",{class:"bh-title",text:catId ? catName(catId) : t("tCats")}), topFilt),
      catScroll, subRow));
  const base = () => catId ? S.catalog.filter(p => p.cat === catId) : S.catalog;
  st.f = st.f || {}; st.r = st.r || {};
  const fval = (p, k) => (p.attrs || {})[k];
  const hasVal = (p, k, v) => { const x = fval(p, k); return Array.isArray(x) ? x.includes(v) : k === "model" ? modelIn(p, v) : x === v; };
  const ctxA = () => Object.assign({}, st.f);
  const applyF = (list, skip) => list.filter(p => {
    if (st.sub && p.sub !== st.sub) return false;
    if (S.city && p.city !== S.city) return false;
    for (const k in st.f) if (k !== skip && st.f[k] && !hasVal(p, k, st.f[k])) return false;
    const r = st.r;
    if (r.pmin && p.price < +r.pmin) return false; if (r.pmax && p.price > +r.pmax) return false;
    const a = p.attrs || {};
    if (r.ymin && !(+a.year >= +r.ymin)) return false; if (r.ymax && !(+a.year <= +r.ymax)) return false;
    if (r.amin && !(+a.area >= +r.amin)) return false; if (r.amax && !(+a.area <= +r.amax)) return false;
    return true;
  });
  const nActive = () => Object.values(st.f).filter(Boolean).length + Object.values(st.r).filter(Boolean).length + (S.city ? 1 : 0);
  const filterFields = kind => catId ? fieldsFor(catId, st.sub, ctxA()).filter(f => f.filter === kind) : [];
  // кнопки значений, которые есть в товарах (с количеством)
  const valueChips = (f, list, onPick) => {
    const counts = {};
    list.forEach(p => { const v = fval(p, f.k); (Array.isArray(v) ? v : v ? [v] : []).forEach(x => counts[x] = (counts[x] || 0) + 1); });
    let vals = optsOf(f, st.sub, ctxA()).filter(v => counts[v]);
    Object.keys(counts).forEach(v => { if (!vals.includes(v)) vals.push(v); });
    return vals.map(v => h("button",{class:"chip"+(st.f[f.k]===v?" on":""),onclick:()=>onPick(st.f[f.k]===v ? "" : v)},
      optLabel(f, v)+(f.unit && f.type==="sel" ? " "+f.unit : ""), h("small",{text:" "+counts[v]})));
  };
  const drawSubs = () => {
    const rows = [];
    if (catId && SUBS[catId]){
      const list = base();
      rows.push(h("div",{class:"pt-row big"+(SUBS[catId].length > 4 ? " two-rows" : ""),style:SUBS[catId].length > 4 ? {gridTemplateColumns:"repeat("+Math.ceil(SUBS[catId].length/2)+",108px)"} : null},
        ...SUBS[catId].map(k => { const n = list.filter(p => p.sub === k).length;
          return photoTile("sub:"+catId+":"+k, subName(k), st.sub===k, ()=>{
            if (catId === "auto" && VEHICLE_SUBS[k]){ st.sub = k; st.f = {}; go("/brands/auto/"+k); return; }
            if (catId === "realty"){ st.sub = k; st.f = {}; go("/deal/realty/"+k); return; }
            st.sub = k; st.f = {}; go("/c/"+catId+"/list"); }, n, catId); })));
    }
    filterFields("main").forEach(f => {
      if (f.k === "brand" && catId === "auto" && VEHICLE_SUBS[st.sub]){
        const b = st.f.brand;
        rows.push(h("div",{class:"mk-pick-wrap"}, h("button",{class:"mk-pick",onclick:()=>go("/brands/auto/"+st.sub)},
          b ? makeLogo(b) : anyLogo(st.sub === "trucks" ? TRUCK_BRANDS : st.sub === "buses" ? BUS_BRANDS : st.sub === "special" ? SPECIAL_BRANDS : CAR_BRANDS),
          h("span",null, h("small",{text:t("makeBtn")}), h("b",{text: b ? brandName(b) : t("anyMake")})), h("span",{class:"ar",text:"›"})),
          b ? h("button",{class:"chip",text:"✕",onclick:()=>{ st.f = {}; draw(); }}) : null));
        if (b && b !== "other"){
          if (!MODELS) loadModels().then(d => { if (d && S.browse === st) draw(); });
          else if (modelsOf(st.sub, b).length || st.f.model)
            rows.push(h("div",{class:"mk-pick-wrap"}, h("button",{class:"mk-pick md-pick",onclick:()=>go(modelsHref("auto", st.sub, b))},
              h("span",null, h("small",{text:t("f_model")}), h("b",{text: modelLabel(st.f.model) || t("anyModel")})), h("span",{class:"ar",text:"›"})),
              st.f.model ? h("button",{class:"chip",text:"✕",onclick:()=>{ delete st.f.model; draw(); }}) : null));
        }
        return;
      }
      if (f.k === "brand" && (catId === "auto" || catId === "autoparts")){
        const list = applyF(base(), "brand"), counts = {};
        list.forEach(p => { const b = (p.attrs||{}).brand; if (b) counts[b] = (counts[b] || 0) + 1; });
        const brands = Object.keys(counts).sort((x, y) => counts[y] - counts[x]);
        if (brands.length) rows.push(h("div",{class:"pt-row big brands"+(brands.length > 4 ? " two-rows" : ""),style:brands.length > 4 ? {gridTemplateColumns:"repeat("+Math.ceil(brands.length/2)+",108px)"} : null}, ...brands.map(b =>
          photoTile("brand:"+b, brandName(b), st.f.brand===b, ()=>{ st.f.brand = st.f.brand===b ? "" : b; delete st.f.model; draw(); }, counts[b], catId))));
        return;
      }
      const chips = valueChips(f, applyF(base(), f.k), v => { st.f[f.k] = v; if (f.k === "brand") delete st.f.model; draw(); });
      if (chips.length) rows.push(h("div",{class:"chips sub-chips"}, h("span",{class:"chip-lbl",text:fieldLabel(f)+":"}), ...chips));
    });
    subRow.replaceChildren(...rows);
  };
  const filtersSheet = () => sheet((box, close) => {
    const body2 = h("div");
    const showBtn = h("button",{class:"btn block"});
    const upd = () => { showBtn.textContent = t("showN",{n: applyF(base()).length}); };
    const rangeRow = (label, kmin, kmax) => {
      const a = h("input",{class:"inp",type:"number",inputmode:"numeric",placeholder:label,value:st.r[kmin]||""});
      const b = h("input",{class:"inp",type:"number",inputmode:"numeric",placeholder:t("to"),value:st.r[kmax]||""});
      a.oninput = () => { st.r[kmin] = a.value; upd(); }; b.oninput = () => { st.r[kmax] = b.value; upd(); };
      return h("div",{class:"two",style:{marginBottom:"14px"}}, a, b);
    };
    const drawBody = () => {
      const flds = catId ? fieldsFor(catId, st.sub, ctxA()) : [];
      const lbl = txt => h("div",{class:"f-lbl",text:txt});
      const parts = [];
      // велаят
      const city = h("select",{class:"inp"}, h("option",{value:"",text:t("allCities")}), ...CITIES.map(c => h("option",{value:c,text:c,selected:S.city===c})));
      city.onchange = () => { S.city = city.value; upd(); };
      parts.push(lbl(t("fRegion")), h("div",{style:{marginBottom:"14px"}}, city));
      // торговый центр / рынок (те, где есть объявления)
      const mallsHere = [...new Set(base().map(p => (p.attrs || {}).mall).filter(Boolean))].sort();
      if (mallsHere.length){
        const ms = h("select",{class:"inp"}, h("option",{value:"",text:t("mallAny")}), ...mallsHere.map(m => h("option",{value:m,text:"🏬 "+m,selected:st.f.mall===m})));
        ms.onchange = () => { if (ms.value) st.f.mall = ms.value; else delete st.f.mall; upd(); };
        parts.push(lbl(t("mallF")), h("div",{style:{marginBottom:"14px"}}, ms));
      }
      // модель (если выбрана марка и есть список моделей)
      if (catId === "auto" && st.f.brand && st.f.brand !== "other" && VEHICLE_SUBS[st.sub] && modelsOf(st.sub, st.f.brand).length){
        parts.push(lbl(t("f_model")), h("button",{type:"button",class:"mk-pick md-pick f-model",onclick:()=>{ close(); go(modelsHref("auto", st.sub, st.f.brand)); }},
          h("span",null, h("b",{text: modelLabel(st.f.model) || t("anyModel")})), h("span",{class:"ar",text:"›"})));
      }
      // год — выбор колесом (от / до)
      if (flds.some(f => f.k === "year" && f.filter === "range")){
        const now = new Date().getFullYear(), years = []; for (let y = now; y >= 1960; y--) years.push(String(y));
        const ysel = k => { const el = h("select",{class:"inp"}, h("option",{value:"",text:t("any")}), ...years.map(y => h("option",{value:y,text:y,selected:String(st.r[k]||"")===y})));
          el.onchange = () => { st.r[k] = el.value; upd(); }; return el; };
        parts.push(lbl(t("fYear")), h("div",{class:"two",style:{marginBottom:"14px"}}, h("label",{class:"yr"}, h("small",{text:t("from")}), ysel("ymin")), h("label",{class:"yr"}, h("small",{text:t("to")}), ysel("ymax"))));
      }
      parts.push(lbl(t("fPrice")), rangeRow(t("priceFrom"), "pmin", "pmax"));
      if (flds.some(f => f.k === "area" && f.filter === "range")) parts.push(rangeRow(t("areaFrom"), "amin", "amax"));
      const modelBtn = catId === "auto" && st.f.brand && VEHICLE_SUBS[st.sub] && modelsOf(st.sub, st.f.brand).length;
      flds.filter(f => (f.filter === "more" || f.filter === "main") && !(modelBtn && f.k === "model")).forEach(f => {
        const chips = valueChips(f, applyF(base(), f.k), v => { st.f[f.k] = v; drawBody(); });
        if (chips.length) parts.push(h("div",{class:"field"}, h("span",{text:fieldLabel(f)}), h("div",{class:"chips wrap-chips"}, ...chips)));
      });
      body2.replaceChildren(...parts); upd();
    };
    drawBody();
    showBtn.onclick = () => close(true);
    box.append(h("h2",{text:t("filters")+(catId ? " · "+catName(catId) : "")}), body2,
      h("div",{style:{display:"grid",gridTemplateColumns:"1fr 2fr",gap:"10px",marginTop:"6px"}},
        h("button",{class:"btn ghost",text:t("reset"),onclick:()=>{ st.f = {}; st.r = {}; S.city = ""; drawBody(); }}), showBtn));
  }).then(() => draw());
  const drawList = () => {
    const list = applyF(base());
    const n = nActive();
    topFilt.textContent = t("filters") + (n ? " (" + n + ")" : "");
    topFilt.classList.toggle("on", !!n);
    const mode = viewMode();
    const title = st.f.brand ? brandName(st.f.brand) + (st.f.model ? " " + modelLabel(st.f.model) : "") : st.sub ? subName(st.sub) : catId ? catName(catId) : t("allGoods");
    body.replaceChildren(
      h("div",{class:"sec-h list-h"}, h("h2",null, title, h("small",{text:"  "+list.length}))),
      filterBar(drawList, compact),
      feed(sortList(list), !S.catalog.length && S.catalogLoading ? h("div",{class:"empty"}, h("div",{class:"spin"})) : null, null, mode));
  };
  page(head, h("div",{class:"wrap"}, body));
  const fmtN = v => (+v).toLocaleString("ru-RU");
  const rangeTxt = (a, b, f) => a && b ? f(a)+" – "+f(b) : a ? t("from")+" "+f(a) : b ? t("to")+" "+f(b) : "";
  const qchip = (label, val, onclick) => h("button",{type:"button",class:"qchip"+(val?" on":""),onclick},
    h("span",{text: val || label}), h("i",{html:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>'}));
  const pairSheet = (title, mk) => sheet((box, close) => {
    const [a, b, read] = mk();
    box.append(h("h2",{text:title}), h("div",{class:"two",style:{marginBottom:"14px"}}, a, b),
      h("div",{style:{display:"grid",gridTemplateColumns:"1fr 2fr",gap:"10px"}},
        h("button",{class:"btn ghost",text:t("reset"),onclick:()=>{ read(true); close(true); }}),
        h("button",{class:"btn",text:t("show"),onclick:()=>{ read(false); close(true); }})));
  }).then(() => draw());
  const drawQuick = () => {
    if (!compact) return;
    cTitle.textContent = st.f.brand ? brandName(st.f.brand) + (st.f.model ? " " + modelLabel(st.f.model) : "") : subName(st.sub);
    const chips = [];
    const vehicle = catId === "auto" && VEHICLE_SUBS[st.sub];
    if (vehicle) chips.push(qchip(t("makeBtn"), st.f.brand ? brandName(st.f.brand) : "", () => go("/brands/auto/"+st.sub)));
    if (catId === "auto" && st.f.brand && st.f.brand !== "other" && modelsOf(st.sub, st.f.brand).length)
      chips.push(qchip(t("f_model"), modelLabel(st.f.model), () => go(modelsHref("auto", st.sub, st.f.brand))));
    // основные фильтры раздела (размер, комнаты, тип сделки, марка телефона и т.п.)
    fieldsFor(catId, st.sub, Object.assign({}, st.f)).filter(f => f.filter === "main" && f.k !== "model" && !(vehicle && f.k === "brand")).forEach(f => {
      const cur = st.f[f.k];
      chips.push(qchip(fieldLabel(f), cur ? optLabel(f, cur) + (f.unit && f.type === "sel" ? " " + f.unit : "") : "", () => sheet((box, close) => {
        const counts = {};
        applyF(base(), f.k).forEach(p => { const v = (p.attrs || {})[f.k]; (Array.isArray(v) ? v : v ? [v] : []).forEach(x => counts[x] = (counts[x] || 0) + 1); });
        const vals = [...new Set([...optsOf(f, st.sub, Object.assign({}, st.f)), ...Object.keys(counts)])];
        box.append(h("h2",{text:fieldLabel(f)}), h("div",{class:"opt-list"},
          ...["", ...vals].map(v => h("button",{type:"button",class:"opt"+((cur||"")===v?" on":""),onclick:()=>{ st.f[f.k] = v; if (f.k === "brand") delete st.f.model; close(true); }},
            h("span",{text: v ? optLabel(f, v) + (f.unit && f.type === "sel" ? " " + f.unit : "") : t("any")}),
            (cur||"")===v ? h("b",{text:"✓"}) : counts[v] ? h("small",{class:"opt-n",text:String(counts[v])}) : null))));
      }).then(() => draw())));
    });
    chips.push(qchip(t("fRegion"), S.city, () => sheet((box, close) => box.append(h("h2",{text:t("fRegion")}),
      h("div",{class:"opt-list"}, ...["", ...CITIES].map(c => h("button",{type:"button",class:"opt"+(S.city===c?" on":""),onclick:()=>{ S.city = c; close(true); }},
        h("span",{text:c || t("allCities")}), S.city===c ? h("b",{text:"✓"}) : null))))).then(() => draw())));
    chips.push(qchip(t("qPrice"), rangeTxt(st.r.pmin, st.r.pmax, fmtN), () => pairSheet(t("fPrice"), () => {
      const a = h("input",{class:"inp",type:"number",inputmode:"numeric",placeholder:t("from"),value:st.r.pmin||""});
      const b = h("input",{class:"inp",type:"number",inputmode:"numeric",placeholder:t("to"),value:st.r.pmax||""});
      return [a, b, reset => { st.r.pmin = reset ? "" : a.value; st.r.pmax = reset ? "" : b.value; }];
    })));
    if (fieldsFor(catId, st.sub, Object.assign({}, st.f)).some(f => f.k === "year" && f.filter === "range"))
      chips.push(qchip(t("qYear"), rangeTxt(st.r.ymin, st.r.ymax, String), () => pairSheet(t("fYear"), () => {
        const now = new Date().getFullYear(), years = []; for (let y = now; y >= 1960; y--) years.push(String(y));
        const sel = (k, ph) => h("label",{class:"yr"}, h("small",{text:ph}), h("select",{class:"inp"}, h("option",{value:"",text:t("any")}),
          ...years.map(y => h("option",{value:y,text:y,selected:String(st.r[k]||"")===y}))));
        const a = sel("ymin", t("from")), b = sel("ymax", t("to"));
        return [a, b, reset => { st.r.ymin = reset ? "" : a.querySelector("select").value; st.r.ymax = reset ? "" : b.querySelector("select").value; }];
      })));
    qBox.replaceChildren(...chips);
  };
  if (compact && !MODELS) loadModels().then(() => drawQuick());
  const draw = () => { if (compact) drawQuick(); else drawSubs(); drawList(); };
  draw(); loadCatalog().then(draw);
  // показать выбранную категорию в ленте
  const on = catScroll.querySelector(".cs.on");
  if (on) requestAnimationFrame(() => { catScroll.scrollLeft = on.offsetLeft - catScroll.clientWidth / 2 + on.clientWidth / 2; });
}
function viewShop(uid){
  setTab("");
  let q = "", cat = (S.shopPre && S.shopPre.cat) || "";
  S.shopPre = null;
  const head = h("div"), body = h("div",{class:"sec"});
  const qIn = h("input",{type:"search",placeholder:t("searchShop"),"aria-label":t("searchShop")});
  qIn.oninput = () => { q = qIn.value.trim().toLowerCase(); drawList(); };
  const all = () => S.catalog.filter(p => p.user === uid);
  const drawHead = () => {
    const list = all(), f = list[0];
    if (!f){ head.replaceChildren(); return; }
    // выбранной категории у магазина нет — показываем всё
    if (cat && !list.some(p => p.cat === cat)) cat = "";
    $("shop-title") && ($("shop-title").textContent = f.sellerName);
    let sum = 0, n = 0; list.forEach(p => { if (p.rating){ sum += p.rating * p.reviews; n += p.reviews; } });
    const cats = [...new Set(list.map(p => p.cat))];
    head.replaceChildren(h("div",{class:"shop-head"},
      h("div",{class:"seller"}, avaEl(f.sellerName, f.sellerLogo, "big"),
        h("div",{style:{minWidth:0}}, h("div",{class:"nm",text:f.sellerName}), stypeBadge(f.stype),
          h("div",{class:"sub",text:"📍 "+f.city}))),
      h("div",{class:"shop-stats"},
        h("div",null, h("b",{text:String(list.length)}), h("span",{text:t("goodsWord")})),
        h("div",null, h("b",{text:n ? (sum/n).toFixed(1) : "—"}), h("span",{text:t("ratingWord")})),
        h("div",null, h("b",{text:String(n)}), h("span",{text:t("reviewsWord")}))),
      h("div",{class:"search",style:{marginTop:"12px",border:"1px solid var(--line)"}}, h("span",{html:IC.search}), qIn)),
      cats.length > 1 ? h("div",{class:"chips",style:{padding:"10px 10px 0"}},
        h("button",{class:"chip"+(cat===""?" on":""),text:t("allGoods"),onclick:()=>{ cat = ""; drawHead(); drawList(); }}),
        ...cats.map(c => h("button",{class:"chip"+(cat===c?" on":""),text:catOf(c).e+" "+catName(c),onclick:()=>{ cat = c; drawHead(); drawList(); }}))) : null);
  };
  const drawList = () => {
    let list = all();
    if (cat) list = list.filter(p => p.cat === cat);
    if (q) list = list.filter(p => textMatch(p, q.split(/\s+/)));
    body.replaceChildren(filterBar(drawList), feed(sortList(list), null, null, viewMode()));
  };
  const bar = topBar(t("shop")); bar.querySelector("h1").id = "shop-title";
  // свой магазин: сверху «Сделать магазин VIP» и баланс
  const own = h("div");
  const drawOwn = () => {
    if (!S.user || S.user.id !== uid || !S.expDays) return own.replaceChildren();
    own.replaceChildren(h("div",{class:"own-vip"},
      h("div",{class:"ov-bal"}, "🪙 ", coins(S.balance), h("button",{class:"link",text:t("topUp"),onclick:()=>topUpSheet()})),
      h("div",{class:"ov-hint",text: S.shopVip ? "⭐ "+t("vipUntil",{d:dayName(S.shopVip)})+" — "+t("vipShopAllOn") : t("vipItemHint",{p:coins((S.vipPrices||{}).item || 10)})})));
    // на каждой своей карточке — кнопка «⭐ VIP» (одно объявление)
    S.cardExtra = p => {
      const on = isVip(p);
      return h("button",{type:"button",class:"card-vip"+(on ? " on" : ""),onclick:e=>{ e.preventDefault(); e.stopPropagation();
          if (S.shopVip && new Date(S.shopVip) > Date.now()) return toast(t("vipShopAllOn"));
          itemVipSheet(p, () => { drawOwn(); drawList(); });
        }}, on ? "⭐ VIP" : "⭐ VIP · "+fmt((S.vipPrices||{}).item || 10));
    };
    drawList();
  };
  // администратор (вошёл в админку): начислить монеты этому продавцу
  const admBar = S.adminToken ? h("div",{class:"own-vip adm-bar"},
    h("button",{class:"btn block vip-shop-btn",onclick:()=>adminThreadSheet(uid)}, "🪙 ", t("admCredit"))) : null;
  page(bar, h("div",{class:"wrap"}, admBar, own, head, body));
  // свой магазин управляется на странице «Мой магазин»; здесь — вид как у покупателя
  const draw = () => { drawHead(); drawList(); };
  draw(); loadCatalog().then(draw);
}
function viewFav(){
  setTab("me");
  const box = h("div",{class:"sec"});
  const draw = () => {
    const list = S.catalog.filter(p => S.favs.has(p.id));
    box.replaceChildren(feed(list, emptyBox("💛", t("favEmpty"), t("favEmptySub"), h("a",{class:"btn soft",href:"#/",text:t("toShop")}))));
  };
  page(topBar(t("favs")), h("div",{class:"wrap"}, box));
  draw(); loadCatalog().then(draw);
}

/* ===== СТРАНИЦА ТОВАРА ===== */
async function viewProduct(id){
  setTab("", false);
  const short = byId(id);
  const root = h("div",{class:"wrap"});
  page(root);
  if (short) renderProduct(root, Object.assign({}, short, {photos: short.thumb ? [{url: short.thumb}] : [], loading: true}));
  else root.append(topBar(""), h("div",{class:"empty"}, h("div",{class:"spin"})));
  const r = await call("product", {id});
  if (r.ok) migrateProduct(r.product);
  if (location.hash !== "#/p/"+id) return;
  if (!r.ok){ root.replaceChildren(topBar(""), emptyBox("😕", t("gone"), t("goneSub"), h("a",{class:"btn soft",href:"#/",text:t("toShop")}))); return; }
  renderProduct(root, r.product);
}
function renderProduct(root, p){
  const photos = p.photos && p.photos.length ? p.photos : [];
  const track = h("div",{class:"gal-track"}, ...photos.map((ph, i) => h("img",{src:ph.url || ph.thumb,alt:p.title+" "+(i+1),loading:i?"lazy":null})));
  const n = h("div",{class:"gal-n",text:"1/"+Math.max(1,photos.length)});
  // цвета / варианты = фото с подписью
  const variants = photos.map((ph, i) => ({ph, i})).filter(x => x.ph.label);
  let picked = null;
  const vBox = h("div",{class:"vars"});
  const vName = h("span",{class:"var-name"});
  const drawVars = idx => {
    vBox.querySelectorAll(".var").forEach(el => el.classList.toggle("on", +el.dataset.i === idx));
    const v = variants.find(x => x.i === idx);
    if (v){ picked = v.ph.label; vName.textContent = ": " + v.ph.label; S.pickVariant = {product: p.id, label: v.ph.label}; }
  };
  variants.forEach(v => vBox.append(h("button",{class:"var","data-i":v.i,onclick:()=>{
    track.scrollTo({left: v.i * track.clientWidth, behavior:"smooth"}); drawVars(v.i);
  }}, h("img",{src:v.ph.thumb || v.ph.url,alt:v.ph.label,loading:"lazy"}), h("span",{text:v.ph.label}))));
  if (S.pickVariant && S.pickVariant.product !== p.id) S.pickVariant = null;
  let scrollT = 0;
  track.addEventListener("scroll", () => {
    const idx = Math.round(track.scrollLeft / track.clientWidth);
    n.textContent = (idx + 1) + "/" + photos.length;
    clearTimeout(scrollT); scrollT = setTimeout(() => { if (variants.some(v => v.i === idx)) drawVars(idx); }, 120);
  }, {passive:true});
  const gal = h("div",{class:"gal"}, track, photos.length > 1 ? n : null,
    h("button",{class:"icon-btn gal-back","aria-label":t("back"),html:IC.back,onclick:()=>back()}));
  const isOwner = S.user && p.user === S.user.id;
  const s = p.seller;
  const revBox = h("div",{class:"box",id:"rev"});
  const shopStrip = h("div");
  if (!p.loading) loadReviews(p, revBox); else revBox.hidden = true;
  const similar = h("div");
  const statusNote = p.status && p.status !== "active" ?
    h("div",{class:"warn",style:{margin:"10px 0 0"}}, h("span",{text:"ℹ️"}), h("span",{text:t("st_"+p.status)})) : null;

  root.replaceChildren(gal,
    h("div",{class:"pd"},
      priceEl(p.price, null, priceSuffix(p), p.cat),
      h("h1",{text:p.title}),
      p.rating ? h("a",{class:"rt-line",href:"#rev",onclick:e=>{ e.preventDefault(); revBox.scrollIntoView({behavior:"smooth"}); }},
        stars(p.rating), h("b",{text:p.rating.toFixed(1)}), h("span",{text:t("nReviews",{n:p.reviews})})) : null,
      h("div",{class:"tags"}, isVip(p) ? h("span",{class:"vip-pill",text:"⭐ VIP"}) : null,
        h("a",{href:"#/c/"+p.cat,text:catOf(p.cat).e+" "+catName(p.cat)+(p.sub ? " · "+subName(p.sub) : "")}),
        NO_COND[p.cat] ? null : h("span",{text:p.cond === "used" ? t("used") : t("new")}),
        h("span",{text:ago(p.at)})),
      // размеры в наличии — крупно, сразу под названием
      (() => { const z = (p.attrs || {}).size; const arr = Array.isArray(z) ? z : z ? [z] : [];
        return arr.length ? h("div",{class:"sizes"}, h("small",{text:t("sizesHave")}), h("div",{class:"sz-row"}, ...arr.map(v => h("span",{class:"sz",text:v})))) : null; })(),
      h("div",{class:"loc"}, h("span",{text:(p.attrs||{}).mall ? "🏬" : "📍"}), h("div",null, h("small",{text:t("location")}), h("b",{text:placeText(p)}))),
      p.video ? h("a",{class:"btn vid-btn block",href:p.video,target:"_blank",rel:"noopener"},
        h("span",{text:"▶"}), t("watchVideo",{svc:videoKind(p.video)})) : null,
      statusNote),
    variants.length ? h("div",{class:"box"}, h("h3",null, t("variants")+" ("+variants.length+")", vName), vBox) : null,
    specsBox(p),
    p.desc ? h("div",{class:"box"}, h("h3",{text:t("desc")}), h("div",{class:"desc",text:p.desc})) : null,
    revBox,
    s ? h("div",{class:"box shop-box"},
      h("a",{class:"seller",href:"#/u/"+s.id}, avaEl(s.name, s.logo),
        h("div",{style:{flex:1,minWidth:0}}, h("div",{class:"nm"}, s.name, " ", stypeBadge(s.stype)),
          h("div",{class:"sub",text:"📍 "+s.city+" · "+t("nGoods",{n:s.count||0})+(s.rating ? " · ★ "+s.rating.toFixed(1)+" ("+s.reviews+")" : "")}))),
      shopStrip,
      h("a",{class:"btn ghost block",href:"#/u/"+s.id,style:{marginTop:"12px"}}, icon("store"), t("enterShop",{n:s.count||0}))) : null,
    h("div",{class:"box"}, h("div",{class:"warn"}, h("span",{text:"⚠️"}), h("span",{text:t("safeNote")})),
      h("div",{style:{textAlign:"right",marginTop:"10px"}},
        h("button",{class:"link",style:{color:"var(--mut)",fontSize:"13px",display:"inline-flex",gap:"5px",alignItems:"center"},onclick:()=>reportSheet(p)}, icon("flag"), t("report")))),
    similar);

  // нижняя панель
  const dock = h("div",{class:"dock"}, h("div",{class:"wrap"},
    heartBtn(p.id, "mini"),
    isOwner ? h("a",{class:"btn ghost",href:"#/edit/"+p.id}, icon("edit"), t("edit")) :
      h("button",{class:"btn ghost",disabled:p.loading||null,onclick:()=>contact("chat", p)}, icon("chat"), t("write")),
    isOwner ? null : h("button",{class:"btn",disabled:p.loading||null,onclick:()=>contact("call", p)}, icon("phone"), t("call"))));
  dock.querySelector(".mini").append(h("span",{text:t("fav")}));
  root.append(dock);

  if (!p.loading) loadCatalog().then(() => { showSimilar(p, similar); if (s) drawShopStrip(p, shopStrip); });
}
// «Ещё в этом магазине» — горизонтальная лента товаров продавца
function drawShopStrip(p, box){
  const list = S.catalog.filter(x => x.user === p.user && x.id !== p.id);
  if (!list.length) return;
  box.replaceChildren(h("div",{class:"sub-h",style:{marginTop:"14px"},text:t("moreFromShop")}),
    h("div",{class:"hscroll"}, ...list.slice(0, 12).map(x => h("a",{class:"mini-card",href:"#/p/"+x.id},
      h("img",{src:x.thumb,alt:x.title,loading:"lazy"}),
      h("div",{class:"tt",text:x.title}), priceEl(x.price))),
      list.length > 12 ? h("a",{class:"mini-card more-card",href:"#/u/"+p.user}, h("b",{text:"+"+(list.length-12)}), t("all")) : null));
}
async function showSimilar(p, box){
  let list = [];
  const vecs = S.vectors || (S.catalog.length > 0 ? await loadVectors() : []);
  const me = vecs.find(v => v.id === p.id);
  if (me){
    list = vecs.filter(v => v.id !== p.id).map(v => [Vision.score(me, v), v.id])
      .sort((a,b) => b[0]-a[0]).slice(0, 30).map(x => byId(x[1])).filter(Boolean);
  }
  const sameCat = S.catalog.filter(x => x.cat === p.cat && x.id !== p.id && !list.includes(x));
  list = list.concat(sameCat).slice(0, 20);
  if (!list.length) return;
  box.replaceChildren(h("div",{class:"sec"}, h("div",{class:"sec-h"}, h("h2",{text:t("similar")})), feed(list)));
}
async function contact(kind, p){
  if (!await needAuth("authWhy")) return;
  if (!await needRules()) return;
  if (S.user && S.user.id === p.user) return toast(t("e_own"));
  if (kind === "chat"){
    const b = busy();
    const r = await call("openChat", {product: p.id});
    b.done();
    if (!r.ok) return toast(errText(r));
    go("/chat/"+r.id);
  } else callSheet(p);
}
function callSheet(p){
  const s = p.seller; if (!s) return;
  const num = "+993"+s.phone;
  sheet((box) => {
    box.append(h("h2",{text:s.name}), h("p",{text:t("callSub")}),
      h("div",{style:{fontSize:"26px",fontWeight:"800",textAlign:"center",margin:"6px 0 18px",letterSpacing:".5px"},text:phoneFmt(s.phone)}),
      h("div",{style:{display:"grid",gap:"10px"}},
        h("a",{class:"btn block green",href:"tel:"+num}, icon("phone"), t("call")),
        s.imo ? imoBtn(s.phone) : null,
        h("button",{class:"btn block ghost",text:t("copy"),onclick:async e => {
          try{ await navigator.clipboard.writeText(num); e.target.textContent = t("copied"); }catch(x){ e.target.textContent = num; }
        }})),
      h("div",{class:"warn",style:{marginTop:"14px"}}, h("span",{text:"⚠️"}), h("span",{text:t("rule3")})));
  });
}
function reportSheet(p){
  sheet((box, close) => {
    let reason = "fraud";
    const reasons = ["fraud","banned","wrong","other"];
    const txt = h("textarea",{class:"inp",maxlength:"500",placeholder:t("reportPh")});
    const send = h("button",{class:"btn block",text:t("send")});
    box.append(h("h2",{text:t("report")}), h("p",{text:p.title}),
      h("div",{style:{display:"grid",gap:"10px",marginBottom:"14px"}}, ...reasons.map(r => {
        const i = h("input",{type:"radio",name:"rr",value:r,checked:r===reason}); i.onchange = () => reason = r;
        return h("label",{class:"check"}, i, h("span",{text:t("rr_"+r)}));
      })), txt, h("div",{style:{height:"12px"}}), send);
    send.onclick = async () => {
      send.disabled = true;
      const r = await call("report", {id: p.id, reason, text: txt.value});
      if (!r.ok){ send.disabled = false; return toast(errText(r)); }
      close(); toast(t("reportOk"));
    };
  });
}

function specsBox(p){
  const a = p.attrs || {};
  const rows = fieldsFor(p.cat, p.sub, a).map(f => [fieldLabel(f), attrText(f, a[f.k])]).filter(r => r[1]);
  if (!rows.length) return null;
  return h("div",{class:"box"}, h("h3",{text:t("specs")}),
    h("dl",{class:"specs"}, ...rows.flatMap(([k,v]) => [h("dt",{text:k}), h("dd",{text:v})])));
}
/* ===== ОТЗЫВЫ (как в Pinduoduo: звёзды + реальные фото покупателей) ===== */
function stars(n, big){
  const el = h("span",{class:"stars"+(big?" big":""),"aria-label":n+"/5"});
  for (let i = 1; i <= 5; i++) el.append(h("i",{class: n >= i - 0.25 ? "on" : n >= i - 0.75 ? "half" : null,text:"★"}));
  return el;
}
function photoViewer(list, start){
  sheet((box) => {
    box.classList.add("viewer");
    const track = h("div",{class:"gal-track"}, ...list.map(ph => h("img",{src:ph.url || ph.thumb,alt:""})));
    box.append(track);
    requestAnimationFrame(() => track.scrollLeft = start * track.clientWidth);
  });
}
async function loadReviews(p, box){
  const r = await call("reviews", {id: p.id});
  if (!r.ok){ box.hidden = true; return; }
  const list = r.reviews;
  const allPhotos = list.flatMap(v => v.photos.map(ph => Object.assign({rev:v}, ph)));
  const mine = list.find(v => v.mine);
  const head = h("div",{class:"rev-head"},
    h("h3",{style:{margin:0}}, t("reviews")+" ("+list.length+")"),
    list.length ? h("div",{class:"rev-avg"}, h("b",{text:(list.reduce((a,v) => a+v.stars, 0)/list.length).toFixed(1)}), stars(list.reduce((a,v) => a+v.stars, 0)/list.length)) : null);
  const photosRow = allPhotos.length ? h("div",null,
    h("div",{class:"sub-h",text:t("buyerPhotos",{n:allPhotos.length})}),
    h("div",{class:"rev-strip"}, ...allPhotos.map((ph, i) => h("button",{onclick:()=>photoViewer(allPhotos, i)}, h("img",{src:ph.thumb||ph.url,alt:"",loading:"lazy"}))))) : null;
  const isOwner = S.user && p.user === S.user.id;
  let action = null;
  if (!isOwner){
    if (r.canReview) action = h("button",{class:"btn soft block",text:mine ? t("editReview") : t("writeReview"),onclick:()=>reviewSheet(p, mine, () => loadReviews(p, box))});
    else if (!S.token) action = h("p",{class:"hint",text:t("reviewLogin")});
    else action = h("p",{class:"hint",text:t("reviewNeedChat")});
  }
  let shown = 3;
  const items = h("div",{class:"rev-list"});
  const drawItems = () => {
    items.replaceChildren(...list.slice(0, shown).map(v => h("div",{class:"rev"},
      h("div",{class:"rev-top"}, h("div",{class:"ava sm",text:initials(v.name)}),
        h("div",{style:{flex:1,minWidth:0}}, h("div",{class:"nm",text:v.name+(v.mine?" ("+t("you")+")":"")}),
          h("div",{class:"sub"}, stars(v.stars), " · "+ago(v.at)+(v.city?" · "+v.city:"")))),
      v.text ? h("div",{class:"rev-text",text:v.text}) : null,
      v.photos.length ? h("div",{class:"rev-ph"}, ...v.photos.map((ph, i) => h("button",{onclick:()=>photoViewer(v.photos, i)}, h("img",{src:ph.thumb||ph.url,alt:"",loading:"lazy"})))) : null)));
    if (list.length > shown) items.append(h("button",{class:"more",text:t("showMoreRev",{n:list.length - shown}),onclick:()=>{ shown += 10; drawItems(); }}));
  };
  drawItems();
  box.hidden = false;
  box.replaceChildren(head, photosRow,
    list.length ? items : h("p",{class:"hint",text:t("noReviews")}), action);
}
function reviewSheet(p, mine, done){
  sheet((box, close) => {
    let n = mine ? mine.stars : 0;
    let shots = mine ? mine.photos.map(ph => ({existing:true, id:ph.id, thumb:ph.thumb||ph.url})) : [];
    const starRow = h("div",{class:"star-pick"});
    const drawStars = () => starRow.replaceChildren(...[1,2,3,4,5].map(i => h("button",{type:"button",class:i<=n?"on":null,"aria-label":i+"/5",text:"★",onclick:()=>{ n = i; drawStars(); }})),
      h("span",{text: n ? t("star"+n) : t("tapStars")}));
    const txt = h("textarea",{class:"inp",maxlength:"1000",placeholder:t("reviewPh")}); txt.value = mine ? mine.text : "";
    const picker = h("input",{type:"file",accept:"image/*",multiple:true,hidden:true});
    const shotsBox = h("div",{class:"shots"});
    const drawShots = () => {
      shotsBox.replaceChildren(...shots.map((s, i) => h("div",{class:"shot"}, h("img",{src:s.thumb||s.dataUrl,alt:""}),
        h("button",{class:"x",text:"×","aria-label":t("delete"),onclick:()=>{ shots.splice(i,1); drawShots(); }}))));
      if (shots.length < 4) shotsBox.append(h("button",{class:"add-shot",onclick:()=>picker.click()}, h("span",{html:IC.cam}), t("addPhoto")));
    };
    picker.onchange = async () => {
      for (const f of [...picker.files].slice(0, 4 - shots.length)){ try{ shots.push(await compress(f, 1280)); }catch(e){ toast(t("e_photo")); } }
      picker.value = ""; drawShots();
    };
    const err = h("div",{class:"err"});
    const send = h("button",{class:"btn block",text:t("sendReview")});
    send.onclick = async () => {
      if (!n) return err.textContent = t("e_stars");
      send.disabled = true;
      const b = busy(t("saving"));
      try{
        const r = await call("saveReview", {product: p.id, stars: n, text: txt.value});
        if (!r.ok) throw r;
        const keep = shots.filter(s => s.existing).map(s => s.id);
        if (mine && keep.length !== mine.photos.length){ const k = await call("reviewPhoto", {id: r.id, keep}); if (!k.ok) throw k; }
        const fresh = shots.filter(s => !s.existing);
        for (let i = 0; i < fresh.length; i++){
          b.set(t("uploading",{i:i+1,n:fresh.length}), i / fresh.length);
          const up = await call("reviewPhoto", {id: r.id, data: fresh[i].b64, mime: "image/jpeg"});
          if (!up.ok) throw up;
        }
        b.done(); close(true); toast(t("reviewThanks")); S.catalogAt = 0; done && done();
      }catch(e){ b.done(); send.disabled = false; err.textContent = errText(e && e.error ? e : {error:"net"}); }
    };
    drawStars(); drawShots();
    box.append(h("h2",{text:mine ? t("editReview") : t("writeReview")}), h("p",{text:p.title}),
      starRow, h("label",{class:"field"}, h("span",{text:t("reviewText")}), txt),
      h("div",{class:"field"}, h("span",{style:{display:"block",fontSize:"13px",fontWeight:"600",color:"var(--mut)",marginBottom:"6px"},text:t("reviewPhotos")}), shotsBox, picker),
      err, send,
      mine ? h("button",{class:"btn block ghost",style:{marginTop:"10px",color:"#c62828"},text:t("deleteReview"),onclick:async()=>{
        const r = await call("deleteReview", {id: mine.id}); if (!r.ok) return toast(errText(r)); close(true); toast(t("deleted")); done && done();
      }}) : null);
  });
}

/* ===== ПОИСК ПО ФОТО ===== */
function viewPhoto(){
  setTab("cam");
  const cam = h("input",{type:"file",accept:"image/*",capture:"environment",hidden:true});
  const gal = h("input",{type:"file",accept:"image/*",hidden:true});
  const out = h("div");
  const onPick = inp => () => { const f = inp.files && inp.files[0]; inp.value = ""; if (f) runPhotoSearch(f, out); };
  cam.onchange = onPick(cam); gal.onchange = onPick(gal);
  page(h("div",{class:"ps-hero"},
      h("div",{style:{fontSize:"44px"},text:"📷"}),
      h("h1",{text:t("psTitle")}), h("p",{text:t("psSub")}),
      h("div",{class:"btns"},
        h("button",{class:"btn",onclick:()=>cam.click()}, icon("cam"), t("psCam")),
        h("button",{class:"btn ghost2",onclick:()=>gal.click()}, icon("img"), t("psGal"))), cam, gal),
    h("div",{class:"wrap"}, out));
  if (S.photoSearch) showPhotoResults(out, S.photoSearch);
  Vision.loadML(); // заранее начинаем грузить нейросеть
}
async function runPhotoSearch(file, out){
  const url = URL.createObjectURL(file);
  const status = h("div",{class:"kv",text:t("psLooking")});
  out.replaceChildren(h("div",{class:"ps-q"}, h("img",{src:url,alt:""}), h("div",null, h("b",{text:t("psYour")}), status)),
    h("div",{class:"empty"}, h("div",{class:"spin"})));
  try{
    const img = await loadImg(url);
    const [, q] = await Promise.all([loadCatalog(), Vision.describe(img, 15000)]);
    status.textContent = t("psCompare");
    const vecs = await loadVectors();
    const ranked = vecs.map(v => [Vision.score(q, v), v.id]).sort((a,b) => b[0]-a[0]);
    // показываем самые похожие: близкие к лучшему результату (минимум 6)
    const top = ranked.length ? ranked[0][0] : 0, margin = q.m ? 0.22 : 0.09;
    let best = ranked.filter(x => x[0] >= top - margin).slice(0, 40);
    if (best.length < 6) best = ranked.slice(0, 6);
    const list = best.map(x => byId(x[1])).filter(Boolean);
    S.photoSearch = {url, list: list.map(p => p.id), cat: q.cat, smart: !!q.m};
  }catch(e){ console.error(e); S.photoSearch = {url, list: [], cat: null, error: true}; }
  if (location.hash === "#/photo") showPhotoResults(out, S.photoSearch);
}
function showPhotoResults(out, ps){
  const list = ps.list.map(byId).filter(Boolean);
  out.replaceChildren(
    h("div",{class:"ps-q"}, h("img",{src:ps.url,alt:""}),
      h("div",null, h("b",{text:t("psFound",{n:list.length})}),
        ps.cat ? h("div",{style:{marginTop:"6px"}}, h("a",{class:"chip on",href:"#/c/"+ps.cat,text:catOf(ps.cat).e+" "+catName(ps.cat)})) : null,
        h("div",{class:"kv",style:{marginTop:"6px"},text:ps.smart ? t("psSmart") : t("psBasic")}))),
    h("div",{class:"sec"}, feed(list, emptyBox("🖼️", t("psNone"), t("psNoneSub")))));
}

/* ===== ЧАТЫ ===== */
async function viewChats(){
  setTab("chats");
  const box = h("div",{class:"clist"});
  page(h("div",{class:"bar"}, h("h1",{style:{paddingLeft:"10px"},text:t("tChats")})), h("div",{class:"wrap"}, box));
  if (!S.token){
    box.replaceChildren(emptyBox("💬", t("chatsLogin"), t("chatsLoginSub"),
      h("button",{class:"btn",text:t("login"),onclick:async()=>{ if (await authSheet("authTitle")) viewChats(); }})));
    return;
  }
  box.append(h("div",{class:"empty"}, h("div",{class:"spin"})));
  const load = async () => {
    const r = await call("chats");
    if (!r.ok) return box.replaceChildren(emptyBox("⚠️", errText(r)));
    S.unread = r.chats.filter(c => c.unread).length; updateBadge();
    if (!r.chats.length) return box.replaceChildren(emptyBox("💬", t("chatsEmpty"), t("chatsEmptySub"), h("a",{class:"btn soft",href:"#/",text:t("toShop")})));
    box.replaceChildren(...r.chats.map(c => h("a",{class:"row",href:"#/chat/"+c.id},
      h("div",{class:"ava",text:initials(c.other)}),
      h("div",{class:"in"},
        h("div",{class:"t"}, c.other, h("span",{style:{color:"var(--mut2)",fontWeight:"400"},text:" · "+(c.role==="seller"?t("buyer"):t("seller"))})),
        h("div",{class:"s",style:{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",display:"block",fontWeight:c.unread?"700":"400",color:c.unread?"var(--fg)":null},
          text:(c.mine ? t("you")+": " : "") + c.lastText}),
        c.product ? h("div",{class:"s",text:"🛍 "+c.product.title}) : null),
      h("div",{style:{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"8px"}},
        h("span",{class:"tm",text:ago(c.lastAt)}), c.unread ? h("span",{class:"dot"}) : null),
      c.product && c.product.thumb ? h("img",{src:c.product.thumb,alt:"",style:{width:"48px",height:"48px"}}) : null)));
  };
  await load();
  S.timers.push(setInterval(() => { if (!document.hidden) load(); }, 20000));
}
async function viewChat(id){
  setTab("", false);
  if (!S.token){ go("/chats"); return; }
  const msgs = h("div",{class:"msgs"}, h("div",{class:"empty"}, h("div",{class:"spin"})));
  const head = h("div",{class:"bar"},
    h("button",{class:"icon-btn","aria-label":t("back"),html:IC.back,onclick:()=>go("/chats")}),
    h("h1",{text:"…"}));
  const prodStrip = h("div");
  const quick = h("div",{class:"quick"});
  const ta = h("textarea",{rows:"1",placeholder:t("msgPh"),maxlength:"1000","aria-label":t("msgPh")});
  const fileIn = h("input",{type:"file",accept:"image/*",hidden:true});
  const sendBtn = h("button",{class:"send","aria-label":t("send"),html:IC.send});
  const composer = h("div",{class:"composer"}, h("div",{class:"wrap"},
    h("button",{class:"icon-btn","aria-label":t("photo"),html:IC.img,onclick:()=>fileIn.click()}), fileIn, ta, sendBtn));
  page(h("div",{class:"wrap"}, head, prodStrip, msgs, quick), composer);

  let lastAt = "", lastDay = "", info = null;
  const seen = new Set();
  const atBottom = () => window.innerHeight + window.scrollY >= document.body.scrollHeight - 120;
  const toBottom = () => window.scrollTo(0, document.body.scrollHeight);
  const bubble = m => {
    const day = dayName(m.at);
    const out = [];
    if (day !== lastDay){ out.push(h("div",{class:"day",text:day})); lastDay = day; }
    out.push(h("div",{class:"msg "+(m.mine?"me":"them")+(m.pending?" pending":""),"data-id":m.id||""},
      m.photo ? h("a",{href:m.photo.url,target:"_blank",rel:"noopener"}, h("img",{src:m.photo.thumb||m.photo.url,alt:""})) : null,
      m.text ? h("div",{text:m.text}) : null,
      h("div",{class:"tm",text:m.pending ? "…" : hm(m.at)})));
    return out;
  };
  const addMsgs = list => {
    const stick = atBottom() || !lastAt;
    list.forEach(m => { if (seen.has(m.id)) return; seen.add(m.id); msgs.append(...bubble(m)); if (m.at > lastAt) lastAt = m.at; });
    if (stick) toBottom();
  };
  const drawQuick = () => {
    if (!info || info.role !== "buyer" || seen.size) { quick.replaceChildren(); return; }
    quick.replaceChildren(...["q1","q2","q3","q4"].map(k => h("button",{text:t(k),onclick:()=>send(t(k))})));
  };
  const first = await call("chat", {id});
  if (location.hash !== "#/chat/"+id) return;
  if (!first.ok){ msgs.replaceChildren(emptyBox("⚠️", errText(first))); return; }
  info = first.info;
  head.querySelector("h1").textContent = info.other ? info.other.name : "—";
  if (info.role === "buyer" && info.other)
    head.append(h("a",{class:"icon-btn",href:"tel:+993"+info.other.phone,"aria-label":t("call"),html:IC.phone}));
  if (info.product) prodStrip.replaceChildren(h("a",{class:"chat-prod",href:"#/p/"+info.product.id},
    info.product.thumb ? h("img",{src:info.product.thumb,alt:""}) : null,
    h("div",{style:{minWidth:0,flex:1}}, h("div",{class:"t",text:info.product.title}), priceEl(info.product.price)),
    info.product.status !== "active" ? h("span",{class:"st off",text:t("st_short_"+info.product.status)}) : null));
  msgs.replaceChildren(info.role === "buyer" ? h("div",{class:"day",style:{maxWidth:"90%",textAlign:"center",borderRadius:"12px"},text:"⚠️ "+t("rule3")}) : "");
  addMsgs(first.messages);
  drawQuick();
  if (info.role === "buyer" && info.product && S.pickVariant && S.pickVariant.product === info.product.id){
    ta.value = t("askVariant",{v: S.pickVariant.label}); S.pickVariant = null;
  }
  call("readChat", {id}); S.unread = Math.max(0, S.unread - 1); updateBadge();

  async function send(text, file){
    text = (text || "").trim();
    if (!text && !file) return;
    const tmp = {id:"tmp"+Date.now(), mine:true, text, at:new Date().toISOString(), pending:true,
      photo: file ? {url: file.dataUrl} : null};
    const els = bubble(tmp); msgs.append(...els); toBottom();
    quick.replaceChildren();
    const r = await call("send", {id, text, data: file ? file.b64 : null, mime: file ? "image/jpeg" : null});
    els.forEach(e => e.remove());
    if (!r.ok){ toast(errText(r)); if (!file) ta.value = text; return; }
    addMsgs([r.message]);
  }
  sendBtn.onclick = () => { const v = ta.value; ta.value = ""; ta.style.height = ""; send(v); ta.focus(); };
  ta.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey && matchMedia("(pointer:fine)").matches){ e.preventDefault(); sendBtn.click(); } });
  ta.addEventListener("input", () => { ta.style.height = ""; ta.style.height = Math.min(120, ta.scrollHeight) + "px"; });
  fileIn.onchange = async () => {
    const f = fileIn.files[0]; fileIn.value = ""; if (!f) return;
    try{ send("", await compress(f, 1280)); }catch(e){ toast(t("e_photo")); }
  };
  // новые сообщения (раз в 4 секунды, только когда экран открыт)
  S.timers.push(setInterval(async () => {
    if (document.hidden) return;
    const r = await call("chat", {id, since: lastAt});
    if (r.ok && r.messages && r.messages.length){ addMsgs(r.messages); drawQuick(); call("readChat", {id}); }
  }, 4000));
}

/* ===== ПРОФИЛЬ ===== */
/* Автообновление: если на сайте вышла новая версия (файл version.json), приложение перезагружается само.
   Перезагрузка — сразу, если вы на главном меню, иначе — при следующем возврате на главное меню. */
let updateReady = false;
async function checkUpdate(){
  try{
    const r = await fetch("version.json?t=" + Date.now(), {cache:"no-store"});
    if (!r.ok) return;
    const v = String((await r.json()).v || "");
    if (+v > +APP_VER){ updateReady = true; maybeReload(); }
  }catch(e){}
}
function maybeReload(){
  if (!updateReady || sheetEl) return;
  let last = 0; try{ last = +sessionStorage.getItem("tmUpdAt") || 0; }catch(e){}
  if (Date.now() - last < 120000) return;          // не чаще раза в 2 минуты
  if ((navStack[navStack.length-1] || "/") === "/" || document.hidden){
    updateReady = false; try{ sessionStorage.setItem("tmUpdAt", String(Date.now())); }catch(e){}
    location.reload();
  }
}
// версия сайта и что стоит на сервере (по ответу каталога): помогает понять, обновлён ли Vip.gs
function srvText(){
  const c = S.srvInfo;
  if (!c) return "…";
  return c.vipVer ? "Vip.gs " + c.vipVer : c.malls ? "Vip.gs 49–58" : c.expDays ? "Vip.gs старый (до 49)" : "Vip.gs не установлен";
}
function verLine(){
  const el = h("div",{id:"ver-line",style:{textAlign:"center",color:"var(--mut2)",fontSize:"12px",padding:"14px 0 90px"}});
  const upd = () => { el.textContent = APP_NAME+" · "+t("version")+" "+APP_VER+" · сервер: "+srvText(); };
  upd();
  // свежий ответ сервера — и строка обновится
  call("catalog").then(r => { if (r && r.ok){ S.srvInfo = {vipVer: r.vipVer || 0, malls: !!r.malls, expDays: r.expDays || 0}; upd(); } else { el.textContent = APP_NAME+" · "+t("version")+" "+APP_VER+" · сервер не ответил"; } });
  return el;
}
async function viewMe(){
  setTab("me");
  if (!S.token){
    page(h("div",{class:"me-head"}, h("div",{class:"ava",text:"🙂"}),
        h("div",{style:{flex:1}}, h("div",{class:"nm",text:t("guest")}), h("div",{class:"sub",text:t("guestSub")})), langSwitch()),
      h("div",{class:"wrap"},
        h("div",{class:"box"}, h("div",{style:{display:"grid",gap:"10px"}},
          h("button",{class:"btn block",text:t("register"),onclick:async()=>{ if (await authSheet("authTitle","reg")) viewMe(); }}),
          h("button",{class:"btn block ghost",text:t("login"),onclick:async()=>{ if (await authSheet("authTitle","login")) viewMe(); }}))),
        h("div",{class:"box menu"},
          h("a",{href:"#/fav"}, "💛 ", t("favs"), h("span",{class:"ar",text:"›"})),
          h("a",{href:"#/rules"}, "📄 ", t("rulesTitle"), h("span",{class:"ar",text:"›"})),
          h("button",{onclick:()=>adminContactSheet()}, "☎️ ", t("contactAdmin"), h("span",{class:"ar",text:"›"})))));
    $("app").append(verLine());
    return;
  }
  const u = S.user || {};
  const list = h("div",{class:"rows"}, h("div",{class:"empty",style:{padding:"20px"}}, h("div",{class:"spin"})));
  const count = h("span",{style:{color:"var(--mut2)",fontWeight:"500"}});
  const statusBox = h("div"), balBox = h("div");
  const picker = h("input",{type:"file",accept:"image/*",multiple:true,hidden:true});
  picker.onchange = () => { S.pendingFiles = [...picker.files]; picker.value = ""; go("/sell"); };
  page(h("div",{class:"me-head"}, avaEl(u.name, u.logo),
      h("div",{style:{flex:1,minWidth:0}}, h("div",{class:"nm",text:u.name}), h("div",{class:"sub",text:phoneFmt(u.phone)+" · "+u.city+(u.stype ? " · "+t("stype_"+u.stype) : "")})), langSwitch()),
    h("div",{class:"wrap"},
      statusBox, balBox,
      h("div",{class:"box"},
        h("button",{class:"add-big",onclick:()=>picker.click()}, h("span",{style:{fontSize:"34px",color:"var(--red)"},text:"📷"}),
          t("addProduct"), h("span",{text:t("addProductSub")})), picker),
      h("a",{class:"box my-shop-big",href:"#/u/"+u.id}, h("span",{class:"ms-ic",text:"🏪"}),
        h("span",{class:"ms-in"}, h("b",null, t("myShop"), " ", count), h("small",{text:t("myShopSub")})), h("span",{class:"ar",text:"›"})),
      h("div",{class:"box menu"},
        h("a",{href:"#/chats"}, "💬 ", t("tChats"), h("span",{class:"ar",text:"›"})),
        h("a",{href:"#/fav"}, "💛 ", t("favs"), h("span",{class:"ar",text:"›"})),
        h("a",{href:"#/profile"}, "⚙️ ", t("profile"), h("span",{class:"ar",text:"›"})),
        h("a",{href:"#/rules"}, "📄 ", t("rulesTitle"), h("span",{class:"ar",text:"›"})),
        h("a",{href:"#/support"}, "💬 ", t("chatAdmin"), S.supportUnread ? h("span",{class:"sup-dot red",text:String(S.supportUnread)}) : null, h("span",{class:"ar",text:"›"})),
        h("button",{onclick:()=>adminContactSheet()}, "☎️ ", t("contactAdmin"), h("span",{class:"ar",text:"›"})),
        h("button",{onclick:()=>logoutAsk()}, "🚪 ", t("logout")),
        h("button",{class:"del-acc",onclick:()=>deleteAccountAsk()}, "🗑 ", t("delAcc")))));
  $("app").append(verLine());
  const r = await call("me");
  if (!r.ok){ statusBox.replaceChildren(h("div",{class:"err",text:errText(r)})); return; }
  S.user = r.user; lsSet("user", r.user); setExpDays(r.expDays);
  if (r.balance != null){
    S.balance = +r.balance || 0; S.vipPrices = r.vipPrices || {}; S.shopVip = r.shopVip || ""; S.supportUnread = +r.supportUnread || 0; updateBadge();
    const drawBal = () => balBox.replaceChildren(h("div",{class:"box bal-box"},
      h("div",{class:"coin",text:"🪙"}),
      h("div",{style:{flex:1,minWidth:0}}, h("small",{text:t("balance")}), h("b",{id:"bal-sum",text:coins(S.balance)}), h("span",{text:t("coinRate")})),
      h("button",{class:"btn sm",onclick:()=>topUpSheet()}, t("topUp"), S.supportUnread ? h("span",{class:"sup-dot",text:String(S.supportUnread)}) : null)),
      r.products.length ? h("div",{class:"box shop-vip-box"+(S.shopVip ? " on" : "")},
        h("button",{class:"btn block vip-shop-btn",onclick:()=>shopVipSheet(() => { drawBal(); })},
          "⭐ ", S.shopVip ? t("vipShopOn",{d:dayName(S.shopVip)}) : t("makeShopVip"))) : null);
    drawBal();
  }
  if (r.user.seller === "pending") statusBox.replaceChildren(h("div",{class:"box"}, h("div",{class:"warn"}, h("span",{text:"⏳"}), h("span",{text:t("pendingNote")}))));
  if (r.user.seller === "pending") statusBox.querySelector(".box").append(h("button",{class:"link",style:{marginTop:"10px"},text:t("contactAdmin"),onclick:()=>adminContactSheet()}));
  if (r.user.seller === "blocked") statusBox.replaceChildren(h("div",{class:"box"}, h("div",{class:"warn",style:{background:"#fde8e8",color:"#9b1c1c"}}, h("span",{text:"⛔"}), h("span",{text:t("blockedNote")}))));
  count.textContent = r.products.length ? "("+r.products.length+")" : "";
  // скоро удалятся — предупреждение со ссылкой в магазин
  const soon = r.products.filter(expSoon);
  if (soon.length) statusBox.append(h("a",{class:"box",id:"exp-warn",href:"#/u/"+r.user.id,style:{display:"block"}}, h("div",{class:"warn",style:{background:"#fde8e8",color:"#9b1c1c"}},
    h("span",{text:"⏳"}), h("span",{text:t("expSoon",{n:soon.length})}))));
  updateBadge();
}
// свой магазин: все свои товары (и снятые), у каждого ✎ ✕ 🗑, VIP за монеты и «удалится через…»
async function viewMyShop(uid){
  setTab("me");
  let cat = (S.shopPre && S.shopPre.cat) || "";   // категория, выбранная наверху (главная / VIP-магазины)
  S.shopPre = null;
  const catBox = h("div");
  const u = S.user || {};
  const list = h("div",{class:"rows"}, h("div",{class:"empty",style:{padding:"20px"}}, h("div",{class:"spin"})));
  const top = h("div"), warn = h("div"), vBox = h("div");
  const setV = () => { list.className = "rows my-rows v-" + viewMode(); vBox.replaceChildren(h("div",{class:"ltools"}, h("div",{class:"sp"}), viewMini(setV))); };
  setV();
  const q = h("input",{type:"search",placeholder:t("searchShop"),"aria-label":t("searchShop")});
  const picker = h("input",{type:"file",accept:"image/*",multiple:true,hidden:true});
  picker.onchange = () => { S.pendingFiles = [...picker.files]; picker.value = ""; go("/sell"); };
  page(topBar("🏪 "+t("myShop"), {right: h("a",{class:"btn sm ghost",href:"#/u/"+uid+"/view",text:"👀 "+t("asBuyer")})}),
    h("div",{class:"wrap"},
      h("div",{class:"shop-head"}, h("div",{class:"seller"}, avaEl(u.name, u.logo, "big"),
        h("div",{style:{minWidth:0}}, h("div",{class:"nm",text:u.name}), stypeBadge(u.stype), h("div",{class:"sub",text:"📍 "+(u.city||"")})))),
      top, warn,
      h("div",{class:"box"},
        h("div",{class:"ms-tools"},
          h("div",{class:"search",style:{border:"1px solid var(--line)"}}, h("span",{html:IC.search}), q),
          h("button",{class:"btn sm",onclick:()=>picker.click()}, icon("plus"), t("tAdd")), picker),
        catBox, vBox, list)));
  const r = await call("me");
  if (location.hash !== "#/u/"+uid) return;
  if (!r.ok){ list.replaceChildren(h("div",{class:"err",text:errText(r)})); return; }
  S.user = r.user; lsSet("user", r.user); setExpDays(r.expDays);
  if (r.balance != null){ S.balance = +r.balance || 0; S.vipPrices = r.vipPrices || {}; S.shopVip = r.shopVip || ""; }
  const drawTop = () => top.replaceChildren(h("div",{class:"own-vip"},
    h("div",{class:"ov-bal"}, "🪙 ", h("span",{id:"bal-sum",text:coins(S.balance)}), h("button",{class:"link",text:t("topUp"),onclick:()=>topUpSheet()})),
    h("div",{class:"ov-hint",text: S.shopVip ? "⭐ "+t("vipUntil",{d:dayName(S.shopVip)})+" — "+t("vipShopAllOn") : t("vipItemHint",{p:coins((S.vipPrices||{}).item || 10)})}),
    null));
  drawTop();
  if (!r.products.length){ list.replaceChildren(h("p",{class:"hint",style:{margin:0},text:t("noGoods")})); return; }
  const soon = r.products.filter(expSoon);
  if (soon.length) warn.replaceChildren(h("div",{class:"box",id:"exp-warn"}, h("div",{class:"warn",style:{background:"#fde8e8",color:"#9b1c1c"}},
    h("span",{text:"⏳"}), h("span",{text:t("expSoon",{n:soon.length})}))));
  const prods = soon.concat(r.products.filter(p => !expSoon(p)));
  const rows = prods.map(p => { const x = myRow(p, r.user, drawTop); x._p = p; return x; });
  const cats = [...new Set(r.products.map(p => p.cat))];
  if (cat && !cats.includes(cat)) cat = "";
  const drawCats = () => catBox.replaceChildren(cats.length > 1 ? h("div",{class:"chips",style:{padding:"0 0 8px"}},
    h("button",{class:"chip"+(!cat?" on":""),text:t("allGoods"),onclick:()=>{ cat = ""; drawCats(); draw(); }}),
    ...cats.map(c => h("button",{class:"chip"+(cat===c?" on":""),text:catOf(c).e+" "+catName(c),onclick:()=>{ cat = c; drawCats(); draw(); }}))) : null);
  const draw = () => {
    const v = q.value.trim().toLowerCase();
    const vis = rows.filter(x => (!cat || x._p.cat === cat) && (!v || looseHas((x._p.title+" "+catName(x._p.cat)).toLowerCase(), v)));
    list.replaceChildren(...(vis.length ? vis : [h("p",{class:"hint",style:{margin:0},text:t("nothingQ",{q:q.value.trim()})})]));
  };
  q.oninput = draw; drawCats(); draw();
  // обратный отсчёт — раз в минуту
  S.timers.push(setInterval(() => rows.forEach(x => x._tick && x._tick()), 60000));
  updateBadge();
}
function myRow(p, u, onBal){
  const stChip = () => {
    const live = p.status === "active" && u.seller === "active";
    const [cls, key] = p.status === "banned" ? ["bad","st_short_banned"] : p.status === "sold" ? ["off","st_short_sold"] :
      p.status === "hidden" ? ["off","st_short_hidden"] : live ? ["ok","st_short_active"] : ["wait","st_short_wait"];
    return h("span",{class:"st "+cls,text:t(key)});
  };
  const row = h("div",{class:"row my"+(isVip(p)?" vip":"")});
  const timer = h("div",{class:"exp"});
  row._tick = () => {
    if (!expAt(p)){ timer.hidden = true; return; }
    const soon = expSoon(p);
    timer.hidden = false; timer.className = "exp" + (soon ? " soon" : "");
    timer.replaceChildren(h("span",{text:"⏳ "+expText(p)}),
      soon ? h("button",{class:"btn sm",text:t("renew"),onclick:renew}) : null);
  };
  const draw = () => {
    const acts = h("div",{class:"acts"});
    if (p.status === "active"){
      acts.append(h("button",{class:"ebtn","aria-label":t("edit"),title:t("edit"),html:IC.edit,onclick:()=>go("/edit/"+p.id)}),
        h("button",{class:"xbtn","aria-label":t("removeSale"),title:t("removeSale"),text:"✕",onclick:()=>setStatus("sold")}),
        h("button",{class:"ebtn del","aria-label":t("delete"),title:t("delete"),html:IC.trash,onclick:()=>del()}));
    } else if (p.status !== "banned"){
      acts.append(h("button",{class:"btn sm soft",text:t("backSale"),onclick:()=>setStatus("active")}),
        h("button",{class:"ebtn del","aria-label":t("delete"),title:t("delete"),html:IC.trash,onclick:()=>del()}));
    }
    const vipOn = isVip(p), shopOn = S.shopVip && new Date(S.shopVip) > Date.now();
    const vip = p.status !== "active" ? (vipOn ? h("span",{class:"vip-pill",text:"⭐ "+t("vipUntil",{d:dayName(p.vip)})}) : null) :
      shopOn ? h("span",{class:"vip-pill",text:"⭐ "+t("vipUntil",{d:dayName(p.vip || S.shopVip)})}) :
      h("button",{class:"vip-ask"+(vipOn ? " on" : ""),onclick:()=>itemVipSheet(p, afterVip)},
        vipOn ? "⭐ "+t("vipUntil",{d:dayName(p.vip)})+" · ＋" : "⭐ "+t("makeVip")+" · "+coins((S.vipPrices||{}).item || 10));
    const more = null;
    row.replaceChildren(
      h("div",{class:"my-top"},
        p.thumb ? h("img",{src:p.thumb,alt:""}) : h("div",{class:"noimg"}),
        h("a",{class:"in",href:"#/p/"+p.id}, h("div",{class:"t",text:p.title}),
          h("div",{class:"s"}, priceEl(p.price), stChip()),
          h("div",{class:"where",text:[catName(p.cat), p.sub ? subName(p.sub) : "", [(p.attrs||{}).brand ? brandName(p.attrs.brand) : "", modelLabel((p.attrs||{}).model)].filter(Boolean).join(" ")].filter(Boolean).join(" · ")})), acts),
      vip || expAt(p) ? h("div",{class:"my-bot"}, vip, more, timer) : null,
      // старое объявление без раздела — покупатели не найдут его в разделе и фильтрах
      SUBS[p.cat] && !p.sub && p.status !== "banned" ? h("button",{class:"no-sub",onclick:()=>go("/edit/"+p.id)}, "⚠️ ", t("noSubWarn")) : null);
    row._tick();
  };
  function afterVip(){ row.className = "row my" + (isVip(p) ? " vip" : ""); draw(); if ($("bal-sum")) $("bal-sum").textContent = coins(S.balance); onBal && onBal(); }
  async function renew(){
    const r = await call("renewProduct", {id: p.id});
    if (!r.ok) return toast(errText(r));
    p.exp = r.exp; p.at = r.at || p.at; const c = byId(p.id); if (c){ c.exp = p.exp; c.at = p.at; }
    S.catalogAt = 0; draw(); toast(t("renewOk"));
    if (!document.querySelector(".row.my .exp.soon") && $("exp-warn")) $("exp-warn").remove();
    updateBadge();
  }
  async function setStatus(st){
    const old = p.status; p.status = st; draw();
    const r = await call("setStatus", {id: p.id, status: st});
    if (!r.ok){ p.status = old; draw(); return toast(errText(r)); }
    S.catalogAt = 0;
    if (st === "sold") toast(t("removedOk"), {label: t("undo"), fn: () => setStatus("active")});
    else toast(t("backOk"));
  }
  async function del(){
    const yes = await sheet((box, close) => box.append(h("h2",{text:t("delQ")}), h("p",{text:p.title}),
      h("div",{style:{display:"grid",gap:"10px"}},
        h("button",{class:"btn block",style:{background:"#c62828"},text:t("delete"),onclick:()=>close(true)}),
        h("button",{class:"btn block ghost",text:t("cancel"),onclick:()=>close(false)}))));
    if (!yes) return;
    const r = await call("deleteProduct", {id: p.id});
    if (!r.ok) return toast(errText(r));
    row.remove(); S.catalogAt = 0; toast(t("deleted"));
  }
  draw();
  return row;
}
function viewProfile(){
  setTab("me");
  if (!S.token){ go("/me"); return; }
  const u = S.user;
  const name = h("input",{class:"inp",maxlength:"60",value:u.name});
  const city = h("select",{class:"inp"}, ...CITIES.map(c => h("option",{value:c,text:c,selected:u.city===c})));
  const imo = h("input",{type:"checkbox",checked:!!u.imo});
  const stype = h("select",{class:"inp"}, h("option",{value:"",text:t("role_buyer")}),
    ...STYPES.map(s => h("option",{value:s,text:t("role_"+s),selected:u.stype===s})));
  const logo = logoPicker(u.logo || "");
  const err = h("div",{class:"err"});
  const save = h("button",{class:"btn block",text:t("save")});
  save.onclick = async () => {
    if (!name.value.trim()) return err.textContent = t("e_name");
    save.disabled = true;
    const r = await call("saveProfile", {name: name.value, city: city.value, imo: imo.checked, stype: stype.value});
    if (r.ok && logo.changed()){
      const lr = await call("uploadLogo", {data: logo.data() || "", mime: "image/jpeg"});
      if (lr.ok) S.user.logo = lr.logo;
    }
    save.disabled = false;
    if (!r.ok) return err.textContent = errText(r);
    Object.assign(S.user, {name: name.value.trim(), city: city.value, imo: imo.checked, stype: stype.value}); lsSet("user", S.user);
    S.catalogAt = 0;
    toast(t("saved")); go("/me");
  };
  page(topBar(t("profile")), h("div",{class:"wrap"}, h("div",{class:"box"},
    h("label",{class:"field"}, h("span",{text:t("whoAreYou")}), stype),
    h("label",{class:"field"}, h("span",{text:t("name")}), name),
    h("div",{class:"field"}, h("span",{text:t("logoOpt")}), logo.el),
    h("label",{class:"field"}, h("span",{text:t("city")}), city),
    h("label",{class:"check",style:{marginBottom:"12px"}}, imo, h("span",{text:t("hasImo")})),
    h("div",{class:"hint",style:{marginBottom:"14px"},text:t("phoneFixed",{p:phoneFmt(u.phone)})}),
    err, save)));
}

/* ===== ПОПОЛНИТЬ БАЛАНС: переписка с администратором прямо в приложении ===== */
// пузырьки переписки (продавец ↔ администратор); mine — кто «я» на этом экране
function supBubbles(list, mine){
  let lastDay = "";
  const out = [];
  list.forEach(m => {
    const day = dayName(m.at);
    if (day !== lastDay){ out.push(h("div",{class:"day",text:day})); lastDay = day; }
    out.push(h("div",{class:"msg "+(m.from === mine ? "me" : "them")+(m.from === "admin" && /^✅/.test(m.text||"") ? " ok" : "")},
      m.photo ? h("a",{href:m.photo,target:"_blank",rel:"noopener"}, h("img",{src:m.photo,alt:""})) : null,
      m.amount && m.from === "user" ? h("div",{class:"sup-amt",text:"🪙 "+coins(m.amount)}) : null,
      m.text ? h("div",{text:m.text}) : null,
      h("div",{class:"tm",text:hm(m.at)})));
  });
  return out;
}
async function viewTopUp(chat){
  setTab("me", false);
  if (!S.token){ go("/me"); return; }
  const here = location.hash;
  const bal = h("b",{text:coins(S.balance)});
  const msgs = h("div",{class:"msgs sup-msgs"}, h("div",{class:"empty"}, h("div",{class:"spin"})));
  let amount = 0, file = null;
  const amtIn = h("input",{class:"inp",inputmode:"numeric",placeholder:t("topAmountPh")});
  const chips = h("div",{class:"quick sup-chips"});
  const drawChips = () => chips.replaceChildren(...[10, 30, 55, 100, 200].map(n =>
    h("button",{type:"button",class:amount === n ? "on" : null,text:n+" 🪙",onclick:()=>{ amount = n; amtIn.value = String(n); drawChips(); }})));
  amtIn.oninput = () => { amount = Math.max(0, parseInt(amtIn.value, 10) || 0); drawChips(); };
  drawChips();
  const shot = h("div",{class:"sup-shot"});
  const picker = h("input",{type:"file",accept:"image/*",hidden:true});
  const drawShot = () => shot.replaceChildren(file ? h("div",{class:"sup-prev"}, h("img",{src:file.dataUrl,alt:""}),
      h("button",{type:"button",class:"xbtn",text:"✕",onclick:()=>{ file = null; drawShot(); }})) :
    h("button",{type:"button",class:"btn block ghost",onclick:()=>picker.click()}, icon("img"), t("attachShot")));
  picker.onchange = async () => { const f = picker.files[0]; picker.value = ""; if (!f) return;
    try{ file = await compress(f, 1400); drawShot(); }catch(e){ toast(t("e_photo")); } };
  drawShot();
  const txt = h("textarea",{class:"inp",rows:"2",placeholder:t("topTextPh")});
  const send = h("button",{class:"btn block",text:t("topSend")});
  send.onclick = async () => {
    if (!amount && !file && !txt.value.trim()) return toast(chat ? t("chatNeed") : t("topNeed"));
    send.disabled = true; const b = busy(t("saving"));
    const r = await call("supportSend", {amount, text: txt.value.trim(), photo: file ? file.b64 : "", mime: "image/jpeg"});
    b.done(); send.disabled = false;
    if (!r.ok) return toast(errText(r));
    amount = 0; amtIn.value = ""; file = null; txt.value = ""; drawChips(); drawShot();
    toast(chat ? t("chatSent") : t("topSent")); load();
  };
  if (chat){ txt.placeholder = t("chatPh"); send.textContent = t("chatSend"); }
  page(topBar(chat ? "💬 "+t("chatAdmin") : "🪙 "+t("topUp")),
    h("div",{class:"wrap"},
      chat ? h("div",{class:"box sup-how"}, h("p",{style:{margin:0},text:t("chatAdminSub")})) :
      h("div",{class:"box bal-box"}, h("div",{class:"coin",text:"🪙"}),
        h("div",{style:{flex:1,minWidth:0}}, h("small",{text:t("balance")}), bal, h("span",{text:t("coinRate")}))),
      chat ? null : h("div",{class:"box sup-how"}, h("h3",{text:t("topHowT")}),
        h("ol",null, h("li",{text:t("topStep1")}), h("li",{text:t("topStep2")}), h("li",{text:t("topStep3")}))),
      msgs,
      chat ? h("div",{class:"box sup-form"},
        h("label",{class:"lbl",text:t("chatMsg")}), txt,
        h("label",{class:"lbl",text:t("chatPhoto")}), shot, picker,
        h("div",{style:{height:"10px"}}), send) :
      h("div",{class:"box sup-form"}, h("h3",{text:t("topNewT")}),
        h("label",{class:"lbl",text:t("topAmount")}), chips, amtIn,
        h("label",{class:"lbl",text:t("topShot")}), shot, picker,
        h("label",{class:"lbl",text:t("topText")}), txt,
        h("div",{style:{height:"10px"}}), send)));
  let n = -1;
  async function load(){
    const r = await call("supportList");
    if (location.hash !== here) return;
    if (!r.ok){
      // сервер ещё без этой функции — старый способ: IMO / звонок
      if (r.error === "server"){ msgs.replaceChildren(h("div",{class:"box"}, h("p",{text:t("topUpHow")}), ...adminContactBtns())); return; }
      msgs.replaceChildren(h("div",{class:"err",text:errText(r)})); return;
    }
    S.balance = +r.balance || 0; bal.textContent = coins(S.balance); S.supportUnread = 0; updateBadge();
    if (r.messages.length === n) return;
    n = r.messages.length;
    msgs.replaceChildren(...(n ? supBubbles(r.messages, "user") : [h("p",{class:"hint",style:{textAlign:"center"},text:t("topEmpty")})]));
    if (chat) window.scrollTo(0, document.body.scrollHeight);
  }
  load();
  S.timers.push(setInterval(() => { if (!document.hidden) load(); }, 20000));
}

function viewRules(){
  setTab("me");
  page(topBar(t("rulesTitle")), h("div",{class:"wrap"}, h("div",{class:"box"},
    h("p",{style:{marginTop:0},text:t("rulesSub")}), rulesList(),
    h("h3",{text:t("sellRulesT")}), h("div",{class:"rules"}, h("ul",null, ...[1,2,3].map(i => h("li",{text:t("srule"+i)})))))));
}

/* ===== ДОБАВИТЬ / ИЗМЕНИТЬ ТОВАР ===== */
async function viewSell(editId){
  setTab("me", false);
  loadModels();
  if (!S.token){
    page(topBar(t("sell")), h("div",{class:"wrap"}, emptyBox("🏪", t("sellBanner"), t("sellLogin"),
      h("button",{class:"btn",text:t("register"),onclick:async()=>{ if (await authSheet("sellAuth","reg","private")) viewSell(editId); }}))));
    return;
  }
  Vision.loadML(); // в фоне: ИИ определит категорию по фото
  let prod = {title:"", price:"", cat:"", sub:"", cond:"new", desc:"", city:"", place:"", status:"active", attrs:{}};
  if (!editId && S.sellPreset && S.sellPreset.cat){
    prod.cat = S.sellPreset.cat; prod.sub = S.sellPreset.sub || "";
    if (S.sellPreset.brand) prod.attrs = {brand: S.sellPreset.brand};
  }
  S.sellPreset = null;
  let shots = [];
  if (editId){
    page(topBar(t("editTitle")), h("div",{class:"empty"}, h("div",{class:"spin"})));
    const r = await call("product", {id: editId});
    if (!r.ok){ page(topBar(t("editTitle")), emptyBox("😕", errText(r))); return; }
    prod = migrateProduct(r.product);
    shots = (prod.photos || []).map(ph => ({existing:true, id:ph.id, thumb:ph.thumb, url:ph.url, label:ph.label||""}));
  }
  prod.attrs = Object.assign({}, prod.attrs || {});
  const origMain = shots[0] && shots[0].id;
  let mainVec = null, aiGuess = null;
  const STEPS = 5;
  let step = 1, maxStep = editId ? STEPS : 1, distOther = false, mallOther = false;

  // --- общие элементы ---
  const picker = h("input",{type:"file",accept:"image/*",multiple:true,hidden:true});
  const titleIn = h("input",{class:"inp",maxlength:"60",placeholder:t("titlePh"),value:prod.title||""});
  const titleCnt = h("div",{class:"cnt-r"});
  const updCnt = () => titleCnt.textContent = t("titleCounter",{n:titleIn.value.length});
  titleIn.oninput = () => { prod.title = titleIn.value; updCnt(); }; updCnt();
  const videoIn = h("input",{class:"inp",type:"url",inputmode:"url",maxlength:"300",placeholder:"https://www.tiktok.com/@…",value:prod.video||""});
  videoIn.oninput = () => prod.video = videoIn.value;
  const descIn = h("textarea",{class:"inp",maxlength:"2000",placeholder:t("descPh")}); descIn.value = prod.desc || "";
  descIn.oninput = () => prod.desc = descIn.value;
  const priceIn = h("input",{type:"number",inputmode:"decimal",min:"0",step:"0.01",placeholder:"0",value:+prod.price > 0 ? prod.price : "","aria-label":t("price")});
  priceIn.oninput = () => prod.price = priceIn.value;
  const shotsBox = h("div"), guessEl = h("div",{class:"guess",hidden:true});
  const content = h("div",{class:"wrap wiz"});
  const err = h("div",{class:"err"});
  const nextBtn = h("button",{class:"btn block",style:{flex:"none"}});
  const head = h("div",{class:"wiz-head"});
  const reqStar = () => h("b",{style:{color:"var(--red)"},text:" *"});
  const fail = (msg) => { err.textContent = msg; toast(msg); };

  // --- фото ---
  const drawShots = () => {
    const grid = h("div",{class:"shots"});
    shots.forEach((sh, i) => {
      const lab = h("input",{class:"shot-lab",maxlength:"30",placeholder:t("variantPh"),value:sh.label||"","aria-label":t("variantPh")});
      lab.oninput = () => { sh.label = lab.value; };
      grid.append(h("div",{class:"shot-w"},
        h("div",{class:"shot"},
          h("img",{src:sh.thumb || sh.dataUrl,alt:"",onclick:()=>{ if (i){ shots.unshift(shots.splice(i,1)[0]); mainVec = null; drawShots(); analyzeMain(); } }}),
          h("button",{class:"x","aria-label":t("delete"),text:"×",onclick:()=>{ shots.splice(i,1); if (!i) mainVec = null; drawShots(); analyzeMain(); }}),
          i === 0 ? h("div",{class:"main",text:t("mainPhoto")}) : null),
        lab));
    });
    if (shots.length < MAX_PHOTOS) grid.append(h("div",{class:"shot-w"}, h("button",{class:"add-shot",onclick:()=>picker.click()}, h("span",{html:IC.cam}), t("addPhoto"))));
    shotsBox.replaceChildren(shots.length ? grid :
      h("button",{class:"add-big",onclick:()=>picker.click()}, h("span",{style:{fontSize:"34px"},text:"📷"}), t("addPhotos"), h("span",{text:t("addPhotosSub")})),
      shots.length ? h("div",{class:"hint",text:t("variantHint")}) : null);
  };
  async function addFiles(files){
    if (files.length > MAX_PHOTOS - shots.length) toast(t("e_too_many"));
    files = [...files].slice(0, MAX_PHOTOS - shots.length);
    for (const f of files){ try{ shots.push(Object.assign({file:f}, await compress(f, 1280))); }catch(e){ toast(t("e_photo")); } }
    drawShots(); analyzeMain();
  }
  async function analyzeMain(){
    const sh = shots[0];
    if (!sh || sh.existing){ guessEl.hidden = true; return; }
    const res = await Vision.describe(sh.img || await loadImg(sh.dataUrl), 20000);
    if (shots[0] !== sh) return;
    mainVec = res;
    if (res.cat && CATS.some(c => c.id === res.cat)){
      aiGuess = {cat: res.cat, sub: res.sub || ""};
      guessEl.hidden = false;
      guessEl.textContent = "✨ " + t("w_aiFound",{c: catName(res.cat) + (res.sub ? " · " + subName(res.sub) : "")});
    }
  }
  picker.onchange = () => { addFiles(picker.files); picker.value = ""; };

  // --- поля категории ---
  const reqFields = () => prod.cat ? fieldsFor(prod.cat, prod.sub, prod.attrs).filter(f => f.req) : [];
  const optFields = () => prod.cat ? fieldsFor(prod.cat, prod.sub, prod.attrs).filter(f => !f.req) : [];
  const catDone = () => prod.cat && (!SUBS[prod.cat] || prod.sub) && reqFields().every(f => prod.attrs[f.k]);
  const fieldWidget = (f, a, redraw) => {
    const sub = prod.sub;
    if (f.type === "sel" || f.type === "multi"){
      const opts = optsOf(f, sub, a);
      if (f.type === "sel" && opts.length > 12){
        const sel = h("select",{class:"inp"}, h("option",{value:"",text:t("pickOpt"),selected:!a[f.k]}),
          ...opts.map(o => h("option",{value:o,text:optLabel(f, o),selected:a[f.k]===o})));
        sel.onchange = () => { a[f.k] = sel.value; redraw(); };
        return sel;
      }
      const box = h("div",{class:"chips wrap-chips"});
      const d = () => box.replaceChildren(...opts.map(o => {
        const on = f.type === "multi" ? (a[f.k] || []).includes(o) : a[f.k] === o;
        return h("button",{type:"button",class:"chip"+(on?" on":""),text:(f.type === "multi" ? (on ? "☑ " : "☐ ") : "")+optLabel(f, o)+(f.unit && f.type==="sel" ? " "+f.unit : ""),onclick:()=>{
          if (f.type === "multi"){ const arr = (a[f.k] || []).slice(); const i = arr.indexOf(o); i < 0 ? arr.push(o) : arr.splice(i, 1); a[f.k] = arr; d(); }
          else { a[f.k] = on ? "" : o; redraw(); }
        }});
      }));
      d(); return box;
    }
    if (f.type === "year"){
      const sel = h("select",{class:"inp"}, h("option",{value:"",text:"—"}), ...range(1970, yr() + 1).reverse().map(y => h("option",{value:y,text:y,selected:a[f.k]===y})));
      sel.onchange = () => a[f.k] = sel.value; return sel;
    }
    if (f.type === "num"){
      const inp = h("input",{class:"inp",type:"number",inputmode:"decimal",min:"0",step:f.step||"1",placeholder:"0",value:a[f.k]||""});
      inp.oninput = () => a[f.k] = inp.value;
      return f.unit ? h("div",{class:"unit-in"}, inp, h("b",{text:f.unit})) : inp;
    }
    const list = f.list ? f.list(sub, a) : [];
    const id = "dl_" + f.k;
    const inp = h("input",{class:"inp",maxlength:String(f.max||40),placeholder:list.length ? t("modelPh") : "",value:a[f.k]||"",autocomplete:"off"});
    if (!list.length){ inp.oninput = () => a[f.k] = inp.value; return inp; }
    // подсказки: можно писать по-русски («камри», «хайландер») — выберется правильное название
    const sug = h("div",{class:"sug"});
    const showSug = () => {
      const v = inp.value.trim().toLowerCase();
      const hits = v ? list.filter(m => looseHas(m.toLowerCase(), v)).slice(0, 8) : [];
      sug.replaceChildren(...(hits.length === 1 && hits[0] === inp.value ? [] : hits.map(m => h("button",{type:"button",class:"chip",text:m,onclick:()=>{ inp.value = m; a[f.k] = m; sug.replaceChildren(); }}))));
    };
    inp.oninput = () => { a[f.k] = inp.value; showSug(); };
    inp.onchange = () => { const c = canonName(list, inp.value, a.brand); if (c !== inp.value){ inp.value = c; a[f.k] = c; } };
    return h("div",null, inp, sug);
  };

  // строка списка (как в Aýterek): фото/значок + название + ›
  const rowItem = (tile, label, sub2, onclick, on) => h("button",{type:"button",class:"wrow"+(on?" on":""),onclick},
    tile, h("div",{class:"wrow-t"}, h("b",{text:label}), sub2 ? h("small",{text:sub2}) : null), h("span",{class:"ar",text:on ? "✓" : "›"}));
  const crumb = () => {
    const parts = [];
    if (prod.cat) parts.push(h("button",{class:"crumb",onclick:()=>{ prod.cat = ""; prod.sub = ""; prod.attrs = {}; render(); }}, catName(prod.cat)));
    if (prod.sub) parts.push(h("button",{class:"crumb",onclick:()=>{ prod.sub = ""; prod.attrs = {}; render(); }}, subName(prod.sub)));
    reqFields().forEach(f => { if (prod.attrs[f.k]) parts.push(h("button",{class:"crumb",onclick:()=>{ prod.attrs[f.k] = ""; render(); }}, optLabel(f, prod.attrs[f.k]))); });
    return parts.length ? h("div",{class:"crumbs"}, ...parts, h("small",{class:"swipe",text:t("w_change")})) : null;
  };

  // --- шаги ---
  const stepTitles = ["w1","w2","w3","w4","w5"];
  function drawHead(){
    head.replaceChildren(
      h("div",{class:"bar",style:{position:"static",border:0}},
        h("button",{class:"icon-btn","aria-label":t("back"),html:IC.back,onclick:()=>{ if (step > 1){ step--; render(); } else go("/me"); }}),
        h("h1",{text:editId ? t("editTitle") : t("addListing")})),
      h("div",{class:"wiz-steps"}, ...stepTitles.map((k, i) => h("button",{class:"ws"+(i+1===step?" on":"")+(i+1<=maxStep?" ok":""),
        onclick:()=>{ if (i+1 <= maxStep){ step = i+1; render(); } }}, h("i"), h("span",{text:t(k)})))),
      h("div",{class:"wiz-sub",text:t("w_step",{i:step,n:STEPS})+" · "+t(stepTitles[step-1])}));
  }
  function goStep(n){ step = n; maxStep = Math.max(maxStep, n); render(); window.scrollTo(0, 0); }

  function step1(){
    nextBtn.textContent = t("w_continue");
    nextBtn.onclick = () => {
      if (!shots.length) return fail(t("e_noPhoto"));
      if (!titleIn.value.trim()) return fail(t("e_noTitle"));
      if (!prod.cat && aiGuess){ prod.cat = aiGuess.cat; prod.sub = aiGuess.sub && (SUBS[prod.cat]||[]).includes(aiGuess.sub) ? aiGuess.sub : ""; }
      goStep(2);
    };
    return [
      h("div",{class:"box"}, editId ? null : h("p",{class:"ai-note",text:"✨ "+t("w_ai")}), shotsBox, guessEl, picker),
      h("div",{class:"box"},
        h("label",{class:"field",style:{marginBottom:0}}, h("span",null, t("title"), reqStar()), titleIn, titleCnt),
        editId ? null : h("button",{class:"btn block ghost",style:{marginTop:"12px"},text:t("w_pickSelf"),onclick:()=>{
          if (!shots.length) return fail(t("e_noPhoto")); if (!titleIn.value.trim()) return fail(t("e_noTitle"));
          prod.cat = ""; prod.sub = ""; goStep(2); }})),
      h("div",{class:"box"},
        h("label",{class:"field",style:{marginBottom:0}}, h("span",{text:t("videoOpt")}), videoIn, h("div",{class:"hint",text:t("videoHint")})))
    ];
  }
  function step2(){
    nextBtn.textContent = t("w_continue");
    nextBtn.onclick = () => {
      if (!prod.cat) return fail(t("e_noCat"));
      if (SUBS[prod.cat] && !prod.sub) return fail(t("w_pickSub"));
      const miss = reqFields().find(f => !prod.attrs[f.k]);
      if (miss) return fail(t("e_req",{f: fieldLabel(miss)}));
      goStep(3);
    };
    const redraw = () => render();
    const next = () => { if (catDone()) goStep(3); else render(); };
    if (!prod.cat){
      return [h("div",{class:"box"}, h("h3",{text:t("w_pickCat")}),
        ...CATS.map(c => rowItem(catTile(c.id), catName(c.id), (SUBS[c.id]||[]).slice(0,3).map(subName).join(", ")+"…", ()=>{ prod.cat = c.id; prod.sub = ""; prod.attrs = {}; next(); })))];
    }
    if (SUBS[prod.cat] && !prod.sub){
      return [h("div",{class:"box"}, crumb(), h("h3",{text:t("w_pickSub")}),
        ...SUBS[prod.cat].map(k => rowItem(tileImg("sub:"+prod.cat+":"+k, () => catIcon(prod.cat)), subName(k), "", ()=>{ prod.sub = k; prod.attrs = {}; next(); })))];
    }
    const miss = reqFields().find(f => !prod.attrs[f.k]);
    if (miss){
      const opts = optsOf(miss, prod.sub, prod.attrs);
      const isBrand = miss.k === "brand";
      return [h("div",{class:"box"}, crumb(), h("h3",{text:fieldLabel(miss)}),
        isBrand && prod.cat === "auto" ? makeList(opts, null, b => { prod.attrs[miss.k] = b; next(); }, "", false) :
        isBrand ? h("div",{class:"brand-grid"}, ...opts.map(o => photoTile("brand:"+o, optLabel(miss, o), false, ()=>{ prod.attrs[miss.k] = o; next(); }, null, prod.cat)))
          : h("div",null, ...opts.map(o => rowItem(h("b",{class:"ci txt",text:""}), optLabel(miss, o), "", ()=>{ prod.attrs[miss.k] = o; next(); }))))];
    }
    return [h("div",{class:"box"}, h("h3",{text:t("w2")}), crumb(), h("p",{class:"hint",text:"✓"}))];
  }
  function step3(){
    nextBtn.textContent = t("w_continue");
    nextBtn.onclick = () => { if (!prod.city) return fail(t("w_pickVel")); goStep(4); };
    if (!prod.city){
      return [h("div",{class:"box"}, h("h3",{text:t("w_pickVel")}),
        ...CITIES.map(c => rowItem(h("b",{class:"ci txt",text:"📍"}), c, (DISTRICTS[c]||[]).slice(0,3).join(", ")+"…", ()=>{ prod.city = c; prod.place = ""; distOther = false; render(); })))];
    }
    const list = DISTRICTS[prod.city] || [];
    const other = h("input",{class:"inp",maxlength:"40",placeholder:prod.cat === "realty" ? t("placeRealtyPh") : t("placePh"),value:list.includes(prod.place) ? "" : prod.place||""});
    other.oninput = () => prod.place = other.value;
    // сначала — торговый центр / рынок (если продавец там)
    const malls = mallsOf(prod.city), cur = prod.attrs.mall || "";
    const mq = h("input",{class:"inp",type:"search",placeholder:"🔍  "+t("mallSearch")});
    const mOther = h("input",{class:"inp",maxlength:"40",placeholder:t("mallOtherPh"),value:cur && !malls.includes(cur) ? cur : ""});
    mOther.onchange = () => { prod.attrs.mall = mOther.value.trim(); };
    const mList = h("div");
    const drawM = () => {
      const v = mq.value.trim().toLowerCase();
      mList.replaceChildren(...malls.filter(m => !v || looseHas(m.toLowerCase(), v)).map(m =>
        rowItem(h("b",{class:"ci txt",text:"🏬"}), m, "", ()=>{ prod.attrs.mall = m; prod.place = ""; goStep(4); }, cur === m)));
    };
    mq.oninput = drawM; drawM();
    return [h("div",{class:"box"},
      h("div",{class:"crumbs"}, h("button",{class:"crumb",onclick:()=>{ prod.city = ""; prod.place = ""; delete prod.attrs.mall; render(); }}, "📍 "+prod.city), h("small",{class:"swipe",text:t("w_change")})),
      h("h3",{text:"🏬 "+t("mallPick")}), h("p",{class:"hint",style:{marginTop:"-4px"},text:t("mallPickSub")}),
      malls.length > 6 ? mq : null, mList,
      rowItem(h("b",{class:"ci txt",text:"✏️"}), t("mallOther"), "", ()=>{ mallOther = true; render(); setTimeout(() => mOther.focus(), 50); }, mallOther || (cur && !malls.includes(cur))),
      mallOther || (cur && !malls.includes(cur)) ? h("div",{style:{margin:"8px 0"}}, mOther,
        h("button",{class:"btn block",style:{marginTop:"8px"},text:t("w_continue"),onclick:()=>{ prod.attrs.mall = mOther.value.trim(); if (prod.attrs.mall) goStep(4); }})) : null,
      cur ? rowItem(h("b",{class:"ci txt",text:"✕"}), t("mallNone"), "", ()=>{ delete prod.attrs.mall; mallOther = false; render(); }) : null),
      h("div",{class:"box"},
      h("h3",{text:t("w_pickDist")}), h("p",{class:"hint",style:{marginTop:"-4px"},text:t("distSub")}),
      ...list.map(d => rowItem(h("b",{class:"ci txt",text:"🏘"}), d, "", ()=>{ prod.place = d; delete prod.attrs.mall; goStep(4); }, prod.place === d)),
      rowItem(h("b",{class:"ci txt",text:"✏️"}), t("w_otherDist"), "", ()=>{ distOther = true; render(); setTimeout(() => other.focus(), 50); }, distOther),
      distOther || (prod.place && !list.includes(prod.place)) ? h("div",{style:{marginTop:"10px"}}, other) : null)];
  }
  function step4(){
    nextBtn.textContent = t("w_continue");
    nextBtn.onclick = () => goStep(5);
    const a = prod.attrs, flds = optFields();
    const condSeg = h("div",{class:"seg"});
    const drawCond = () => condSeg.replaceChildren(...["new","used"].map(k => h("button",{type:"button",class:prod.cond===k?"on":null,text:t(k),onclick:()=>{ prod.cond=k; drawCond(); }})));
    drawCond();
    return [h("div",{class:"box"},
      h("p",{class:"hint",style:{marginTop:0},text:t("w_optional")}),
      ...flds.map(f => h(f.type === "sel" || f.type === "multi" ? "div" : "label",{class:"field"},
        h("span",null, fieldLabel(f), f.unitKey ? h("small",{class:"swipe",text:t(f.unitKey)}) : null), fieldWidget(f, a, () => render()))),
      NO_COND[prod.cat] ? null : h("div",{class:"field"}, h("span",{text:t("cond")}), condSeg),
      h("label",{class:"field",style:{marginBottom:0}}, h("span",{text:t("descOpt")}), descIn))];
  }
  function step5(){
    nextBtn.textContent = editId ? t("save") : t("publish");
    nextBtn.onclick = publish;
    const free = PRICE_FREE[prod.cat], optional = PRICE_OPTIONAL[prod.cat];
    const u = S.user || {};
    return [
      h("div",{class:"box wiz-sum"},
        shots[0] ? h("img",{src:shots[0].thumb || shots[0].dataUrl,alt:""}) : null,
        h("div",null, h("b",{text:prod.title}), h("small",{text:[catName(prod.cat), prod.sub ? subName(prod.sub) : "", prod.attrs.brand ? brandName(prod.attrs.brand) : ""].filter(Boolean).join(" › ")}),
          h("small",{text:"📍 "+[prod.city, prod.attrs.mall ? "🏬 "+prod.attrs.mall : "", prod.place].filter(Boolean).join(" · ")}))),
      free ? h("div",{class:"box"}, h("div",{class:"price nego",text:"🎁 "+t("freePrice")})) :
        h("div",{class:"box"}, h("label",{class:"field",style:{marginBottom:0}}, h("span",null, optional ? t("priceOpt") : t("price"), optional ? null : reqStar()),
          h("div",{class:"price-in"}, priceIn, h("b",{text:"TMT"})))),
      h("div",{class:"box"},
        h("div",{class:"field",style:{marginBottom:0}}, h("span",{text:t("w_contact")}),
          h("div",{class:"phone-ro"}, h("b",{text:phoneFmt(u.phone)}), u.imo ? h("span",{class:"st ok",text:"IMO"}) : null),
          h("div",{class:"hint",text:t("w_changePhone")}))),
      h("div",{class:"box"}, h("div",{class:"hint",style:{marginTop:0},text:t("sellAgree")}))
    ];
  }

  async function publish(){
    err.textContent = "";
    if (!shots.length) { goStep(1); return fail(t("e_noPhoto")); }
    if (!prod.title.trim()) { goStep(1); return fail(t("e_noTitle")); }
    if (!catDone()) { goStep(2); return fail(t("e_noCat")); }
    if (!prod.city) { goStep(3); return fail(t("w_pickVel")); }
    const price = PRICE_FREE[prod.cat] ? 0 : parseFloat(String(priceIn.value).replace(",", ".")) || 0;
    if (!(price > 0) && !PRICE_OPTIONAL[prod.cat] && !PRICE_FREE[prod.cat]) return fail(t("e_noPrice"));
    if (videoIn.value.trim() && !videoUrl(videoIn.value)) { goStep(1); return fail(t("e_video")); }
    const flds = fieldsFor(prod.cat, prod.sub, prod.attrs);
    const b = busy(t("saving"));
    try{
      const main = shots[0];
      let vec = null;
      if (!main.existing){ vec = mainVec || await Vision.describe(main.img || await loadImg(main.dataUrl), 8000); }
      else if (main.id !== origMain){ try{ vec = await Vision.describe(await loadImg(main.url || main.thumb, true), 8000); }catch(e){} }
      if (prod.attrs.model && prod.attrs.brand) prod.attrs.model = canonName([...new Set([...modelsOf(prod.sub, prod.attrs.brand), ...(CAR_MODELS[prod.attrs.brand] || [])])], prod.attrs.model, prod.attrs.brand);
      const data = {title: prod.title.trim(), price, cat: prod.cat, cond: NO_COND[prod.cat] ? "new" : prod.cond, desc: descIn.value, city: prod.city, status: editId ? prod.status : "active",
        place: (prod.place||"").trim(), video: videoUrl(videoIn.value), sub: SUBS[prod.cat] ? prod.sub : "",
        attrs: Object.fromEntries(flds.map(f => [f.k, prod.attrs[f.k]]).filter(([k, v]) => v != null && v !== "" && !(Array.isArray(v) && !v.length))
          .map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
          .concat(prod.attrs.mall ? [["mall", String(prod.attrs.mall).trim().slice(0, 60)]] : [])),
        photoOrder: editId ? shots.filter(x => x.existing).map(x => x.id) : [],
        photoLabels: Object.fromEntries(shots.filter(x => x.existing).map(x => [x.id, (x.label||"").trim()]))};
      if (editId) data.id = editId;
      if (vec){ data.vs = vec.vs; data.vm = vec.vm || ""; }
      const r = await call("saveProduct", {product: data});
      if (!r.ok) throw r;
      const id = r.id;
      const fresh = shots.filter(x => !x.existing), idMap = new Map();
      for (let i = 0; i < fresh.length; i++){
        b.set(t("uploading",{i:i+1,n:fresh.length}), i / fresh.length);
        const upd = {id, data: fresh[i].b64, mime: "image/jpeg", label: (fresh[i].label||"").trim()};
        let up = await call("uploadPhoto", upd);
        if (!up.ok && up.error === "net"){ await sleep(1500); up = await call("uploadPhoto", upd); }
        if (!up.ok) throw up;
        idMap.set(fresh[i], up.photo.id);
      }
      b.set(null, 1);
      const order = shots.map(x => x.existing ? x.id : idMap.get(x));
      const serverOrder = shots.filter(x => x.existing).map(x => x.id).concat(fresh.map(x => idMap.get(x)));
      if (order.join() !== serverOrder.join()){
        data.id = id; data.photoOrder = order; data.photoLabels = {}; delete data.vs; delete data.vm;
        const r2 = await call("saveProduct", {product: data}); if (!r2.ok) throw r2;
      }
      b.done();
      S.catalogAt = 0; S.vectorsAt = 0;
      if (r.seller && S.user){ S.user.seller = r.seller; lsSet("user", S.user); }
      sellDone(id, r.seller, !!editId);
    }catch(e){ b.done(); console.error(e); fail(errText(e && e.error ? e : {error:"net"})); }
  }

  function render(){
    err.textContent = "";
    drawHead();
    const parts = [step1, step2, step3, step4, step5][step-1]();
    content.replaceChildren(...parts);
  }
  drawShots();
  page(head, content,
    h("div",{class:"dock"}, h("div",{class:"wrap",style:{maxWidth:"720px",flexDirection:"column",alignItems:"stretch",gap:"0"}}, err, nextBtn)));
  err.style.margin = "0 0 6px"; err.style.minHeight = "0";
  render();
  if (S.pendingFiles){ const f = S.pendingFiles; S.pendingFiles = null; addFiles(f); }
}
function sellDone(id, sellerSt, edited){
  setTab("me");
  page(h("div",{class:"wrap"}, h("div",{class:"done"},
    h("div",{class:"ok",text:"✓"}),
    h("h2",{style:{margin:"0 0 8px"},text:edited ? t("savedGood") : t("published")}),
    h("p",{style:{color:"var(--mut)",margin:"0 0 22px"},text:sellerSt === "pending" ? t("pendingNote") : t("publishedSub")}),
    h("div",{style:{display:"grid",gap:"10px",maxWidth:"320px",margin:"0 auto"}},
      h("a",{class:"btn block",href:"#/sell",onclick:e=>{ if (location.hash === "#/sell"){ e.preventDefault(); viewSell(); } }}, icon("plus"), t("addMore")),
      h("a",{class:"btn block ghost",href:"#/p/"+id,text:t("viewIt")}),
      h("a",{class:"btn block ghost",href:"#/me",text:t("myGoods")})))));
}

/* ===== ФОТО: сжатие ===== */
function loadImg(src, cors){
  return new Promise((res, rej) => {
    const img = new Image();
    if (cors) img.crossOrigin = "anonymous";
    img.onload = () => res(img); img.onerror = rej; img.src = src;
  });
}
async function compress(file, max){
  const url = URL.createObjectURL(file);
  try{
    const img = await loadImg(url);
    const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0,0,c.width,c.height);
    g.drawImage(img, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL("image/jpeg", 0.82);
    const small = await loadImg(dataUrl);
    return {dataUrl, b64: dataUrl.split(",")[1], img: small};
  } finally { setTimeout(() => URL.revokeObjectURL(url), 2000); }
}

/* ===== ЗАПУСК ===== */
function start(){
  document.documentElement.lang = S.lang === "tm" ? "tk" : S.lang;
  renderTabbar();
  const p0 = curPath();
  navStack.push("/"); if (p0 !== "/") navStack.push(p0);
  topP = 0; history.replaceState({tm:"g", p:0}, "", "#"+p0);
  window.addEventListener("popstate", onPop);
  // адрес поменяли вручную
  window.addEventListener("hashchange", () => { if (!history.state){ const p = curPath(); navStack.push(p); setUrl(p); route(); } });
  document.addEventListener("visibilitychange", () => { if (!document.hidden && S.token) startPoll(); if (!document.hidden) checkUpdate(); });
  checkUpdate(); setInterval(checkUpdate, 3 * 60 * 1000);
  route();
  loadCatalog(true);
  startPoll();
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
}
