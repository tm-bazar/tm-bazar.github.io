/* ===== ИКОНКИ КАТЕГОРИЙ (единый стиль: контур + лёгкая заливка) ===== */
const CAT_COLORS = {
  personal:["#e0457b","#fde7ef"], jobs:["#3f51b5","#e8ebfa"], rent:["#0f9d8a","#e0f6f2"], business:["#59636e","#eef0f3"],
  buy:["#1e88e5","#e5f1fd"], med:["#e04f2c","#fde9e3"], free:["#c08a00","#fdf5d8"],
  all:["#e8341c","#ffe9e4"], clothes:["#e0457b","#fde7ef"], shoes:["#2f6fd6","#e6efff"], kids:["#e39a0c","#fff4d9"],
  phones:["#12a150","#e3f7ec"], electronics:["#6b4fd8","#eeeaff"], appliances:["#1d8fbf","#e3f4fb"], auto:["#e8341c","#ffe9e4"],
  autoparts:["#59636e","#eef0f3"], moto:["#0f9d8a","#e0f6f2"], realty:["#ef7d11","#fff0e0"], home:["#d1495b","#fde8eb"],
  furniture:["#8b5e34","#f5ece3"], carpets:["#b5179e","#fbe6f6"], beauty:["#e5508f","#fde7f1"], jewelry:["#c08a00","#fdf5d8"],
  build:["#4a5568","#edeff2"], garden:["#3c9a2e","#e6f5e1"], animals:["#a0672b","#f6eee4"], food:["#e04f2c","#fde9e3"],
  sport:["#1e88e5","#e5f1fd"], books:["#3f51b5","#e8ebfa"], services:["#00897b","#e0f2f0"], other:["#6e747c","#eef0f2"]
};
const F = 'fill="currentColor" fill-opacity=".16"';
const CAT_SVG = {
  personal:`<path d="M12 18h24l-2 22H14z" ${F}/><path d="M18 18v-3a6 6 0 0 1 12 0v3"/>`,
  jobs:`<rect x="7" y="15" width="34" height="23" rx="4" ${F}/><path d="M18 15v-4h12v4M7 25h34"/>`,
  rent:`<circle cx="16" cy="30" r="8" ${F}/><path d="M22 25l16-16M32 15l4 4M28 19l3 3"/>`,
  business:`<path d="M6 40V22l10 6v-6l10 6v-6l10 6V10h6v30z" ${F}/>`,
  buy:`<path d="M6 9h6l4 20h20l4-14H14" /><path d="M14 15h26l-4 14H16z" ${F}/><circle cx="19" cy="37" r="2.5" fill="currentColor"/><circle cx="33" cy="37" r="2.5" fill="currentColor"/>`,
  med:`<rect x="8" y="14" width="32" height="24" rx="4" ${F}/><path d="M18 14v-4h12v4M24 20v12M18 26h12"/>`,
  free:`<rect x="9" y="20" width="30" height="20" rx="2" ${F}/><path d="M6 14h36v6H6zM24 14v26M24 14c-3-6-11-6-9-1 1 2 5 1 9 1zM24 14c3-6 11-6 9-1-1 2-5 1-9 1z"/>`,
  all:`<rect x="8" y="8" width="13" height="13" rx="4" ${F}/><rect x="27" y="8" width="13" height="13" rx="4"/><rect x="8" y="27" width="13" height="13" rx="4"/><rect x="27" y="27" width="13" height="13" rx="4" ${F}/>`,
  clothes:`<path d="M18 8l-9 5 3.5 7.5L16 19v21h16V19l3.5 1.5L39 13l-9-5c-1 3-3.2 4.6-6 4.6S19 11 18 8z" ${F}/>`,
  shoes:`<path d="M5 31c0-6 1.5-11 4-13.5 3 0 5 2 8 4.5l6 3.5c4 2 10 2 14 4 3 1.5 6 3 6 6v3H5z" ${F}/><path d="M5 34h38M16 22.5l-2.5 2.5M20.5 25.5l-2.5 2.5"/>`,
  kids:`<circle cx="15" cy="14" r="4.5" ${F}/><circle cx="33" cy="14" r="4.5" ${F}/><circle cx="24" cy="25" r="12" ${F}/><ellipse cx="24" cy="29.5" rx="5" ry="3.6"/><circle cx="19.5" cy="23" r="1.3" fill="currentColor"/><circle cx="28.5" cy="23" r="1.3" fill="currentColor"/>`,
  phones:`<rect x="14" y="5" width="20" height="38" rx="5" ${F}/><path d="M21 9.5h6"/><circle cx="24" cy="37.5" r="1.6" fill="currentColor"/>`,
  electronics:`<rect x="10" y="10" width="28" height="20" rx="2.5" ${F}/><path d="M5 34h38l-2.5 4.5h-33z"/>`,
  appliances:`<rect x="11" y="6" width="26" height="36" rx="4" ${F}/><path d="M11 15h26"/><circle cx="24" cy="28" r="8"/><path d="M19.5 28.5c2 2 7 2 9 0" /><circle cx="16" cy="10.5" r="1.2" fill="currentColor"/><circle cx="20.5" cy="10.5" r="1.2" fill="currentColor"/>`,
  auto:`<path d="M5 31v-6l4.5-1.5 5-7.5h17.5l6 7.5L43 25v6z" ${F}/><path d="M17 17.5l-3 6.5h20.5l-5-6.5"/><circle cx="14" cy="32" r="4.2" fill="#fff"/><circle cx="34" cy="32" r="4.2" fill="#fff"/>`,
  autoparts:`<circle cx="24" cy="24" r="16" ${F}/><circle cx="24" cy="24" r="7"/><circle cx="24" cy="24" r="2" fill="currentColor"/><path d="M24 8v9M24 31v9M8 24h9M31 24h9"/>`,
  moto:`<circle cx="11" cy="32" r="6" ${F}/><circle cx="37" cy="32" r="6" ${F}/><path d="M11 32h13l6-11h5M30 21l-4-9h-5M26 12h6M14 25h10"/>`,
  realty:`<path d="M12 20v20h24V20" ${F}/><path d="M7 23L24 9l17 14"/><rect x="20.5" y="29" width="7" height="11" rx="1"/><path d="M33 13v-3h3v6"/>`,
  home:`<path d="M10 20h28v11a9 9 0 0 1-9 9H19a9 9 0 0 1-9-9z" ${F}/><path d="M7 20h34M20 14h8M19 9c0-2 2-2 2-4M27 9c0-2 2-2 2-4"/>`,
  furniture:`<path d="M7 24a4 4 0 0 1 8 0v4h18v-4a4 4 0 0 1 8 0v11H7z" ${F}/><path d="M11 20v-4.5a3.5 3.5 0 0 1 3.5-3.5h19a3.5 3.5 0 0 1 3.5 3.5V20M10 35v4M38 35v4"/>`,
  carpets:`<rect x="10" y="8" width="28" height="32" rx="2" ${F}/><rect x="15" y="13" width="18" height="22" rx="1"/><path d="M24 17l5 7-5 7-5-7z" fill="currentColor" fill-opacity=".35"/><path d="M13 4v4M19 4v4M25 4v4M31 4v4M35 4v4M13 40v4M19 40v4M25 40v4M31 40v4M35 40v4"/>`,
  beauty:`<rect x="17" y="24" width="14" height="17" rx="2.5" ${F}/><path d="M19.5 24v-8h9v8M19.5 16l3-8.5h6V16"/>`,
  jewelry:`<circle cx="24" cy="30" r="11" ${F}/><circle cx="24" cy="30" r="6.5"/><path d="M17.5 12l3.5-4.5h6l3.5 4.5-6.5 7z" fill="currentColor" fill-opacity=".35"/>`,
  build:`<path d="M21 13l8-8 13 13-8 8z" ${F}/><path d="M27.5 19.5L9 38a3 3 0 0 0 4 4l18.5-18.5M21 13l-3-3"/>`,
  garden:`<path d="M24 25c0-8.5-6.5-13-15-13 0 8.5 6.5 13 15 13z" ${F}/><path d="M24 21c0-6.5 5.5-11 13-11 0 6.5-5.5 11-13 11z" ${F}/><path d="M24 41V20M14 41h20"/>`,
  animals:`<ellipse cx="24" cy="32" rx="9.5" ry="7.5" ${F}/><circle cx="12.5" cy="21" r="4" ${F}/><circle cx="19.5" cy="13" r="4" ${F}/><circle cx="28.5" cy="13" r="4" ${F}/><circle cx="35.5" cy="21" r="4" ${F}/>`,
  food:`<path d="M24 16c-3-3-12.5-3-13.5 6-1 9.5 5 19 9.5 19 2 0 2.5-1 4-1s2 1 4 1c4.5 0 10.5-9.5 9.5-19-1-9-10.5-9-13.5-6z" ${F}/><path d="M24 16c0-4 1.5-7 5-9M27 10c3-1 5 0 6 2-3 1-5 0-6-2z"/>`,
  sport:`<circle cx="24" cy="24" r="16" ${F}/><path d="M24 17l6 4.5-2.3 7h-7.4l-2.3-7z" fill="currentColor" fill-opacity=".45"/><path d="M24 17V8.5M30 21.5l8-2.5M27.7 28.5l5 7M20.3 28.5l-5 7M18 21.5l-8-2.5"/>`,
  books:`<path d="M24 14c-4.5-3.5-10.5-4.5-17-3.5v27c6.5-1 12.5 0 17 3.5 4.5-3.5 10.5-4.5 17-3.5v-27c-6.5-1-12.5 0-17 3.5z" ${F}/><path d="M24 14v27"/>`,
  services:`<path d="M31.5 6.5a9.5 9.5 0 0 0-8.7 12.9L8.6 33.6a3.6 3.6 0 0 0 5.1 5.1l14.2-14.2A9.5 9.5 0 0 0 41 16.2l-5.4 5.4-5.5-1.2-1.2-5.5z" ${F}/>`,
  other:`<path d="M8 16l16-8 16 8v18l-16 8-16-8z" ${F}/><path d="M8 16l16 8 16-8M24 24v18M16 12l16 8"/>`
};
function catIcon(id){
  const [c, b] = CAT_COLORS[id] || CAT_COLORS.other;
  return h("b",{class:"ci",style:{background:b,color:c},
    html:`<svg viewBox="0 0 48 48" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${CAT_SVG[id] || CAT_SVG.other}</svg>`});
}
