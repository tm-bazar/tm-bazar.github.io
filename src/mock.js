/* ===== ДЕМО-РЕЖИМ =====
   Работает, пока API_URL пустой: всё хранится в этом браузере, сервер не нужен.
   Демо-продавец: телефон 65 000000, PIN 1234. Пароль админки: admin. */
const Mock = (() => {
  let db = null;
  const now = () => new Date().toISOString();
  const save = () => { try{ localStorage.setItem("tmb_mockdb7", JSON.stringify(db)); }catch(e){ console.warn("демо: место в браузере закончилось"); } };
  const next = k => (db.seq[k] = (db.seq[k] || 0) + 1);
  const pad = n => ("000" + n).slice(-4);
  const hash = (phone, pin) => "h" + phone + ":" + pin;

  function art(kind, color, label){
    const c = document.createElement("canvas"); c.width = c.height = 480;
    const g = c.getContext("2d");
    const bg = g.createLinearGradient(0, 0, 480, 480); bg.addColorStop(0, "#fafafa"); bg.addColorStop(1, "#ececf0");
    g.fillStyle = bg; g.fillRect(0, 0, 480, 480);
    g.fillStyle = color; g.strokeStyle = "rgba(0,0,0,.18)"; g.lineWidth = 6;
    g.beginPath();
    if (kind === "shoe"){ g.moveTo(70,300); g.quadraticCurveTo(90,190,190,200); g.lineTo(260,250); g.quadraticCurveTo(400,260,410,320); g.lineTo(410,350); g.lineTo(70,350); g.closePath(); }
    else if (kind === "shirt"){ g.moveTo(150,110); g.lineTo(200,90); g.quadraticCurveTo(240,130,280,90); g.lineTo(330,110); g.lineTo(400,180); g.lineTo(350,220); g.lineTo(330,200); g.lineTo(330,390); g.lineTo(150,390); g.lineTo(150,200); g.lineTo(130,220); g.lineTo(80,180); g.closePath(); }
    else if (kind === "phone"){ g.roundRect(160,70,160,320,28); }
    else if (kind === "laptop"){ g.roundRect(110,120,260,170,12); g.moveTo(70,300); g.lineTo(410,300); g.lineTo(430,340); g.lineTo(50,340); g.closePath(); }
    else if (kind === "ball"){ g.arc(240,240,140,0,Math.PI*2); }
    else if (kind === "pot"){ g.roundRect(120,200,240,150,30); g.rect(90,215,40,20); g.rect(350,215,40,20); g.roundRect(140,170,200,34,10); }
    else if (kind === "chair"){ g.rect(150,90,40,300); g.rect(150,240,200,40); g.rect(310,240,40,150); g.rect(150,90,180,40); }
    else if (kind === "bear"){ g.arc(240,280,110,0,Math.PI*2); g.moveTo(330,160); g.arc(240,160,80,0,Math.PI*2); g.moveTo(195,95); g.arc(175,95,32,0,Math.PI*2); g.moveTo(337,95); g.arc(305,95,32,0,Math.PI*2); }
    else if (kind === "car"){ g.moveTo(60,300); g.lineTo(90,230); g.lineTo(170,220); g.lineTo(220,160); g.lineTo(330,160); g.lineTo(380,225); g.lineTo(420,240); g.lineTo(420,300); g.closePath(); }
    else if (kind === "bottle"){ g.roundRect(200,60,80,60,10); g.roundRect(170,120,140,280,40); }
    else if (kind === "apple"){ g.arc(200,260,110,0,Math.PI*2); g.arc(280,260,110,0,Math.PI*2); }
    else if (kind === "house"){ g.moveTo(240,80); g.lineTo(410,210); g.lineTo(370,210); g.lineTo(370,390); g.lineTo(110,390); g.lineTo(110,210); g.lineTo(70,210); g.closePath(); }
    else { g.roundRect(110,110,260,260,30); }
    g.fill(); g.stroke();
    if (kind === "car" || kind === "chair"){ g.fillStyle = "#333"; if (kind === "car"){ g.beginPath(); g.arc(140,305,38,0,7); g.arc(340,305,38,0,7); g.fill(); } }
    if (kind === "ball"){ g.fillStyle = "#222"; g.beginPath(); g.arc(240,240,40,0,7); g.fill(); }
    g.fillStyle = "rgba(0,0,0,.55)"; g.font = "600 26px system-ui, sans-serif"; g.textAlign = "center";
    g.fillText(label, 240, 440);
    return c;
  }

  function seed(){
    db = {seq:{}, users:[], products:[], chats:[], messages:[], reports:[], reviews:[]};
    const mk = (name, phone, city, seller) => {
      const u = {id:"U"+pad(next("U")), name, phone, city, imo:"1", seller, status:"active", at:new Date(Date.now()-864e5*40).toISOString(), lang:"ru", pin:hash(phone,"1234"), token:""};
      db.users.push(u); return u;
    };
    const a = mk("Demo Dükan", "65000000", "Aşgabat", "active"); a.stype = "shop";
    const b = mk("Aýna Moda", "63111111", "Mary", "active"); b.stype = "online";
    const c = mk("Tehno Merkez", "62222222", "Daşoguz", "active"); c.stype = "shop";
    { const lc = document.createElement("canvas"); lc.width = lc.height = 160; const g = lc.getContext("2d");
      g.fillStyle = "#7b2cbf"; g.fillRect(0,0,160,160); g.fillStyle = "#fff"; g.font = "800 64px system-ui"; g.textAlign = "center"; g.fillText("AM", 80, 102);
      b.logo = lc.toDataURL("image/png"); }
    const d0 = mk("Serdar", "61444444", "Türkmenbaşy", "active"); d0.stype = "private";
    mk("Jeren (garaşýar)", "64333333", "Türkmenabat", "pending");
    const items = [
      [b,"Ak krossowka, 41 razmer","shoes","shoe","#ffffff",320,"new","men"],
      [b,"Кроссовки красные, 38","shoes","shoe","#e8341c",280,"new","women"],
      [b,"Gara köwüş, deri","shoes","shoe","#2b2b2b",450,"used","men"],
      [b,"Футболка синяя, хлопок","clothes","shirt","#2f6fd6",90,"new","men"],
      [b,"Gyzyl köýnek","clothes","shirt","#d8264a",150,"new","women",{size:["S","M","L"]}],
      [b,"Жёлтая детская футболка","kids","shirt","#ffc93c",60,"new","kidsclothes"],
      [c,"Smartfon, 128 GB","electronics","phone","#1f1f1f",3200,"new","mobiles",{brand:"Samsung",model:"Galaxy A55",memory:"128",ram:"8",color:"black",camera:"yes",frontcam:"yes",sim:"2 SIM"}],
      [c,"iPhone 13, mawy","electronics","phone","#7fb3ff",6400,"used","mobiles",{brand:"Apple",model:"iPhone 13",memory:"128",color:"blue"}],
      [c,"Noutbuk 15.6\"","electronics","laptop","#9aa0a6",8900,"new","laptops"],
      [a,"Futbol topy","sport","ball","#ffffff",180,"new","football"],
      [a,"Баскетбольный мяч","sport","ball","#f08a24",210,"new","football"],
      [a,"Кастрюля 5 литров","home","pot","#c0c4cc",240,"new","kitchenware"],
      [a,"Gyzyl gazan","home","pot","#d33b2c",190,"new","kitchenware"],
      [a,"Деревянный стул","furniture","chair","#a8743e",350,"used","kitchenfurn"],
      [a,"Плюшевый мишка","kids","bear","#b5835a",120,"new","toys"],
      [c,"Oýunjak maşyn","kids","car","#2fa84f",95,"new","toys"],
      [a,"Духи 50 мл","beauty","bottle","#f2a7c3",260,"new","perfume"],
      [a,"Täze almalar, 1 kg","food","apple","#d9302b",18,"new","fruitveg"],
      [d0,"Toyota Camry 2015, ak reňk","auto","car","#f2f2f2",215000,"used","cars",{brand:"Toyota",model:"Camry",year:"2015",km:"180000",gear:"auto",fuel:"petrol"}],
      [d0,"Teker 205/55 R16 (4 sany)","autoparts","ball","#2b2b2b",2400,"used","tires"],
      [d0,"3 otagly jaý, Türkmenbaşy","realty","house","#e9c46a",950000,"used","house",{deal:"sale",rooms:"3",area:"140",landarea:"6",floors:"2",repair:"euro",furniture:"partly"}],
      [a,"2 otagly kwartira, Parahat-7","realty","house","#8ecae6",3500,"used","flat",{deal:"rent",flattype:"elite",rooms:"2",area:"72",floor:"5",floors:"9",repair:"euro",furniture:"yes",forwhom:["family","students"],period:"monthly"}],
      [a,"3 otagly kwartira satlyk, 30-njy mkr","realty","house","#ffb703",820000,"used","flat",{deal:"sale",flattype:"newbuild",rooms:"3",area:"96",floor:"3",floors:"12",repair:"designer",furniture:"no"}]
    ];
    // демо: футболка в 3 цветах
    {
      const vs = [["#2f6fd6","Gök / Синий"],["#d8264a","Gyzyl / Красный"],["#2fa84f","Ýaşyl / Зелёный"]].map(([c,l],k) => {
        const url = art("shirt", c, l).toDataURL("image/jpeg", 0.8); return {id:"v"+k, url, thumb:url, label:l};
      });
      const cv = art("shirt", "#2f6fd6", "Futbolka"); 
      db.products.push({id:"P"+pad(next("P")), user:b.id, title:"Futbolka, 3 reňk / Футболка, 3 цвета", price:"85", cat:"clothes", sub:"men", city:b.city, cond:"new",
        desc:"S, M, L, XL", place:"Baýramaly", video:"https://www.tiktok.com/@tmbazar/video/1", photos: JSON.stringify(vs), status:"active", at:new Date(Date.now()-1800e3).toISOString(), upd:now(),
        vs:"s1:" + Vision.encode(Vision.simple(cv)), vm:""});
    }
    // демо: покупатели и отзывы с «реальными» фото
    const bu1 = mk("Aýgül", "64123456", "Aşgabat", ""), bu2 = mk("Myrat", "65987654", "Mary", ""), bu3 = mk("Ogulgerek", "63555555", "Ahal", "");
    const shirtId = db.products[db.products.length-1].id;
    const rphoto = (c, l) => { const u = art("shirt", c, l).toDataURL("image/jpeg", 0.7); return {id:"r"+Math.random().toString(36).slice(2,7), url:u, thumb:u}; };
    [[bu1,5,"Gowy hil, reňki suratdaky ýaly. Satyjy çalt jogap berdi 👍",[rphoto("#2f6fd6","Aýgül"),rphoto("#2f6fd6","Aýgül 2")]],
     [bu2,4,"Хорошая футболка, размер L подошёл. Немного тоньше, чем ожидал.",[rphoto("#d8264a","Myrat")]],
     [bu3,5,"Ýaşyl reňki aldym, örän gowy! Рекомендую.",[]]].forEach(([u,stars,text,ph],k) => {
      db.chats.push({id:"C"+next("C"), product:shirtId, buyer:u.id, seller:b.id, lastText:"Sag boluň!", lastAt:new Date(Date.now()-864e5*(3-k)).toISOString(), lastFrom:u.id, readB:"", readS:"x"});
      db.reviews.push({id:"V"+next("V"), product:shirtId, seller:b.id, user:u.id, stars:String(stars), text, photos:JSON.stringify(ph), at:new Date(Date.now()-864e5*(2-k)).toISOString(), status:""});
    });
    items.forEach(([u,title,cat,kind,color,price,cond,sub,attrs], i) => {
      const cv = art(kind, color, title.slice(0, 26));
      const url = cv.toDataURL("image/jpeg", 0.8);
      const vs = "s1:" + Vision.encode(Vision.simple(cv));
      db.products.push({id:"P"+pad(next("P")), user:u.id, title, price:String(price), cat, sub:sub||"", place: cat==="realty" ? (title.includes("Parahat") ? "Parahat-7" : title.includes("30-njy") ? "30-njy mkr" : "") : "", attrs:attrs?JSON.stringify(attrs):(cat==="autoparts"?JSON.stringify({brand:"Toyota"}):""), city:u.city, cond,
        desc: i % 3 === 0 ? "Демо-товар. Здесь продавец пишет размер, цвет, состояние и где можно забрать.\nDemo haryt." : "",
        photos: JSON.stringify([{id:"f"+i, url, thumb:url}]), status:"active",
        at:new Date(Date.now() - i*3.6e6*7).toISOString(), upd:now(), vs, vm:""});
    });
    save();
  }
  function load(){
    if (db) return;
    try{ db = JSON.parse(localStorage.getItem("tmb_mockdb7")); }catch(e){}
    if (!db || !db.users) seed();
  }

  const P = s => { try{ return JSON.parse(s); }catch(e){ return null; } };
  const userByToken = tk => tk ? db.users.find(u => u.token === tk && u.status !== "blocked") : null;
  const pub = u => ({id:u.id, name:u.name, phone:u.phone, city:u.city, imo:u.imo==="1", stype:u.stype||"", logo:u.logo||"", seller:u.seller||"", status:u.status, at:u.at});
  const short = (p, u) => { const ph = P(p.photos) || []; return {id:p.id, user:p.user, sellerName:u?u.name:"", sellerLogo:u?u.logo||"":"", stype:u?u.stype||"private":"", title:p.title, price:+p.price, cat:p.cat, sub:p.sub||"", attrs:P(p.attrs)||{}, city:p.city, place:p.place||"", hasVideo:!!p.video, cond:p.cond, at:p.at, thumb:ph[0]?ph[0].thumb:"", photoCount:ph.length, variants:ph.filter(x=>x.label).length}; };
  const activeSellers = () => Object.fromEntries(db.users.filter(u => u.seller === "active" && u.status !== "blocked").map(u => [u.id, u]));
  const admOk = d => d.adminToken === "demo-admin";
  const ratings = () => { const bp = {}, bs = {};
    db.reviews.forEach(x => { if (x.status === "hidden") return; const s = +x.stars;
      (bp[x.product] = bp[x.product] || {sum:0,n:0}); bp[x.product].sum += s; bp[x.product].n++;
      (bs[x.seller] = bs[x.seller] || {sum:0,n:0}); bs[x.seller].sum += s; bs[x.seller].n++; });
    return {bp, bs}; };
  const avg = x => Math.round(x.sum / x.n * 10) / 10;
  const hasChat = (uid, pid) => db.chats.some(c => c.product === pid && c.buyer === uid && c.lastAt);

  const A = {
    adminTile(d){ if (!admOk(d)) return {ok:false,error:"auth"}; db.tiles = db.tiles || {};
      if (d.data) db.tiles[d.key] = "data:image/jpeg;base64," + d.data; else delete db.tiles[d.key]; return {ok:true, thumb: db.tiles[d.key] || ""}; },
    catalog(){ const s = activeSellers(), rs = ratings(); return {ok:true, tiles: db.tiles || {}, products: db.products.filter(p => p.status === "active" && s[p.user] && p.photos !== "[]")
      .map(p => { const r = short(p, s[p.user]), x = rs.bp[p.id]; if (x){ r.rating = avg(x); r.reviews = x.n; } return r; }).reverse()}; },
    reviews(d){
      const me = userByToken(d.token), p = db.products.find(x => x.id === d.id);
      const list = db.reviews.filter(x => x.product === d.id && x.status !== "hidden").map(x => { const u = db.users.find(y => y.id === x.user);
        return {id:x.id, name:u?u.name:"—", city:u?u.city:"", stars:+x.stars, text:x.text, photos:P(x.photos)||[], at:x.at, mine:!!(me && me.id === x.user)}; }).reverse();
      return {ok:true, reviews:list, canReview: !!(me && p && p.user !== me.id && hasChat(me.id, p.id))};
    },
    saveReview(d){
      const u = userByToken(d.token); if (!u) return {ok:false,error:"auth"};
      const p = db.products.find(x => x.id === d.product); if (!p) return {ok:false,error:"not_found"};
      if (p.user === u.id) return {ok:false,error:"own"}; if (!hasChat(u.id, p.id)) return {ok:false,error:"no_chat"};
      if (!d.stars) return {ok:false,error:"stars"};
      let v = db.reviews.find(x => x.product === p.id && x.user === u.id);
      if (!v){ v = {id:"V"+next("V"), product:p.id, seller:p.user, user:u.id, photos:"[]", status:""}; db.reviews.push(v); }
      Object.assign(v, {stars:String(d.stars), text:(d.text||"").slice(0,1000), at:now()});
      return {ok:true, id:v.id};
    },
    reviewPhoto(d){
      const u = userByToken(d.token), v = db.reviews.find(x => x.id === d.id); if (!u || !v || v.user !== u.id) return {ok:false,error:"not_found"};
      let ph = P(v.photos) || []; if (Array.isArray(d.keep)) ph = ph.filter(x => d.keep.includes(x.id));
      let x = null; if (d.data){ if (ph.length >= 4) return {ok:false,error:"too_many"}; const url = "data:image/jpeg;base64,"+d.data; x = {id:"r"+Date.now()+Math.random().toString(36).slice(2,5), url, thumb:url}; ph.push(x); }
      v.photos = JSON.stringify(ph); return {ok:true, photo:x};
    },
    deleteReview(d){ const u = userByToken(d.token), i = db.reviews.findIndex(x => x.id === d.id); if (!u || i < 0 || db.reviews[i].user !== u.id) return {ok:false,error:"not_found"}; db.reviews.splice(i,1); return {ok:true}; },
    adminReview(d){ if (!admOk(d)) return {ok:false,error:"auth"}; const i = db.reviews.findIndex(x => x.id === d.id); if (i < 0) return {ok:false,error:"not_found"};
      if (d.remove) db.reviews.splice(i,1); else db.reviews[i].status = d.status === "hidden" ? "hidden" : ""; return {ok:true}; },
    vectors(){ const s = activeSellers(); return {ok:true, items: db.products.filter(p => p.status === "active" && s[p.user]).map(p => [p.id, p.vs, p.vm])}; },
    product(d){
      const p = db.products.find(x => x.id === d.id); if (!p) return {ok:false,error:"not_found"};
      const u = db.users.find(x => x.id === p.user), me = userByToken(d.token);
      const vis = p.status === "active" && u && u.seller === "active" && u.status !== "blocked";
      if (!vis && !(me && me.id === p.user) && !admOk(d)) return {ok:false,error:"not_found"};
      const r = short(p, u); r.desc = p.desc; r.video = p.video || ""; r.photos = P(p.photos) || []; r.status = p.status;
      r.seller = {id:u.id, name:u.name, phone:u.phone, imo:u.imo==="1", city:u.city, stype:u.stype||"private", logo:u.logo||"", since:u.at, count: db.products.filter(x => x.user === u.id && x.status === "active").length};
      const rs = ratings(); if (rs.bp[p.id]){ r.rating = avg(rs.bp[p.id]); r.reviews = rs.bp[p.id].n; }
      if (rs.bs[u.id]){ r.seller.rating = avg(rs.bs[u.id]); r.seller.reviews = rs.bs[u.id].n; }
      return {ok:true, product:r};
    },
    uploadLogo(d){ const u = userByToken(d.token); if (!u) return {ok:false,error:"auth"}; u.logo = d.data ? "data:image/jpeg;base64,"+d.data : ""; return {ok:true, logo:u.logo}; },
    report(d){ const me = userByToken(d.token); db.reports.push({id:"R"+next("R"), product:d.id, user:me?me.id:"", reason:d.reason, text:d.text||"", at:now(), status:"new"}); return {ok:true}; },
    sendCode(d){ return {ok:true}; },
    resetPin(d){
      const u = db.users.find(x => x.phone === d.phone); if (!u) return {ok:false,error:"no_user"};
      if (!/^\d{4}$/.test(String(d.pin||""))) return {ok:false,error:"pin"};
      u.pin = hash(d.phone, d.pin); if (!u.token) u.token = "t"+Math.random().toString(36).slice(2);
      return {ok:true, user:pub(u), token:u.token};
    },
    register(d){
      if (!d.name) return {ok:false,error:"fields"};
      if (!/^(6[1-5]|71)\d{6}$/.test(d.phone)) return {ok:false,error:"phone"};
      if (!CITIES.includes(d.city)) return {ok:false,error:"city"};
      if (db.users.some(u => u.phone === d.phone)) return {ok:false,error:"exists"};
      const u = {id:"U"+pad(next("U")), name:d.name, phone:d.phone, city:d.city, imo:d.imo?"1":"", stype:d.stype||"", logo:"", seller:"", status:"active", at:now(), lang:d.lang, pin:hash(d.phone,d.pin), token:"t"+Math.random().toString(36).slice(2)};
      db.users.push(u); return {ok:true, user:pub(u), token:u.token};
    },
    login(d){
      const u = db.users.find(x => x.phone === d.phone);
      if (!u || u.pin !== hash(d.phone, d.pin)) return {ok:false,error:"wrong"};
      if (u.status === "blocked") return {ok:false,error:"blocked"};
      if (!u.token) u.token = "t"+Math.random().toString(36).slice(2);
      return {ok:true, user:pub(u), token:u.token};
    },
    me(d){ const u = userByToken(d.token); if (!u) return {ok:false,error:"auth"};
      return {ok:true, user:pub(u), products: db.products.filter(p => p.user === u.id).map(p => Object.assign(short(p,u), {status:p.status})).reverse()}; },
    saveProfile(d){ const u = userByToken(d.token); if (!u) return {ok:false,error:"auth"}; Object.assign(u, {name:d.name, city:d.city, imo:d.imo?"1":""}); if (d.stype != null) u.stype = d.stype; return {ok:true}; },
    saveProduct(d){
      const u = userByToken(d.token); if (!u) return {ok:false,error:"auth"};
      if (u.seller === "blocked") return {ok:false,error:"blocked"};
      const o = d.product, price = +o.price;
      if (!o.title || !o.cat || (!(price > 0) && !PRICE_OPTIONAL[o.cat] && !PRICE_FREE[o.cat])) return {ok:false,error:"fields"};
      let p = o.id ? db.products.find(x => x.id === o.id) : null;
      if (p && p.user !== u.id) return {ok:false,error:"auth"};
      if (!p){ p = {id:"P"+pad(next("P")), user:u.id, at:now(), photos:"[]", vs:"", vm:"", status:"active"}; db.products.push(p); }
      let photos = P(p.photos) || [];
      if (Array.isArray(o.photoOrder)) photos = photos.filter(x => o.photoOrder.includes(x.id)).sort((a,b) => o.photoOrder.indexOf(a.id) - o.photoOrder.indexOf(b.id));
      if (o.photoLabels) photos.forEach(x => { if (o.photoLabels[x.id] != null) x.label = String(o.photoLabels[x.id]).slice(0,30); });
      if (o.video && !videoUrl(o.video)) return {ok:false,error:"video"};
      if (SUBS[o.cat] && !SUBS[o.cat].includes(o.sub)) return {ok:false,error:"sub"};
      if (o.cat === "auto" && VEHICLE_SUBS[o.sub] && !(o.attrs && o.attrs.brand)) return {ok:false,error:"brand"};
      if (o.cat === "realty" && !(o.attrs && o.attrs.deal)) return {ok:false,error:"deal"};
      p.sub = SUBS[o.cat] ? o.sub : ""; p.attrs = o.attrs && Object.keys(o.attrs).length ? JSON.stringify(o.attrs) : "";
      Object.assign(p, {place:(o.place||"").slice(0,40), video:videoUrl(o.video), title:o.title, price:String(price), cat:o.cat, city:o.city, cond:o.cond, desc:o.desc||"", photos:JSON.stringify(photos),
        status: p.status === "banned" ? "banned" : (o.status || "active"), upd:now()});
      if (o.vs != null) p.vs = o.vs; if (o.vm != null) p.vm = o.vm;
      if (!u.seller || u.seller === "pending") u.seller = "active";
      return {ok:true, id:p.id, seller:u.seller};
    },
    uploadPhoto(d){
      const u = userByToken(d.token), p = db.products.find(x => x.id === d.id);
      if (!u || !p || p.user !== u.id) return {ok:false,error:"not_found"};
      const ph = P(p.photos) || []; if (ph.length >= 10) return {ok:false,error:"too_many"};
      const url = "data:image/jpeg;base64," + d.data, x = {id:"f"+Date.now()+Math.random().toString(36).slice(2,6), url, thumb:url, label:d.label||""};
      ph.push(x); p.photos = JSON.stringify(ph); return {ok:true, photo:x};
    },
    setStatus(d){ const u = userByToken(d.token), p = db.products.find(x => x.id === d.id);
      if (!u || !p || p.user !== u.id) return {ok:false,error:"not_found"}; if (p.status === "banned") return {ok:false,error:"banned"};
      p.status = d.status; return {ok:true}; },
    deleteProduct(d){ const u = userByToken(d.token), i = db.products.findIndex(x => x.id === d.id);
      if (!u || i < 0 || db.products[i].user !== u.id) return {ok:false,error:"not_found"}; db.products.splice(i,1); return {ok:true}; },
    openChat(d){
      const u = userByToken(d.token); if (!u) return {ok:false,error:"auth"};
      const p = db.products.find(x => x.id === d.product); if (!p) return {ok:false,error:"not_found"};
      if (p.user === u.id) return {ok:false,error:"own"};
      let c = db.chats.find(x => x.product === p.id && x.buyer === u.id);
      if (!c){ c = {id:"C"+next("C"), product:p.id, buyer:u.id, seller:p.user, lastText:"", lastAt:"", lastFrom:"", readB:"", readS:""}; db.chats.push(c); }
      return {ok:true, id:c.id};
    },
    chats(d){
      const u = userByToken(d.token); if (!u) return {ok:false,error:"auth"};
      return {ok:true, chats: db.chats.filter(c => (c.buyer === u.id || c.seller === u.id) && c.lastAt).map(c => {
        const o = db.users.find(x => x.id === (c.buyer === u.id ? c.seller : c.buyer)), p = db.products.find(x => x.id === c.product);
        const read = c.buyer === u.id ? c.readB : c.readS;
        return {id:c.id, role:c.buyer===u.id?"buyer":"seller", other:o?o.name:"—", product:p?{id:p.id,title:p.title,price:+p.price,thumb:(P(p.photos)||[])[0]?.thumb||""}:null,
          lastText:c.lastText, lastAt:c.lastAt, mine:c.lastFrom===u.id, unread:c.lastFrom!==u.id && (!read || read < c.lastAt)};
      }).sort((a,b) => a.lastAt < b.lastAt ? 1 : -1)};
    },
    chat(d){
      const u = userByToken(d.token); if (!u) return {ok:false,error:"auth"};
      const c = db.chats.find(x => x.id === d.id); if (!c || (c.buyer !== u.id && c.seller !== u.id)) return {ok:false,error:"not_found"};
      const msgs = db.messages.filter(m => m.chat === c.id && (!d.since || m.at > d.since)).map(m => ({id:m.id, from:m.from, mine:m.from===u.id, text:m.text, photo:P(m.photo), at:m.at}));
      const r = {ok:true, messages:msgs};
      if (!d.since){
        const o = db.users.find(x => x.id === (c.buyer === u.id ? c.seller : c.buyer)), p = db.products.find(x => x.id === c.product);
        r.info = {role:c.buyer===u.id?"buyer":"seller", other:o?{name:o.name, phone:o.phone, imo:o.imo==="1"}:null,
          product:p?{id:p.id,title:p.title,price:+p.price,status:p.status,thumb:(P(p.photos)||[])[0]?.thumb||""}:null};
      }
      return r;
    },
    send(d){
      const u = userByToken(d.token); if (!u) return {ok:false,error:"auth"};
      const c = db.chats.find(x => x.id === d.id); if (!c) return {ok:false,error:"not_found"};
      const photo = d.data ? JSON.stringify({id:"m", url:"data:image/jpeg;base64,"+d.data, thumb:"data:image/jpeg;base64,"+d.data}) : "";
      if (!d.text && !photo) return {ok:false,error:"fields"};
      const m = {id:"M"+next("M"), chat:c.id, from:u.id, text:d.text||"", photo, at:now()};
      db.messages.push(m);
      Object.assign(c, {lastText:m.text||"📷", lastAt:m.at, lastFrom:u.id}); c[c.buyer===u.id?"readB":"readS"] = m.at;
      // демо: продавец отвечает автоматически
      if (c.buyer === u.id && !db.messages.some(x => x.chat === c.id && x.from === c.seller)){
        setTimeout(() => {
          const r = {id:"M"+next("M"), chat:c.id, from:c.seller, text:"Salam! Hawa, bar. Здравствуйте, товар в наличии 🙂", photo:"", at:now()};
          db.messages.push(r); Object.assign(c, {lastText:r.text, lastAt:r.at, lastFrom:c.seller}); save();
        }, 2500);
      }
      return {ok:true, message:{id:m.id, from:u.id, mine:true, text:m.text, photo:P(photo), at:m.at}};
    },
    readChat(d){ const u = userByToken(d.token), c = db.chats.find(x => x.id === d.id); if (u && c) c[c.buyer===u.id?"readB":"readS"] = now(); return {ok:true}; },
    poll(d){ const r = A.chats(d); if (!r.ok) return r; return {ok:true, unread:r.chats.filter(c => c.unread).length, at:now()}; },
    adminLogin(d){ return d.password === "admin" ? {ok:true, token:"demo-admin"} : {ok:false,error:"wrong"}; },
    adminData(d){
      if (!admOk(d)) return {ok:false,error:"auth"};
      const by = Object.fromEntries(db.users.map(u => [u.id,u]));
      return {ok:true, approval:true,
        users: db.users.map(u => Object.assign(pub(u), {count: db.products.filter(p => p.user === u.id).length})).reverse(),
        products: db.products.map(p => Object.assign(short(p, by[p.user]), {status:p.status, desc:p.desc})).reverse(),
        reports: db.reports.slice().reverse(),
        reviews: db.reviews.map(x => Object.assign({}, x, {stars:+x.stars, name:(by[x.user]||{}).name||"—", photos:P(x.photos)||[]})).reverse()};
    },
    adminUser(d){ if (!admOk(d)) return {ok:false,error:"auth"}; const u = db.users.find(x => x.id === d.id); if (!u) return {ok:false,error:"not_found"};
      if (d.seller != null) u.seller = d.seller; if (d.status) { u.status = d.status; if (d.status === "blocked") u.token = ""; }
      if (d.pin){ u.pin = hash(u.phone, d.pin); u.token = ""; } return {ok:true}; },
    adminProduct(d){ if (!admOk(d)) return {ok:false,error:"auth"}; const i = db.products.findIndex(x => x.id === d.id); if (i < 0) return {ok:false,error:"not_found"};
      if (d.remove) db.products.splice(i,1); else db.products[i].status = d.status; return {ok:true}; },
    adminReport(d){ if (!admOk(d)) return {ok:false,error:"auth"}; const x = db.reports.find(r => r.id === d.id); if (x) x.status = d.status; return {ok:true}; },
    // v38: VIP и срок объявления 30 дней
    renewProduct(d){ const u = userByToken(d.token), p = db.products.find(x => x.id === d.id);
      if (!u || !p || p.user !== u.id) return {ok:false,error:"not_found"}; p.at = now(); return {ok:true, at:p.at, exp:mExp(p)}; },
    adminVip(d){ if (!admOk(d)) return {ok:false,error:"auth"}; db.vip = db.vip || {};
      if (+d.days > 0) db.vip[d.id] = new Date(Date.now() + d.days * 864e5).toISOString(); else delete db.vip[d.id]; return {ok:true}; },
    // v39: баланс и покупка VIP
    buyVip(d){ const u = userByToken(d.token); if (!u) return {ok:false,error:"auth"}; db.bal = db.bal || {}; const pr = mPrices();
      if (d.shop){ const price = pr.shop[d.days]; if (!price) return {ok:false,error:"no_price"}; if ((db.bal[u.id]||0) < price) return {ok:false,error:"no_money"};
        db.bal[u.id] -= price; db.vipShop = db.vipShop || {}; const from = Math.max(Date.now(), new Date(db.vipShop[u.id] || 0).getTime() || 0);
        db.vipShop[u.id] = new Date(from + d.days * 864e5).toISOString(); return {ok:true, shopVip:db.vipShop[u.id], balance:db.bal[u.id]}; }
      const p = db.products.find(x => x.id === d.id); if (!p || p.user !== u.id) return {ok:false,error:"not_found"};
      if ((db.bal[u.id]||0) < pr.item) return {ok:false,error:"no_money"}; db.bal[u.id] -= pr.item; db.vip = db.vip || {};
      const from = Math.max(Date.now(), new Date(db.vip[p.id] || 0).getTime() || 0);
      db.vip[p.id] = new Date(from + 7 * 864e5).toISOString(); return {ok:true, vip:db.vip[p.id], balance:db.bal[u.id]}; },
    supportSend(d){ const u = userByToken(d.token); if (!u) return {ok:false,error:"auth"}; db.sup = db.sup || [];
      const o = {id:"M"+Date.now(), at:now(), user:u.id, name:u.name, phone:u.phone, from:"user", text:d.text||"", photo:d.photo ? "data:image/jpeg;base64,"+d.photo : "", amount:+d.amount||0, readA:"", readU:"1"};
      db.sup.push(o); return {ok:true}; },
    supportList(d){ const u = userByToken(d.token); if (!u) return {ok:false,error:"auth"}; db.sup = db.sup || [];
      const mine = db.sup.filter(m => m.user === u.id); mine.forEach(m => { if (m.from === "admin") m.readU = "1"; });
      return {ok:true, messages:mine.map(m => ({id:m.id, at:m.at, from:m.from, text:m.text, photo:m.photo, amount:m.amount})), balance:(db.bal||{})[u.id]||0}; },
    adminSupport(d){ if (!admOk(d)) return {ok:false,error:"auth"}; const by = {};
      (db.sup||[]).forEach(m => { const t = by[m.user] || (by[m.user] = {user:m.user, name:m.name, phone:m.phone, unread:0, amount:0});
        t.last = {at:m.at, from:m.from, text:m.text, photo:m.photo, amount:m.amount}; if (m.from === "user" && !m.readA){ t.unread++; if (m.amount) t.amount = m.amount; } });
      return {ok:true, threads:Object.values(by).map(t => Object.assign(t, {balance:(db.bal||{})[t.user]||0}))}; },
    adminSupportThread(d){ if (!admOk(d)) return {ok:false,error:"auth"}; const u = db.users.find(x => x.id === d.user); if (!u) return {ok:false,error:"not_found"};
      const mine = (db.sup||[]).filter(m => m.user === u.id); mine.forEach(m => { if (m.from === "user") m.readA = "1"; });
      return {ok:true, user:{id:u.id, name:u.name, phone:u.phone}, messages:mine.map(m => ({id:m.id, at:m.at, from:m.from, text:m.text, photo:m.photo, amount:m.amount})), balance:(db.bal||{})[u.id]||0}; },
    adminSupportSend(d){ if (!admOk(d)) return {ok:false,error:"auth"}; const u = db.users.find(x => x.id === d.user); if (!u) return {ok:false,error:"not_found"};
      db.bal = db.bal || {}; db.sup = db.sup || []; let text = d.text || ""; const a = +d.amount || 0;
      if (a){ if ((db.bal[u.id]||0) + a < 0) return {ok:false,error:"no_money"}; db.bal[u.id] = (db.bal[u.id]||0) + a; text = (a > 0 ? "✅ Начислено "+a+" монет. Баланс: "+db.bal[u.id]+" монет." : "Списано "+(-a)+" монет.") + (text ? "\n"+text : ""); }
      if (!text) return {ok:false,error:"fields"};
      db.sup.push({id:"M"+Date.now(), at:now(), user:u.id, name:u.name, phone:u.phone, from:"admin", text, photo:"", amount:a, readA:"1", readU:""});
      return {ok:true, balance:db.bal[u.id]}; },
    adminMallSug(d){ if (!admOk(d)) return {ok:false,error:"auth"}; db.mallSug = (db.mallSug||[]).filter(x => !(x.city === d.city && x.name === d.name));
      if (d.ok){ db.malls = db.malls || JSON.parse(JSON.stringify(MALLS_DEFAULT)); (db.malls[d.city] = db.malls[d.city] || []).push(d.name); } return {ok:true}; },
    deleteAccount(d){ const u = userByToken(d.token); if (!u) return {ok:false,error:"auth"}; const n = db.products.filter(p => p.user === u.id).length;
      db.products = db.products.filter(p => p.user !== u.id); db.users = db.users.filter(x => x.id !== u.id); return {ok:true, removed:n}; },
    adminMalls(d){ if (!admOk(d)) return {ok:false,error:"auth"}; db.malls = d.malls; return {ok:true, malls:d.malls}; },
    adminVipShop(d){ if (!admOk(d)) return {ok:false,error:"auth"}; db.vipShop = db.vipShop || {};
      if (+d.days > 0) db.vipShop[d.user] = new Date(Date.now() + d.days * 864e5).toISOString(); else delete db.vipShop[d.user]; return {ok:true}; },
    adminBalance(d){ if (!admOk(d)) return {ok:false,error:"auth"}; db.bal = db.bal || {};
      const v = (db.bal[d.id] || 0) + (+d.amount || 0); if (v < 0) return {ok:false,error:"no_money"}; db.bal[d.id] = v; return {ok:true, balance:v}; },
    adminPrices(d){ if (!admOk(d)) return {ok:false,error:"auth"}; db.prices2 = {shop:{}, item:+d.prices.item||0, itemDays:7}; [7,15,30].forEach(n => { db.prices2.shop[n] = +d.prices.shop[n] || 0; }); return {ok:true}; }
  };
  const mPrices = () => db.prices2 || (db.prices2 = {shop:{7:30, 15:55, 30:100}, item:10, itemDays:7});
  const mExp = p => new Date(new Date(p.at).getTime() + 30 * 864e5).toISOString();
  const mDecorate = (r, d) => {
    if (!r || !r.ok) return r;
    if (!db.vip){ db.vip = {}; const u2 = db.products.length && db.products[3] ? db.products[3].user : "";   // демо: пара VIP-объявлений
      db.products.filter(p => p.user === u2).slice(0, 3).forEach(p => { db.vip[p.id] = new Date(Date.now() + 9 * 864e5).toISOString(); }); }
    const deco = x => { const p = db.products.find(y => y.id === x.id); if (p){ x.exp = mExp(p); const a = db.vip[x.id] || "", b = (db.vipShop || {})[p.user] || ""; x.vip = a > b ? a : b; x.shopVip = b; } return x; };
    if (d.action === "catalog"){
      r.products = r.products.filter(x => new Date(deco(x).exp) > Date.now());
      r.expDays = 30; if (db.malls) r.malls = db.malls;
    }
    if (d.action === "me" || d.action === "adminData"){ r.products.forEach(deco); r.expDays = 30; r.vipPrices = mPrices(); }
    if (!db.bal){ db.bal = {}; db.users.forEach(u => { if (u.seller === "active") db.bal[u.id] = 50; }); }
    if (d.action === "me"){ r.balance = db.bal[r.user.id] || 0; r.shopVip = (db.vipShop || {})[r.user.id] || ""; }
    if (d.action === "adminData"){ r.mallSug = db.mallSug || []; if (db.malls) r.malls = db.malls; }
    if (d.action === "saveProduct" && r.ok && d.product && d.product.attrs && d.product.attrs.mall){
      const known = ((db.malls || MALLS_DEFAULT)[d.product.city] || []);
      if (!known.includes(d.product.attrs.mall)){ db.mallSug = db.mallSug || []; db.mallSug.push({city:d.product.city, name:d.product.attrs.mall, at:now()}); } }
    if (d.action === "adminData") r.users.forEach(u => { u.balance = db.bal[u.id] || 0; u.shopVip = (db.vipShop || {})[u.id] || ""; });
    if (d.action === "product" && r.product) deco(r.product);
    return r;
  };
  return {
    async run(d){
      load();
      await new Promise(r => setTimeout(r, 120));
      const fn = A[d.action]; if (!fn) return {ok:false,error:"server"};
      const r = mDecorate(fn(d), d); save(); return r;
    },
    reset(){ localStorage.removeItem("tmb_mockdb7"); db = null; }
  };
})();
