/*******************************************************
 *  EMINE BAZAR — сервер маркетплейса (Google Apps Script)
 *  Это НОВЫЙ проект: создайте новую Google Таблицу,
 *  Расширения → Apps Script, и вставьте этот файл целиком.
 *******************************************************/

/* ===== НАСТРОЙКИ ===== */

const APP_NAME = "TM Bazar";

// Пароль админки. Лучше задать его в «Свойствах скрипта» → ADMIN_PASSWORD
// (тогда он не пропадёт, если вы замените этот файл).
const ADMIN_PASSWORD_DEFAULT = "поменяйте-этот-пароль";

// Куда приходят письма о новых продавцах и жалобах.
const ADMIN_EMAIL = "d.remezanov@gmail.com";

// true  — товары нового продавца появятся на сайте только после вашего «Одобрить» в админке.
// false — товары видны сразу (плохие можно скрыть потом).
const SELLER_APPROVAL = false;

const MAX_PHOTOS = 10;                   // фото у одного товара (можно с подписью цвета/варианта)
const PHOTO_FOLDER = "TM Bazar — фото";
const ADMIN_SESSION_SEC = 6 * 60 * 60;   // 6 часов
const MAX_FAILS = 5;                     // неверных PIN подряд
const LOCK_SEC = 30 * 60;                // блокировка на 30 минут
const MAX_MSG = 1000;                    // длина сообщения в чате

/* ===== СТРУКТУРА ТАБЛИЦЫ ===== */

const SHEETS = {
  users: { name: "Пользователи", cols: [
    ["id","ID"],["name","Имя / магазин"],["phone","Телефон"],["city","Велаят"],["imo","IMO"],
    ["seller","Продавец"],["stype","Тип продавца"],["logo","Логотип"],["status","Статус"],["at","Дата регистрации"],["lang","Язык"],
    ["pin","PIN (хэш)"],["token","Токен входа"]] },
  products: { name: "Товары", cols: [
    ["id","ID"],["user","Продавец"],["title","Название"],["price","Цена, TMT"],["cat","Категория"],
    ["city","Город"],["cond","Состояние"],["desc","Описание"],["photos","Фото"],["status","Статус"],
    ["at","Добавлен"],["upd","Изменён"],["vs","Вектор фото (простой)"],["vm","Вектор фото (нейросеть)"],
    ["place","Город / этрап"],["video","Видео (TikTok / Instagram)"],
    ["sub","Раздел"],["attrs","Характеристики (марка, год…)"]] },
  chats: { name: "Чаты", cols: [
    ["id","ID"],["product","Товар"],["buyer","Покупатель"],["seller","Продавец"],
    ["lastText","Последнее сообщение"],["lastAt","Время"],["lastFrom","От кого"],
    ["readB","Прочитал покупатель"],["readS","Прочитал продавец"]] },
  messages: { name: "Сообщения", cols: [
    ["id","ID"],["chat","Чат"],["from","От кого"],["text","Текст"],["photo","Фото"],["at","Время"]] },
  tiles: { name: "Картинки", cols: [["key","Плитка (категория / раздел / марка)"],["photo","Фото"]] },
  reviews: { name: "Отзывы", cols: [
    ["id","ID"],["product","Товар"],["seller","Продавец"],["user","Покупатель"],["stars","Звёзды"],
    ["text","Текст"],["photos","Фото"],["at","Дата"],["status","Статус"]] },
  reports: { name: "Жалобы", cols: [
    ["id","ID"],["product","Товар"],["user","Кто пожаловался"],["reason","Причина"],["text","Текст"],
    ["at","Дата"],["status","Статус"]] }
};

const CATS = ["auto","realty","electronics","shoes","home","personal","appliances","jobs","rent","kids","build","sport","business","services","buy","med","animals","free"];
// в этих категориях цену можно не указывать (будет «Договорная»), «free» — всегда 0
const PRICE_OPTIONAL = { jobs: 1, services: 1, buy: 1, rent: 1, business: 1, free: 1 };
const STYPES = ["private","shop","online"];
// Разделы категорий (обязательны, если есть список). Для auto вместо раздела обязательна марка.
const SUBS = {
  electronics: ["mobiles","laptops","computers","tablets","tv","players","consoles","smartwatches","headphones","speakers",
    "office","printers","cameras","phoneacc","cases","security","ups","surge","network","powerbanks","landline",
    "batteries","smartrings","chargers","phoneparts","components"],
  realty: ["flat","house","cottage","land","commercial","garage"],
  home: ["furniture","kitchenware","textile","carpets","decor","lighting","cleaning","garden","food","other"],
  auto: ["cars","trucks","buses","imported","special","moto","water","parts","tires","caracc","oils"],
  shoes: ["womenshoes","menshoes","kidsshoes","sportshoes"],
  personal: ["womenclothes","menclothes","bags","gold","silver","watches","bijou","cosmetics","perfume","accessories"],
  appliances: ["bigapp","kitchenapp","climate","smallapp","other"],
  jobs: ["vacancy","resume"],
  rent: ["rentcars","rentequip","renttools","rentevent","rentclothes","other"],
  kids: ["toys","kidsclothes","strollers","babycare","school","kidsfurn"],
  build: ["materials","tools","plumbing","electrics","doors","paint"],
  sport: ["fitness","football","bicycles","sportwear","hunting","music","books","tourism","collect"],
  business: ["readybiz","bizequip","production","agroequip","other"],
  services: ["repair","construction","transport","beautysvc","education","cleaningsvc","events","itsvc","other"],
  buy: ["buyelec","buyauto","buyrealty","buyother"],
  med: ["medequip","rehab","optics","other"],
  animals: ["livestock","birds","catsdogs","fish","petgoods"],
  free: ["freethings","freefurn","freeclothes","freeanimals","other"]
};   // частный продавец / магазин / онлайн-магазин
// Ашхабад + 5 велаятов
const CITIES = ["Aşgabat","Ahal","Mary","Daşoguz","Türkmenabat","Türkmenbaşy"];

/* ===== ПЕРВЫЙ ЗАПУСК: выберите setup и нажмите «Выполнить» ===== */

function setup() {
  const ss = SpreadsheetApp.getActive();
  Object.keys(SHEETS).forEach(function (k) {
    const def = SHEETS[k];
    let sh = ss.getSheetByName(def.name);
    if (!sh) sh = ss.insertSheet(def.name);
    const headers = def.cols.map(function (c) { return c[1]; });
    if (sh.getMaxColumns() < headers.length) sh.insertColumnsAfter(sh.getMaxColumns(), headers.length - sh.getMaxColumns());
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
    sh.setFrozenRows(1);
    sh.getRange(1, 1, sh.getMaxRows(), headers.length).setNumberFormat("@");
  });
  const def = ss.getSheetByName("Лист1") || ss.getSheetByName("Sheet1");
  if (def && ss.getSheets().length > 1 && def.getLastRow() === 0) ss.deleteSheet(def);
  getPhotoFolder_();
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty("SALT")) props.setProperty("SALT", Utilities.getUuid());
  Logger.log("Готово. Листы созданы, папка для фото: «" + PHOTO_FOLDER + "».");
}

/* ===== ВХОД ЗАПРОСОВ ===== */

function doGet() { return json_({ ok: true, service: APP_NAME }); }

// Действия, которые только читают — без очереди (быстрее).
const READ_ONLY = { catalog: 1, vectors: 1, product: 1, poll: 1, chat: 1, chats: 1, me: 1, reviews: 1 };
const MAX_REVIEW_PHOTOS = 4;

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: "server" }); }
  const fn = API[d && d.action];
  if (!fn) return json_({ ok: false, error: "server" });
  if (READ_ONLY[d.action]) {
    try { return json_(fn(d)); } catch (err) { console.error(err); return json_({ ok: false, error: "server" }); }
  }
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000);
    return json_(fn(d));
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: "server" });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

/* ===== ДЕЙСТВИЯ ===== */

const API = {

  /* ---------- Каталог (для всех) ---------- */

  catalog: function () {
    const sellers = activeSellers_();
    const rs = ratings_();
    const list = readAll_("products")
      .filter(function (p) { return p.status === "active" && sellers[p.user] && p.photos && p.photos !== "[]"; })
      .map(function (p) { const r = shortProduct_(p, sellers[p.user]); const x = rs.byProduct[p.id];
        if (x) { r.rating = Math.round(x.sum / x.n * 10) / 10; r.reviews = x.n; } return r; })
      .reverse(); // новые сверху
    return { ok: true, products: list, approval: SELLER_APPROVAL, tiles: tiles_() };
  },

  vectors: function () {
    const sellers = activeSellers_();
    const items = readAll_("products")
      .filter(function (p) { return p.status === "active" && sellers[p.user] && (p.vs || p.vm); })
      .map(function (p) { return [p.id, p.vs || "", p.vm || ""]; });
    return { ok: true, items: items };
  },

  product: function (d) {
    const p = findBy_("products", "id", d.id);
    if (!p) return { ok: false, error: "not_found" };
    const u = findBy_("users", "id", p.user);
    const me = d.token ? userByToken_(d.token) : null;
    const isOwner = me && me.id === p.user;
    const visible = p.status === "active" && u && u.seller === "active" && u.status !== "blocked";
    if (!visible && !isOwner && !admOk_(d)) return { ok: false, error: "not_found" };
    const r = shortProduct_(p, u);
    r.desc = p.desc;
    r.video = p.video || "";
    r.photos = parse_(p.photos, []);
    r.status = p.status;
    r.seller = u ? { id: u.id, name: u.name, phone: u.phone, imo: u.imo === "1", city: u.city,
      stype: u.stype || "private", logo: (parse_(u.logo, null) || {}).thumb || "",
      since: u.at, count: readAll_("products").filter(function (x) { return x.user === u.id && x.status === "active"; }).length } : null;
    const rs = ratings_();
    const xp = rs.byProduct[p.id], xs = u ? rs.bySeller[u.id] : null;
    if (xp) { r.rating = Math.round(xp.sum / xp.n * 10) / 10; r.reviews = xp.n; }
    if (xs && r.seller) { r.seller.rating = Math.round(xs.sum / xs.n * 10) / 10; r.seller.reviews = xs.n; }
    return { ok: true, product: r };
  },

  /* ---------- Отзывы ---------- */

  reviews: function (d) {
    const me = d.token ? userByToken_(d.token) : null;
    const users = indexBy_(readAll_("users"), "id");
    const list = rowsWhere_("reviews", "product", String(d.id || ""))
      .filter(function (x) { return x.status !== "hidden"; })
      .map(function (x) { const u = users[x.user];
        return { id: x.id, name: u ? u.name : "—", city: u ? u.city : "", stars: +x.stars || 0, text: x.text,
          photos: parse_(x.photos, []), at: x.at, mine: !!(me && me.id === x.user) }; })
      .reverse();
    let canReview = false;
    if (me) {
      const p = findBy_("products", "id", d.id);
      canReview = !!p && p.user !== me.id && hasChat_(me.id, p.id);
    }
    return { ok: true, reviews: list, canReview: canReview };
  },

  // оставить или изменить свой отзыв (только тот, кто писал продавцу об этом товаре)
  saveReview: function (d) {
    const u = userByToken_(d.token);
    if (!u) return { ok: false, error: "auth" };
    const p = findBy_("products", "id", d.product);
    if (!p) return { ok: false, error: "not_found" };
    if (p.user === u.id) return { ok: false, error: "own" };
    if (!hasChat_(u.id, p.id)) return { ok: false, error: "no_chat" };
    const stars = Math.max(1, Math.min(5, parseInt(d.stars, 10) || 0));
    if (!d.stars) return { ok: false, error: "stars" };
    const old = rowsWhere_("reviews", "product", p.id).filter(function (x) { return x.user === u.id; })[0];
    const row = { product: p.id, seller: p.user, user: u.id, stars: String(stars), text: clean_(d.text, 1000), at: new Date().toISOString() };
    if (old) { update_("reviews", "id", old.id, row); return { ok: true, id: old.id }; }
    row.id = "V" + nextId_("V"); row.photos = "[]"; row.status = "";
    append_("reviews", row);
    return { ok: true, id: row.id };
  },

  reviewPhoto: function (d) {
    const u = userByToken_(d.token);
    if (!u) return { ok: false, error: "auth" };
    const v = findBy_("reviews", "id", d.id);
    if (!v || v.user !== u.id) return { ok: false, error: "not_found" };
    let photos = parse_(v.photos, []);
    if (Array.isArray(d.keep)) {   // удалить фото, которых нет в keep
      photos.forEach(function (x) { if (d.keep.indexOf(x.id) < 0) trashFile_(x.id); });
      photos = photos.filter(function (x) { return d.keep.indexOf(x.id) >= 0; });
    }
    let ph = null;
    if (d.data) {
      if (photos.length >= MAX_REVIEW_PHOTOS) return { ok: false, error: "too_many" };
      ph = savePhoto_(d.data, d.mime, "review_" + v.id);
      photos.push(ph);
    }
    update_("reviews", "id", v.id, { photos: JSON.stringify(photos) });
    return { ok: true, photo: ph };
  },

  deleteReview: function (d) {
    const u = userByToken_(d.token);
    if (!u) return { ok: false, error: "auth" };
    const v = findBy_("reviews", "id", d.id);
    if (!v || v.user !== u.id) return { ok: false, error: "not_found" };
    parse_(v.photos, []).forEach(function (x) { trashFile_(x.id); });
    remove_("reviews", "id", v.id);
    return { ok: true };
  },

  report: function (d) {
    const p = findBy_("products", "id", d.id);
    if (!p) return { ok: false, error: "not_found" };
    const me = d.token ? userByToken_(d.token) : null;
    const r = { id: "R" + nextId_("R"), product: p.id, user: me ? me.id : "", reason: clean_(d.reason, 40),
      text: clean_(d.text, 500), at: new Date().toISOString(), status: "new" };
    append_("reports", r);
    mail_(APP_NAME + ": жалоба на товар " + p.id,
      "Товар: " + p.id + " — " + p.title + "\nПричина: " + r.reason + "\n" + r.text + "\n\nОткройте админку, вкладка «Жалобы».");
    return { ok: true };
  },

  /* ---------- Аккаунт ---------- */

  register: function (d) {
    const phone = digits_(d.phone);
    const name = clean_(d.name, 60);
    if (!name) return { ok: false, error: "fields" };
    if (!validPhone_(phone)) return { ok: false, error: "phone" };
    if (!/^\d{4}$/.test(String(d.pin || ""))) return { ok: false, error: "pin" };
    if (CITIES.indexOf(d.city) < 0) return { ok: false, error: "city" };
    if (findBy_("users", "phone", phone)) return { ok: false, error: "exists" };
    const u = { id: "U" + pad_(nextId_("U")), name: name, phone: phone,
      city: d.city, imo: d.imo ? "1" : "",
      seller: "", stype: STYPES.indexOf(d.stype) >= 0 ? d.stype : "", logo: "", status: "active", at: new Date().toISOString(), lang: clean_(d.lang, 5),
      pin: hashPin_(phone, d.pin), token: Utilities.getUuid() };
    append_("users", u);
    return { ok: true, user: publicUser_(u), token: u.token };
  },

  login: function (d) {
    const phone = digits_(d.phone);
    if (isLocked_("pin:" + phone)) return { ok: false, error: "locked" };
    const u = findBy_("users", "phone", phone);
    if (!u || u.pin !== hashPin_(phone, d.pin)) {
      fail_("pin:" + phone);
      return { ok: false, error: isLocked_("pin:" + phone) ? "locked" : "wrong" };
    }
    resetFails_("pin:" + phone);
    if (u.status === "blocked") return { ok: false, error: "blocked" };
    if (!u.token) { u.token = Utilities.getUuid(); update_("users", "id", u.id, { token: u.token }); }
    return { ok: true, user: publicUser_(u), token: u.token };
  },

  me: function (d) {
    const u = userByToken_(d.token);
    if (!u) return { ok: false, error: "auth" };
    const mine = readAll_("products").filter(function (p) { return p.user === u.id; })
      .map(function (p) { const r = shortProduct_(p, u); r.status = p.status; return r; }).reverse();
    return { ok: true, user: publicUser_(u), products: mine, approval: SELLER_APPROVAL };
  },

  saveProfile: function (d) {
    const u = userByToken_(d.token);
    if (!u) return { ok: false, error: "auth" };
    const name = clean_(d.name, 60);
    if (!name) return { ok: false, error: "fields" };
    const upd = { name: name, city: CITIES.indexOf(d.city) >= 0 ? d.city : u.city, imo: d.imo ? "1" : "" };
    if (d.stype != null) upd.stype = STYPES.indexOf(d.stype) >= 0 ? d.stype : "";
    update_("users", "id", u.id, upd);
    u.name = name;
    return { ok: true };
  },

  // логотип магазина (необязательно); data пустое — удалить логотип
  uploadLogo: function (d) {
    const u = userByToken_(d.token);
    if (!u) return { ok: false, error: "auth" };
    const old = parse_(u.logo, null);
    if (old) trashFile_(old.id);
    let ph = null;
    if (d.data) { ph = savePhoto_(d.data, d.mime, "logo_" + u.id); }
    update_("users", "id", u.id, { logo: ph ? JSON.stringify(ph) : "" });
    return { ok: true, logo: ph ? ph.thumb : "" };
  },

  /* ---------- Товары продавца ---------- */

  saveProduct: function (d) {
    const u = userByToken_(d.token);
    if (!u) return { ok: false, error: "auth" };
    if (u.status === "blocked" || u.seller === "blocked") return { ok: false, error: "blocked" };
    const o = d.product || {};
    let price = Math.round(parseFloat(String(o.price).replace(",", ".")) * 100) / 100;
    const cat = CATS.indexOf(o.cat) >= 0 ? o.cat : "";
    const title = clean_(o.title, 80);
    // обязательно: название, цена больше нуля, категория (фото проверяется в каталоге)
    if (!title || !cat) return { ok: false, error: "fields" };
    if (cat === "free") price = 0;
    if (!(price > 0) && !PRICE_OPTIONAL[cat]) return { ok: false, error: "fields" };
    if (!(price >= 0)) price = 0;
    if (o.video && !videoUrl_(o.video)) return { ok: false, error: "video" };
    const sub = SUBS[cat] ? (SUBS[cat].indexOf(o.sub) >= 0 ? o.sub : "") : "";
    if (SUBS[cat] && !sub) return { ok: false, error: "sub" };
    const attrs = cleanAttrs_(o.attrs);
    if (cat === "auto" && ["cars", "imported", "trucks", "buses", "special"].indexOf(sub) >= 0 && !attrs.brand) return { ok: false, error: "brand" };
    if (cat === "electronics" && ["mobiles", "tablets", "smartwatches"].indexOf(sub) >= 0 && !attrs.brand) return { ok: false, error: "brand" };
    if (cat === "realty" && ["sale", "rent", "roomrent"].indexOf(attrs.deal) < 0) return { ok: false, error: "deal" };

    let p = o.id ? findBy_("products", "id", o.id) : null;
    if (p && p.user !== u.id) return { ok: false, error: "auth" };
    const isNew = !p;
    const now = new Date().toISOString();
    if (isNew) p = { id: "P" + pad_(nextId_("P")), user: u.id, at: now, photos: "[]", vs: "", vm: "" };

    // порядок фото / удалённые фото
    let photos = parse_(p.photos, []);
    if (Array.isArray(o.photoOrder)) {
      const keep = photos.filter(function (x) { return o.photoOrder.indexOf(x.id) >= 0; })
        .sort(function (a, b) { return o.photoOrder.indexOf(a.id) - o.photoOrder.indexOf(b.id); });
      photos.forEach(function (x) { if (keep.indexOf(x) < 0) trashFile_(x.id); });
      photos = keep;
    }
    // подписи фото: цвет / вариант («Красный», «XL»…)
    if (o.photoLabels && typeof o.photoLabels === "object") {
      photos.forEach(function (x) { if (o.photoLabels[x.id] != null) x.label = clean_(o.photoLabels[x.id], 30); });
    }
    const st = p.status === "banned" ? "banned" : (["active", "sold", "hidden"].indexOf(o.status) >= 0 ? o.status : "active");
    const row = {
      id: p.id, user: u.id, title: title, price: String(price), cat: cat,
      city: CITIES.indexOf(o.city) >= 0 ? o.city : (u.city || CITIES[0]),
      cond: o.cond === "used" ? "used" : "new", desc: clean_(o.desc, 2000),
      place: clean_(o.place, 40), video: videoUrl_(o.video),
      sub: sub, attrs: Object.keys(attrs).length ? JSON.stringify(attrs) : "",
      photos: JSON.stringify(photos), status: st, at: p.at, upd: now,
      vs: o.vs != null ? clean_(o.vs, 2000) : p.vs, vm: o.vm != null ? clean_(o.vm, 4000) : p.vm
    };
    if (isNew) append_("products", row); else update_("products", "id", p.id, row);

    // первый товар — человек становится продавцом
    if (!u.seller) {
      const s = SELLER_APPROVAL ? "pending" : "active";
      update_("users", "id", u.id, { seller: s });
      if (SELLER_APPROVAL) mail_(APP_NAME + ": новый продавец " + u.name,
        "Новый продавец ждёт одобрения.\n\nИмя: " + u.name + "\nТелефон: +993 " + u.phone + "\nГород: " + u.city +
        "\nПервый товар: " + row.title + " — " + row.price + " TMT\n\nОткройте админку, вкладка «Продавцы».");
      u.seller = s;
    }
    return { ok: true, id: p.id, seller: u.seller };
  },

  uploadPhoto: function (d) {
    const u = userByToken_(d.token);
    if (!u) return { ok: false, error: "auth" };
    const p = findBy_("products", "id", d.id);
    if (!p || p.user !== u.id) return { ok: false, error: "not_found" };
    const photos = parse_(p.photos, []);
    if (photos.length >= MAX_PHOTOS) return { ok: false, error: "too_many" };
    const ph = savePhoto_(d.data, d.mime, p.id);
    if (d.label) ph.label = clean_(d.label, 30);
    photos.push(ph);
    update_("products", "id", p.id, { photos: JSON.stringify(photos) });
    return { ok: true, photo: ph };
  },

  // быстро: «нет в наличии» / «вернуть в продажу» (одна кнопка ✕)
  setStatus: function (d) {
    const u = userByToken_(d.token);
    if (!u) return { ok: false, error: "auth" };
    const p = findBy_("products", "id", d.id);
    if (!p || p.user !== u.id) return { ok: false, error: "not_found" };
    if (p.status === "banned") return { ok: false, error: "banned" };
    if (["active", "sold", "hidden"].indexOf(d.status) < 0) return { ok: false, error: "fields" };
    update_("products", "id", p.id, { status: d.status, upd: new Date().toISOString() });
    return { ok: true };
  },

  deleteProduct: function (d) {
    const u = userByToken_(d.token);
    if (!u) return { ok: false, error: "auth" };
    const p = findBy_("products", "id", d.id);
    if (!p || p.user !== u.id) return { ok: false, error: "not_found" };
    parse_(p.photos, []).forEach(function (x) { trashFile_(x.id); });
    remove_("products", "id", p.id);
    return { ok: true };
  },

  /* ---------- Чат ---------- */

  // открыть (или найти) чат по товару
  openChat: function (d) {
    const u = userByToken_(d.token);
    if (!u) return { ok: false, error: "auth" };
    if (u.status === "blocked") return { ok: false, error: "blocked" };
    const p = findBy_("products", "id", d.product);
    if (!p) return { ok: false, error: "not_found" };
    if (p.user === u.id) return { ok: false, error: "own" };
    let c = readAll_("chats").filter(function (x) { return x.product === p.id && x.buyer === u.id; })[0];
    if (!c) {
      c = { id: "C" + nextId_("C"), product: p.id, buyer: u.id, seller: p.user, lastText: "", lastAt: "",
        lastFrom: "", readB: "", readS: "" };
      append_("chats", c);
    }
    return { ok: true, id: c.id };
  },

  // список чатов пользователя
  chats: function (d) {
    const u = userByToken_(d.token);
    if (!u) return { ok: false, error: "auth" };
    const mine = readAll_("chats").filter(function (c) { return (c.buyer === u.id || c.seller === u.id) && c.lastAt; });
    if (!mine.length) return { ok: true, chats: [] };
    const users = indexBy_(readAll_("users"), "id");
    const prods = indexBy_(readAll_("products"), "id");
    const list = mine.map(function (c) {
      const other = users[c.buyer === u.id ? c.seller : c.buyer];
      const p = prods[c.product];
      const read = c.buyer === u.id ? c.readB : c.readS;
      return { id: c.id, role: c.buyer === u.id ? "buyer" : "seller",
        other: other ? other.name : "—",
        product: p ? { id: p.id, title: p.title, price: +p.price, thumb: (parse_(p.photos, [])[0] || {}).thumb || "" } : null,
        lastText: c.lastText, lastAt: c.lastAt, mine: c.lastFrom === u.id,
        unread: !!c.lastAt && c.lastFrom !== u.id && (!read || read < c.lastAt) };
    }).sort(function (a, b) { return a.lastAt < b.lastAt ? 1 : -1; });
    return { ok: true, chats: list };
  },

  // сообщения чата (since — только новые)
  chat: function (d) {
    const u = userByToken_(d.token);
    if (!u) return { ok: false, error: "auth" };
    const c = findBy_("chats", "id", d.id);
    if (!c || (c.buyer !== u.id && c.seller !== u.id)) return { ok: false, error: "not_found" };
    const since = String(d.since || "");
    const cacheKey = "cv:" + c.id;
    const cached = CacheService.getScriptCache().get(cacheKey);
    if (since && cached && cached <= since) return { ok: true, messages: [], same: true };

    const msgs = rowsWhere_("messages", "chat", c.id)
      .filter(function (m) { return !since || m.at > since; })
      .map(function (m) { return { id: m.id, from: m.from, mine: m.from === u.id, text: m.text, photo: parse_(m.photo, null), at: m.at }; });
    const res = { ok: true, messages: msgs };
    if (!since) {
      const other = findBy_("users", "id", c.buyer === u.id ? c.seller : c.buyer);
      const p = findBy_("products", "id", c.product);
      res.info = { role: c.buyer === u.id ? "buyer" : "seller",
        other: other ? { name: other.name, phone: other.phone, imo: other.imo === "1" } : null,
        product: p ? { id: p.id, title: p.title, price: +p.price, status: p.status,
          thumb: (parse_(p.photos, [])[0] || {}).thumb || "" } : null };
    }
    return res;
  },

  send: function (d) {
    const u = userByToken_(d.token);
    if (!u) return { ok: false, error: "auth" };
    if (u.status === "blocked") return { ok: false, error: "blocked" };
    const c = findBy_("chats", "id", d.id);
    if (!c || (c.buyer !== u.id && c.seller !== u.id)) return { ok: false, error: "not_found" };
    const text = clean_(d.text, MAX_MSG);
    let photo = "";
    if (d.data) photo = JSON.stringify(savePhoto_(d.data, d.mime, "chat_" + c.id));
    if (!text && !photo) return { ok: false, error: "fields" };
    const at = new Date().toISOString();
    const m = { id: "M" + nextId_("M"), chat: c.id, from: u.id, text: text, photo: photo, at: at };
    append_("messages", m);
    const upd = { lastText: text || "📷", lastAt: at, lastFrom: u.id };
    upd[c.buyer === u.id ? "readB" : "readS"] = at;
    update_("chats", "id", c.id, upd);
    const cache = CacheService.getScriptCache();
    cache.put("cv:" + c.id, at, 21600);
    cache.put("uv:" + (c.buyer === u.id ? c.seller : c.buyer), at, 21600);
    return { ok: true, message: { id: m.id, from: u.id, mine: true, text: text, photo: parse_(photo, null), at: at } };
  },

  readChat: function (d) {
    const u = userByToken_(d.token);
    if (!u) return { ok: false, error: "auth" };
    const c = findBy_("chats", "id", d.id);
    if (!c || (c.buyer !== u.id && c.seller !== u.id)) return { ok: false, error: "not_found" };
    const upd = {}; upd[c.buyer === u.id ? "readB" : "readS"] = new Date().toISOString();
    update_("chats", "id", c.id, upd);
    return { ok: true };
  },

  // быстрая проверка «есть ли новые сообщения» (для значка)
  poll: function (d) {
    const u = userByToken_(d.token);
    if (!u) return { ok: false, error: "auth" };
    const last = CacheService.getScriptCache().get("uv:" + u.id);
    if (d.since && last && last <= d.since) return { ok: true, same: true };
    const r = API.chats(d);
    return { ok: true, unread: r.chats.filter(function (c) { return c.unread; }).length, at: last || "" };
  },

  /* ---------- Админка ---------- */

  adminLogin: function (d) {
    if (isLocked_("admin")) return { ok: false, error: "locked" };
    const pw = adminPassword_();
    if (!pw || String(d.password || "") !== pw) {
      fail_("admin");
      return { ok: false, error: isLocked_("admin") ? "locked" : "wrong" };
    }
    resetFails_("admin");
    const token = Utilities.getUuid();
    CacheService.getScriptCache().put("adm:" + token, "1", ADMIN_SESSION_SEC);
    return { ok: true, token: token };
  },

  adminData: function (d) {
    if (!admOk_(d)) return { ok: false, error: "auth" };
    const users = readAll_("users");
    const prods = readAll_("products");
    const count = {};
    prods.forEach(function (p) { count[p.user] = (count[p.user] || 0) + 1; });
    const byId = indexBy_(users, "id");
    return { ok: true, approval: SELLER_APPROVAL,
      users: users.map(function (u) { const r = publicUser_(u); r.phone = u.phone; r.count = count[u.id] || 0; return r; }).reverse(),
      products: prods.map(function (p) { const r = shortProduct_(p, byId[p.user]); r.status = p.status; r.desc = p.desc; return r; }).reverse(),
      reports: readAll_("reports").reverse(),
      reviews: readAll_("reviews").map(function (x) { const u = byId[x.user];
        return { id: x.id, product: x.product, user: x.user, name: u ? u.name : "—", stars: +x.stars, text: x.text,
          photos: parse_(x.photos, []), at: x.at, status: x.status }; }).reverse() };
  },

  adminUser: function (d) {
    if (!admOk_(d)) return { ok: false, error: "auth" };
    const u = findBy_("users", "id", d.id);
    if (!u) return { ok: false, error: "not_found" };
    const upd = {};
    if (["active", "pending", "blocked", ""].indexOf(d.seller) >= 0) upd.seller = d.seller;
    if (["active", "blocked"].indexOf(d.status) >= 0) upd.status = d.status;
    if (d.status === "blocked") upd.token = Utilities.getUuid(); // выкинуть из аккаунта
    if (d.pin != null) {
      if (!/^\d{4}$/.test(String(d.pin))) return { ok: false, error: "pin" };
      upd.pin = hashPin_(u.phone, d.pin); upd.token = Utilities.getUuid(); resetFails_("pin:" + u.phone);
    }
    update_("users", "id", u.id, upd);
    return { ok: true };
  },

  adminProduct: function (d) {
    if (!admOk_(d)) return { ok: false, error: "auth" };
    const p = findBy_("products", "id", d.id);
    if (!p) return { ok: false, error: "not_found" };
    if (d.remove) {
      parse_(p.photos, []).forEach(function (x) { trashFile_(x.id); });
      remove_("products", "id", p.id);
    } else if (["active", "hidden", "sold", "banned"].indexOf(d.status) >= 0) {
      update_("products", "id", p.id, { status: d.status });
    }
    return { ok: true };
  },

  // фото плитки категории / раздела / марки (ставит администратор); без data — удалить
  adminTile: function (d) {
    if (!admOk_(d)) return { ok: false, error: "auth" };
    const key = String(d.key || "");
    if (!/^(cat|sub|brand):[^\n]{1,60}$/.test(key)) return { ok: false, error: "fields" };
    const old = findBy_("tiles", "key", key);
    if (old) { const ph = parse_(old.photo, null); if (ph) trashFile_(ph.id); }
    if (!d.data) { if (old) remove_("tiles", "key", key); return { ok: true, thumb: "" }; }
    const ph = savePhoto_(d.data, d.mime, "tile_" + key.replace(/[^\w]/g, "_"));
    if (old) update_("tiles", "key", key, { photo: JSON.stringify(ph) });
    else append_("tiles", { key: key, photo: JSON.stringify(ph) });
    return { ok: true, thumb: ph.thumb };
  },

  adminReview: function (d) {
    if (!admOk_(d)) return { ok: false, error: "auth" };
    const v = findBy_("reviews", "id", d.id);
    if (!v) return { ok: false, error: "not_found" };
    if (d.remove) { parse_(v.photos, []).forEach(function (x) { trashFile_(x.id); }); remove_("reviews", "id", v.id); }
    else update_("reviews", "id", v.id, { status: d.status === "hidden" ? "hidden" : "" });
    return { ok: true };
  },

  adminReport: function (d) {
    if (!admOk_(d)) return { ok: false, error: "auth" };
    update_("reports", "id", String(d.id || ""), { status: d.status === "new" ? "new" : "done" });
    return { ok: true };
  }
};

/* ===== ВСПОМОГАТЕЛЬНОЕ: пользователи и товары ===== */

function publicUser_(u) {
  return { id: u.id, name: u.name, phone: u.phone, city: u.city, imo: u.imo === "1",
    stype: u.stype || "", logo: (parse_(u.logo, null) || {}).thumb || "",
    seller: u.seller || "", status: u.status || "active", at: u.at };
}
function activeSellers_() {
  const m = {};
  readAll_("users").forEach(function (u) { if (u.seller === "active" && u.status !== "blocked") m[u.id] = u; });
  return m;
}
function tiles_() {
  const m = {};
  readAll_("tiles").forEach(function (x) { const ph = parse_(x.photo, null); if (ph) m[x.key] = ph.thumb; });
  return m;
}
// средняя оценка товаров и продавцов
function ratings_() {
  const byProduct = {}, bySeller = {};
  readAll_("reviews").forEach(function (x) {
    if (x.status === "hidden") return;
    const s = +x.stars || 0; if (!s) return;
    (byProduct[x.product] = byProduct[x.product] || { sum: 0, n: 0 }); byProduct[x.product].sum += s; byProduct[x.product].n++;
    (bySeller[x.seller] = bySeller[x.seller] || { sum: 0, n: 0 }); bySeller[x.seller].sum += s; bySeller[x.seller].n++;
  });
  return { byProduct: byProduct, bySeller: bySeller };
}
function hasChat_(userId, productId) {
  return rowsWhere_("chats", "product", productId).some(function (c) { return c.buyer === userId && c.lastAt; });
}

function shortProduct_(p, u) {
  const photos = parse_(p.photos, []);
  return { id: p.id, user: p.user, sellerName: u ? u.name : "",
    sellerLogo: u ? (parse_(u.logo, null) || {}).thumb || "" : "", stype: u ? u.stype || "private" : "", title: p.title, price: +p.price || 0,
    cat: p.cat, sub: p.sub || "", attrs: parse_(p.attrs, {}), city: p.city, place: p.place || "", hasVideo: !!p.video, cond: p.cond, at: p.at,
    thumb: photos[0] ? photos[0].thumb : "", photoCount: photos.length,
    variants: photos.filter(function (x) { return x.label; }).length };
}
function userByToken_(token) {
  if (!token) return null;
  const u = findBy_("users", "token", String(token));
  return u && u.status !== "blocked" ? u : null;
}

/* ===== ЧТЕНИЕ / ЗАПИСЬ ТАБЛИЦЫ ===== */

function sheet_(k) {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEETS[k].name);
  if (!sh) throw new Error("Нет листа «" + SHEETS[k].name + "». Запустите setup.");
  return sh;
}
function keys_(k) { return SHEETS[k].cols.map(function (c) { return c[0]; }); }
function toObj_(keys, r) { const o = {}; keys.forEach(function (key, i) { o[key] = r[i]; }); return o; }

function readAll_(k) {
  const sh = sheet_(k), keys = keys_(k), n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, keys.length).getDisplayValues()
    .filter(function (r) { return r[0] !== ""; })
    .map(function (r) { return toObj_(keys, r); });
}

// Быстрый поиск строк по значению в колонке (через TextFinder, без чтения всего листа)
function rowNums_(k, keyName, value) {
  const sh = sheet_(k), col = keys_(k).indexOf(keyName) + 1, n = sh.getLastRow() - 1;
  if (n < 1 || value === "" || value == null) return [];
  return sh.getRange(2, col, n, 1).createTextFinder(String(value)).matchEntireCell(true).matchCase(true)
    .findAll().map(function (r) { return r.getRow(); });
}
function rowsWhere_(k, keyName, value) {
  const sh = sheet_(k), keys = keys_(k);
  return rowNums_(k, keyName, value).sort(function (a, b) { return a - b; }).map(function (row) {
    return toObj_(keys, sh.getRange(row, 1, 1, keys.length).getDisplayValues()[0]);
  });
}
function findBy_(k, keyName, value) { return rowsWhere_(k, keyName, value)[0] || null; }

function append_(k, obj) {
  const keys = keys_(k), sh = sheet_(k);
  const r = sh.getRange(sh.getLastRow() + 1, 1, 1, keys.length);
  r.setNumberFormat("@");
  r.setValues([keys.map(function (key) { return obj[key] == null ? "" : String(obj[key]); })]);
}

function update_(k, keyName, value, obj) {
  const row = rowNums_(k, keyName, value)[0];
  if (!row) return false;
  const sh = sheet_(k), keys = keys_(k);
  const cur = sh.getRange(row, 1, 1, keys.length).getDisplayValues()[0];
  const next = keys.map(function (key, i) { return obj[key] == null ? cur[i] : String(obj[key]); });
  sh.getRange(row, 1, 1, keys.length).setValues([next]);
  return true;
}

function remove_(k, keyName, value) {
  const row = rowNums_(k, keyName, value)[0];
  if (row) sheet_(k).deleteRow(row);
}

function indexBy_(arr, key) { const m = {}; arr.forEach(function (x) { m[x[key]] = x; }); return m; }

function nextId_(prefix) {
  const props = PropertiesService.getScriptProperties();
  const n = (parseInt(props.getProperty("NEXT_" + prefix), 10) || 0) + 1;
  props.setProperty("NEXT_" + prefix, String(n));
  return n;
}

/* ===== ФОТО ===== */

function savePhoto_(data, mime, name) {
  const type = /^image\/(jpeg|png|webp)$/.test(mime || "") ? mime : "image/jpeg";
  const bytes = Utilities.base64Decode(String(data || ""));
  if (bytes.length > 4 * 1024 * 1024) throw new Error("photo too big");
  const blob = Utilities.newBlob(bytes, type, name + "_" + Date.now() + ".jpg");
  const file = getPhotoFolder_().createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  const id = file.getId();
  return { id: id,
    url: "https://lh3.googleusercontent.com/d/" + id + "=w1600",
    thumb: "https://lh3.googleusercontent.com/d/" + id + "=w500" };
}
function getPhotoFolder_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty("PHOTO_FOLDER_ID");
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  const it = DriveApp.getFoldersByName(PHOTO_FOLDER);
  const f = it.hasNext() ? it.next() : DriveApp.createFolder(PHOTO_FOLDER);
  props.setProperty("PHOTO_FOLDER_ID", f.getId());
  return f;
}
function trashFile_(id) {
  if (!id) return;
  try { DriveApp.getFileById(id).setTrashed(true); } catch (e) {}
}

/* ===== ПРОЧЕЕ ===== */

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
// подробности товара (марка, год, комнаты, площадь, размеры…): короткие ключи и значения
function cleanAttrs_(a) {
  const r = {};
  if (!a || typeof a !== "object" || Array.isArray(a)) return r;
  Object.keys(a).slice(0, 30).forEach(function (k) {
    if (!/^[a-z]{1,12}$/.test(k)) return;
    const v = a[k];
    if (Array.isArray(v)) {
      const arr = v.slice(0, 20).map(function (x) { return clean_(x, 20); }).filter(String);
      if (arr.length) r[k] = arr;
    } else if (v != null && String(v).trim() !== "") r[k] = clean_(v, 60);
  });
  return r;
}
// ссылка на видео: только TikTok, Instagram, YouTube
function videoUrl_(x) {
  let s = String(x || "").trim();
  if (!s) return "";
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  return /^https?:\/\/([a-z0-9-]+\.)*(tiktok\.com|instagram\.com|instagr\.am|youtube\.com|youtu\.be)(\/|$)/i.test(s) && s.length <= 300 ? s : "";
}
function parse_(s, def) { if (!s) return def; try { return JSON.parse(s); } catch (e) { return def; } }
function digits_(x) { return String(x || "").replace(/\D/g, "").replace(/^993(?=\d{8}$)/, ""); }
function clean_(x, max) { return String(x == null ? "" : x).trim().slice(0, max || 200); }
function pad_(n) { return ("000" + n).slice(-4); }
function validPhone_(p) { return /^(6[1-5]|71)\d{6}$/.test(p); }
function mail_(subj, body) { try { MailApp.sendEmail(ADMIN_EMAIL, subj, body); } catch (e) { console.error(e); } }

function hashPin_(phone, pin) {
  const props = PropertiesService.getScriptProperties();
  let salt = props.getProperty("SALT");
  if (!salt) { salt = Utilities.getUuid(); props.setProperty("SALT", salt); }
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + "|" + phone + "|" + pin, Utilities.Charset.UTF_8);
  return bytes.map(function (b) { return ("0" + (b & 255).toString(16)).slice(-2); }).join("");
}

function adminPassword_() {
  const p = PropertiesService.getScriptProperties().getProperty("ADMIN_PASSWORD") || ADMIN_PASSWORD_DEFAULT;
  return (!p || p === "поменяйте-этот-пароль") ? "" : p;
}
function admOk_(d) {
  return !!(d && d.adminToken && CacheService.getScriptCache().get("adm:" + d.adminToken));
}

function isLocked_(key) { return !!CacheService.getScriptCache().get("lock:" + key); }
function fail_(key) {
  const cache = CacheService.getScriptCache();
  const n = (parseInt(cache.get("fail:" + key), 10) || 0) + 1;
  if (n >= MAX_FAILS) { cache.put("lock:" + key, "1", LOCK_SEC); cache.remove("fail:" + key); }
  else cache.put("fail:" + key, String(n), LOCK_SEC);
}
function resetFails_(key) {
  const cache = CacheService.getScriptCache();
  cache.remove("fail:" + key); cache.remove("lock:" + key);
}
