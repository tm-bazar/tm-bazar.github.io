/* ===== АДМИНКА (адрес: сайт/#/admin) ===== */

// переписка с продавцом о пополнении + начислить монеты в один клик
async function adminThreadSheet(uid, onChange){
  let changed = false;
  await sheet((box, close) => {
    const body = h("div",null, h("div",{class:"empty"}, h("div",{class:"spin"})));
    box.append(body);
    const load = async () => {
      const r = await call("adminSupportThread", {user: uid});
      if (!r.ok){ body.replaceChildren(h("div",{class:"err",text:r.error === "server" ? "Обновите Vip.gs на сервере (версия 45)." : errText(r)})); return; }
      const lastAsk = [...r.messages].reverse().find(m => m.from === "user" && m.amount);
      const amt = h("input",{class:"inp",inputmode:"numeric",placeholder:"Сколько монет",value:lastAsk ? String(lastAsk.amount) : ""});
      const txt = h("input",{class:"inp",placeholder:"Ответ (необязательно)",style:{marginTop:"8px"}});
      const go_ = async sign => {
        const v = Math.round(parseFloat(String(amt.value).replace(",", ".")) || 0);
        if (sign && !(v > 0)) return toast("Введите сумму");
        if (!sign && !txt.value.trim()) return toast("Напишите ответ");
        const b = busy(); const x = await call("adminSupportSend", {user: uid, amount: sign * v, text: txt.value.trim()}); b.done();
        if (!x.ok) return toast(errText(x));
        changed = true; toast(sign > 0 ? "Начислено "+v+" монет" : sign < 0 ? "Списано" : "Отправлено"); load();
      };
      const credit = h("button",{class:"btn block green",onclick:()=>go_(1)});
      const updBtn = () => { const v = parseInt(amt.value, 10) || 0; credit.textContent = v > 0 ? "✅ Начислить " + v + " монет" : "✅ Начислить"; };
      amt.oninput = updBtn; updBtn();
      body.replaceChildren(
        h("h2",{text:"🪙 "+r.user.name}),
        h("p",{class:"hint",style:{margin:"0 0 8px"}}, h("a",{class:"link",href:"tel:+993"+r.user.phone,text:phoneFmt(r.user.phone)}),
          " · баланс: ", h("b",{text:coins(r.balance)}), " · 1 монета = 1 манат"),
        h("div",{class:"msgs sup-msgs adm"}, ...(r.messages.length ? supBubbles(r.messages, "admin") : [h("p",{class:"hint",text:"Сообщений пока нет."})])),
        h("div",{class:"quick sup-chips"}, ...[10,30,55,100,200].map(n => h("button",{type:"button",text:"+"+n,onclick:()=>{ amt.value = String(n); updBtn(); }}))),
        amt, txt, h("div",{style:{height:"10px"}}),
        h("div",{style:{display:"grid",gap:"8px"}}, credit,
          h("button",{class:"btn block ghost",text:"Только ответить",onclick:()=>go_(0)}),
          h("button",{class:"btn block ghost",style:{color:"#c62828"},text:"− Списать эту сумму",onclick:()=>go_(-1)}),
          h("a",{class:"btn block ghost",href:"#/u/"+uid,onclick:()=>close()}, "🏪 Магазин продавца")));
      const m = body.querySelector(".sup-msgs"); if (m) m.scrollTop = m.scrollHeight;
    };
    load();
  });
  if (changed && onChange) onChange();
}
async function viewAdmin(){
  setTab("", false);
  document.body.classList.remove("no-tab");
  const root = h("div",{class:"adm"});
  page(h("div",{class:"bar"},
    h("button",{class:"icon-btn","aria-label":t("back"),html:IC.back,onclick:()=>go("/")}),
    h("h1",{text:"Админка · "+APP_NAME}),
    S.adminToken ? h("button",{class:"btn sm ghost",text:"Выйти",onclick:()=>{ S.adminToken = null; viewAdmin(); }}) : null), root);

  if (!S.adminToken){
    const pw = h("input",{class:"inp",type:"password",placeholder:"Пароль",autocomplete:"current-password"});
    const err = h("div",{class:"err"});
    const btn = h("button",{class:"btn block",text:"Войти"});
    btn.onclick = async () => {
      btn.disabled = true;
      const r = await call("adminLogin", {password: pw.value});
      btn.disabled = false;
      if (!r.ok) return err.textContent = r.error === "locked" ? "Слишком много попыток. Подождите 30 минут." : r.error === "wrong" ? "Неверный пароль." : errText(r);
      S.adminToken = r.token; viewAdmin();
    };
    pw.addEventListener("keydown", e => { if (e.key === "Enter") btn.click(); });
    root.append(h("div",{class:"box",style:{maxWidth:"380px",margin:"30px auto"}},
      h("h3",{text:"Вход для администратора"}), pw, err, btn,
      isDemo ? h("p",{class:"hint",text:"Демо-режим: пароль admin"}) : null));
    return;
  }

  root.append(h("div",{class:"empty"}, h("div",{class:"spin"})));
  await loadCatalog(true);
  const [r, sup] = await Promise.all([call("adminData"), call("adminSupport")]);
  const threads = sup && sup.ok ? sup.threads : null;
  if (!r.ok){ S.adminToken = null; if (r.error === "auth") return viewAdmin(); root.replaceChildren(h("div",{class:"err",text:errText(r)})); return; }
  const users = r.users, prods = r.products, reports = r.reports, reviews = r.reviews || [];
  const pending = users.filter(u => u.seller === "pending");
  const newRep = reports.filter(x => x.status !== "done");
  const tabs = [["pending","Ждут одобрения ("+pending.length+")"],["users","Пользователи ("+users.length+")"],
    ["prods","Товары ("+prods.length+")"],["vip","⭐ VIP ("+prods.filter(isVip).length+")"],["topup","💬 Сообщения и пополнения"+(threads ? " ("+threads.filter(x => x.unread).length+")" : "")],["reports","Жалобы ("+newRep.length+")"],["reviews","Отзывы ("+reviews.length+")"],["malls","🏬 ТЦ и рынки"+((r.mallSug||[]).length ? " ("+r.mallSug.length+")" : "")],["tiles","Картинки"]];
  let tab = S.admTab || (threads && threads.some(x => x.unread) ? "topup" : pending.length ? "pending" : newRep.length ? "reports" : "prods");
  let q = "";
  const body = h("div");
  const search = h("input",{class:"inp",type:"search",placeholder:"Поиск: имя, телефон, товар, ID",style:{marginBottom:"10px"}});
  search.oninput = () => { q = search.value.trim().toLowerCase(); draw(); };
  const tabBar = h("div",{class:"tabs"});
  const drawTabs = () => tabBar.replaceChildren(...tabs.map(([k,l]) => h("button",{class:"chip"+(tab===k?" on":""),text:l,onclick:()=>{ tab = k; S.admTab = k; drawTabs(); draw(); }})));
  const ubyId = Object.fromEntries(users.map(u => [u.id, u]));
  const pbyId = Object.fromEntries(prods.map(p => [p.id, p]));
  const match = s => !q || s.toLowerCase().includes(q);

  const sellerChip = s => s === "active" ? h("span",{class:"st ok",text:"Продавец ✓"}) : s === "pending" ? h("span",{class:"st wait",text:"Ждёт проверки"}) :
    s === "blocked" ? h("span",{class:"st bad",text:"Продажа запрещена"}) : h("span",{class:"st off",text:"Покупатель"});
  async function act(action, data, okText){
    const r = await call(action, data);
    if (!r.ok) return toast(errText(r));
    toast(okText || "Готово"); S.catalogAt = 0; viewAdmin();
  }
  function userRow(u){
    return h("div",{class:"row"},
      avaEl(u.name, u.logo),
      h("div",{class:"in"},
        h("div",{class:"t",text:u.name+"  ·  "+u.id}),
        h("div",{class:"s"}, h("a",{class:"link",href:"tel:+993"+u.phone,text:phoneFmt(u.phone)}), "· "+u.city, "· товаров: "+u.count, stypeBadge(u.stype), sellerChip(u.seller),
          u.status === "blocked" ? h("span",{class:"st bad",text:"Аккаунт заблокирован"}) : null,
          u.balance != null ? h("span",{class:"vip-pill",text:"🪙 "+coins(u.balance)}) : null,
          u.shopVip ? h("span",{class:"vip-pill",text:"⭐ VIP-магазин до "+new Date(u.shopVip).toLocaleDateString("ru-RU")}) : null),
        h("div",{class:"kv",text:"С "+new Date(u.at).toLocaleDateString("ru-RU")})),
      h("div",{class:"acts"},
        u.balance != null ? h("button",{class:"btn sm ghost",style:{color:"#8a6200"},text:"🪙 Баланс",onclick:()=>balanceSheet(u)}) : null,
        u.balance != null && u.count ? h("button",{class:"btn sm ghost",style:{color:"#8a6200"},text:u.shopVip ? "⭐ VIP-магазин: изменить" : "⭐ VIP-магазин",onclick:async()=>{
          const days = await sheet((box, close) => box.append(h("h2",{text:"VIP-магазин: "+u.name}),
            h("p",{text:"Бесплатно, без списания с баланса. Все объявления магазина станут VIP."}),
            h("div",{style:{display:"grid",gap:"10px"}}, ...[7,15,30].map(n => h("button",{class:"btn block",text:"+ "+n+" дней",onclick:()=>close(n)})),
              u.shopVip ? h("button",{class:"btn block ghost",style:{color:"#c62828"},text:"Убрать VIP",onclick:()=>close(-1)}) : null)));
          if (days) act("adminVipShop",{user:u.id,days:days > 0 ? days : 0}, days > 0 ? "VIP-магазин на "+days+" дн." : "VIP убран");
        }}) : null,
        u.seller !== "active" && u.count ? h("button",{class:"btn sm green",text:"Одобрить",onclick:()=>act("adminUser",{id:u.id,seller:"active"},"Продавец одобрен")}) : null,
        u.count ? h("a",{class:"btn sm ghost",href:"#/u/"+u.id,text:"Товары"}) : null,
        u.seller === "active" || u.seller === "pending" ? h("button",{class:"btn sm ghost",text:"Запретить продажу",onclick:()=>act("adminUser",{id:u.id,seller:"blocked"})}) : null,
        u.status !== "blocked" ? h("button",{class:"btn sm ghost",style:{color:"#c62828"},text:"Заблокировать",onclick:()=>act("adminUser",{id:u.id,status:"blocked"})}) :
          h("button",{class:"btn sm ghost",text:"Разблокировать",onclick:()=>act("adminUser",{id:u.id,status:"active"})}),
        h("button",{class:"btn sm ghost",text:"Новый PIN",onclick:async()=>{
          const pin = await sheet((box, close) => {
            const i = h("input",{class:"inp pin",inputmode:"numeric",maxlength:"4",placeholder:"••••"});
            box.append(h("h2",{text:"Новый PIN для "+u.name}), h("p",{text:"Скажите клиенту новый PIN по телефону."}), i, h("div",{style:{height:"12px"}}),
              h("button",{class:"btn block",text:"Сохранить",onclick:()=>{ if (/^\d{4}$/.test(i.value)) close(i.value); else toast("4 цифры"); }}));
          });
          if (pin) act("adminUser",{id:u.id,pin},"PIN изменён");
        }})));
  }
  // пополнить (+) или списать (−) баланс
  async function balanceSheet(u){
    const res = await sheet((box, close) => {
      const sum = h("input",{class:"inp",inputmode:"decimal",placeholder:"Сколько монет"});
      const note = h("input",{class:"inp",placeholder:"Комментарий (необязательно)",style:{marginTop:"8px"}});
      const go_ = sign => { const v = parseFloat(String(sum.value).replace(",", ".")); if (!(v > 0)) return toast("Введите сумму"); close({amount: sign * v, note: note.value}); };
      box.append(h("h2",{text:"🪙 Баланс: "+u.name}),
        h("p",{text:"Сейчас: "+coins(u.balance)+" · "+phoneFmt(u.phone)+" · 1 монета = 1 манат"}), sum, note, h("div",{style:{height:"12px"}}),
        h("div",{style:{display:"grid",gap:"10px"}},
          h("button",{class:"btn block green",text:"＋ Пополнить",onclick:()=>go_(1)}),
          h("button",{class:"btn block ghost",style:{color:"#c62828"},text:"− Списать",onclick:()=>go_(-1)})),
        h("p",{class:"hint",text:"Все операции записываются на лист «Баланс» в Google Таблице."}));
    });
    if (res) act("adminBalance", {id:u.id, amount:res.amount, note:res.note}, res.amount > 0 ? "Баланс пополнен" : "Списано");
  }
  // цены VIP, по которым продавцы покупают VIP со своего баланса
  function pricesBox(){
    const pr = r.vipPrices || {}, sh = pr.shop || {};
    const inp = v => h("input",{class:"inp",inputmode:"decimal",value:+v ? String(v) : "",placeholder:"0"});
    const ins = {7: inp(sh[7]), 15: inp(sh[15]), 30: inp(sh[30])}, item = inp(pr.item);
    return h("div",{class:"box",style:{marginBottom:"10px"}},
      h("h3",{text:"💰 Цены VIP (в монетах, 1 монета = 1 манат)"}),
      h("p",{class:"hint",style:{margin:"0 0 8px"},text:"VIP-магазин — все объявления продавца жёлтые и выше всех. Продавец платит со своего баланса. 0 — этот вариант не продаётся."}),
      h("div",{style:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px"}},
        ...[7,15,30].map(d => h("label",{style:{fontSize:"13px",fontWeight:"600"}}, "Магазин "+d+" дн", ins[d]))),
      h("label",{style:{fontSize:"13px",fontWeight:"600",display:"block",marginTop:"8px"}}, "Одно объявление ("+(pr.itemDays||7)+" дн)", item),
      h("button",{class:"btn block",style:{marginTop:"10px"},text:"Сохранить цены",onclick:()=>act("adminPrices",{prices:{shop:{7:ins[7].value,15:ins[15].value,30:ins[30].value}, item:item.value}},"Цены сохранены")}));
  }
  function prodRow(p){
    const u = ubyId[p.user] || {};
    const st = {active:["ok","В продаже"],sold:["off","Нет в наличии"],hidden:["off","Скрыт"],banned:["bad","Снят админом"]}[p.status] || ["off",p.status];
    return h("div",{class:"row"},
      p.thumb ? h("img",{src:p.thumb,alt:""}) : h("div",{class:"noimg"}),
      h("div",{class:"in"},
        h("a",{class:"t link",href:"#/p/"+p.id,text:p.title+"  ·  "+p.id}),
        h("div",{class:"s"}, priceEl(p.price), "· "+catName(p.cat)+" · "+p.city, h("span",{class:"st "+st[0],text:st[1]})),
        h("div",{class:"kv"}, "Продавец: "+(u.name||"?")+" ", sellerChip(u.seller),
          isVip(p) ? h("span",{class:"vip-pill",text:"⭐ VIP до "+new Date(p.vip).toLocaleDateString("ru-RU")}) : null,
          p.exp ? h("span",{style:{color:"var(--mut)"},text:" · удалится "+new Date(p.exp).toLocaleDateString("ru-RU")}) : null)),
      h("div",{class:"acts"},
        r.expDays ? h("button",{class:"btn sm ghost",style:{color:"#8a6200"},text:isVip(p) ? "⭐ VIP: изменить" : "⭐ Сделать VIP",onclick:async()=>{
          const days = await sheet((box, close) => box.append(h("h2",{text:"VIP: "+p.title}),
            h("p",{text:"VIP-объявление выделяется жёлтым, стоит выше других, а магазин попадает в «VIP-магазины» на главной."}),
            h("div",{style:{display:"grid",gap:"10px"}},
              ...[7,15,30].map(n => h("button",{class:"btn block",text:"VIP на "+n+" дней",onclick:()=>close(n)})),
              isVip(p) ? h("button",{class:"btn block ghost",style:{color:"#c62828"},text:"Убрать VIP",onclick:()=>close(-1)}) : null)));
          if (days) act("adminVip",{id:p.id,days:days > 0 ? days : 0}, days > 0 ? "VIP включён на "+days+" дн." : "VIP убран");
        }}) : null,
        p.status === "banned" ? h("button",{class:"btn sm ghost",text:"Вернуть",onclick:()=>act("adminProduct",{id:p.id,status:"active"})}) :
          h("button",{class:"btn sm ghost",text:"Снять",onclick:()=>act("adminProduct",{id:p.id,status:"banned"},"Товар снят")}),
        h("button",{class:"btn sm ghost",style:{color:"#c62828"},text:"Удалить",onclick:async()=>{
          const yes = await sheet((box, close) => box.append(h("h2",{text:"Удалить навсегда?"}), h("p",{text:p.title}),
            h("button",{class:"btn block",style:{background:"#c62828"},text:"Удалить",onclick:()=>close(true)})));
          if (yes) act("adminProduct",{id:p.id,remove:true},"Удалено");
        }})));
  }
  // фото для плиток: категории, разделы, марки машин
  function tileRows(){
    const items = [];
    CATS.forEach(c => {
      items.push(["cat:"+c.id, "📁 "+catName(c.id), c.id]);
      (SUBS[c.id] || []).forEach(k => items.push(["sub:"+c.id+":"+k, "   └ "+catName(c.id)+" → "+subName(k), c.id]));
    });
    [...new Set([].concat(CAR_BRANDS, TRUCK_BRANDS, BUS_BRANDS, SPECIAL_BRANDS))].forEach(b => items.push(["brand:"+b, "🚗 "+b, "auto"]));
    const bulkIn = h("input",{type:"file",accept:"image/*",multiple:true,hidden:true});
    const norm = x => String(x).toLowerCase().replace(/\.[a-z0-9]+$/,"").replace(/[^a-zа-яё0-9]/g,"");
    bulkIn.onchange = async () => {
      const files = [...bulkIn.files]; bulkIn.value = ""; if (!files.length) return;
      const brands = [...new Set([].concat(CAR_BRANDS, TRUCK_BRANDS, BUS_BRANDS, SPECIAL_BRANDS, PHONE_BRANDS))];
      const map = Object.fromEntries(brands.map(b => [norm(b), b])); map[norm("Lada")] = "ВАЗ (LADA)"; map[norm("VAZ")] = "ВАЗ (LADA)"; Object.assign(map, {gaz:"ГАЗ", uaz:"УАЗ", zaz:"ЗАЗ", zil:"ЗИЛ", zis:"ЗиС", moskvich:"Москвич", izh:"ИЖ", luaz:"ЛуАЗ", tagaz:"ТагАЗ",
        bogdan:"Богдан", sollers:"Соллерс", evolute:"Эволют", doninvest:"Донинвест", greatwall:"Great Wall Motor", ssangyong:"SsangYong",
        kgmobility:"KG Mobility", lynkco:"Lynk & Co", mercedes:"Mercedes-Benz", citroën:"Citroen", rollsroyce:"Rolls-Royce", alfaromeo:"Alfa Romeo"});
      const b = busy("Загружаем эмблемы…"); let ok = 0; const miss = [];
      for (let i = 0; i < files.length; i++){
        const brand = map[norm(files[i].name)];
        b.set("Загружаем эмблемы… " + (i+1) + " / " + files.length, i / files.length);
        if (!brand){ miss.push(files[i].name); continue; }
        try{ const c = await compress(files[i], 300); const r = await call("adminTile", {key:"brand:"+brand, data:c.b64, mime:"image/jpeg"});
          if (r.ok){ S.tiles["brand:"+brand] = r.thumb; ok++; } else miss.push(files[i].name); }catch(e){ miss.push(files[i].name); }
      }
      b.done(); S.catalogAt = 0; draw();
      toast("Загружено: " + ok + (miss.length ? ". Не узнал: " + miss.slice(0,5).join(", ") + (miss.length > 5 ? "…" : "") : ""));
    };
    const bulk = h("div",{class:"box",style:{margin:"0 0 12px"}},
      h("b",{text:"Эмблемы марок пачкой"}),
      h("p",{class:"hint",text:"Выберите сразу много картинок. Назовите каждый файл как марку: Toyota.png, Mercedes-Benz.png, Lada.png… — приложение само поставит каждую эмблему к своей марке. Лучше квадратные картинки на белом или прозрачном фоне."}),
      h("button",{class:"btn sm",text:"Выбрать эмблемы",onclick:()=>bulkIn.click()}), bulkIn);
    const head = h("p",{class:"hint",style:{margin:"0 0 10px"},text:"Поставьте настоящее фото для категории, раздела или марки. Если фото не поставлено, на сайте показывается фото самого нового товара. Берите свои фото или бесплатные (Unsplash, Pexels)."});
    return [bulk, head].concat(items.filter(([k, l]) => match(k+l)).map(([key, label, cid]) => {
      const own = S.tiles && S.tiles[key];
      const inp = h("input",{type:"file",accept:"image/*",hidden:true});
      inp.onchange = async () => {
        const f = inp.files[0]; inp.value = ""; if (!f) return;
        const b = busy("Загружаем…");
        try{ const c = await compress(f, 600); const r = await call("adminTile", {key, data: c.b64, mime: "image/jpeg"});
          b.done(); if (!r.ok) return toast(errText(r)); S.tiles[key] = r.thumb; S.catalogAt = 0; toast("Фото поставлено"); draw(); }
        catch(e){ b.done(); toast(t("e_photo")); }
      };
      return h("div",{class:"row"},
        tileImg(key, () => catIcon(cid)),
        h("div",{class:"in"}, h("div",{class:"t",text:label}), h("div",{class:"kv",text: own ? "Ваше фото" : tilePhoto(key) ? "Сейчас: фото товара" : "Сейчас: значок"})),
        h("div",{class:"acts"},
          h("button",{class:"btn sm",text: own ? "Заменить" : "Загрузить фото",onclick:()=>inp.click()}), inp,
          own ? h("button",{class:"btn sm ghost",text:"Убрать",onclick:async()=>{ const r = await call("adminTile", {key, data:""}); if (!r.ok) return toast(errText(r)); delete S.tiles[key]; draw(); }}) : null));
    }));
  }
  function revRow(x){
    const p = pbyId[x.product];
    return h("div",{class:"row",style:{opacity:x.status==="hidden"?.55:1}},
      h("div",{class:"in"},
        h("div",{class:"t"}, stars(x.stars), "  "+x.name+" · "+new Date(x.at).toLocaleDateString("ru-RU")),
        x.text ? h("div",{class:"s",style:{whiteSpace:"pre-wrap"},text:x.text}) : null,
        x.photos.length ? h("div",{class:"rev-ph"}, ...x.photos.map(ph => h("a",{href:ph.url,target:"_blank",rel:"noopener"}, h("img",{src:ph.thumb||ph.url,alt:""})))) : null,
        h("div",{class:"s"}, "Товар: ", p ? h("a",{class:"link",href:"#/p/"+p.id,text:p.title}) : x.product)),
      h("div",{class:"acts"},
        x.status === "hidden" ? h("button",{class:"btn sm ghost",text:"Показать",onclick:()=>act("adminReview",{id:x.id,status:""})}) :
          h("button",{class:"btn sm ghost",text:"Скрыть",onclick:()=>act("adminReview",{id:x.id,status:"hidden"},"Отзыв скрыт")}),
        h("button",{class:"btn sm ghost",style:{color:"#c62828"},text:"Удалить",onclick:()=>act("adminReview",{id:x.id,remove:true},"Удалено")})));
  }
  function repRow(x){
    const p = pbyId[x.product];
    const reasons = {fraud:"Мошенничество",banned:"Запрещённый товар",wrong:"Неверная цена или описание",other:"Другое"};
    return h("div",{class:"row",style:{opacity:x.status==="done"?.6:1}},
      h("div",{class:"in"},
        h("div",{class:"t",text:(reasons[x.reason]||x.reason)+"  ·  "+new Date(x.at).toLocaleString("ru-RU")}),
        x.text ? h("div",{class:"s",style:{whiteSpace:"pre-wrap"},text:x.text}) : null,
        h("div",{class:"s"}, "Товар: ", p ? h("a",{class:"link",href:"#/p/"+p.id,text:p.title+" ("+p.id+")"}) : x.product+" (удалён)",
          x.user && ubyId[x.user] ? " · от "+ubyId[x.user].name : "")),
      h("div",{class:"acts"},
        p && p.status !== "banned" ? h("button",{class:"btn sm ghost",text:"Снять товар",onclick:()=>act("adminProduct",{id:p.id,status:"banned"},"Товар снят")}) : null,
        x.status !== "done" ? h("button",{class:"btn sm green",text:"Решено",onclick:()=>act("adminReport",{id:x.id,status:"done"})}) :
          h("span",{class:"st off",text:"Решено"})));
  }
  function draw(){
    let rows = [];
    if (tab === "pending") rows = pending.filter(u => match(u.name+u.phone+u.id)).map(userRow);
    if (tab === "users") rows = users.filter(u => match(u.name+u.phone+u.id+u.city)).map(userRow);
    if (tab === "prods") rows = prods.filter(p => match(p.title+p.id+(ubyId[p.user]||{}).name)).map(prodRow);
    if (tab === "vip") rows = prods.filter(p => isVip(p) && match(p.title+p.id+(ubyId[p.user]||{}).name)).map(prodRow);
    if (tab === "reports") rows = reports.filter(x => match(x.text+x.product+x.reason)).map(repRow);
    if (tab === "reviews") rows = reviews.filter(x => match(x.text+x.product+x.name)).map(revRow);
    if (tab === "tiles") rows = tileRows();
    if (tab === "malls"){
      if (r.malls){ S.malls = r.malls; lsSet("malls", r.malls); }
      const sug = r.mallSug || [];
      const sugBox = sug.length ? h("div",{class:"box",style:{background:"var(--vipBg)",borderColor:"var(--vipLine)"}},
        h("h3",{text:"🆕 Новые от продавцов ("+sug.length+")"}),
        h("p",{class:"hint",style:{margin:"0 0 8px"},text:"Продавцы вписали ТЦ или рынок, которого нет в списке. «Добавить» — и его смогут выбирать все."}),
        ...sug.map(sgi => h("div",{class:"row"},
          h("div",{class:"in"}, h("div",{class:"t",text:"🏬 "+sgi.name}), h("div",{class:"s",text:"📍 "+sgi.city+" · "+new Date(sgi.at).toLocaleDateString("ru-RU")})),
          h("div",{class:"acts"},
            h("button",{class:"btn sm green",text:"✅ Добавить",onclick:()=>act("adminMallSug",{city:sgi.city,name:sgi.name,ok:true},"Добавлено в список")}),
            h("button",{class:"btn sm ghost",text:"✕",onclick:()=>act("adminMallSug",{city:sgi.city,name:sgi.name,ok:false},"Отклонено")}))))) : null;
      // список ТЦ по велаятам: ✕ — убрать, «＋ Добавить» — новый; сохраняется сразу
      const cur = Object.fromEntries(CITIES.map(c => [c, mallsOf(c).slice()]));
      const save = async (msg) => {
        const x2 = await call("adminMalls", {malls: cur});
        if (!x2.ok) return toast(x2.error === "server" ? "Обновите Vip.gs на сервере." : errText(x2));
        S.malls = x2.malls; lsSet("malls", x2.malls); toast(msg); draw();
      };
      const cityBox = c => {
        const inp = h("input",{class:"inp",placeholder:"Название нового ТЦ или рынка"});
        const add = () => { const v = inp.value.trim(); if (!v) return; if (!cur[c].includes(v)) cur[c].push(v); save("Добавлено: " + v); };
        inp.addEventListener("keydown", e => { if (e.key === "Enter") add(); });
        return h("div",{class:"box mall-city"},
          h("h3",null, "📍 "+c, h("small",{text:"  "+cur[c].length})),
          ...(cur[c].length ? cur[c].map(m => h("div",{class:"mall-row"}, h("span",{text:"🏬 "+m}),
            h("button",{class:"xbtn",title:"Убрать","aria-label":"Убрать",text:"✕",onclick:async()=>{
              const yes = await sheet((box, close) => box.append(h("h2",{text:"Убрать «"+m+"»?"}),
                h("p",{text:"Продавцы больше не смогут его выбрать. Уже поданные объявления останутся."}),
                h("button",{class:"btn block",style:{background:"#c62828"},text:"Убрать",onclick:()=>close(true)})));
              if (yes){ cur[c] = cur[c].filter(z => z !== m); save("Убрано: " + m); }
            }}))) : [h("p",{class:"hint",style:{margin:"0 0 8px"},text:"Пока пусто"})]),
          h("div",{class:"mall-add"}, inp, h("button",{class:"btn sm",text:"＋ Добавить",onclick:add})));
      };
      rows = [sugBox,
        h("p",{class:"hint",style:{margin:"0 0 10px"},text:"Продавец выбирает свой ТЦ или рынок при подаче объявления, покупатель на главной может искать товары по ТЦ."}),
        ...CITIES.map(cityBox)];
    }
    if (tab === "topup") rows = !threads ? [h("div",{class:"err",text:"Обновите Vip.gs на сервере (версия 45), чтобы видеть заявки."})] :
      threads.filter(x => match(x.name+x.phone+x.user)).map(x => h("button",{type:"button",class:"row sup-row"+(x.unread?" new":""),onclick:()=>adminThreadSheet(x.user, () => viewAdmin())},
        h("div",{class:"coin sm",text:"🪙"}),
        h("div",{class:"in"}, h("div",{class:"t"}, x.name, x.unread ? h("span",{class:"sup-dot",text:String(x.unread)}) : null),
          h("div",{class:"s"}, phoneFmt(x.phone), "· баланс: "+coins(x.balance), x.amount ? h("span",{class:"vip-pill",text:"просит "+coins(x.amount)}) : null),
          h("div",{class:"kv",text:(x.last.from === "admin" ? "Вы: " : "") + (x.last.photo && !x.last.text ? "📷 Скриншот" : (x.last.photo ? "📷 " : "") + (x.last.text || (x.last.amount ? coins(x.last.amount) : "")))})),
        h("span",{class:"ar",text:"›"})));
    const note = tab === "pending" ? h("p",{class:"hint",style:{margin:"0 0 10px"},text: r.approval ?
      "Товары этих продавцов не видны покупателям, пока вы не нажмёте «Одобрить». Перед одобрением позвоните продавцу и посмотрите его товары." :
      "Одобрение выключено (SELLER_APPROVAL = false): товары видны сразу."}) : null;
    const prices = tab === "vip" && r.expDays && r.vipPrices ? pricesBox() : null;
    body.replaceChildren(note, prices, ...(rows.length ? rows : [h("div",{class:"empty",text:"Пусто"})]));
  }
  drawTabs(); draw();
  root.replaceChildren(tabBar, search, body);
}
