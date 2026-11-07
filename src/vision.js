/* ===== ПОИСК ПО ФОТО =====
   Два способа «понять» картинку:
   1) простой (всегда работает, без интернета): цвета, расположение цветов, контуры;
   2) нейросеть MobileNet (умный, грузится из интернета ~10 МБ один раз, потом из кэша браузера).
   Для каждого товара сохраняем оба «отпечатка» главного фото. */
const ML_LABELS = {
  shoes:["shoe","sneaker","boot","sandal","clog","loafer","slipper"],
  clothes:["jersey","t-shirt","sweatshirt","cardigan","suit","gown","coat","jacket","kimono","abaya","miniskirt","jean","trench","poncho","sock","brassiere","bow tie","sombrero","cowboy hat","apron","pajama","swimsuit","bikini","military uniform","vestment","overskirt","hoopskirt","sarong","stole","cloak","fur coat","lab coat","maillot","wig","necklace","purse","backpack","wallet","handbag","mitten","sunglass","sunglasses"],
  kids:["teddy","crib","cradle","bassinet","stroller","pram","rattle","toyshop","balloon","jigsaw","piggy bank","bib"],
  electronics_ph:["cellular telephone","cellular phone","cellphone","mobile phone","ipod","dial telephone","pay-phone"],
  electronics:["laptop","notebook","monitor","screen","television","computer keyboard","keyboard","mouse","loudspeaker","remote control","camera","reflex camera","projector","printer","joystick","hard disc","modem","desktop computer","radio","cassette player","cd player","tape player","headphone","digital watch","digital clock","power drill","microphone","oscilloscope","hand-held computer","web site","switch"],
  home:["frying pan","wok","teapot","cup","coffee mug","plate","mixing bowl","toaster","microwave","refrigerator","washer","vacuum","iron","lamp","table lamp","quilt","pillow","bath towel","shower curtain","spatula","ladle","caldron","crock pot","dutch oven","espresso maker","coffeepot","water jug","water bottle","pitcher","measuring cup","strainer","can opener","corkscrew","dishwasher","stove","rotisserie","waffle iron","beaker","vase","candle","pot","soap dispenser","broom","bucket","plunger","tray","dishrag","wall clock","analog clock","electric fan","space heater","sewing machine"],
  beauty:["lipstick","perfume","lotion","hair spray","sunscreen","face powder","hair slide","hair drier","band aid","cream"],
  furniture:["chair","studio couch","desk","dining table","wardrobe","bookcase","chiffonier","china cabinet","four-poster","rocking chair","folding chair","entertainment center","file","medicine chest","throne","park bench","window shade","barber chair","sofa","shoji"],
  auto:["sports car","minivan","jeep","pickup","cab","limousine","convertible","beach wagon","racer","tow truck","trailer truck","ambulance","police van","tractor","minibus","moving van"],
  autoparts:["car wheel","grille","car mirror","seat belt","disk brake","radiator","gas pump","spotlight"],
  moto:["motor scooter","moped","go-kart","golfcart","snowmobile"],
  appliances:["washer","refrigerator","microwave","dishwasher","stove","vacuum","iron","electric fan","space heater","sewing machine","toaster"],
  carpets:["prayer rug","doormat","quilt"],
  animals:["ram","ox","hen","cock","goose","golden retriever","tabby","persian cat","goldfish","hamster","birdhouse","hay"],
  realty:["boathouse","greenhouse","patio","palace","mobile home","yurt","library"],
  jewelry:["necklace","digital watch","analog clock","stopwatch","chain mail"],
  books:["book jacket","comic book","binder","envelope","fountain pen","ballpoint","notebook","pencil box","rubber eraser"],
  garden:["pot","greenhouse","lawn mower","hay","daisy","rapeseed","corn"],
  build:["hammer","screwdriver","chain saw","nail","screw","shovel","hatchet","plane","padlock","chain","lumbermill","paintbrush","rule","tile roof","brick","toilet seat","washbasin","bathtub","doormat","sliding door","fence","hook"],
  sport:["soccer ball","basketball","volleyball","tennis ball","football helmet","rugby ball","golf ball","ping-pong ball","dumbbell","barbell","racket","mountain bike","bicycle","tricycle","unicycle","ski","swimming trunks","punching bag","croquet ball","baseball","balance beam","horizontal bar","snorkel","paddle","sleeping bag","tent","crash helmet"],
  food:["banana","orange","lemon","granny smith","strawberry","pineapple","pizza","french loaf","bagel","meat loaf","cucumber","bell pepper","corn","mushroom","pomegranate","fig","pretzel","cheeseburger","hotdog","ice cream","chocolate sauce","trifle","burrito","guacamole","head cabbage","broccoli","cauliflower","zucchini","acorn squash","butternut squash","artichoke","jackfruit","custard apple","dough","carbonara","consomme","potpie","espresso","red wine","eggnog","menu","grocery store"]
};

const Vision = {
  ml: null, mlLoading: null, mlFailed: false,

  loadScript(src){
    return new Promise((res, rej) => {
      if ([...document.scripts].some(s => s.src === src)) return res();
      const s = document.createElement("script"); s.src = src; s.async = true;
      s.onload = res; s.onerror = rej; document.head.append(s);
    });
  },
  loadML(){
    if (this.ml) return Promise.resolve(this.ml);
    if (this.mlFailed) return Promise.resolve(null);
    if (!this.mlLoading){
      this.mlLoading = (async () => {
        try{
          await this.loadScript(CDN_TF);
          await this.loadScript(CDN_MN);
          this.ml = await window.mobilenet.load({version: 2, alpha: 1.0});
          return this.ml;
        }catch(e){ console.warn("MobileNet не загрузился, работает простой поиск", e); this.mlFailed = true; return null; }
      })();
    }
    return this.mlLoading;
  },
  timeout(p, ms){ return Promise.race([p, new Promise(r => setTimeout(() => r(null), ms))]); },

  // квадрат из центра картинки
  square(img, n){
    const w = img.naturalWidth || img.width, hh = img.naturalHeight || img.height;
    const s = Math.min(w, hh);
    const c = document.createElement("canvas"); c.width = c.height = n;
    const g = c.getContext("2d", {willReadFrequently: true});
    g.fillStyle = "#fff"; g.fillRect(0, 0, n, n);
    g.drawImage(img, (w - s) / 2, (hh - s) / 2, s, s, 0, 0, n, n);
    return c;
  },

  // простой «отпечаток»: цвета (28) + сетка цветов 3×3 (27) + контуры 4×8 (32)
  simple(img){
    const N = 48;
    const d = this.square(img, N).getContext("2d").getImageData(0, 0, N, N).data;
    const hist = new Float32Array(28), grid = new Float32Array(27), edges = new Float32Array(32), gray = new Float32Array(N*N);
    let mr = 0, mg = 0, mb = 0;
    // цвет фона = средний цвет по краям; пиксели похожие на фон почти не учитываем
    let br = 0, bgc = 0, bb = 0, bn = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++){
      if (x > 2 && x < N-3 && y > 2 && y < N-3) continue;
      const i = (y*N + x) * 4; br += d[i]; bgc += d[i+1]; bb += d[i+2]; bn++;
    }
    br /= bn*255; bgc /= bn*255; bb /= bn*255;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++){
      const i = (y*N + x) * 4, r = d[i]/255, g = d[i+1]/255, b = d[i+2]/255;
      gray[y*N+x] = 0.299*r + 0.587*g + 0.114*b;
      const mx = Math.max(r,g,b), mn = Math.min(r,g,b), v = mx, s = mx ? (mx-mn)/mx : 0;
      let hue = 0;
      if (mx !== mn){
        if (mx === r) hue = ((g-b)/(mx-mn) + 6) % 6; else if (mx === g) hue = (b-r)/(mx-mn) + 2; else hue = (r-g)/(mx-mn) + 4;
        hue /= 6;
      }
      const dx = (x - N/2) / (N/2), dy = (y - N/2) / (N/2);
      const fg = Math.min(1, Math.max(0.08, Math.hypot(r-br, g-bgc, b-bb) / 0.25));
      const w = Math.exp(-(dx*dx + dy*dy) / 0.72) * fg; // центр и сам предмет важнее фона
      const idx = (s > 0.22 && v > 0.18) ? Math.floor(hue*12) % 12 * 2 + (s > 0.6 ? 1 : 0) : 24 + Math.min(3, Math.floor(v*4));
      hist[idx] += w;
      const cell = Math.floor(y/16)*3 + Math.floor(x/16);
      grid[cell*3] += r; grid[cell*3+1] += g; grid[cell*3+2] += b;
      mr += r; mg += g; mb += b;
    }
    mr /= N*N; mg /= N*N; mb /= N*N;
    for (let c = 0; c < 9; c++){ grid[c*3] = grid[c*3]/256 - mr; grid[c*3+1] = grid[c*3+1]/256 - mg; grid[c*3+2] = grid[c*3+2]/256 - mb; }
    for (let y = 1; y < N-1; y++) for (let x = 1; x < N-1; x++){
      const gx = gray[y*N+x+1] - gray[y*N+x-1], gy = gray[(y+1)*N+x] - gray[(y-1)*N+x];
      const m = Math.hypot(gx, gy); if (m < 0.02) continue;
      let a = Math.atan2(gy, gx); if (a < 0) a += Math.PI;
      const bin = Math.min(7, Math.floor(a / Math.PI * 8));
      const q = (y < N/2 ? 0 : 2) + (x < N/2 ? 0 : 1);
      edges[q*8 + bin] += m;
    }
    const norm = (v, k) => { let s = 0; for (const x of v) s += x*x; s = Math.sqrt(s) || 1; return Array.from(v, x => x / s * k); };
    const hs = Array.from(hist, Math.sqrt), es = Array.from(edges, Math.sqrt);
    return norm([...norm(hs, 1), ...norm(grid, 0.8), ...norm(es, 0.7)], 1);
  },

  async neural(img){
    const m = await this.timeout(this.loadML(), this._wait || 15000);
    if (!m) return null;
    const c = this.square(img, 224);
    const emb = m.infer(c, true);
    const data = Array.from(await emb.data()); emb.dispose();
    let cat = null, sub = null;
    try{
      const preds = await m.classify(c, 5);
      for (const p of preds){
        if (p.probability < 0.08) continue;
        const name = p.className.toLowerCase();
        for (const k in ML_LABELS) if (ML_LABELS[k].some(w => name.split(",").some(part => part.trim() === w || part.trim().includes(w)))){ cat = k === "electronics_ph" ? "electronics" : k; if (k === "electronics_ph") sub = "mobiles"; break; }
        if (cat) break;
      }
    }catch(e){}
    return {vec: data, cat, sub};
  },

  // главная функция: картинка → {vs, vm, s, m, cat}
  async describe(img, wait){
    const s = this.simple(img);
    this._wait = wait;
    let n = null;
    try{ n = await this.neural(img); }catch(e){ console.warn(e); }
    const vs = "s1:" + this.encode(s), vm = n ? "m2:" + this.encode(n.vec) : "";
    return {vs, vm, s: this.decode(vs), m: this.decode(vm), cat: n ? n.cat : null, sub: n ? n.sub : null};
  },

  // числа → короткая строка (int8 + base64)
  encode(v){
    let mx = 0; for (const x of v) mx = Math.max(mx, Math.abs(x));
    const k = mx ? 127 / mx : 0;
    const b = new Int8Array(v.length); v.forEach((x, i) => b[i] = Math.round(x * k));
    let s = ""; new Uint8Array(b.buffer).forEach(c => s += String.fromCharCode(c));
    return btoa(s);
  },
  decode(str){
    if (!str || str.indexOf(":") < 0) return null;
    try{
      const raw = atob(str.slice(str.indexOf(":") + 1));
      const b = new Int8Array(raw.length); for (let i = 0; i < raw.length; i++) b[i] = (raw.charCodeAt(i) << 24) >> 24;
      let n = 0; for (const x of b) n += x*x;
      return {v: b, n: Math.sqrt(n) || 1, kind: str.slice(0, str.indexOf(":"))};
    }catch(e){ return null; }
  },
  cos(a, b){
    if (!a || !b || a.kind !== b.kind || a.v.length !== b.v.length) return null;
    let d = 0; for (let i = 0; i < a.v.length; i++) d += a.v[i] * b.v[i];
    return d / (a.n * b.n);
  },
  // похожесть двух товаров/фото: нейросеть, если есть у обоих, иначе простой способ
  score(q, item){
    const m = this.cos(q.m, item.m);
    if (m != null) return m;
    const s = this.cos(q.s, item.s);
    return s == null ? -1 : (s - 0.35) * 0.7; // простой способ «менее уверен» — ставим ниже умного
  }
};
