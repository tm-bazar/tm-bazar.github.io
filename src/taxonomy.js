/* ===== РАЗДЕЛЫ, ПОЛЯ И ФИЛЬТРЫ ДЛЯ КАЖДОЙ КАТЕГОРИИ =====
   SUBS   — разделы категории (обязательно выбрать, если список есть)
   FIELDS — подробные поля: показываются продавцу, покупателю (характеристики) и в фильтрах.
   Типы полей: sel (один вариант), multi (несколько), num (число), text, year. */
const SUBS = {
  electronics: ["mobiles","laptops","computers","tablets","tv","players","consoles","smartwatches","headphones","speakers",
                "office","printers","cameras","phoneacc","cases","security","ups","surge","network","powerbanks","landline",
                "batteries","smartrings","chargers","phoneparts","components"],
  realty:      ["flat","house","land","commercial","garage"],
  home:        ["furniture","kitchenware","textile","carpets","decor","lighting","cleaning","garden","food","other"],
  auto:        ["cars","trucks","buses","imported","special","moto","water","parts","tires","caracc","oils"],
  shoes:       ["womenshoes","menshoes","kidsshoes","sportshoes"],
  personal:    ["womenclothes","menclothes","bags","gold","silver","watches","bijou","cosmetics","perfume","accessories"],
  appliances:  ["bigapp","kitchenapp","climate","smallapp","other"],
  jobs:        ["vacancy","resume"],
  rent:        ["rentcars","rentequip","renttools","rentevent","rentclothes","other"],
  kids:        ["toys","kidsclothes","strollers","babycare","school","kidsfurn"],
  build:       ["materials","tools","plumbing","electrics","doors","paint"],
  sport:       ["fitness","football","bicycles","sportwear","hunting","music","books","tourism","collect"],
  business:    ["readybiz","bizequip","production","agroequip","other"],
  services:    ["repair","construction","transport","beautysvc","education","cleaningsvc","events","itsvc","other"],
  buy:         ["buyelec","buyauto","buyrealty","buyother"],
  med:         ["medequip","rehab","optics","other"],
  animals:     ["livestock","birds","catsdogs","fish","petgoods"],
  free:        ["freethings","freefurn","freeclothes","freeanimals","other"]
};
// цена: в этих категориях можно не указывать («Договорная»), в «Отдам даром» — всегда бесплатно
const PRICE_OPTIONAL = {jobs:1, services:1, buy:1, rent:1, business:1};
const PRICE_FREE = {free:1};
const VEHICLE_SUBS = {cars:1, imported:1, trucks:1, buses:1, special:1};

/* ---- справочники ---- */
const POPULAR_CARS = ["Toyota", "Lexus", "Hyundai", "Kia", "Mercedes-Benz", "BMW", "Ford", "Mitsubishi", "Opel"];
const CAR_BRANDS = ["Toyota", "Lexus", "Hyundai", "Kia", "Mercedes-Benz", "BMW", "Ford", "Mitsubishi", "Opel", "Abarth", "AC", "Acura", "AITO", "Aiways", "Alfa Romeo", "Alpina", "Alpine", "AMC", "Arcfox", "Aro", "Asia", "Aston Martin", "Audi", "Aurus", "Avatr", "BAIC", "Baojun", "Barkas", "BAW", "Belgee", "Bentley", "Bestune", "Borgward", "Brilliance", "Bugatti", "Buick", "BYD", "Cadillac", "Changan", "Changfeng", "Changhe", "Chery", "Chevrolet", "Chrysler", "Ciimo", "Citroen", "Cupra", "Dacia", "Dadi", "Daewoo", "Daihatsu", "Datsun", "Dayun", "DeLorean", "Denza", "Derways", "Dodge", "Dongfeng", "Dorcen", "DW Hower", "Enovate", "EXEED", "FAW", "Ferrari", "Fiat", "Fisker", "Forthing", "Foton", "GAC", "Geely", "Genesis", "Geo", "GMC", "Great Wall Motor", "Hafei", "Haima", "Hanteng", "Haval", "Hawtai", "HiPhi", "Holden", "Honda", "Hongqi", "Hozon", "Huaihai", "Huanghai", "Huazi", "Hummer", "Hycan", "iCAR", "IM Motors", "Infiniti", "Iran Khodro", "Isuzu", "IVECO", "JAC", "Jaecoo", "Jaguar", "Jeep", "Jetour", "Jetta", "Jidu", "Jinbei", "JMC", "JMEV", "Jonway", "Kaiyi", "Karma", "Kawei", "KG Mobility", "Knewstar", "Kuayue", "Lamborghini", "Lancia", "Land Rover", "Landwind", "Leapmotor", "LEVC", "Lifan", "Lincoln", "Livan", "Lotus", "Lucid", "Luxeed", "Luxgen", "Lynk & Co", "M-Hero", "Mahindra", "Marussia", "Maserati", "Maxus", "Maybach", "Mazda", "McLaren", "Mercury", "MG", "MINI", "Mitsuoka", "Nio", "Nissan", "Oldsmobile", "OMODA", "ORA", "Oshan", "Oting", "Packard", "Pagani", "Perodua", "Peugeot", "Piaggio", "Plymouth", "Polar Stone", "Polestar", "Pontiac", "Porsche", "Qiantu", "Qingling", "Qoros", "Radar", "RAM", "Ravon", "Renault", "Renault Samsung", "Rimac", "Rising Auto", "Rivian", "Roewe", "Rolls-Royce", "Rover", "Rox", "Saab", "SAIPA", "Saturn", "Scion", "SEAT", "Seres", "Shuanghuan", "Skoda", "Skywell", "Smart", "Solaris", "Soueast", "SsangYong", "Stelato", "Subaru", "Suzuki", "SWM", "Tank", "TATA", "Tatra", "Tenet", "Tesla", "Tianma", "Tianye", "Tofas", "Trabant", "Venucia", "Verito", "VGV", "Volkswagen", "Volvo", "Vortex", "Voyah", "Wartburg", "Weltmeister", "WEY", "Wuling", "Xcite", "Xiaomi", "Xpeng", "Yema", "Zeekr", "Zotye", "ZX", "Амберавто", "Амбертрак", "Богдан", "ВАЗ (LADA)", "ГАЗ", "Донинвест", "ЗАЗ", "ЗИЛ", "ЗиС", "ИЖ", "ЛуАЗ", "Москвич", "Соллерс", "ТагАЗ", "УАЗ", "Эволют"];
const TRUCK_BRANDS = ["KAMAZ","MAN","Mercedes-Benz","Volvo","Scania","DAF","Iveco","Isuzu","Hyundai","GAZ","Howo","Shacman","FAW","Foton","Ford","Mitsubishi Fuso","Hino"];
const BUS_BRANDS = ["Mercedes-Benz","Ford","Toyota","Hyundai","GAZ","Yutong","Golden Dragon","Higer","King Long","Isuzu","Volkswagen","PAZ"];
const SPECIAL_BRANDS = ["Caterpillar","Komatsu","JCB","Hitachi","Hyundai","Volvo","XCMG","Liugong","Shantui","SDLG","Belarus (MTZ)","John Deere","Case","New Holland"];
const CAR_MODELS = {
  "Toyota":["Camry","Corolla","Land Cruiser","Land Cruiser Prado","RAV4","Highlander","Avalon","Sequoia","4Runner","Tundra","Tacoma","Sienna","Yaris","Prius","Hilux","Venza","C-HR","Fortuner","Hiace","Coaster"],
  "Lexus":["ES","GX","LX","RX","NX","IS","LS","GS","UX"],
  "Hyundai":["Elantra","Sonata","Accent","Santa Fe","Tucson","Creta","Palisade","Kona","Staria","Grandeur","i30"],
  "Kia":["Rio","K5","Optima","Sportage","Sorento","Cerato","Seltos","Carnival","K8","Telluride","Soul"],
  "Chevrolet":["Cobalt","Nexia","Gentra","Lacetti","Malibu","Captiva","Tahoe","Cruze","Spark","Damas","Equinox","Traverse","Onix","Tracker"],
  "Nissan":["Altima","Sentra","Maxima","Patrol","Pathfinder","X-Trail","Rogue","Armada","Murano","Juke","Navara"],
  "Mercedes-Benz":["C-Class","E-Class","S-Class","G-Class","GLE","GLS","GLC","ML","Sprinter","Vito"],
  "BMW":["3 Series","5 Series","7 Series","X3","X5","X6","X7"],
  "Honda":["Accord","Civic","CR-V","Pilot","Odyssey","HR-V"],
  "Mitsubishi":["Pajero","Outlander","Lancer","L200","ASX","Galant"],
  "Ford":["Focus","Fusion","Explorer","Escape","F-150","Transit","Mustang","Edge","Expedition"],
  "Volkswagen":["Passat","Jetta","Golf","Tiguan","Touareg","Polo","Teramont"],
  "ВАЗ (LADA)":["Granta","Vesta","Niva","Niva Travel","Priora","Kalina","2107","2106","Largus"],
  "Mazda":["Mazda3","Mazda6","CX-5","CX-9","CX-30"],
  "Audi":["A4","A6","A8","Q5","Q7","Q8"],
  "Opel":["Astra","Vectra","Corsa","Insignia","Zafira"],
  "Daewoo":["Nexia","Matiz","Lacetti","Gentra","Damas"],
  "Haval":["H6","Jolion","H9","Dargo"],
  "Chery":["Tiggo 4","Tiggo 7","Tiggo 8","Arrizo"],
  "Geely":["Coolray","Monjaro","Atlas","Emgrand","Tugella"],
  "Subaru":["Forester","Outback","Legacy","Impreza","XV"],
  "Land Rover":["Range Rover","Range Rover Sport","Defender","Discovery"],
  "Jeep":["Grand Cherokee","Wrangler","Cherokee","Compass"]
};
const PHONE_BRANDS = ["Apple","Samsung","Xiaomi","Redmi","POCO","Huawei","Honor","Realme","OPPO","Vivo","Tecno","Infinix","itel","Nokia","Google","OnePlus","Motorola","ZTE","Umidigi","Oukitel","Blackview","Sony","Nothing"];
const PHONE_MODELS = {
  "Apple":["iPhone 16 Pro Max","iPhone 16 Pro","iPhone 16","iPhone 15 Pro Max","iPhone 15 Pro","iPhone 15","iPhone 14 Pro Max","iPhone 14 Pro","iPhone 14","iPhone 13 Pro Max","iPhone 13","iPhone 12","iPhone 11","iPhone XR","iPhone SE","iPad","iPad Air","iPad Pro","Apple Watch"],
  "Samsung":["Galaxy S25 Ultra","Galaxy S24 Ultra","Galaxy S24","Galaxy S23","Galaxy Z Fold","Galaxy Z Flip","Galaxy A56","Galaxy A55","Galaxy A35","Galaxy A25","Galaxy A15","Galaxy A05","Galaxy M","Galaxy Tab"],
  "Xiaomi":["Xiaomi 15","Xiaomi 14","Xiaomi 14T","Xiaomi 13T","Pad 6"], "Redmi":["Redmi Note 14 Pro","Redmi Note 14","Redmi Note 13 Pro","Redmi Note 13","Redmi 14C","Redmi 13C","Redmi A3"],
  "POCO":["POCO X7","POCO X6","POCO F6","POCO M6","POCO C65"], "Huawei":["Pura 70","Mate 60","nova 12","nova 11","Y9"],
  "Honor":["Honor 200","Honor X9b","Honor X8b","Honor X7b","Honor 90","Magic 6"], "Realme":["Realme 12","Realme C67","Realme C55","Realme Note 50"],
  "Tecno":["Spark 20","Spark 30","Camon 30","Pova 6","Pop 8"], "Infinix":["Hot 40","Hot 50","Note 40","Smart 8"], "Vivo":["Y36","Y27","V30"], "OPPO":["A78","A58","Reno 11"]
};
const COLORS = ["black","white","silver","gray","gold","blue","red","green","purple","pink","other"];
const ASGABAT_PLACES = ["Parahat-1","Parahat-2","Parahat-3","Parahat-4","Parahat-5","Parahat-6","Parahat-7",
  "1-nji mkr","2-nji mkr","3-nji mkr","4-nji mkr","5-nji mkr","6-njy mkr","7-nji mkr","8-nji mkr","9-njy mkr","10-njy mkr","11-nji mkr","30-njy mkr",
  "Howdan A","Howdan B","Howdan W","Gurtly","Köşi","Bekrewe","Çoganly","Büzmeýin","Arçabil şaýoly","Bagtyýarlyk etraby","Berkararlyk etraby","Köpetdag etraby","Büzmeýin etraby"];

// районы и микрорайоны по велаятам (можно выбрать или написать свой вариант)
const DISTRICTS = {
  "Aşgabat": ["1-nji mkr","2-nji mkr","3-nji mkr","4-nji mkr","5-nji mkr","6-njy mkr","7-nji mkr","8-nji mkr","9-njy mkr","10-njy mkr","11-nji mkr","30-njy mkr",
    "Parahat-1","Parahat-2","Parahat-3","Parahat-4","Parahat-5","Parahat-6","Parahat-7","Howdan A","Howdan B","Howdan W","Gurtly","Köşi","Bekrewe","Çoganly",
    "Arçabil şaýoly","Täze jaýlar","Bagtyýarlyk etraby","Berkararlyk etraby","Büzmeýin etraby","Köpetdag etraby"],
  "Ahal": ["Arkadag şäheri","Änew","Tejen","Ak bugdaý etraby","Altyn asyr etraby","Babadaýhan etraby","Bäherden etraby","Gökdepe etraby","Kaka etraby","Sarahs etraby","Tejen etraby"],
  "Mary": ["Mary şäheri","Baýramaly","Serhetabat","Garagum etraby","Mary etraby","Murgap etraby","Oguzhan etraby","Sakarçäge etraby","Tagtabazar etraby","Türkmengala etraby","Wekilbazar etraby","Ýolöten etraby"],
  "Daşoguz": ["Daşoguz şäheri","Köneürgenç","Akdepe etraby","Boldumsaz etraby","Görogly etraby","Gubadag etraby","Ruhubelent etraby","Saparmyrat Türkmenbaşy etraby","Türkmenbaşy etraby"],
  "Türkmenabat": ["Türkmenabat şäheri","Kerki","Seýdi","Magdanly","Çärjew etraby","Darganata etraby","Dänew etraby","Farap etraby","Garabekewül etraby","Halaç etraby","Hojambaz etraby","Köýtendag etraby","Saýat etraby"],
  "Türkmenbaşy": ["Türkmenbaşy şäheri","Awaza","Balkanabat","Serdar","Bereket","Gumdag","Hazar","Esenguly etraby","Etrek etraby","Magtymguly etraby"]
};
const yr = () => new Date().getFullYear();
const range = (a, b) => Array.from({length: b - a + 1}, (_, i) => String(a + i));
const isRent = a => a.deal === "rent" || a.deal === "roomrent";

/* ---- поля по категориям ----
   k: ключ, type, opts: список или (sub,a)=>список, raw: варианты без перевода (марки, размеры),
   req: обязательно, when: показывать ли, filter: "main" (кнопки сверху) / "more" (в окне «Фильтры»),
   unit: единица, list: подсказки для текста, step: шаг числа */
const FIELDS = {
  shoes: [
    {k:"size", type:"multi", raw:true, filter:"main", opts:(s) => s === "kidsshoes" ? range(18, 36) : range(35, 47), unitKey:"sizeHint"},
    {k:"season", type:"sel", filter:"more", opts:["summer","demi","winter","allseason"]},
    {k:"brandt", type:"text", max:30},
    {k:"color", type:"sel", filter:"more", opts:["black","white","silver","gray","gold","blue","red","green","purple","pink","other"]}
  ],
  personal: [
    {k:"size", type:"multi", raw:true, filter:"main", opts:["XS","S","M","L","XL","XXL","3XL","4XL+"],
      when:(s) => s === "womenclothes" || s === "menclothes", unitKey:"sizeHint"},
    {k:"brandt", type:"text", max:30, when:(s) => s !== "gold" && s !== "silver"},
    {k:"color", type:"sel", filter:"more", opts:["black","white","silver","gray","gold","blue","red","green","purple","pink","other"], when:(s) => s !== "gold" && s !== "silver" && s !== "perfume" && s !== "cosmetics"},
    {k:"probe", type:"sel", raw:true, filter:"more", opts:(s) => s === "silver" ? ["875","925","999"] : ["375","500","585","750","875","999"], when:(s) => s === "gold" || s === "silver"},
    {k:"weight", type:"num", unit:"g", step:"0.01", when:(s) => s === "gold" || s === "silver"}
  ],
  kids: [
    {k:"size", type:"multi", raw:true, filter:"main", opts:["0-1","1-2","2-3","3-4","4-6","6-8","8-10","10-12","12-14","14+"], when:(s) => s === "kidsclothes"},
    {k:"age", type:"sel", raw:true, filter:"more", opts:["0-1","1-3","3-7","7-12","12+"], when:(s) => s === "toys" || s === "babycare"},
    {k:"gender", type:"sel", filter:"more", opts:["boy","girl","unisex"]}
  ],
  home: [
    {k:"material", type:"text", max:30, when:(s) => s === "furniture"},
    {k:"ctype", type:"sel", filter:"more", opts:["handmade","machine"], when:(s) => s === "carpets"},
    {k:"cmaterial", type:"sel", filter:"more", opts:["wool","silk","synthetic","cotton"], when:(s) => s === "carpets" || s === "textile"},
    {k:"csize", type:"text", max:20, when:(s) => s === "carpets"},
    {k:"unit", type:"sel", opts:["kg","pcs","l","box"], when:(s) => s === "food"}
  ],
  jobs: [
    {k:"jobfield", type:"text", max:40},
    {k:"schedule", type:"sel", filter:"main", opts:["full","part","shift","remote"]},
    {k:"experience", type:"sel", filter:"more", opts:["none","1-3","3+"]}
  ],
  rent: [
    {k:"period", type:"sel", filter:"more", opts:["hourly","daily","monthly"]}
  ],
  electronics: [
    {k:"brand", type:"sel", raw:true, req:true, filter:"main", opts:PHONE_BRANDS.concat(["other"]), when:(s) => s === "mobiles" || s === "tablets" || s === "smartwatches"},
    {k:"brandt", type:"text", max:30, when:(s) => !(s === "mobiles" || s === "tablets" || s === "smartwatches")},
    {k:"model", type:"text", max:40, filter:"more", list:(s, a) => PHONE_MODELS[a.brand] || [], when:(s) => s === "mobiles" || s === "tablets" || s === "smartwatches"},
    {k:"color", type:"sel", filter:"more", opts:COLORS, when:(s) => s === "mobiles" || s === "tablets" || s === "smartwatches" || s === "laptops" || s === "headphones"},
    {k:"memory", type:"sel", raw:true, filter:"more", unit:"GB", opts:["8","16","32","64","128","256","512","1024"], when:(s) => s === "mobiles" || s === "tablets"},
    {k:"ram", type:"sel", raw:true, filter:"more", unit:"GB", opts:["1","2","3","4","6","8","12","16","32","64"], when:(s) => s === "mobiles" || s === "tablets" || s === "laptops" || s === "computers"},
    {k:"screensz", type:"sel", raw:true, filter:"more", opts:(s) => s === "tv" ? ["24–32″","40–43″","50–55″","65″","75″+"] : s === "laptops" ? ["13–14″","15–16″","17″+"] : s === "tablets" ? ["7–8″","10–11″","12–13″"] : ["до 5.5″","5.5–6.1″","6.2–6.6″","6.7″+"],
      when:(s) => s === "mobiles" || s === "tablets" || s === "laptops" || s === "tv"},
    {k:"camera", type:"sel", opts:["yes","no"], when:(s) => s === "mobiles" || s === "tablets"},
    {k:"frontcam", type:"sel", opts:["yes","no"], when:(s) => s === "mobiles" || s === "tablets"},
    {k:"sim", type:"sel", raw:true, opts:["1 SIM","2 SIM","eSIM"], when:(s) => s === "mobiles"},
    {k:"nfc", type:"sel", opts:["yes","no"], when:(s) => s === "mobiles" || s === "smartwatches"},
    {k:"box", type:"multi", opts:["box","charger","docs","warranty"], when:(s) => s === "mobiles" || s === "tablets" || s === "laptops" || s === "smartwatches"}
  ],
  appliances: [{k:"brandt", type:"text", max:30}],
  auto: [
    {k:"brand", type:"sel", raw:true, req:true, filter:"main", when:(s) => !!VEHICLE_SUBS[s],
      opts:(s) => (s === "trucks" ? TRUCK_BRANDS : s === "buses" ? BUS_BRANDS : s === "special" ? SPECIAL_BRANDS : CAR_BRANDS).concat(["other"])},
    {k:"brand", type:"sel", raw:true, filter:"main", labelKey:"brandFor", opts:CAR_BRANDS.concat(["other"]), when:(s) => s === "parts" || s === "tires" || s === "caracc" || s === "oils"},
    {k:"tiresize", type:"text", max:20, when:(s) => s === "tires"},
    {k:"brandt", type:"text", max:30, when:(s) => s === "moto" || s === "water"},
    {k:"model", type:"text", max:40, filter:"more", list:(s, a) => CAR_MODELS[a.brand] || [], when:(s) => !!VEHICLE_SUBS[s] || s === "parts"},
    {k:"year", type:"year", filter:"range", when:(s) => !!VEHICLE_SUBS[s] || s === "moto" || s === "water"},
    {k:"km", type:"num", unit:"km", when:(s) => !!VEHICLE_SUBS[s] || s === "moto"},
    {k:"body", type:"sel", filter:"main", opts:["suv","sedan","crossover","hatchback","wagon","minivan","pickup","coupe","convertible"], when:(s) => s === "cars" || s === "imported"},
    {k:"engine", type:"num", unit:"l", step:"0.1", when:(s) => !!VEHICLE_SUBS[s] && s !== "special"},
    {k:"gear", type:"sel", filter:"more", opts:["auto","manual"], when:(s) => !!VEHICLE_SUBS[s]},
    {k:"fuel", type:"sel", filter:"more", opts:["petrol","gas","diesel","hybrid","electric"], when:(s) => !!VEHICLE_SUBS[s] || s === "moto"},
    {k:"drive", type:"sel", opts:["fwd","rwd","awd"], when:(s) => s === "cars"},
    {k:"color", type:"text", max:20, when:(s) => !!VEHICLE_SUBS[s] || s === "moto"},
    {k:"exchange", type:"sel", filter:"more", opts:["yes","no"], when:(s) => !!VEHICLE_SUBS[s] || s === "moto"}
  ],
  realty: [
    {k:"deal", type:"sel", req:true, filter:"main", opts:(s) => s === "flat" || s === "house" || s === "cottage" ? ["sale","rent","roomrent"] : ["sale","rent"]},
    {k:"flattype", type:"sel", filter:"more", opts:["newbuild","elite","secondary"], when:(s) => s === "flat"},
    {k:"comtype", type:"sel", filter:"more", opts:["office","shop","warehouse","cafe","production","other"], when:(s) => s === "commercial"},
    {k:"rooms", type:"sel", raw:true, filter:"main", opts:["1","2","3","4","5+"], when:(s) => s === "flat" || s === "house" || s === "cottage"},
    {k:"area", type:"num", unit:"m²", filter:"range", when:(s) => s !== "land"},
    {k:"landarea", type:"num", unit:"sot", when:(s) => s === "house" || s === "cottage" || s === "land"},
    {k:"floor", type:"num", when:(s) => s === "flat" || s === "commercial"},
    {k:"floors", type:"num", when:(s) => s === "flat" || s === "house" || s === "cottage" || s === "commercial"},
    {k:"repair", type:"sel", filter:"more", opts:["none","cosmetic","euro","designer"], when:(s) => s !== "land" && s !== "garage"},
    {k:"furniture", type:"sel", filter:"more", opts:["yes","partly","no"], when:(s) => s === "flat" || s === "house" || s === "cottage" || s === "commercial"},
    {k:"forwhom", type:"multi", filter:"more", opts:["family","students","workers","anyone"], when:(s, a) => isRent(a) && s !== "commercial" && s !== "garage" && s !== "land"},
    {k:"period", type:"sel", filter:"more", opts:["daily","monthly","long"], when:(s, a) => isRent(a)}
  ],
  animals: [
    {k:"atype", type:"sel", filter:"main", opts:["sheep","goat","cow","camel","horse","other"], when:(s) => s === "livestock"},
    {k:"count", type:"num"},
    {k:"agetxt", type:"text", max:20, when:(s) => s !== "petgoods"}
  ],
  sport: [{k:"blang", type:"sel", filter:"more", opts:["tm","ru","en","other"], when:(s) => s === "books"}]
};
function fieldsFor(cat, sub, a){ return (FIELDS[cat] || []).filter(f => !f.when || f.when(sub || "", a || {})); }
function optsOf(f, sub, a){ return typeof f.opts === "function" ? f.opts(sub || "", a || {}) : (f.opts || []); }
function optLabel(f, v){ return v === "other" ? t("o_other") : f.raw || f.type === "text" ? v : (t("o_"+f.k+"_"+v) || v); }
function fieldLabel(f){ return t(f.labelKey || ("f_"+f.k)); }
function attrText(f, v){
  if (v == null || v === "" || (Array.isArray(v) && !v.length)) return "";
  if (Array.isArray(v)) return v.map(x => optLabel(f, x)).join(", ");
  if (f.type === "sel") return optLabel(f, v) + (f.unit ? " " + f.unit : "");
  if (f.type === "num") return fmt(v) + (f.unit ? " " + f.unit : "");
  return String(v);
}
// цена: «/ месяц», «/ кг»
function priceSuffix(p){
  const a = p.attrs || {};
  if (p.cat === "realty" && isRent(a)) return a.period === "daily" ? t("perDay") : t("perMonth");
  if (p.cat === "home" && p.sub === "food" && a.unit) return "/ " + t("o_unit_" + a.unit);
  if (p.cat === "rent" && a.period) return t("per_" + a.period);
  return "";
}
// короткая строка в карточке
function cardLine(p){
  const a = p.attrs || {}, out = [];
  if (p.cat === "auto" && VEHICLE_SUBS[p.sub]){
    if (a.brand) out.push(brandName(a.brand) + (a.model ? " " + a.model : ""));
    if (a.year) out.push(a.year);
    if (a.km) out.push(fmt(a.km) + " km");
  } else if (p.cat === "realty"){
    if (a.deal) out.push(t("o_deal_" + a.deal));
    if (a.rooms) out.push(t("roomsShort",{n:a.rooms}));
    if (a.area) out.push(fmt(a.area) + " m²");
    if (a.floor) out.push(a.floors ? a.floor + "/" + a.floors + " " + t("floorShort") : a.floor + " " + t("floorShort"));
  } else if (p.cat === "electronics" && a.brand){
    if (a.brand) out.push(brandName(a.brand) + (a.model ? " " + a.model : ""));
    if (a.memory) out.push(a.memory + " GB");
  } else if (Array.isArray(a.size) && a.size.length){
    out.push(t("f_size") + ": " + a.size.slice(0, 6).join(", ") + (a.size.length > 6 ? "…" : ""));
  } else if (a.probe || a.weight){
    if (a.probe) out.push(a.probe); if (a.weight) out.push(fmt(a.weight) + " g");
  } else if (a.brand) out.push(brandName(a.brand));
  return out.join(" · ");
}
function subName(k){ return t("sub_"+k); }
function brandName(b){ return b === "other" ? t("o_other") : b; }
function carLine(p){ return cardLine(p); }

/* ---- переводы [ru, tm, en] ---- */
const SUBT = {
  womenclothes:["Женская одежда","Aýal eşikleri","Women's clothing"], menclothes:["Мужская одежда","Erkek eşikleri","Men's clothing"],
  womenshoes:["Женская обувь","Aýal aýakgaplary","Women's shoes"], menshoes:["Мужская обувь","Erkek aýakgaplary","Men's shoes"],
  sportshoes:["Спортивная обувь","Sport aýakgaplary","Sports shoes"],
  bags:["Сумки и рюкзаки","Sumkalar we rýukzaklar","Bags & backpacks"], accessories:["Аксессуары","Aksesuarlar","Accessories"],
  kidsshoes:["Детская обувь","Çaga aýakgaplary","Kids' shoes"], textile:["Текстиль и шторы","Dokma we perdeler","Textiles & curtains"],
  garden:["Сад и огород","Bag we bakja","Garden"], food:["Продукты питания","Azyk önümleri","Food"], furniture:["Мебель","Mebel","Furniture"],
  imported:["Привозимые авто (в дороге)","Getirilýän awtoulaglar (ýolda)","Imported cars (on the way)"], moto:["Мотоциклы и мопеды","Motosikl we mopedler","Motorbikes & mopeds"],
  water:["Водный транспорт","Suw ulaglary","Water transport"], vacancy:["Вакансии","Iş orunlary","Vacancies"], resume:["Резюме (ищу работу)","Rezýume (iş gözleýärin)","CVs (looking for work)"],
  rentcars:["Аренда авто","Awtoulag kärendesi","Car rental"], rentequip:["Аренда техники","Tehnika kärendesi","Equipment rental"], renttools:["Прокат инструментов","Gural kärendesi","Tool rental"],
  rentevent:["Для свадеб и праздников","Toý we baýramlar üçin","Weddings & events"], rentclothes:["Прокат одежды","Eşik kärendesi","Clothing rental"],
  paint:["Краски и отделка","Boýag we bezeg","Paint & finishing"], hunting:["Охота и рыбалка","Aw we balyk tutmak","Hunting & fishing"],
  music:["Музыкальные инструменты","Saz gurallary","Musical instruments"], tourism:["Туризм и отдых","Syýahat we dynç alyş","Travel & outdoors"],
  collect:["Коллекционирование","Kolleksiýa","Collecting"], readybiz:["Готовый бизнес","Taýýar biznes","Ready business"],
  bizequip:["Оборудование для бизнеса","Biznes üçin enjamlar","Business equipment"], production:["Производство","Önümçilik","Production"],
  agroequip:["Сельхозтехника","Oba hojalyk tehnikasy","Farm machinery"], construction:["Строительство и ремонт","Gurluşyk we abatlaýyş","Construction"],
  cleaningsvc:["Уборка","Arassaçylyk","Cleaning"], events:["Праздники и фото","Baýramlar we surat","Events & photo"], itsvc:["Компьютеры и IT","Kompýuter we IT","IT services"],
  buyelec:["Куплю электронику","Elektronika satyn alýaryn","Buying electronics"], buyauto:["Куплю транспорт","Ulag satyn alýaryn","Buying vehicles"],
  buyrealty:["Куплю недвижимость","Emläk satyn alýaryn","Buying property"], buyother:["Куплю другое","Başga zat satyn alýaryn","Buying other"],
  medequip:["Медицинское оборудование","Lukmançylyk enjamlary","Medical equipment"], rehab:["Реабилитация и уход","Bejeriş we ideg","Rehab & care"],
  optics:["Оптика","Optika","Optics"], fish:["Аквариум и рыбки","Akwarium we balyklar","Aquarium & fish"],
  freethings:["Вещи","Zatlar","Things"], freefurn:["Мебель","Mebel","Furniture"], freeclothes:["Одежда","Eşikler","Clothes"], freeanimals:["Животные","Haýwanlar","Animals"],
  women:["Женская","Aýal","Women"], men:["Мужская","Erkek","Men"], kids:["Детская","Çaga","Kids"],
  toys:["Игрушки","Oýunjaklar","Toys"], kidsclothes:["Детская одежда","Çaga eşikleri","Kids' clothes"],
  strollers:["Коляски и автокресла","Arabajyk we awtokreslo","Strollers & car seats"],
  babycare:["Уход за малышом","Bäbek idegi","Baby care"], school:["Для школы","Mekdep üçin","School"],
  smartphones:["Смартфоны","Smartfonlar","Smartphones"], tablets:["Планшеты","Planşetler","Tablets"],
  mobiles:["Мобильные телефоны","Mobil telefonlar","Mobile phones"], players:["Плееры","Pleýerler","Players"],
  headphones:["Наушники","Nauşnikler","Headphones"], speakers:["Аудиоколонки","Audio kolonkalar","Speakers"],
  office:["Оргтехника","Ofis tehnikasy","Office equipment"], printers:["Принтеры и расходники","Printerler we sarp ediş harytlary","Printers & supplies"],
  cases:["Чехлы","Gaplar","Cases"], security:["Системы безопасности","Howpsuzlyk ulgamlary","Security systems"],
  ups:["ИБП","UPS","UPS"], surge:["Сетевые фильтры","Tok filtrleri","Surge protectors"], network:["Сетевое оборудование","Tor enjamlary","Network equipment"],
  powerbanks:["Внешние аккумуляторы, пауэрбанки","Powerbanklar","Power banks"], landline:["Стационарные телефоны","Stasionar telefonlar","Landline phones"],
  batteries:["Батарейки и аккумуляторы","Batareýalar we akkumulýatorlar","Batteries"], smartrings:["Умные кольца","Akylly ýüzükler","Smart rings"],
  chargers:["Зарядные устройства","Zarýad berijiler","Chargers"], phoneparts:["Автозапчасти","Awtoşaýlar","Car parts"],
  components:["Детали электроники","Elektronika şaýlary","Electronic components"],
  buttonphones:["Кнопочные телефоны","Düwmeli telefonlar","Button phones"], smartwatches:["Смарт-часы","Akylly sagatlar","Smartwatches"],
  phoneacc:["Аксессуары для смартфонов","Smartfon aksesuarlary","Smartphone accessories"],
  laptops:["Ноутбуки","Noutbuklar","Laptops"], computers:["Компьютеры и мониторы","Kompýuterler we monitorlar","Computers & monitors"],
  tv:["Телевизоры","Telewizorlar","TVs"], audio:["Аудио и наушники","Audio we nauşnikler","Audio & headphones"],
  cameras:["Фото и видео","Foto we wideo","Cameras"], consoles:["Игровые приставки","Oýun pristawkalary","Game consoles"],
  elecacc:["Аксессуары и запчасти","Aksesuarlar we şaýlar","Accessories & parts"],
  bigapp:["Холодильники, стиральные машины","Sowadyjylar, kir ýuwujy maşynlar","Fridges & washers"],
  kitchenapp:["Техника для кухни","Aşhana tehnikasy","Kitchen appliances"], climate:["Кондиционеры и обогреватели","Kondisionerler we ýylytgyçlar","AC & heaters"],
  smallapp:["Пылесосы, утюги и др.","Tozan sorujy, ütük we ş.m.","Vacuums, irons, etc."],
  cars:["Легковые авто","Ýeňil awtoulaglar","Passenger cars"], trucks:["Грузовой транспорт","Ýük ulaglary","Trucks & cargo"],
  buses:["Автобусы","Awtobuslar","Buses"], special:["Спецавтотехника","Ýörite awtotehnika","Special vehicles"],
  parts:["Автозапчасти","Awtoşaýlar","Car parts"], tires:["Шины и диски (колёса)","Teker we diskler","Tyres & wheels"], oils:["Масла и автохимия","Ýag we awtohimiýa","Oils & car chemicals"],
  carelec:["Автоэлектроника","Awtoelektronika","Car electronics"], caracc:["Автотовары","Awtoharytlar","Car accessories"],
  motorcycles:["Мотоциклы","Motosikller","Motorcycles"], scooters:["Скутеры и мопеды","Skuter we moped","Scooters & mopeds"],
  bicycles:["Велосипеды","Welosipedler","Bicycles"], quads:["Квадроциклы","Kwadrosikller","Quad bikes"],
  flat:["Квартира","Kwartira","Flat"], house:["Дом и коттедж","Jaý we kottej","House & cottage"], cottage:["Коттеджи","Kottejler","Cottages"],
  land:["Земельный участок","Ýer bölegi","Land plot"], commercial:["Коммерческая недвижимость","Täjirçilik emlägi","Commercial property"],
  garage:["Гараж и подвал","Garaž we ýerzemin","Garage & basement"],
  kitchenware:["Посуда","Gap-gaç","Kitchenware"], decor:["Декор","Bezeg","Decor"], cleaning:["Хозтовары","Hojalyk harytlary","Household goods"],
  lighting:["Освещение","Yşyklandyryş","Lighting"],
  livingroom:["Гостиная","Myhman otagy","Living room"], bedroom:["Спальня","Ýatak otagy","Bedroom"], kitchenfurn:["Кухня","Aşhana","Kitchen"],
  office:["Офис","Ofis","Office"], kidsfurn:["Детская","Çaga otagy","Kids' room"],
  carpets:["Ковры","Halylar","Carpets"], fabrics:["Ткани","Matalar","Fabrics"], curtains:["Шторы","Perdeler","Curtains"], bedding:["Постельное бельё","Düşek-ýorgan","Bedding"],
  cosmetics:["Косметика","Kosmetika","Cosmetics"], perfume:["Парфюмерия","Atyrlar","Perfume"], haircare:["Уход за волосами","Saç ideg","Hair care"], skincare:["Уход за кожей","Deri ideg","Skin care"],
  gold:["Золото","Altyn","Gold"], silver:["Серебро","Kümüş","Silver"], watches:["Часы","Sagatlar","Watches"], bijou:["Бижутерия","Bižuteriýa","Costume jewellery"],
  materials:["Стройматериалы","Gurluşyk materiallary","Building materials"], tools:["Инструменты","Gurallar","Tools"],
  plumbing:["Сантехника","Santehnika","Plumbing"], electrics:["Электрика","Elektrika","Electrical"], doors:["Двери и окна","Gapy we penjire","Doors & windows"],
  plants:["Растения и семена","Ösümlik we tohum","Plants & seeds"], gardentools:["Садовый инвентарь","Bag gurallary","Garden tools"], fertilizers:["Удобрения","Dökünler","Fertilizers"],
  livestock:["Скот","Mal","Livestock"], birds:["Птицы","Guşlar","Birds"], catsdogs:["Кошки и собаки","Pişik we it","Cats & dogs"], petgoods:["Товары для животных","Haýwanlar üçin harytlar","Pet supplies"],
  fruitveg:["Фрукты и овощи","Miweler we gök önümler","Fruit & veg"], meatdairy:["Мясо и молочное","Et we süýt önümleri","Meat & dairy"], sweets:["Сладости и выпечка","Süýjülik we çörek","Sweets & bakery"],
  fitness:["Фитнес","Fitnes","Fitness"], football:["Футбол и мячи","Futbol we toplar","Football & balls"], sportwear:["Спортивная одежда","Sport eşikleri","Sportswear"],
  books:["Книги","Kitaplar","Books"], stationery:["Канцтовары","Kanselýariýa","Stationery"],
  repair:["Ремонт","Abatlaýyş","Repair"], transport:["Перевозки","Ýük daşamak","Transport"], beautysvc:["Красота","Gözellik","Beauty"], education:["Обучение","Okuw","Education"],
  other:["Другое","Başga","Other"]
};
const ATTRT = {
  // поля
  f_size:["Размеры в наличии","Bar ölçegler","Sizes available"], sizeHint:["можно выбрать несколько","birnäçesini saýlap bolýar","you can pick several"],
  f_brandt:["Бренд","Brend","Brand"], f_age:["Возраст","Ýaşy","Age"], f_gender:["Для кого","Kim üçin","For"],
  f_brand:["Марка","Marka","Make"], brandFor:["Для какой машины (марка)","Haýsy maşyn üçin (marka)","For which car (make)"],
  f_model:["Модель","Model","Model"], f_memory:["Память","Ýat","Storage"], f_ram:["Оперативная память","Operatiw ýat","RAM"],
  f_screen:["Экран, дюймов","Ekran, dýuým","Screen, inches"], f_screensz:["Диагональ экрана","Ekranyň diagonaly","Screen size"],
  f_camera:["Основная камера","Esasy kamera","Main camera"], f_frontcam:["Фронтальная камера","Öňki kamera","Front camera"],
  f_sim:["SIM-карты","SIM-kartlar","SIM"], f_nfc:["NFC","NFC","NFC"], f_box:["Комплект","Toplum","Included"],
  o_camera_yes:["Есть","Bar","Yes"], o_camera_no:["Нет","Ýok","No"], o_frontcam_yes:["Есть","Bar","Yes"], o_frontcam_no:["Нет","Ýok","No"],
  o_nfc_yes:["Есть","Bar","Yes"], o_nfc_no:["Нет","Ýok","No"],
  o_box_box:["Коробка","Gutusy","Box"], o_box_charger:["Зарядка","Zarýadka","Charger"], o_box_docs:["Документы","Resminamalar","Documents"], o_box_warranty:["Гарантия","Kepillik","Warranty"],
  o_color_black:["Чёрный","Gara","Black"], o_color_white:["Белый","Ak","White"], o_color_silver:["Серебристый","Kümüşsow","Silver"], o_color_gray:["Серый","Çal","Grey"],
  o_color_gold:["Золотой","Altynsow","Gold"], o_color_blue:["Синий","Gök","Blue"], o_color_red:["Красный","Gyzyl","Red"], o_color_green:["Зелёный","Ýaşyl","Green"],
  o_color_purple:["Фиолетовый","Melewşe","Purple"], o_color_pink:["Розовый","Gülgüne","Pink"], o_color_other:["Другой","Başga","Other"],
  f_year:["Год выпуска","Çykan ýyly","Year"], f_km:["Пробег","Geçen ýoly","Mileage"], f_body:["Кузов","Kuzow","Body"],
  f_engine:["Объём двигателя, л","Hereketlendirijiniň göwrümi, l","Engine, L"], f_gear:["Коробка передач","Tizlik gutusy","Gearbox"],
  f_fuel:["Топливо","Ýangyç","Fuel"], f_drive:["Привод","Sürüji","Drive"], f_color:["Цвет","Reňki","Colour"], f_exchange:["Обмен","Çalyşmak","Trade-in"],
  f_tiresize:["Размер шин","Tekeriň ölçegi","Tyre size"],
  f_deal:["Тип объявления","Bildirişiň görnüşi","Listing type"], f_flattype:["Тип дома","Jaýyň görnüşi","Building type"],
  f_comtype:["Назначение","Niýetlenilişi","Purpose"], f_rooms:["Комнат","Otag sany","Rooms"], f_area:["Площадь","Meýdany","Area"],
  f_landarea:["Участок, соток","Ýer, sotka","Plot, sotka"], f_floor:["Этаж","Gat","Floor"], f_floors:["Этажей в доме","Jaýyň gat sany","Floors in building"],
  f_repair:["Ремонт","Remont","Renovation"], f_furniture:["Мебель","Mebel","Furniture"], f_forwhom:["Для кого сдаётся","Kime kärendesine berilýär","Rent to"],
  f_period:["Срок аренды","Kärende möhleti","Rental period"], f_material:["Материал","Material","Material"], f_ctype:["Тип","Görnüşi","Type"],
  f_csize:["Размер","Ölçegi","Size"], f_probe:["Проба","Proba","Fineness"], f_weight:["Вес","Agramy","Weight"],
  f_atype:["Животное","Haýwan","Animal"], f_count:["Количество","Sany","Quantity"], f_agetxt:["Возраст","Ýaşy","Age"],
  f_unit:["Цена за","Bahasy","Price per"], f_season:["Сезон","Möwsüm","Season"],
  o_season_summer:["Лето","Tomus","Summer"], o_season_demi:["Весна / осень","Ýaz / güýz","Spring / autumn"], o_season_winter:["Зима","Gyş","Winter"], o_season_allseason:["Всесезонная","Ähli möwsüm","All-season"], f_cmaterial:["Материал","Material","Material"],
  f_jobfield:["Сфера / должность","Ugur / wezipe","Field / position"], f_schedule:["График","Iş tertibi","Schedule"], f_experience:["Опыт работы","Iş tejribesi","Experience"],
  o_schedule_full:["Полный день","Doly gün","Full-time"], o_schedule_part:["Неполный день","Doly däl gün","Part-time"], o_schedule_shift:["Сменный","Smenaly","Shifts"], o_schedule_remote:["Удалённо","Uzakdan","Remote"],
  o_experience_none:["Без опыта","Tejribesiz","No experience"], "o_experience_1-3":["1–3 года","1–3 ýyl","1–3 years"], "o_experience_3+":["Более 3 лет","3 ýyldan köp","3+ years"],
  o_period_hourly:["Почасово","Sagatlaýyn","Hourly"],
  o_cmaterial_wool:["Шерсть","Ýüň","Wool"], o_cmaterial_silk:["Шёлк","Ýüpek","Silk"], o_cmaterial_synthetic:["Синтетика","Sintetika","Synthetic"], o_cmaterial_cotton:["Хлопок","Pagta","Cotton"],
  per_hourly:["/ час","/ sagat","/ hour"], per_daily:["/ сутки","/ gün","/ day"], per_monthly:["/ мес","/ aý","/ month"],
  negotiable:["Договорная","Ylalaşyk","Negotiable"], freePrice:["Даром","Mugt","Free"], priceOpt:["Цена (можно не указывать — будет «Договорная»)","Baha (ýazmasaňyz «Ylalaşyk» bolar)","Price (leave empty for “Negotiable”)"], f_blang:["Язык","Dili","Language"],
  // мастер добавления
  w_step:["Шаг {i} из {n}","{n}-dan {i}-nji ädim","Step {i} of {n}"], w_continue:["Продолжить →","Dowam et →","Continue →"], w_skip:["Пропустить →","Geç →","Skip →"],
  w1:["Фото и название","Surat we ady","Photos & title"], w2:["Категория","Kategoriýa","Category"], w3:["Где находится","Nirede","Location"],
  w4:["Подробности","Jikme-jiklikler","Details"], w5:["Цена и контакт","Baha we habarlaşmak","Price & contact"],
  w_ai:["ИИ определит категорию по фото","Emeli aň suratdan kategoriýany kesgitlär","AI will detect the category from the photo"],
  w_pickSelf:["Выбрать категорию самостоятельно","Kategoriýany özüm saýlaýaryn","Choose the category myself"],
  w_aiFound:["ИИ определил: {c}","Emeli aň kesgitledi: {c}","AI detected: {c}"], w_change:["изменить","üýtget","change"],
  w_pickCat:["Выберите категорию","Kategoriýany saýlaň","Choose a category"], w_pickSub:["Выберите раздел","Bölümi saýlaň","Choose a section"],
  w_pickVel:["Выберите велаят","Welaýaty saýlaň","Choose a region"], w_pickDist:["Выберите район / микрорайон","Etraby / mikroraýony saýlaň","Choose a district"],
  w_otherDist:["Другое — написать самому","Başga — özüm ýazýaryn","Other — type it"], w_optional:["Всё на этой странице — по желанию","Bu sahypadaky hemme zat — islege görä","Everything here is optional"],
  w_contact:["Телефон для связи (из профиля)","Habarlaşmak üçin telefon (profilden)","Contact phone (from profile)"],
  w_changePhone:["Чтобы сменить номер, напишите администратору.","Belgini çalyşmak üçin administratora ýazyň.","To change it, contact the admin."],
  w_summary:["Ваше объявление","Siziň bildirişiňiz","Your listing"], titleCounter:["{n}/60","{n}/60","{n}/60"],
  // варианты
  o_other:["Другое","Başga","Other"],
  o_gender_boy:["Мальчик","Oglan","Boy"], o_gender_girl:["Девочка","Gyz","Girl"], o_gender_unisex:["Для всех","Hemmeler üçin","Unisex"],
  o_body_sedan:["Седан","Sedan","Sedan"], o_body_hatchback:["Хэтчбек","Hetçbek","Hatchback"], o_body_suv:["Внедорожник","Ýolsuzlyk","SUV"],
  o_body_crossover:["Кроссовер","Krossower","Crossover"], o_body_wagon:["Универсал","Uniwersal","Estate"], o_body_minivan:["Минивэн","Miniwen","Minivan"],
  o_body_pickup:["Пикап","Pikap","Pickup"], o_body_coupe:["Купе","Kupe","Coupe"], o_body_convertible:["Кабриолет","Kabriolet","Convertible"],
  o_gear_auto:["Автомат","Awtomat","Automatic"], o_gear_manual:["Механика","Mehanika","Manual"],
  o_fuel_petrol:["Бензин","Benzin","Petrol"], o_fuel_gas:["Газ","Gaz","Gas"], o_fuel_diesel:["Дизель","Dizel","Diesel"], o_fuel_hybrid:["Гибрид","Gibrid","Hybrid"], o_fuel_electric:["Электро","Elektrik","Electric"],
  o_drive_fwd:["Передний","Öň","FWD"], o_drive_rwd:["Задний","Yz","RWD"], o_drive_awd:["Полный","Doly","AWD/4WD"],
  o_exchange_yes:["Возможен","Bolýar","Possible"], o_f_exchange:["Обмен","Çalyşyk","Trade-in"], o_exchange_no:["Нет","Ýok","No"],
  dl_all:["Все объявления","Ähli bildirişler","All listings"],
  dl_ads:["объявл.","bildiriş","listings"], dl_none:["пока нет объявлений","häzirlikçe bildiriş ýok","no listings yet"],
  dl_flat_sale:["Продажа квартир","Kwartira satlyk","Flats for sale"], dl_flat_rent:["Аренда квартир","Kwartira kärendesi","Flats for rent"], dl_flat_roomrent:["Аренда комнат","Otag kärendesi","Rooms for rent"],
  dl_house_sale:["Продажа домов","Jaý satlyk","Houses for sale"], dl_house_rent:["Аренда домов","Jaý kärendesi","Houses for rent"], dl_house_roomrent:["Аренда комнат","Otag kärendesi","Rooms for rent"],
  dl_land_sale:["Продажа участков","Ýer bölegi satlyk","Land for sale"], dl_land_rent:["Аренда участков","Ýer bölegi kärendesi","Land for rent"],
  dl_commercial_sale:["Продажа коммерческой недвижимости","Täjirçilik emlägi satlyk","Commercial property for sale"], dl_commercial_rent:["Аренда коммерческой недвижимости","Täjirçilik emlägi kärendesi","Commercial property for rent"],
  dl_garage_sale:["Продажа гаражей и подвалов","Garaž we ýerzemin satlyk","Garages & basements for sale"], dl_garage_rent:["Аренда гаражей и подвалов","Garaž we ýerzemin kärendesi","Garages & basements for rent"],
  o_deal_sale:["Продажа","Satlyk","For sale"], o_deal_rent:["Аренда","Kärendesine","For rent"], o_deal_roomrent:["Аренда комнаты","Otag kärendesi","Room for rent"],
  o_flattype_newbuild:["Новостройка","Täze jaý","New building"], o_flattype_elite:["Элитка","Elitka","Premium building"], o_flattype_secondary:["Вторичное жильё","Köne jaý","Resale"],
  o_comtype_office:["Офис","Ofis","Office"], o_comtype_shop:["Магазин","Dükan","Shop"], o_comtype_warehouse:["Склад","Ammar","Warehouse"],
  o_comtype_cafe:["Кафе, ресторан","Kafe, restoran","Café, restaurant"], o_comtype_production:["Производство","Önümçilik","Production"], o_comtype_other:["Другое","Başga","Other"],
  o_repair_none:["Без ремонта","Remontsyz","None"], o_repair_cosmetic:["Косметический","Kosmetik","Cosmetic"], o_repair_euro:["Евроремонт","Ýewroremont","Euro-style"], o_repair_designer:["Дизайнерский","Dizaýnerlik","Designer"],
  o_furniture_yes:["С мебелью","Mebelli","Furnished"], o_furniture_partly:["Частично","Bölekleýin","Partly"], o_furniture_no:["Без мебели","Mebelsiz","Unfurnished"],
  o_forwhom_family:["Семье","Maşgala","Family"], o_forwhom_students:["Студентам","Talyplara","Students"], o_forwhom_workers:["Рабочим","Işçilere","Workers"], o_forwhom_anyone:["Всем","Hemmelere","Anyone"],
  o_period_daily:["Посуточно","Gündelik","Daily"], o_period_monthly:["Помесячно","Aýlyk","Monthly"], o_period_long:["Надолго","Uzak möhletli","Long-term"],
  o_ctype_handmade:["Ручная работа","El işi","Handmade"], o_ctype_machine:["Машинный","Maşyn işi","Machine-made"],
  o_material_wool:["Шерсть","Ýüň","Wool"], o_material_silk:["Шёлк","Ýüpek","Silk"], o_material_synthetic:["Синтетика","Sintetika","Synthetic"], o_material_cotton:["Хлопок","Pagta","Cotton"],
  o_atype_sheep:["Овцы","Goýun","Sheep"], o_atype_goat:["Козы","Geçi","Goats"], o_atype_cow:["Коровы","Sygyr","Cattle"], o_atype_camel:["Верблюды","Düýe","Camels"], o_atype_horse:["Лошади","At","Horses"], o_atype_other:["Другие","Başga","Other"],
  o_unit_kg:["кг","kg","kg"], o_unit_pcs:["шт","sany","pcs"], o_unit_l:["литр","litr","litre"], o_unit_box:["ящик","ýaşik","box"],
  o_blang_tm:["Туркменский","Türkmen","Turkmen"], o_blang_ru:["Русский","Rus","Russian"], o_blang_en:["Английский","Iňlis","English"], o_blang_other:["Другой","Başga","Other"],
  // интерфейс
  sub:["Раздел","Bölüm","Section"], pickBrand:["Выберите марку","Markany saýlaň","Choose a make"], pickOpt:["Выберите","Saýlaň","Choose"],
  pickMake:["Выберите марку","Markany saýlaň","Choose a make"], searchMake:["Поиск марки","Markany gözle","Search make"],
  popularMakes:["Популярные марки","Meşhur markalar","Popular makes"], allMakes:["Все марки А–Я","Ähli markalar A–Ý","All makes A–Z"],
  anyMake:["Все марки","Ähli markalar","All makes"],
  searchModel:["Поиск модели","Model gözle","Search model"], anyModel:["Все модели","Ähli modeller","All models"],
  popularModels:["Популярные модели","Meşhur modeller","Popular models"], allModels:["Все модели А–Я","Ähli modeller A–Ý","All models A–Z"], makeBtn:["Марка","Marka","Make"],
  modelPh:["Начните писать или выберите","Ýazyp başlaň ýa-da saýlaň","Start typing or pick"],
  allSubs:["Все","Ählisi","All"], specs:["Характеристики","Häsiýetnamasy","Specifications"], details:["Подробности","Jikme-jiklikler","Details"],
  e_noSub:["Выберите раздел: {s}","Bölümi saýlaň: {s}","Choose a section: {s}"], e_req:["Заполните: {f}","Dolduryň: {f}","Please fill in: {f}"],
  e_sub:["Выберите раздел категории.","Kategoriýanyň bölümini saýlaň.","Choose a section of the category."],
  e_brand:["Выберите марку машины.","Maşynyň markasyny saýlaň.","Choose the car make."], e_deal:["Выберите тип объявления.","Bildirişiň görnüşini saýlaň.","Choose the listing type."],
  catFirst:["Что вы продаёте?","Näme satýarsyňyz?","What are you selling?"], swipeCats:["листайте вправо →","saga sürüň →","swipe →"],
  filters:["Фильтры","Süzgüçler","Filters"], reset:["Сбросить","Arassala","Reset"], showN:["Показать {n}","{n} görkez","Show {n}"],
  exitQ:["Выйти из приложения?","Programmadan çykmalymy?","Exit the app?"], exitSub:["Чтобы выйти, можно ещё раз нажать «Назад».","Çykmak üçin ýene bir gezek «Yza» basyň.","You can also press Back once more to exit."],
  exitHint:["Чтобы выйти, нажмите «Назад» два раза быстро","Çykmak üçin «Yza» düwmesine iki gezek çalt basyň","To exit, press Back twice quickly"],
  version:["версия","wersiýa","version"],
  exitNext:["Главное меню. Ещё раз «Назад» — выход","Baş sahypa. Ýene «Yza» — çykyş","Home. Press Back again to exit"],
  exitYes:["Выйти","Çyk","Exit"], exitNo:["Остаться","Galmak","Stay"], qPrice:["Цена","Baha","Price"], qYear:["Год","Ýyl","Year"], show:["Показать","Görkez","Show"],
  vView:["Вид","Görnüşi","View"], vGrid:["Плитка","Tor","Grid"], vBig:["Крупно","Uly","Large"], vList:["Список","Sanaw","List"],
  fPrice:["Цена, TMT","Bahasy, TMT","Price, TMT"], fYear:["Год выпуска","Çykan ýyly","Year"], fRegion:["Велаят","Welaýat","Region"],
  any:["Любой","Islendik","Any"], from:["от","-dan","from"],
  priceFrom:["Цена от","Baha -dan","Price from"], to:["до","-a çenli","to"], yearFrom:["Год от","Ýyl -dan","Year from"], areaFrom:["Площадь от, м²","Meýdany -dan, m²","Area from, m²"],
  perMonth:["/ мес","/ aý","/ month"], perDay:["/ сутки","/ gün","/ day"], roomsShort:["{n}-комн.","{n} otagly","{n}-room"], floorShort:["эт.","gat","fl."],
  placeRealty:["Микрорайон / адрес","Mikroraýon / salgy","Microdistrict / address"], placeRealtyPh:["Например: Parahat-7, 30-njy mkr","Mysal: Parahat-7, 30-njy mkr","e.g. Parahat-7"]
};
// названия верхних категорий [ru, tm, en]
const CATN = {
  shoes:["Обувь","Aýakgaplar","Shoes"], electronics:["Электроника","Elektronika","Electronics"], realty:["Недвижимость","Gozgalmaýan emläk","Real estate"],
  home:["Для дома и двора","Öý we howly üçin","Home & garden"], auto:["Транспорт","Ulaglar","Transport"],
  personal:["Личные вещи","Şahsy zatlar","Personal items"], appliances:["Бытовая техника","Öý tehnikasy","Appliances"],
  jobs:["Работа","Iş","Jobs"], rent:["Прокат и аренда","Kärende","Rentals"], kids:["Детский мир","Çagalar dünýäsi","Kids' world"],
  build:["Ремонт и строительство","Abatlaýyş we gurluşyk","Repair & construction"], sport:["Спорт и хобби","Sport we höwes","Sport & hobbies"],
  business:["Бизнес и оборудование","Biznes we enjamlar","Business & equipment"], services:["Услуги","Hyzmatlar","Services"],
  buy:["Куплю","Satyn alaryn","Wanted (I'll buy)"], med:["Медтовары","Lukmançylyk harytlary","Medical goods"],
  animals:["Животные","Haýwanlar","Animals"], free:["Отдам даром","Mugt berýärin","Free (giveaway)"]
};
(function(){
  const L = ["ru","tm","en"];
  for (const k in SUBT) L.forEach((l, i) => T[l]["sub_"+k] = SUBT[k][i]);
  for (const k in ATTRT) L.forEach((l, i) => T[l][k] = ATTRT[k][i]);
  for (const k in CATN) L.forEach((l, i) => T[l]["cat_"+k] = CATN[k][i]);
})();
