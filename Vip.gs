/*******************************************************
 *  TM Bazar — VIP-объявления и срок объявления 30 дней (версия сайта 59)
 *
 *  КАК УСТАНОВИТЬ (Code.gs менять НЕ нужно):
 *  1. Откройте Google Таблицу TM Bazar → Расширения → Apps Script.
 *  2. Слева у «Файлы» нажмите «+» → «Скрипт», назовите файл  Vip
 *     (он должен стоять в списке НИЖЕ Code.gs — так и будет сам).
 *  3. Сотрите всё в новом файле, вставьте этот текст целиком, нажмите 💾.
 *  4. «Развернуть» → «Управление развертываниями» → ✎ (карандаш) →
 *     Версия: «Новая версия» → «Развернуть». Ссылка сайта не меняется.
 *
 *  ЧТО ДЕЛАЕТ:
 *  • Объявления продавцов публикуются сразу, без проверки администратором.
 *  • Каждое объявление живёт 30 дней. Продавец видит обратный отсчёт
 *    (дни и часы). За 3 дня до конца появляется кнопка «Продлить».
 *    Если не продлил — объявление и его фото удаляются автоматически.
 *    Для уже существующих объявлений 30 дней считаются с момента установки
 *    этого файла, чтобы старые товары не пропали сразу.
 *  • VIP: администратор в админке (вкладка «Товары» / «⭐ VIP») включает VIP
 *    на 7, 15 или 30 дней. VIP-объявление жёлтое и стоит выше остальных,
 *    магазин попадает в «VIP-магазины» на главной.
 *  • Баланс 🪙 в монетах (1 монета = 1 манат): администратор пополняет баланс
 *    продавца (админка → «Пользователи» → «🪙 Баланс»), продавец сам покупает VIP.
 *    VIP-магазин (все его объявления жёлтые и выше всех): 7 дней — 30, 15 дней — 55,
 *    30 дней — 100 монет. VIP для одного объявления — 10 монет на 7 дней.
 *    Цены можно поменять в админке (вкладка «⭐ VIP»).
 *    Все пополнения и списания записываются на лист «Баланс» в таблице.
 *  • Пополнение через приложение: продавец нажимает «Пополнить», пишет сумму и
 *    прикрепляет скриншот оплаты. Вам приходит письмо, а в админке на вкладке
 *    «🪙 Пополнения» — переписка и кнопка «Начислить» в один клик.
 *    Переписка хранится на листе «Пополнения».
 *  • Торговые центры и рынки: список по велаятам ведёте вы в админке
 *    (вкладка «🏬 ТЦ и рынки»); продавец выбирает свой ТЦ при подаче объявления.
 *    Если продавец вписал новый ТЦ — он приходит вам в админку, «✅ Добавить» в один клик.
 *  • Раздел и характеристики объявления (марка, модель, размеры, ТЦ…) сохраняются
 *    на листе «Характеристики» — так они точно видны в поиске и фильтрах.
 *******************************************************/

const VIP_VER = 59;                  // версия этого файла (видна внизу Профиля на сайте)
const EXP_DAYS = 30;                 // сколько дней живёт объявление
const EXP_WARN_DAYS = 3;             // за сколько дней показывать «Продлить»
const VIP_PROP = "VIP";              // где хранятся VIP (Свойства скрипта): {ID товара: до какой даты}
const VIP_DAYS = [7, 15, 30];        // на сколько дней можно купить VIP-магазин
const VIP_ITEM_DAYS = 7;             // на сколько дней VIP для одного объявления
const PRICES_DEFAULT = { shop: { 7: 30, 15: 55, 30: 100 }, item: 10 };   // в монетах (1 монета = 1 манат)
const BAL_SHEET = "Баланс";          // лист с пополнениями и списаниями

/* ---------- Срок объявления ---------- */

// дата установки (для старых объявлений отсчёт идёт от неё)
function expStart_() {
  const props = PropertiesService.getScriptProperties();
  let s = props.getProperty("EXP_START");
  if (!s) { s = new Date().toISOString(); props.setProperty("EXP_START", s); }
  return new Date(s).getTime();
}
// когда объявление удалится: дата добавления/продления + 30 дней
function expOf_(at, start) {
  let base = new Date(at).getTime();
  if (isNaN(base)) base = start;
  return new Date(Math.max(base, start) + EXP_DAYS * 864e5).toISOString();
}

/* ---------- VIP ---------- */

function vipMap_() {
  return parse_(PropertiesService.getScriptProperties().getProperty(VIP_PROP), {}) || {};
}
function vipShopMap_() {
  return parse_(PropertiesService.getScriptProperties().getProperty("VIPSHOP"), {}) || {};
}
function saveVipShop_(m) {
  const now = Date.now(), clean = {};
  Object.keys(m).forEach(function (id) { if (new Date(m[id]).getTime() > now) clean[id] = m[id]; });
  PropertiesService.getScriptProperties().setProperty("VIPSHOP", JSON.stringify(clean));
}
function saveVip_(m) {
  const now = Date.now(), clean = {};
  Object.keys(m).forEach(function (id) { if (new Date(m[id]).getTime() > now) clean[id] = m[id]; });
  PropertiesService.getScriptProperties().setProperty(VIP_PROP, JSON.stringify(clean));
}

// добавить к товарам поля exp (когда удалится) и vip (VIP до даты);
// раздел и характеристики (марка, модель…) берём из таблицы, если их не передали
function decorate_(list) {
  const start = expStart_(), vip = vipMap_(), shops = vipShopMap_(), now = Date.now();
  let ext = {}; try { ext = extAll_(); } catch (e) { console.error(e); }
  let rows = null;
  if (list.some(function (x) { return !x.sub || !x.attrs || !Object.keys(x.attrs).length; })) {
    rows = {};
    try { readAll_("products").forEach(function (r) { rows[r.id] = r; }); } catch (e) { console.error(e); }
  }
  list.forEach(function (x) {
    const e = ext[x.id];
    if (e) {
      if (e.cat && SITE_CATS.indexOf(e.cat) >= 0) x.cat = e.cat;
      if (e.sub) x.sub = e.sub;
      x.attrs = x.attrs && typeof x.attrs === "object" ? x.attrs : {};
      Object.keys(e.attrs).forEach(function (k) { x.attrs[k] = e.attrs[k]; });
    }
    const r = rows && rows[x.id];
    if (r) {
      if (!x.sub && r.sub) x.sub = r.sub;
      if ((!x.attrs || !Object.keys(x.attrs).length) && r.attrs) x.attrs = parse_(r.attrs, {}) || {};
    }
    x.exp = expOf_(x.at, start);
    // VIP-магазин делает VIP все его объявления
    const a = vip[x.id] && new Date(vip[x.id]).getTime() > now ? vip[x.id] : "";
    const b = shops[x.user] && new Date(shops[x.user]).getTime() > now ? shops[x.user] : "";
    x.vip = a > b ? a : b;
    x.shopVip = b;
  });
  return list;
}

/* ---------- Баланс и цены VIP ---------- */

function balSheet_() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(BAL_SHEET);
  if (!sh) {
    sh = ss.insertSheet(BAL_SHEET);
    sh.getRange(1, 1, 1, 6).setValues([["Дата", "ID пользователя", "Имя", "Сумма, TMT (+ пополнение, − списание)", "Остаток, TMT", "За что"]]).setFontWeight("bold");
    sh.setFrozenRows(1);
  }
  return sh;
}
// остаток каждого пользователя = сумма всех его строк
function balances_() {
  const sh = balSheet_(), n = sh.getLastRow() - 1, m = {};
  if (n < 1) return m;
  sh.getRange(2, 2, n, 3).getValues().forEach(function (r) {
    const id = String(r[0]); if (!id) return;
    m[id] = Math.round(((m[id] || 0) + (parseFloat(String(r[2]).replace(",", ".")) || 0)) * 100) / 100;
  });
  return m;
}
function balanceOf_(uid) { return balances_()[uid] || 0; }
function addBalance_(u, amount, note) {
  const left = Math.round((balanceOf_(u.id) + amount) * 100) / 100;
  balSheet_().appendRow([new Date().toISOString(), u.id, u.name, amount, left, note]);
  return left;
}
function vipPrices_() {
  const m = parse_(PropertiesService.getScriptProperties().getProperty("VIP_PRICES2"), null) || PRICES_DEFAULT;
  const r = { shop: {}, item: +m.item >= 0 ? +m.item : PRICES_DEFAULT.item, itemDays: VIP_ITEM_DAYS };
  VIP_DAYS.forEach(function (d) { const v = m.shop && m.shop[d]; r.shop[d] = +v >= 0 ? +v : PRICES_DEFAULT.shop[d]; });
  return r;
}

/* ---------- Пополнение: переписка продавца с администратором ---------- */

const SUP_SHEET = "Пополнения";
const SUP_COLS = ["id", "at", "user", "name", "phone", "from", "text", "photo", "amount", "readA", "readU"];
function supSheet_() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(SUP_SHEET);
  if (!sh) {
    sh = ss.insertSheet(SUP_SHEET);
    sh.getRange(1, 1, 1, SUP_COLS.length).setValues([["ID", "Дата", "ID пользователя", "Имя", "Телефон", "Кто пишет", "Текст", "Скриншот", "Сумма (монет)", "Прочитал админ", "Прочитал продавец"]]).setFontWeight("bold");
    sh.setFrozenRows(1);
    sh.getRange(1, 1, sh.getMaxRows(), SUP_COLS.length).setNumberFormat("@");
  }
  return sh;
}
function supAll_() {
  const sh = supSheet_(), n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, SUP_COLS.length).getDisplayValues().map(function (r, i) {
    const o = { row: i + 2 }; SUP_COLS.forEach(function (k, j) { o[k] = r[j]; }); return o;
  }).filter(function (o) { return o.id; });
}
function supAdd_(u, from, text, photo, amount) {
  const o = { id: "M" + Date.now() + Math.floor(Math.random() * 1000), at: new Date().toISOString(), user: u.id, name: u.name, phone: u.phone,
    from: from, text: text, photo: photo || "", amount: amount ? String(amount) : "", readA: from === "admin" ? "1" : "", readU: from === "user" ? "1" : "" };
  const sh = supSheet_(), r = sh.getLastRow() + 1, rng = sh.getRange(r, 1, 1, SUP_COLS.length);
  rng.setNumberFormat("@"); rng.setValues([SUP_COLS.map(function (k) { return String(o[k] == null ? "" : o[k]); })]);
  return o;
}
function supMark_(list, col) {
  const sh = supSheet_(), c = SUP_COLS.indexOf(col) + 1;
  list.forEach(function (m) { if (!m[col]) sh.getRange(m.row, c).setValue("1"); });
}
function supPublic_(m) { return { id: m.id, at: m.at, from: m.from, text: m.text, photo: m.photo, amount: m.amount ? +m.amount : 0 }; }
function supUnreadFor_(uid) { return supAll_().filter(function (m) { return m.user === uid && m.from === "admin" && !m.readU; }).length; }

/* ---------- Раздел и характеристики объявления (свой лист) ---------- */

const EXT_SHEET = "Характеристики";
function extSheet_() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(EXT_SHEET);
  if (!sh) {
    sh = ss.insertSheet(EXT_SHEET);
    sh.getRange(1, 1, 1, 4).setValues([["ID товара", "Раздел", "Характеристики (марка, модель, размеры, ТЦ…)", "Категория"]]).setFontWeight("bold");
    sh.setFrozenRows(1);
    sh.getRange(1, 1, sh.getMaxRows(), 4).setNumberFormat("@");
  }
  if (!sh.getRange(1, 4).getValue()) sh.getRange(1, 4).setValue("Категория").setFontWeight("bold");
  return sh;
}
function extAll_() {
  const sh = extSheet_(), n = sh.getLastRow() - 1, m = {};
  if (n < 1) return m;
  sh.getRange(2, 1, n, 4).getDisplayValues().forEach(function (r, i) { if (r[0]) m[r[0]] = { row: i + 2, sub: r[1], attrs: parse_(r[2], {}) || {}, cat: r[3] }; });
  return m;
}
function extClean_(a) {
  const r = {};
  if (!a || typeof a !== "object" || Array.isArray(a)) return r;
  Object.keys(a).slice(0, 30).forEach(function (k) {
    if (!/^[a-z]{1,12}$/.test(k)) return;
    const v = a[k];
    if (Array.isArray(v)) { const arr = v.slice(0, 30).map(function (x) { return clean_(x, 20); }).filter(String); if (arr.length) r[k] = arr; }
    else if (v != null && String(v).trim() !== "") r[k] = clean_(v, 60);
  });
  return r;
}
function extSave_(id, sub, attrs, cat) {
  const sh = extSheet_(), cur = extAll_()[id], vals = [[id, clean_(sub, 30), JSON.stringify(attrs || {}), clean_(cat, 20)]];
  if (cur) sh.getRange(cur.row, 1, 1, 4).setValues(vals);
  else { const r = sh.getLastRow() + 1, rng = sh.getRange(r, 1, 1, 4); rng.setNumberFormat("@"); rng.setValues(vals); }
}
// категории сайта, которых может не быть в старом Код.gs: сохраняем под совместимой категорией,
// а настоящую храним на листе «Характеристики»
const SITE_CATS = ["auto","realty","electronics","shoes","home","personal","appliances","jobs","rent","kids","build","sport","business","services","buy","med","animals","free"];
function serverCats_() { try { return typeof CATS !== "undefined" && Array.isArray(CATS) ? CATS : null; } catch (e) { return null; } }
function fallbackCat_(cat) {
  const sc = serverCats_();
  if (!sc || sc.indexOf(cat) >= 0) return cat;
  let subs = null; try { subs = typeof SUBS !== "undefined" ? SUBS : null; } catch (e) {}
  const free = function (c) { return !subs || !subs[c]; };
  const prefer = ["other", "home", "clothes", "electronics"];
  for (let i = 0; i < prefer.length; i++) if (sc.indexOf(prefer[i]) >= 0 && free(prefer[i])) return prefer[i];
  for (let i = 0; i < sc.length; i++) if (free(sc[i])) return sc[i];
  return sc[0];
}

/* ---------- Торговые центры и рынки ---------- */

const MALLS_DEFAULT = {
  "Aşgabat": ["Berkarar SDM", "Aşgabat SDM (Ashgabat Mall)", "Paýtagt SDM", "Altyn Asyr bazary", "Gündogar bazary", "Teke bazary", "Gülistan bazary (Rus bazary)", "Mir bazary"],
  "Ahal": [], "Mary": [], "Daşoguz": [], "Türkmenabat": [], "Türkmenbaşy": []
};
function malls_() { return parse_(PropertiesService.getScriptProperties().getProperty("MALLS"), null) || MALLS_DEFAULT; }
function saveMalls_(m) { PropertiesService.getScriptProperties().setProperty("MALLS", JSON.stringify(m)); }
// новые ТЦ, которые вписали продавцы: [{city, name, at}]
function mallSug_() { return parse_(PropertiesService.getScriptProperties().getProperty("MALL_SUG"), []) || []; }
function saveMallSug_(a) { PropertiesService.getScriptProperties().setProperty("MALL_SUG", JSON.stringify(a.slice(-100))); }

/* ---------- Автоудаление (не чаще раза в час, во время любого сохранения) ---------- */

function maybeCleanup_() {
  const c = CacheService.getScriptCache();
  if (c.get("expclean")) return;
  c.put("expclean", "1", 3600);
  try { cleanupExpired_(); } catch (e) { console.error(e); }
}
function cleanupExpired_() {
  const start = expStart_(), now = Date.now();
  let removed = 0;
  readAll_("products").forEach(function (p) {
    if (new Date(expOf_(p.at, start)).getTime() > now) return;
    parse_(p.photos, []).forEach(function (x) { trashFile_(x.id); });
    remove_("products", "id", p.id);
    removed++;
  });
  // без проверки: всех, кто ждёт одобрения, делаем продавцами
  readAll_("users").forEach(function (u) { if (u.seller === "pending") update_("users", "id", u.id, { seller: "active" }); });
  saveVip_(vipMap_());
  return removed;
}
// Можно запускать вручную или по расписанию (см. setupExpiry ниже)
function cleanupExpired() {
  const lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try { Logger.log("Удалено просроченных объявлений: " + cleanupExpired_()); } finally { lock.releaseLock(); }
}
// НЕОБЯЗАТЕЛЬНО: выберите setupExpiry и нажмите «Выполнить» — удаление будет идти и каждую ночь
function setupExpiry() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === "cleanupExpired") ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger("cleanupExpired").timeBased().everyDays(1).atHour(3).create();
  Logger.log("Готово: просроченные объявления будут удаляться каждую ночь.");
}

/* ---------- Подключение к сайту (оборачиваем действия из Code.gs) ---------- */

(function () {
  if (typeof API === "undefined") throw new Error("Vip.gs должен стоять в списке файлов НИЖЕ Code.gs");
  const orig = {};
  ["catalog", "me", "product", "adminData", "saveProduct", "setStatus", "deleteProduct"].forEach(function (k) { orig[k] = API[k]; });

  API.catalog = function (d) {
    const r = orig.catalog(d);
    if (r && r.ok) {
      const now = Date.now();
      r.products = decorate_(r.products).filter(function (x) { return new Date(x.exp).getTime() > now; });
      r.expDays = EXP_DAYS; r.vipVer = VIP_VER;
      r.malls = malls_();
    }
    return r;
  };
  API.me = function (d) {
    const r = orig.me(d);
    if (r && r.ok) {
      decorate_(r.products); r.expDays = EXP_DAYS; r.vipVer = VIP_VER;
      r.balance = balanceOf_(r.user.id); r.vipPrices = vipPrices_();
      const sv = vipShopMap_()[r.user.id]; r.shopVip = sv && new Date(sv).getTime() > Date.now() ? sv : "";
      try { r.supportUnread = supUnreadFor_(r.user.id); } catch (e) { r.supportUnread = 0; }
    }
    return r;
  };
  API.product = function (d) {
    const r = orig.product(d);
    if (r && r.ok && r.product) decorate_([r.product]);
    return r;
  };
  API.adminData = function (d) {
    const r = orig.adminData(d);
    if (r && r.ok) {
      decorate_(r.products); r.expDays = EXP_DAYS; r.vipPrices = vipPrices_();
      r.malls = malls_(); r.mallSug = mallSug_();
      const b = balances_(), sv = vipShopMap_(), now = Date.now();
      r.users.forEach(function (u) { u.balance = b[u.id] || 0; u.shopVip = sv[u.id] && new Date(sv[u.id]).getTime() > now ? sv[u.id] : ""; });
    }
    return r;
  };
  // публикация без проверки администратором
  API.saveProduct = function (d) {
    const want = d && d.product ? d.product.cat : "";
    const fb = want ? fallbackCat_(want) : want;
    let r;
    if (fb !== want) {
      // старый Код.gs не знает эту категорию — сохраняем под совместимой, без проверок раздела
      const copy = JSON.parse(JSON.stringify(d)); copy.product.cat = fb; copy.product.sub = ""; copy.product.attrs = {};
      r = orig.saveProduct(copy);
    } else r = orig.saveProduct(d);
    // старый Код.gs отклонил раздел / марку / сделку — сохраняем без них (они будут на листе «Характеристики»)
    if (r && !r.ok && ["sub", "brand", "deal", "fields"].indexOf(r.error) >= 0 && want && d.product.title && (d.product.price > 0 || d.product.price === 0 || d.product.price)) {
      const copy = JSON.parse(JSON.stringify(d)); copy.product.sub = ""; copy.product.attrs = {};
      r = orig.saveProduct(copy);
      if (r && !r.ok && r.error === "fields") {
        const sc = serverCats_() || [];
        const alt = ["other", "home", "clothes"].filter(function (c) { return sc.indexOf(c) >= 0; })[0];
        if (alt) { copy.product.cat = alt; if (!(+copy.product.price > 0)) copy.product.price = 1; r = orig.saveProduct(copy); }
      }
    }
    // при изменении старый Код.gs может не вернуть id — берём из запроса
    const pid = r && r.ok ? (r.id || (d.product && d.product.id) || "") : "";
    if (r && r.ok && pid && !r.id) r.id = pid;
    if (r && r.ok && pid && d.product) {
      const o = d.product, attrs = extClean_(o.attrs);
      try { extSave_(pid, o.sub || "", attrs, SITE_CATS.indexOf(want) >= 0 ? want : ""); } catch (e) { console.error(e); }
      // новый ТЦ / рынок, которого нет в списке, — на одобрение администратору
      const mall = attrs.mall, city = clean_(o.city, 30);
      if (mall && city) {
        const known = (malls_()[city] || []).concat(mallSug_().filter(function (x) { return x.city === city; }).map(function (x) { return x.name; }));
        if (!known.some(function (x) { return String(x).toLowerCase() === mall.toLowerCase(); })) {
          const sg = mallSug_(); sg.push({ city: city, name: mall, at: new Date().toISOString() }); saveMallSug_(sg);
          try { mail_(APP_NAME + ": новый ТЦ «" + mall + "»", "Продавец указал новый торговый центр / рынок: " + mall + " (" + city + ").\nОдобрите в админке → вкладка «🏬 ТЦ и рынки»."); } catch (e) {}
        }
      }
    }
    if (r && r.ok && r.seller === "pending") {
      const u = userByToken_(d.token);
      if (u) { update_("users", "id", u.id, { seller: "active" }); r.seller = "active"; }
    }
    maybeCleanup_();
    return r;
  };
  API.setStatus = function (d) { const r = orig.setStatus(d); maybeCleanup_(); return r; };
  API.deleteProduct = function (d) {
    const v = vipMap_();
    const r = orig.deleteProduct(d);
    if (r && r.ok && v[d.id]) { delete v[d.id]; saveVip_(v); }
    return r;
  };

  // продлить объявление ещё на 30 дней (кнопка «Продлить» у продавца)
  API.renewProduct = function (d) {
    const u = userByToken_(d.token);
    if (!u) return { ok: false, error: "auth" };
    const p = findBy_("products", "id", d.id);
    if (!p || p.user !== u.id) return { ok: false, error: "not_found" };
    if (p.status === "banned") return { ok: false, error: "banned" };
    const now = new Date().toISOString();
    update_("products", "id", p.id, { at: now, upd: now });
    return { ok: true, at: now, exp: expOf_(now, expStart_()) };
  };

  // продавец покупает VIP со своего баланса (7 / 15 / 30 дней); если уже VIP — срок добавляется
  // продавец покупает VIP со своего баланса:
  //  { shop: true, days: 7 | 15 | 30 } — VIP-магазин (все его объявления);  { id } — одно объявление на 7 дней
  API.buyVip = function (d) {
    const u = userByToken_(d.token);
    if (!u) return { ok: false, error: "auth" };
    const pr = vipPrices_();
    if (d.shop) {
      const days = parseInt(d.days, 10);
      if (VIP_DAYS.indexOf(days) < 0) return { ok: false, error: "fields" };
      const price = pr.shop[days];
      if (!price) return { ok: false, error: "no_price" };
      if (balanceOf_(u.id) < price) return { ok: false, error: "no_money" };
      const m = vipShopMap_(), from = Math.max(Date.now(), new Date(m[u.id] || 0).getTime() || 0);
      m[u.id] = new Date(from + days * 864e5).toISOString();
      saveVipShop_(m);
      const left = addBalance_(u, -price, "VIP-магазин " + days + " дн");
      return { ok: true, shopVip: m[u.id], balance: left };
    }
    const p = findBy_("products", "id", d.id);
    if (!p || p.user !== u.id) return { ok: false, error: "not_found" };
    if (p.status !== "active") return { ok: false, error: "fields" };
    const price = pr.item;
    if (!price) return { ok: false, error: "no_price" };
    if (balanceOf_(u.id) < price) return { ok: false, error: "no_money" };
    const m = vipMap_(), from = Math.max(Date.now(), new Date(m[p.id] || 0).getTime() || 0);
    m[p.id] = new Date(from + VIP_ITEM_DAYS * 864e5).toISOString();
    saveVip_(m);
    const left = addBalance_(u, -price, "VIP объявление " + VIP_ITEM_DAYS + " дн · " + p.id + " " + p.title);
    return { ok: true, vip: m[p.id], balance: left };
  };

  // продавец пишет администратору о пополнении (текст, сумма, скриншот оплаты)
  API.supportSend = function (d) {
    const u = userByToken_(d.token);
    if (!u) return { ok: false, error: "auth" };
    const text = clean_(d.text, 500), amount = Math.max(0, Math.round(parseFloat(String(d.amount || 0).replace(",", ".")) || 0));
    let photo = "";
    if (d.photo) { try { photo = savePhoto_(d.photo, d.mime, "pay_" + u.id).url; } catch (e) { return { ok: false, error: "photo" }; } }
    if (!text && !photo && !amount) return { ok: false, error: "fields" };
    const m = supAdd_(u, "user", text, photo, amount);
    try { mail_(APP_NAME + ": пополнение от " + u.name, (amount ? "Сумма: " + amount + " монет\n" : "") + (text ? "Сообщение: " + text + "\n" : "") +
      (photo ? "Скриншот: " + photo + "\n" : "") + "Телефон: +993 " + u.phone + "\n\nОткройте админку → вкладка «🪙 Пополнения»."); } catch (e) {}
    return { ok: true, msg: supPublic_(m) };
  };
  // переписка продавца с администратором (+ отметка «прочитано»)
  API.supportList = function (d) {
    const u = userByToken_(d.token);
    if (!u) return { ok: false, error: "auth" };
    const mine = supAll_().filter(function (m) { return m.user === u.id; });
    supMark_(mine.filter(function (m) { return m.from === "admin"; }), "readU");
    return { ok: true, messages: mine.map(supPublic_), balance: balanceOf_(u.id) };
  };
  // админ: все переписки, по продавцам (новые сверху)
  API.adminSupport = function (d) {
    if (!admOk_(d)) return { ok: false, error: "auth" };
    const by = {}, bal = balances_();
    supAll_().forEach(function (m) {
      const t = by[m.user] || (by[m.user] = { user: m.user, name: m.name, phone: m.phone, last: null, unread: 0, amount: 0 });
      t.last = supPublic_(m);
      if (m.from === "user" && !m.readA) { t.unread++; if (m.amount) t.amount = +m.amount; }
    });
    const list = Object.keys(by).map(function (k) { const t = by[k]; t.balance = bal[k] || 0; return t; })
      .sort(function (a, b) { return (b.unread - a.unread) || (a.last.at < b.last.at ? 1 : -1); });
    return { ok: true, threads: list };
  };
  // админ: переписка с одним продавцом
  API.adminSupportThread = function (d) {
    if (!admOk_(d)) return { ok: false, error: "auth" };
    const u = findBy_("users", "id", d.user);
    if (!u) return { ok: false, error: "not_found" };
    const mine = supAll_().filter(function (m) { return m.user === u.id; });
    supMark_(mine.filter(function (m) { return m.from === "user"; }), "readA");
    return { ok: true, user: { id: u.id, name: u.name, phone: u.phone }, messages: mine.map(supPublic_), balance: balanceOf_(u.id) };
  };
  // админ: ответить и/или начислить монеты одним действием
  API.adminSupportSend = function (d) {
    if (!admOk_(d)) return { ok: false, error: "auth" };
    const u = findBy_("users", "id", d.user);
    if (!u) return { ok: false, error: "not_found" };
    const amount = Math.round(parseFloat(String(d.amount || 0).replace(",", ".")) || 0);
    let left = balanceOf_(u.id), text = clean_(d.text, 500);
    if (amount) {
      if (left + amount < 0) return { ok: false, error: "no_money" };
      left = addBalance_(u, amount, amount > 0 ? "Пополнение через приложение" : "Списание администратором");
      text = (amount > 0 ? "✅ Начислено " + amount + " монет. Баланс: " + left + " монет." : "Списано " + (-amount) + " монет. Баланс: " + left + " монет.") + (text ? "\n" + text : "");
    }
    if (!text) return { ok: false, error: "fields" };
    supAdd_(u, "admin", text, "", amount);
    return { ok: true, balance: left };
  };

  // админ: список торговых центров и рынков {велаят: [названия]}
  API.adminMalls = function (d) {
    if (!admOk_(d)) return { ok: false, error: "auth" };
    const m = {}, src = d.malls || {};
    Object.keys(src).slice(0, 20).forEach(function (c) {
      m[clean_(c, 30)] = (Array.isArray(src[c]) ? src[c] : []).map(function (x) { return clean_(x, 60); }).filter(String).slice(0, 200);
    });
    saveMalls_(m);
    return { ok: true, malls: m };
  };

  // админ: одобрить (ok: true) или отклонить новый ТЦ от продавца
  API.adminMallSug = function (d) {
    if (!admOk_(d)) return { ok: false, error: "auth" };
    const city = clean_(d.city, 30), name = clean_(d.name, 60);
    saveMallSug_(mallSug_().filter(function (x) { return !(x.city === city && x.name === name); }));
    if (d.ok && name) {
      const m = malls_(); m[city] = m[city] || [];
      if (m[city].indexOf(name) < 0) m[city].push(name);
      saveMalls_(m);
    }
    return { ok: true, malls: malls_(), mallSug: mallSug_() };
  };

  // пользователь удаляет свой аккаунт: все его товары (с фото), VIP, вход
  API.deleteAccount = function (d) {
    const u = userByToken_(d.token);
    if (!u) return { ok: false, error: "auth" };
    const mine = readAll_("products").filter(function (p) { return p.user === u.id; });
    const v = vipMap_();
    mine.forEach(function (p) {
      parse_(p.photos, []).forEach(function (x) { try { trashFile_(x.id); } catch (e) {} });
      remove_("products", "id", p.id);
      delete v[p.id];
    });
    saveVip_(v);
    const sv = vipShopMap_(); delete sv[u.id]; saveVipShop_(sv);
    try { const lg = parse_(u.logo, null); if (lg && lg.id) trashFile_(lg.id); } catch (e) {}
    try { const b = balanceOf_(u.id); if (b) addBalance_(u, -b, "Аккаунт удалён пользователем"); } catch (e) {}
    remove_("users", "id", u.id);
    try { mail_(APP_NAME + ": удалён аккаунт " + u.name, "Пользователь удалил свой аккаунт.\nИмя: " + u.name + "\nТелефон: +993 " + u.phone + "\nУдалено товаров: " + mine.length); } catch (e) {}
    return { ok: true, removed: mine.length };
  };

  // администратор пополняет (+) или списывает (−) баланс пользователя
  API.adminBalance = function (d) {
    if (!admOk_(d)) return { ok: false, error: "auth" };
    const u = findBy_("users", "id", d.id);
    if (!u) return { ok: false, error: "not_found" };
    const amount = Math.round(parseFloat(String(d.amount).replace(",", ".")) * 100) / 100;
    if (!amount || Math.abs(amount) > 1000000) return { ok: false, error: "fields" };
    if (balanceOf_(u.id) + amount < 0) return { ok: false, error: "no_money" };
    const left = addBalance_(u, amount, clean_(d.note, 100) || (amount > 0 ? "Пополнение администратором" : "Списание администратором"));
    return { ok: true, balance: left };
  };

  // цены VIP в монетах (ставит администратор): { shop: {7: 30, 15: 55, 30: 100}, item: 10 }
  API.adminPrices = function (d) {
    if (!admOk_(d)) return { ok: false, error: "auth" };
    const src = d.prices || {}, num = function (x) { const v = Math.round(parseFloat(String(x || 0).replace(",", ".")) * 100) / 100; return v > 0 ? v : 0; };
    const m = { shop: {}, item: num(src.item) };
    VIP_DAYS.forEach(function (n) { m.shop[n] = num((src.shop || {})[n]); });
    PropertiesService.getScriptProperties().setProperty("VIP_PRICES2", JSON.stringify(m));
    return { ok: true, vipPrices: vipPrices_() };
  };

  // администратор сам делает магазин VIP: { user, days } (0 — убрать)
  API.adminVipShop = function (d) {
    if (!admOk_(d)) return { ok: false, error: "auth" };
    const m = vipShopMap_(), days = Math.min(365, Math.max(0, parseInt(d.days, 10) || 0));
    if (days) m[d.user] = new Date(Math.max(Date.now(), new Date(m[d.user] || 0).getTime() || 0) + days * 864e5).toISOString(); else delete m[d.user];
    saveVipShop_(m);
    return { ok: true, shopVip: m[d.user] || "" };
  };

  // VIP от администратора: days = 7 / 15 / 30; 0 — убрать VIP
  API.adminVip = function (d) {
    if (!admOk_(d)) return { ok: false, error: "auth" };
    const p = findBy_("products", "id", d.id);
    if (!p) return { ok: false, error: "not_found" };
    const m = vipMap_(), days = Math.min(365, Math.max(0, parseInt(d.days, 10) || 0));
    if (days) m[p.id] = new Date(Date.now() + days * 864e5).toISOString(); else delete m[p.id];
    saveVip_(m);
    return { ok: true, vip: m[p.id] || "" };
  };
})();
