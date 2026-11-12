/* Artboard Studio — Firebase-authenticated live admin panel */
(function () {
  "use strict";
  var ADMIN_EMAIL = "rafathamed9@gmail.com";
  var FIREBASE_CONFIG = {
    apiKey: "AIzaSyBYZy3hL5Nolj7KyFd3g8zkKCE83xWErxg",
    authDomain: "artboardstudio-117a6.firebaseapp.com",
    projectId: "artboardstudio-117a6",
    storageBucket: "artboardstudio-117a6.firebasestorage.app",
    messagingSenderId: "26311402131",
    appId: "1:26311402131:web:7c2950a172814b2ba0e366"
  };
  var db, auth, currentUser = null, draftCards = [], draftButtons = [], draftPages = [], draftElements = [], publishedPages = [];
  var defaults = {
    tagIcon:"✨", tagText:"إضافة احترافية للمصممين", heroTitle:"ARTBOARD STUDIO",
    heroDesc:"ارتقِ بتجربتك داخل Adobe Illustrator مع مجموعة من الأدوات العملية المصممة لتسهيل التعامل مع لوحات الرسم والصور والعناصر، وتعديل الصور وتحويلها مباشرة على لوحة العمل، وإنشاء رموز QR متجهية قابلة للتحرير.",
    downloadIcon:"📥", downloadBtnText:"تحميل الإضافة الآن", downloadFileUrl:"./ArtboardStudio.rar",
    whatsappNumber:"201127502899", buttonColor1:"#7954ec", buttonColor2:"#a17aff", buttonAngle:120,
    pageBg:"#090b13", glow1:"#30205a", glow2:"#102d4b", textColor:"#f5f6ff",
    secondaryTextColor:"#b9bdd0", siteFont:"'Cairo',sans-serif", baseFontSize:16,
    heroTitleSize:54, animation:"none", heroOrder:"normal", customCards:[], customButtons:[], sidePages:[], customElements:[]
  };

  function addStyles() {
    if (document.getElementById("as-admin-styles")) return;
    var css = [
      "#open-admin-fab{position:fixed;bottom:90px;left:18px;z-index:9998;background:#171827ee;color:#a78bfa;border:1px solid #5a4c93;padding:10px 15px;border-radius:30px;cursor:pointer;font:700 12px Cairo,Tahoma,sans-serif;backdrop-filter:blur(8px);box-shadow:0 8px 25px #0008}",
      "#studio-overlay{display:none;position:fixed;top:0;right:0;width:410px;max-width:96vw;height:100vh;height:100dvh;z-index:9999;flex-direction:column;background:#111422;color:#f8fafc;border-left:1px solid #2e3452;box-shadow:-15px 0 50px #000c;font-family:Cairo,Tahoma,sans-serif;text-align:right}",
      "#studio-overlay *{box-sizing:border-box}#studio-overlay input,#studio-overlay textarea,#studio-overlay select{width:100%;min-width:0;padding:9px 10px;border-radius:8px;border:1px solid #333954;background:#0b0d17;color:#fff;font:12px Cairo,Tahoma,sans-serif}",
      "#studio-overlay input[type=color]{height:38px;padding:3px;background:#0b0d17}#studio-overlay label{display:block;margin:10px 0 5px;font-size:12px;color:#d8def0}",
      "#studio-overlay button{font-family:inherit}.st-head{padding:14px 16px;background:#171b2e;border-bottom:1px solid #262a40;display:flex;justify-content:space-between;align-items:center;gap:10px}.st-head strong{color:#a78bfa;font-size:14px}",
      ".st-btn{border:0;border-radius:8px;padding:8px 12px;color:#fff;background:#343954;cursor:pointer;font-size:12px}.st-primary{background:linear-gradient(120deg,#7954ec,#a17aff);font-weight:800}.st-danger{background:#b91c1c}",
      ".st-tabs{display:flex;overflow-x:auto;background:#0d0f1a;border-bottom:1px solid #262a40;scrollbar-width:thin}.st-tab{flex:1 0 67px;border:0;background:transparent;color:#94a3b8;padding:11px 4px;font-size:10px;white-space:nowrap;cursor:pointer;border-bottom:2px solid transparent}.st-tab.active{color:#c4b5fd;border-color:#8b5cf6}",
      ".st-content{flex:1;overflow:auto;padding:14px;font-size:12px}.st-pane{display:none}.st-pane.active{display:block}.st-grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}.st-grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px}.st-row{display:flex;gap:7px;align-items:center}.st-row>*{min-width:0}",
      ".st-note{font-size:11px;color:#9ca3b8;line-height:1.7}.st-status{margin:12px 0 0;padding:9px;border-radius:8px;background:#171b2e;color:#cbd5e1;min-height:36px;font-size:11px;line-height:1.6}",
      ".st-card{padding:10px;margin:8px 0;background:#171b2e;border:1px solid #2b3252;border-radius:10px}.st-card strong{color:#c4b5fd}.st-bottom{padding:12px 14px;border-top:1px solid #262a40;background:#111422;display:flex;gap:8px}.st-bottom button{flex:1}.st-hidden{display:none!important}",
      ".as-dynamic-area{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:center;padding:14px 0;position:relative}.as-dynamic-area[data-position='floating-left']{position:fixed;left:18px;bottom:155px;z-index:45;flex-direction:column;align-items:flex-start;padding:0}.as-dynamic-area[data-position='floating-right']{position:fixed;right:18px;bottom:90px;z-index:45;flex-direction:column;align-items:flex-end;padding:0}.as-dynamic-area[data-position='header-nav']{padding:0;display:inline-flex}.as-dynamic-area[data-position='hero-actions']{padding:0;display:contents}",
".as-custom-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:11px 18px;border-radius:11px;text-decoration:none;font:700 13px Cairo,Tahoma,sans-serif;cursor:pointer;transition:.2s;border:1px solid transparent}.as-custom-button:hover{transform:translateY(-2px);filter:brightness(1.08)}.as-custom-button.secondary{background:#171827;border-color:#55516f;color:#fff}.as-custom-button.outline{background:transparent;border-color:#a78bfa;color:inherit}.as-custom-button.whatsapp{background:#168c58;color:#fff}.as-custom-button.gradient{background:linear-gradient(120deg,#7954ec,#a17aff);color:#fff}",
".as-page-overlay{position:fixed;inset:0;z-index:9990;background:#03040bd9;backdrop-filter:blur(7px);display:none;align-items:stretch}.as-page-panel{height:100%;width:min(760px,94vw);overflow:auto;background:#111422;color:#f5f6ff;box-shadow:0 0 60px #000b;padding:0 24px 32px}.as-page-head{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;align-items:center;padding:16px 0;background:inherit;border-bottom:1px solid #ffffff22}.as-page-content{max-width:100%;margin:auto;padding:24px 0}.as-page-content h2{font-size:clamp(24px,4vw,38px);margin-bottom:8px}.as-page-content p{white-space:pre-wrap;line-height:1.9}.as-element{padding:20px;border-radius:15px;margin:16px auto;max-width:100%;overflow:hidden}.as-element img{display:block;width:100%;height:auto;max-height:680px;object-fit:contain;border-radius:10px}.as-element-button{display:inline-flex;padding:11px 18px;border-radius:10px;background:linear-gradient(120deg,#7954ec,#a17aff);color:#fff;text-decoration:none;font-weight:800}.as-draft-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.as-draft-actions button{font-size:11px}.as-form-hint{font-size:11px;color:#9ca3b8;line-height:1.6;margin-top:5px}",
      ".st-admin-inserted{padding:30px 0}.st-admin-inserted .st-added-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:16px}.st-added-card{background:#171827;border:1px solid #383354;border-radius:16px;padding:18px;box-shadow:0 12px 32px #0004}.st-added-card img{width:100%;max-height:170px;object-fit:cover;border-radius:10px;margin-bottom:10px}.st-added-icon{font-size:26px;margin-bottom:8px}.st-added-card h3{font-size:17px;margin-bottom:6px}.st-added-card p{font-size:13px;color:var(--as-secondary,#b9bdd0)}",
      "@keyframes asPulse{50%{transform:scale(1.035);filter:brightness(1.12)}}@keyframes asFadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}@keyframes asZoom{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}",
      ".as-admin-fade{animation:asFadeUp .65s ease both}.as-admin-zoom{animation:asZoom .65s ease both}.as-admin-pulse{animation:asPulse 1.8s ease-in-out infinite}@media(max-width:520px){#studio-overlay{width:100vw;max-width:100vw}.st-admin-inserted .st-added-grid{grid-template-columns:1fr}}"
    ].join("\n");
    var style = document.createElement("style");
    style.id = "as-admin-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function buildPanel() {
    if (document.getElementById("studio-overlay")) return;
    var fab = document.createElement("button");
    fab.id = "open-admin-fab"; fab.type = "button"; fab.title = "لوحة التحكم"; fab.textContent = "⚙️ الإدارة";
    document.body.appendChild(fab);
    var overlay = document.createElement("aside");
    overlay.id = "studio-overlay"; overlay.setAttribute("dir", "rtl");
    overlay.innerHTML = [
      "<div class='st-head'><strong>🎨 استوديو التحكم المباشر</strong><div class='st-row'><button type='button' class='st-btn st-danger st-hidden' id='st-logout'>خروج</button><button type='button' class='st-btn' id='st-close'>✕ إغلاق</button></div></div>",
      "<div id='st-login' class='st-content'><h3 style='color:#38bdf8;font-size:16px;margin:0 0 12px'>تسجيل دخول الأدمن</h3>",
      "<label for='st-em'>البريد الإلكتروني</label><input type='email' id='st-em' value='rafathamed9@gmail.com' autocomplete='username'>",
      "<label for='st-pw'>كلمة المرور</label><input type='password' id='st-pw' placeholder='••••••••' autocomplete='current-password'>",
      "<button type='button' id='st-go' class='st-btn st-primary' style='width:100%;margin-top:14px;padding:11px'>دخول للوحة التحكم</button>",
      "<p class='st-note' style='margin-top:12px'>الدخول عبر Firebase Authentication. لا يتم حفظ كلمة المرور داخل الموقع.</p><div id='st-login-msg' class='st-status' role='status'>أدخل بيانات حساب الإدارة للمتابعة.</div></div>",
      "<div id='st-body' class='st-hidden' style='flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden'>",
      "<div class='st-tabs'><button type='button' class='st-tab active' data-t='p-txt'>النصوص</button><button type='button' class='st-tab' data-t='p-col'>الألوان</button><button type='button' class='st-tab' data-t='p-anm'>الخط</button><button type='button' class='st-tab' data-t='p-buttons'>الأزرار</button><button type='button' class='st-tab' data-t='p-pages'>الصفحات</button><button type='button' class='st-tab' data-t='p-elements'>العناصر</button><button type='button' class='st-tab' data-t='p-add'>البطاقات</button></div>",
      "<div class='st-content'>",
      "<section id='p-txt' class='st-pane active'><label>أيقونة ونص الشارة العلوية</label><div class='st-row'><input id='f-tico' value='✨' style='width:58px;text-align:center'><input id='f-tag' value='إضافة احترافية للمصممين'></div>",
      "<label>العنوان الرئيسي</label><input id='f-title' value='ARTBOARD STUDIO'><label>الوصف التعريفي أسفل العنوان</label><textarea id='f-desc' rows='4'></textarea>",
      "<label>أيقونة ونص زر التحميل</label><div class='st-row'><input id='f-bico' value='📥' style='width:58px;text-align:center'><input id='f-btxt' value='تحميل الإضافة الآن'></div>",
      "<label>رابط ملف التحميل</label><input id='f-download' value='./ArtboardStudio.rar' placeholder='https://... أو مسار نسبي'><label>رقم الواتساب (بدون +)</label><input id='f-wa' value='201127502899' inputmode='numeric'></section>",
      "<section id='p-col' class='st-pane'><label>تدرج الأزرار (لون 1 / لون 2 / الزاوية)</label><div class='st-grid3'><input type='color' id='f-c1' value='#7954ec'><input type='color' id='f-c2' value='#a17aff'><input type='number' id='f-ang' value='120' min='0' max='360'></div>",
      "<label>خلفية الموقع وتوهج الواجهة</label><div class='st-grid3'><input type='color' id='f-bg' value='#090b13'><input type='color' id='f-g1' value='#30205a'><input type='color' id='f-g2' value='#102d4b'></div>",
      "<label>لون النصوص (أساسي / ثانوي)</label><div class='st-grid2'><input type='color' id='f-tc' value='#f5f6ff'><input type='color' id='f-sc' value='#b9bdd0'></div></section>",
      "<section id='p-anm' class='st-pane'><label>نوع الخط العربي</label><select id='f-font'><option value=\"'Cairo',sans-serif\">Cairo (كايرو)</option><option value=\"'Tajawal',sans-serif\">Tajawal (تجوّل)</option><option value=\"'IBM Plex Sans Arabic',sans-serif\">IBM Plex Sans Arabic</option><option value=\"'Almarai',sans-serif\">Almarai (المراعي)</option><option value=\"'Readex Pro',sans-serif\">Readex Pro</option></select>",
      "<div class='st-grid2'><div><label>حجم الخط (px)</label><input type='number' id='f-fs' value='16' min='12' max='30'></div><div><label>حجم العنوان (px)</label><input type='number' id='f-hs' value='54' min='28' max='90'></div></div>",
      "<label>حركة العناصر</label><select id='f-anm'><option value='none'>بدون حركة إضافية</option><option value='fadeUp'>انزلاق ناعم لأعلى</option><option value='zoomIn'>تكبير تدريجي</option><option value='pulseBtn'>نبض مستمر لزر التحميل</option></select>",
      "<label>مكان نافذة البرنامج في الواجهة</label><select id='f-ord'><option value='normal'>الوضع الافتراضي (النص يمين)</option><option value='reverse'>معكوس (البرنامج يمين)</option></select></section>",
      "<section id='p-add' class='st-pane'><div class='st-card'><strong>➕ إضافة بطاقة ميزة / إعلان / صورة</strong><label>الأيقونة</label><input id='nb-ico' value='🔥' maxlength='12'><label>العنوان</label><input id='nb-tit' placeholder='عنوان البطاقة'><label>الوصف المختصر</label><textarea id='nb-dsc' rows='2' placeholder='الوصف...'></textarea>",
      "<label>رابط صورة (اختياري – HTTPS)</label><input type='url' id='nb-img' placeholder='https://example.com/image.jpg'><label>مكان ظهور البطاقة</label><select id='nb-pos'><option value='top'>في أعلى الموقع</option><option value='after-hero'>بعد الواجهة الرئيسية</option><option value='before-footer'>في أسفل الموقع</option></select>",
      "<button type='button' id='nb-add' class='st-btn st-primary' style='width:100%;margin-top:10px'>➕ إضافة البطاقة للقائمة</button></div><div id='nb-list'></div><p class='st-note'>تُحفظ البطاقات ضمن إعدادات الموقع، ويمكن حذفها قبل حفظ التعديلات.</p></section>",
      "</div><div class='st-bottom'><button type='button' id='st-save' class='st-btn st-primary'>💾 حفظ التعديلات</button><button type='button' id='st-refresh' class='st-btn'>إعادة تحميل</button></div><div id='st-msg' class='st-status' role='status' style='margin:0 14px 12px'></div></div>"
    ].join("");
    document.body.appendChild(overlay);

    fab.addEventListener("click", function () { overlay.style.display = "flex"; });
    document.getElementById("st-close").addEventListener("click", function () { overlay.style.display = "none"; });
    document.querySelectorAll("#studio-overlay .st-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        document.querySelectorAll("#studio-overlay .st-tab").forEach(function (t) { t.classList.toggle("active", t === tab); });
        document.querySelectorAll("#studio-overlay .st-pane").forEach(function (p) { p.classList.toggle("active", p.id === tab.getAttribute("data-t")); });
      });
    });
    document.getElementById("st-go").addEventListener("click", login);
    document.getElementById("st-pw").addEventListener("keydown", function (e) { if (e.key === "Enter") login(); });
    document.getElementById("st-logout").addEventListener("click", function () { auth.signOut(); });
    document.getElementById("st-save").addEventListener("click", save);
    document.getElementById("st-refresh").addEventListener("click", loadContent);
    document.getElementById("nb-add").addEventListener("click", addCard);
  }

  function status(id, message, type) {
    var el = document.getElementById(id); if (!el) return;
    el.textContent = message;
    el.style.color = type === "error" ? "#fca5a5" : type === "success" ? "#86efac" : "#cbd5e1";
  }
  function color(value, fallback) { return /^#[0-9a-f]{3,8}$/i.test(String(value || "")) ? String(value) : fallback; }
  function url(value, relative) {
    var raw = String(value || "").trim(); if (!raw) return null;
    try { var parsed = new URL(raw, location.href); if (parsed.protocol === "https:" || (relative && parsed.origin === location.origin)) return parsed.href; } catch (e) {}
    return null;
  }
  function digits(value) { return String(value || "").replace(/\D/g, "").slice(0, 18); }

  function apply(data) {
    data = data || {};
    var d = Object.assign({}, defaults, data);
    // Compatibility with the older Firebase fields already used by this website.
    if (data.primaryColor && !data.buttonColor1 && !data.buttonColor2) {
      d.buttonColor1 = data.primaryColor;
      d.buttonColor2 = data.primaryColor;
    }
    if (!data.heroDesc && typeof data.heroDescHtml === "string") {
      d.heroDesc = data.heroDescHtml.replace(/<br\s*\/?\s*>/gi, " ").replace(/<\/p>/gi, " ").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    }
    var tag = document.querySelector(".hero .tag");
    if (tag) tag.textContent = (d.tagIcon || "") + (d.tagText ? " " + d.tagText : "");
    var h1 = document.querySelector(".hero h1");
    if (h1 && d.heroTitle) {
      var words = String(d.heroTitle).trim().split(/\s+/), last = words.pop() || "";
      h1.textContent = words.join(" ");
      if (words.length) h1.appendChild(document.createTextNode(" "));
      var span = document.createElement("span"); span.textContent = last; span.style.color = color(d.buttonColor2, defaults.buttonColor2); h1.appendChild(span);
      h1.style.fontSize = Math.max(28, Math.min(90, parseInt(d.heroTitleSize, 10) || 54)) + "px";
    }
    var desc = document.querySelector(".hero-grid > div:first-child p");
    if (desc && typeof d.heroDesc === "string") desc.textContent = d.heroDesc;
    var dl = url(d.downloadFileUrl || defaults.downloadFileUrl, true);
    document.querySelectorAll(".hero .btn.primary,.download-box .btn.primary").forEach(function (a) {
      a.textContent = (d.downloadIcon || "") + " " + (d.downloadBtnText || defaults.downloadBtnText);
      if (dl) a.href = dl;
    });
    var wa = digits(d.whatsappNumber);
    if (wa) document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) { var q = a.href.indexOf("?"); a.href = "https://wa.me/" + wa + (q >= 0 ? a.href.slice(q) : ""); });

    var c1 = color(d.buttonColor1, defaults.buttonColor1), c2 = color(d.buttonColor2, defaults.buttonColor2);
    var ang = Math.max(0, Math.min(360, parseInt(d.buttonAngle, 10) || 120));
    var bg = color(d.pageBg, defaults.pageBg), g1 = color(d.glow1, defaults.glow1), g2 = color(d.glow2, defaults.glow2);
    var tc = color(d.textColor, defaults.textColor), sc = color(d.secondaryTextColor, defaults.secondaryTextColor);
    document.documentElement.style.setProperty("--as-secondary", sc);
    document.body.style.backgroundColor = bg; document.body.style.color = tc;
    document.body.style.fontFamily = d.siteFont || defaults.siteFont;
    document.body.style.fontSize = Math.max(12, Math.min(30, parseInt(d.baseFontSize, 10) || 16)) + "px";
    document.querySelectorAll(".primary,.showcase-nav button.active").forEach(function (el) { el.style.background = "linear-gradient(" + ang + "deg," + c1 + "," + c2 + ")"; });
    document.querySelectorAll(".logo span,.hero h1 span").forEach(function (el) { el.style.color = c2; });
    document.querySelectorAll(".hero p,.section-title p,.feature p,.step p,.faq details p,.shot figcaption small").forEach(function (el) { el.style.color = sc; });
    document.querySelectorAll(".section-title h2,.feature h3").forEach(function (el) { el.style.color = tc; });
    var hero = document.querySelector(".hero");
    if (hero) hero.style.background = "radial-gradient(ellipse at 15% 20%," + g1 + " 0,transparent 45%),radial-gradient(ellipse at 85% 70%," + g2 + " 0,transparent 40%)," + bg;
    var grid = document.querySelector(".hero-grid");
    if (grid) { grid.style.direction = d.heroOrder === "reverse" ? "ltr" : "rtl"; var intro = grid.querySelector(":scope > div:first-child"); if (intro) intro.style.direction = "rtl"; }
    applyMotion(d.animation);
    renderCards(Array.isArray(d.customCards) ? d.customCards : []);
  }

  function applyMotion(mode) {
    var items = document.querySelectorAll(".hero-grid,.feature,.shot,.step");
    items.forEach(function (el) { el.classList.remove("as-admin-fade", "as-admin-zoom"); });
    var button = document.querySelector(".hero .btn.primary");
    if (button) button.classList.remove("as-admin-pulse");
    if (mode === "fadeUp") items.forEach(function (el) { el.classList.add("as-admin-fade"); });
    if (mode === "zoomIn") items.forEach(function (el) { el.classList.add("as-admin-zoom"); });
    if (mode === "pulseBtn" && button) button.classList.add("as-admin-pulse");
  }

  function renderCards(cards) {
    document.querySelectorAll(".st-admin-inserted").forEach(function (el) { el.remove(); });
    ["top","after-hero","before-footer"].forEach(function (pos) {
      var chosen = cards.filter(function (c) { return c && c.position === pos; }); if (!chosen.length) return;
      var section = document.createElement("section"); section.className = "st-admin-inserted";
      var container = document.createElement("div"); container.className = "container st-added-grid";
      chosen.forEach(function (c) {
        var article = document.createElement("article"); article.className = "st-added-card";
        var image = url(c.imageUrl, false);
        if (image) { var img = document.createElement("img"); img.src = image; img.alt = String(c.title || "صورة"); img.loading = "lazy"; article.appendChild(img); }
        var icon = document.createElement("div"); icon.className = "st-added-icon"; icon.textContent = String(c.icon || "✨");
        var h = document.createElement("h3"); h.textContent = String(c.title || "");
        var p = document.createElement("p"); p.textContent = String(c.description || "");
        article.appendChild(icon); article.appendChild(h); article.appendChild(p); container.appendChild(article);
      });
      section.appendChild(container);
      if (pos === "top") { var header = document.querySelector("header"); if (header && header.parentNode) header.parentNode.insertBefore(section, header.nextSibling); }
      else if (pos === "after-hero") { var hero = document.querySelector(".hero"); if (hero && hero.parentNode) hero.parentNode.insertBefore(section, hero.nextSibling); }
      else { var footer = document.querySelector("footer"); if (footer && footer.parentNode) footer.parentNode.insertBefore(section, footer); }
    });
  }

  function fill(data) {
    data = data || {};
    var d = Object.assign({}, defaults, data);
    if (data.primaryColor && !data.buttonColor1 && !data.buttonColor2) {
      d.buttonColor1 = data.primaryColor;
      d.buttonColor2 = data.primaryColor;
    }
    if (!data.heroDesc && typeof data.heroDescHtml === "string") {
      d.heroDesc = data.heroDescHtml.replace(/<br\s*\/?\s*>/gi, " ").replace(/<\/p>/gi, " ").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    }
    var map = {"f-tico":"tagIcon","f-tag":"tagText","f-title":"heroTitle","f-desc":"heroDesc","f-bico":"downloadIcon","f-btxt":"downloadBtnText","f-download":"downloadFileUrl","f-wa":"whatsappNumber","f-c1":"buttonColor1","f-c2":"buttonColor2","f-ang":"buttonAngle","f-bg":"pageBg","f-g1":"glow1","f-g2":"glow2","f-tc":"textColor","f-sc":"secondaryTextColor","f-font":"siteFont","f-fs":"baseFontSize","f-hs":"heroTitleSize","f-anm":"animation","f-ord":"heroOrder"};
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) el.value = d[map[id]] == null ? "" : d[map[id]]; });
    draftCards = Array.isArray(d.customCards) ? d.customCards.slice(0, 60) : []; renderDraftCards();
  }
  function renderDraftCards() {
    var list = document.getElementById("nb-list"); if (!list) return; list.textContent = "";
    if (!draftCards.length) { var empty = document.createElement("p"); empty.className = "st-note"; empty.textContent = "لا توجد بطاقات مضافة حتى الآن."; list.appendChild(empty); return; }
    draftCards.forEach(function (card, index) {
      var box = document.createElement("div"); box.className = "st-card";
      var title = document.createElement("strong"); title.textContent = (card.icon || "✨") + " " + (card.title || "بطاقة بدون عنوان");
      var info = document.createElement("p"); info.className = "st-note"; info.textContent = (card.position || "after-hero") + (card.imageUrl ? " · تحتوي على صورة" : "");
      var remove = document.createElement("button"); remove.type = "button"; remove.className = "st-btn st-danger"; remove.textContent = "حذف";
      remove.addEventListener("click", function () { draftCards.splice(index, 1); renderDraftCards(); });
      box.appendChild(title); box.appendChild(info); box.appendChild(remove); list.appendChild(box);
    });
  }
  function addCard() {
    var title = document.getElementById("nb-tit").value.trim(), desc = document.getElementById("nb-dsc").value.trim();
    var rawImage = document.getElementById("nb-img").value.trim(), image = rawImage ? url(rawImage, false) : "";
    if (!title) { status("st-msg", "اكتب عنوان البطاقة أولًا.", "error"); return; }
    if (rawImage && !image) { status("st-msg", "رابط الصورة يجب أن يبدأ بـ HTTPS.", "error"); return; }
    draftCards.push({id:"card-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,7),icon:document.getElementById("nb-ico").value.trim() || "✨",title:title.slice(0,100),description:desc.slice(0,500),imageUrl:image,position:document.getElementById("nb-pos").value});
    document.getElementById("nb-tit").value = ""; document.getElementById("nb-dsc").value = ""; document.getElementById("nb-img").value = "";
    renderDraftCards(); status("st-msg", "أُضيفت البطاقة إلى المسودة. اضغط حفظ التعديلات لنشرها.", "success");
  }

  function collect() {
    var download = url(document.getElementById("f-download").value, true);
    if (!download) throw new Error("رابط التحميل غير صالح. استخدم رابط HTTPS أو مسارًا داخل الموقع.");
    var angle = parseInt(document.getElementById("f-ang").value, 10);
    return {
      tagIcon:document.getElementById("f-tico").value.trim().slice(0,12),tagText:document.getElementById("f-tag").value.trim().slice(0,120),
      heroTitle:document.getElementById("f-title").value.trim().slice(0,100),heroDesc:document.getElementById("f-desc").value.trim().slice(0,1200),
      downloadIcon:document.getElementById("f-bico").value.trim().slice(0,12),downloadBtnText:document.getElementById("f-btxt").value.trim().slice(0,100),
      downloadFileUrl:download,whatsappNumber:digits(document.getElementById("f-wa").value),
      buttonColor1:color(document.getElementById("f-c1").value,defaults.buttonColor1),buttonColor2:color(document.getElementById("f-c2").value,defaults.buttonColor2),
      buttonAngle:isFinite(angle)?Math.max(0,Math.min(360,angle)):120,pageBg:color(document.getElementById("f-bg").value,defaults.pageBg),
      glow1:color(document.getElementById("f-g1").value,defaults.glow1),glow2:color(document.getElementById("f-g2").value,defaults.glow2),
      textColor:color(document.getElementById("f-tc").value,defaults.textColor),secondaryTextColor:color(document.getElementById("f-sc").value,defaults.secondaryTextColor),
      siteFont:document.getElementById("f-font").value,baseFontSize:Math.max(12,Math.min(30,parseInt(document.getElementById("f-fs").value,10)||16)),
      heroTitleSize:Math.max(28,Math.min(90,parseInt(document.getElementById("f-hs").value,10)||54)),
      animation:document.getElementById("f-anm").value,heroOrder:document.getElementById("f-ord").value,
      customCards:draftCards.slice(0,60),updatedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedBy:currentUser.email
    };
  }

  async function save() {
    if (!currentUser || currentUser.email.toLowerCase() !== ADMIN_EMAIL) { status("st-msg","سجّل الدخول بحساب الإدارة أولًا.","error"); return; }
    var button = document.getElementById("st-save"); button.disabled = true; button.textContent = "جارٍ الحفظ...";
    try {
      var payload = collect();
      await db.collection("site").doc("content").set(payload,{merge:true});
      apply(payload); status("st-msg","تم حفظ التعديلات في Firebase وتطبيقها على الصفحة.","success");
    } catch (e) {
      console.error("Admin save failed:",e);
      status("st-msg",e && e.code === "permission-denied" ? "تم تسجيل الدخول، لكن Firestore رفض الحفظ. راجع قواعد الأمان في ADMIN_SETUP.md." : (e.message || "تعذر حفظ التعديلات."),"error");
    } finally { button.disabled = false; button.textContent = "💾 حفظ التعديلات"; }
  }
  async function loadContent() {
    try {
      var snap = await db.collection("site").doc("content").get(), data = snap.exists ? snap.data() : defaults;
      fill(data); apply(data); status("st-msg","تم تحميل إعدادات الموقع من Firebase.","success");
    } catch (e) { console.error("Admin content read failed:",e); status("st-msg","تعذر قراءة إعدادات الموقع من Firebase.","error"); }
  }
  function showAdmin() {
    document.getElementById("st-login").classList.add("st-hidden");
    document.getElementById("st-body").classList.remove("st-hidden"); document.getElementById("st-body").style.display = "flex";
    document.getElementById("st-logout").classList.remove("st-hidden"); loadContent();
  }
  function showLogin(message, error) {
    document.getElementById("st-login").classList.remove("st-hidden"); document.getElementById("st-body").classList.add("st-hidden");
    document.getElementById("st-logout").classList.add("st-hidden"); if (message) status("st-login-msg",message,error?"error":"");
  }
  async function login() {
    var email = document.getElementById("st-em").value.trim().toLowerCase(), password = document.getElementById("st-pw").value;
    if (email !== ADMIN_EMAIL) { status("st-login-msg","هذا البريد غير مصرح له بالدخول إلى لوحة الإدارة.","error"); return; }
    if (!password) { status("st-login-msg","أدخل كلمة المرور.","error"); return; }
    var button = document.getElementById("st-go"); button.disabled = true; button.textContent = "جارٍ التحقق...";
    try {
      var result = await auth.signInWithEmailAndPassword(email,password), user = result.user;
      if (!user || !user.email || user.email.toLowerCase() !== ADMIN_EMAIL) { await auth.signOut(); throw new Error("الحساب غير مصرح له."); }
      if (!user.emailVerified) { await auth.signOut(); throw new Error("يجب توثيق البريد الإلكتروني من رسالة Firebase أولًا."); }
      currentUser = user; document.getElementById("st-pw").value = ""; showAdmin();
    } catch (e) {
      var message = e && e.code === "auth/wrong-password" ? "كلمة المرور غير صحيحة." :
        e && e.code === "auth/user-not-found" ? "لا يوجد حساب بهذا البريد في Firebase Authentication." :
        e && e.code === "auth/too-many-requests" ? "محاولات كثيرة. حاول لاحقًا." : (e.message || "فشل تسجيل الدخول.");
      status("st-login-msg",message,"error");
    } finally { button.disabled = false; button.textContent = "دخول للوحة التحكم"; }
  }

  function start() {
    addStyles(); buildPanel();
    try {
      if (!window.firebase) throw new Error("Firebase SDK غير متاح.");
      if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      db = firebase.firestore(); auth = firebase.auth();
      // Keep every open visitor tab synchronized with published site content.
      db.collection("site").doc("content").onSnapshot(function (snap) {
        if (!snap.exists) return;
        var published = snap.data();
        apply(published);
        if (currentUser) fill(published);
      }, function (error) {
        console.error("Artboard Studio live content listener failed:", error);
      });
      auth.onAuthStateChanged(function (user) {
        if (user && user.email && user.email.toLowerCase() === ADMIN_EMAIL && user.emailVerified) { currentUser = user; showAdmin(); }
        else { currentUser = null; if (user) auth.signOut(); showLogin("سجّل الدخول باستخدام بريد الإدارة الموثّق.",false); }
      });
      loadContent();
    } catch (e) { console.error("Admin initialization failed:",e); showLogin("تعذر تهيئة Firebase. تحقق من اتصال الموقع وإعدادات المشروع.",true); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",start); else start();
})();