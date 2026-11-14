/* Artboard Studio — Firebase-authenticated live admin panel */
(function () {
  "use strict";
  var ADMIN_EMAIL = "rafathamed9@gmail.com";
  var ANALYTICS_API_URL = "https://artboard-studio-analytics.rafat-hamed.workers.dev";
  var analyticsMapInstance = null, analyticsMapLayer = null, analyticsLeafletPromise = null;
  var FIREBASE_CONFIG = {
    apiKey: "AIzaSyBYZy3hL5Nolj7KyFd3g8zkKCE83xWErxg",
    authDomain: "artboardstudio-117a6.firebaseapp.com",
    projectId: "artboardstudio-117a6",
    storageBucket: "artboardstudio-117a6.firebasestorage.app",
    messagingSenderId: "26311402131",
    appId: "1:26311402131:web:7c2950a172814b2ba0e366"
  };
  var db, auth, currentUser = null, draftCards = [], draftButtons = [], draftPages = [], draftElements = [], draftVisualItems = [], activeVisualItemId = null, visualEditMode = false, publishedPages = [];
  var defaults = {
    tagIcon:"✨", tagText:"إضافة احترافية للمصممين", heroTitle:"ARTBOARD STUDIO",
    heroDesc:"ارتقِ بتجربتك داخل Adobe Illustrator مع مجموعة من الأدوات العملية المصممة لتسهيل التعامل مع لوحات الرسم والصور والعناصر، وتعديل الصور وتحويلها مباشرة على لوحة العمل، وإنشاء رموز QR متجهية قابلة للتحرير.",
    downloadIcon:"📥", downloadBtnText:"تحميل الإضافة الآن", downloadFileUrl:"./ArtboardStudio.rar",
    whatsappNumber:"201127502899", buttonColor1:"#7954ec", buttonColor2:"#a17aff", buttonAngle:120,
    pageBg:"#090b13", glow1:"#30205a", glow2:"#102d4b", textColor:"#f5f6ff",
    secondaryTextColor:"#b9bdd0", siteFont:"'Cairo',sans-serif", baseFontSize:16,
    heroTitleSize:54, animation:"none", heroOrder:"normal", customCards:[], customButtons:[], sidePages:[], customElements:[], customCanvasItems:[]
  };

  function addStyles() {
    if (document.getElementById("as-admin-styles")) return;
    var css = [
      "#open-admin-fab{position:fixed;bottom:90px;left:18px;z-index:9998;background:#171827ee;color:#a78bfa;border:1px solid #5a4c93;padding:10px 15px;border-radius:30px;cursor:pointer;font:700 12px Cairo,Tahoma,sans-serif;backdrop-filter:blur(8px);box-shadow:0 8px 25px #0008}",
      "#studio-overlay{display:none;position:fixed;top:8vh;right:8vw;width:480px;height:84vh;min-width:320px;min-height:360px;max-width:94vw;max-height:92vh;z-index:9999;flex-direction:column;resize:both;overflow:hidden;background:#111422;color:#f8fafc;border:1px solid #3b4260;border-radius:14px;box-shadow:0 18px 60px #000c;font-family:Cairo,Tahoma,sans-serif;text-align:right}",
      "#studio-overlay *{box-sizing:border-box}#studio-overlay input,#studio-overlay textarea,#studio-overlay select{width:100%;min-width:0;padding:9px 10px;border-radius:8px;border:1px solid #333954;background:#0b0d17;color:#fff;font:12px Cairo,Tahoma,sans-serif}",
      "#studio-overlay input[type=color]{height:38px;padding:3px;background:#0b0d17}#studio-overlay label{display:block;margin:10px 0 5px;font-size:12px;color:#d8def0}",
      "#studio-overlay button{font-family:inherit}.st-head{padding:14px 16px;background:#171b2e;border-bottom:1px solid #262a40;display:flex;justify-content:space-between;align-items:center;gap:10px;cursor:move;touch-action:none;user-select:none}.st-head strong{color:#a78bfa;font-size:14px}.st-panel-size{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 12px;background:#101321;border-bottom:1px solid #262a40}.st-panel-size label{display:flex;align-items:center;gap:6px;margin:0;color:#aeb6cc;font-size:10px}.st-panel-size input{width:78px!important;padding:5px!important;text-align:center}",
      ".st-btn{border:0;border-radius:8px;padding:8px 12px;color:#fff;background:#343954;cursor:pointer;font-size:12px}.st-primary{background:linear-gradient(120deg,#7954ec,#a17aff);font-weight:800}.st-danger{background:#b91c1c}",
      ".st-tabs{display:flex;flex-wrap:wrap;overflow:visible;background:#0d0f1a;border-bottom:1px solid #262a40;scrollbar-width:thin}.st-tab{flex:1 1 18%;min-width:72px;border:0;background:transparent;color:#94a3b8;padding:11px 4px;font-size:10px;white-space:nowrap;cursor:pointer;border-bottom:2px solid transparent}.st-tab.active{color:#c4b5fd;border-color:#8b5cf6}",
      ".st-content{flex:1;overflow:auto;padding:14px;font-size:12px}.st-pane{display:none}.st-pane.active{display:block}.st-grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}.st-grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px}.st-row{display:flex;gap:7px;align-items:center}.st-row>*{min-width:0}",
      ".st-note{font-size:11px;color:#9ca3b8;line-height:1.7}.st-status{margin:12px 0 0;padding:9px;border-radius:8px;background:#171b2e;color:#cbd5e1;min-height:36px;font-size:11px;line-height:1.6}",
      ".st-card{padding:10px;margin:8px 0;background:#171b2e;border:1px solid #2b3252;border-radius:10px}.st-card strong{color:#c4b5fd}.st-bottom{padding:12px 14px;border-top:1px solid #262a40;background:#111422;display:flex;gap:8px}.st-bottom button{flex:1}.st-hidden{display:none!important}",
      " .as-analytics-kpis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:10px 0}.as-analytics-kpi{padding:12px;border-radius:12px;border:1px solid #343954;background:#171b2e;display:flex;flex-direction:column;gap:5px}.as-analytics-kpi span{font-size:11px;color:#b9bdd0}.as-analytics-kpi strong{font-size:23px;color:#c4b5fd;font-variant-numeric:tabular-nums}.as-analytics-legend{display:flex;gap:15px;font-size:11px;margin:8px 0;color:#cbd5e1}.as-analytics-legend span:first-child{color:#c4b5fd}.as-analytics-legend span:last-child{color:#67e8f9}.as-analytics-table-wrap{overflow:auto;margin-top:10px}.as-analytics-table{width:100%;border-collapse:collapse;font-size:11px;min-width:520px}.as-analytics-table th,.as-analytics-table td{padding:9px 8px;border-bottom:1px solid #30364f;text-align:right;vertical-align:top}.as-analytics-table th{color:#c4b5fd;background:#0d0f1a;position:sticky;top:0}.as-analytics-table td{color:#e2e8f0}.as-analytics-countries{display:grid;gap:7px;margin-top:10px}.as-analytics-country{display:flex;justify-content:space-between;gap:10px;padding:7px 9px;background:#0d0f1a;border-radius:8px;font-size:12px}.as-analytics-country strong{color:#c4b5fd}.as-analytics-status-error{color:#fca5a5!important}",
      ".as-dynamic-area{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:center;padding:14px 0;position:relative}.as-dynamic-area[data-position='floating-left']{position:fixed;left:18px;bottom:155px;z-index:45;flex-direction:column;align-items:flex-start;padding:0}.as-dynamic-area[data-position='floating-right']{position:fixed;right:18px;bottom:90px;z-index:45;flex-direction:column;align-items:flex-end;padding:0}.as-dynamic-area[data-position='header-nav']{padding:0;display:inline-flex}.as-dynamic-area[data-position='hero-actions']{padding:0;display:contents}",
".as-custom-button{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:11px 18px;border-radius:11px;text-decoration:none;font:700 13px Cairo,Tahoma,sans-serif;cursor:pointer;transition:.2s;border:1px solid transparent}.as-custom-button:hover{transform:translateY(-2px);filter:brightness(1.08)}.as-custom-button.secondary{background:#171827;border-color:#55516f;color:#fff}.as-custom-button.outline{background:transparent;border-color:#a78bfa;color:inherit}.as-custom-button.whatsapp{background:#168c58;color:#fff}.as-custom-button.gradient{background:linear-gradient(120deg,#7954ec,#a17aff);color:#fff}",
".as-page-overlay{position:fixed;inset:0;z-index:9990;background:#03040bd9;backdrop-filter:blur(7px);display:none;align-items:stretch}.as-page-panel{height:100%;width:min(760px,94vw);overflow:auto;background:#111422;color:#f5f6ff;box-shadow:0 0 60px #000b;padding:0 24px 32px}.as-page-head{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;align-items:center;padding:16px 0;background:inherit;border-bottom:1px solid #ffffff22}.as-page-content{max-width:100%;margin:auto;padding:24px 0}.as-page-content h2{font-size:clamp(24px,4vw,38px);margin-bottom:8px}.as-page-content p{white-space:pre-wrap;line-height:1.9}.as-element{padding:20px;border-radius:15px;margin:16px auto;max-width:100%;overflow:hidden}.as-element img{display:block;width:100%;height:auto;max-height:680px;object-fit:contain;border-radius:10px}.as-element-button{display:inline-flex;padding:11px 18px;border-radius:10px;background:linear-gradient(120deg,#7954ec,#a17aff);color:#fff;text-decoration:none;font-weight:800}.as-draft-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.as-draft-actions button{font-size:11px}.as-form-hint{font-size:11px;color:#9ca3b8;line-height:1.6;margin-top:5px}",
      ".st-admin-inserted{padding:30px 0}.st-admin-inserted .st-added-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:16px}.st-added-card{background:#171827;border:1px solid #383354;border-radius:16px;padding:18px;box-shadow:0 12px 32px #0004}.st-added-card img{width:100%;max-height:170px;object-fit:cover;border-radius:10px;margin-bottom:10px}.st-added-icon{font-size:26px;margin-bottom:8px}.st-added-card h3{font-size:17px;margin-bottom:6px}.st-added-card p{font-size:13px;color:var(--as-secondary,#b9bdd0)}",
      "@keyframes asPulse{50%{transform:scale(1.035);filter:brightness(1.12)}}@keyframes asFadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}@keyframes asZoom{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}",
      ".as-admin-fade{animation:asFadeUp .65s ease both}.as-admin-zoom{animation:asZoom .65s ease both}.as-admin-pulse{animation:asPulse 1.8s ease-in-out infinite}@media(max-width:520px){#studio-overlay{width:100vw;max-width:100vw}.st-admin-inserted .st-added-grid{grid-template-columns:1fr}}"
    ].join("\n");
    var style = document.createElement("style");
    style.id = "as-admin-styles";
    style.textContent = css + "\n#as-free-canvas{position:absolute;top:0;left:0;width:100%;height:1px;z-index:85;pointer-events:none;overflow:visible}.as-visual-item{position:absolute;box-sizing:border-box;max-width:95vw;pointer-events:auto;touch-action:pan-y;transition:box-shadow .16s ease,border-radius .16s ease}.as-visual-item img{display:block;width:100%;height:auto;max-width:95vw}.as-visual-item.as-v-picked{outline:2px dashed #c4b5fd;outline-offset:3px;z-index:999!important}.as-visual-resize{display:none;position:absolute;right:-8px;bottom:-8px;width:18px;height:18px;border:2px solid #fff;border-radius:50%;background:#7954ec;cursor:nwse-resize;z-index:3}.as-v-editing .as-visual-resize{display:block}.as-v-editing .as-visual-item{cursor:move}.as-v-icon-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px;margin-top:8px}.as-v-icon-grid button{font-size:22px;padding:7px 2px;border:1px solid #343954;border-radius:8px;background:#0b0d17;color:#fff;cursor:pointer}.as-v-icon-grid button:hover{border-color:#a78bfa;background:#24203a}.as-v-property-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.as-v-property-grid>div{min-width:0}.as-v-list-row{display:flex;align-items:center;gap:7px;padding:8px;background:#0b0d17;border:1px solid #333954;border-radius:8px;margin:6px 0}.as-v-list-row .st-btn{white-space:nowrap}.as-v-list-row span{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.as-v-help{padding:8px;border-radius:8px;background:#231d3c;color:#d8ccff;font-size:11px;line-height:1.7;margin:8px 0}.as-v-gradient-check{display:flex;align-items:center;gap:8px}.as-v-gradient-check input{width:auto!important}@media(max-width:520px){.as-v-icon-grid{grid-template-columns:repeat(5,minmax(0,1fr))}}";
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
      "<div class='st-head'><strong>🎨 استوديو التحكم المباشر — اسحب الشريط لتحريك اللوحة</strong><div class='st-row'><button type='button' class='st-btn st-danger st-hidden' id='st-logout'>خروج</button><button type='button' class='st-btn' id='st-close'>✕ إغلاق</button></div></div>",
      "<div class='st-panel-size'><label>العرض px <input type='number' id='st-panel-width' min='320' max='1800' value='480'></label><label>الارتفاع px <input type='number' id='st-panel-height' min='360' max='1400' value='760'></label></div>",
      "<div id='st-login' class='st-content'><h3 style='color:#38bdf8;font-size:16px;margin:0 0 12px'>تسجيل دخول الأدمن</h3>",
      "<label for='st-em'>البريد الإلكتروني</label><input type='email' id='st-em' value='rafathamed9@gmail.com' autocomplete='username'>",
      "<label for='st-pw'>كلمة المرور</label><input type='password' id='st-pw' placeholder='••••••••' autocomplete='current-password'>",
      "<button type='button' id='st-go' class='st-btn st-primary' style='width:100%;margin-top:14px;padding:11px'>دخول للوحة التحكم</button>",
      "<p class='st-note' style='margin-top:12px'>الدخول عبر Firebase Authentication. لا يتم حفظ كلمة المرور داخل الموقع.</p><div id='st-login-msg' class='st-status' role='status'>أدخل بيانات حساب الإدارة للمتابعة.</div></div>",
      "<div id='st-body' class='st-hidden' style='flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden'>",
      "<div class='st-tabs'><button type='button' class='st-tab active' data-t='p-txt'>النصوص</button><button type='button' class='st-tab' data-t='p-col'>الألوان</button><button type='button' class='st-tab' data-t='p-anm'>الخط</button><button type='button' class='st-tab' data-t='p-buttons'>الأزرار</button><button type='button' class='st-tab' data-t='p-pages'>الصفحات</button><button type='button' class='st-tab' data-t='p-elements'>العناصر</button><button type='button' class='st-tab' data-t='p-visual'>المحرر المرئي</button><button type='button' class='st-tab' data-t='p-add'>البطاقات</button><button type='button' class='st-tab' data-t='p-analytics'>الإحصائيات</button></div>",
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
      "\n<section id=\"p-buttons\" class=\"st-pane\">\n  <div class=\"st-card\"><strong>➕ إنشاء زر جديد</strong>\n    <label>اسم الزر</label><input id=\"bt-label\" placeholder=\"مثال: اشترِ الآن\">\n    <label>أيقونة الزر</label><input id=\"bt-icon\" value=\"🔗\" maxlength=\"12\">\n    <label>رابط الزر (اختياري عند فتح صفحة جانبية)</label><input id=\"bt-url\" placeholder=\"https://... أو مسار داخلي\">\n    <label>فتح صفحة جانبية</label><select id=\"bt-page\"><option value=\"\">لا يوجد – استخدم الرابط</option></select>\n    <label>مكان الزر</label><select id=\"bt-position\">\n      <option value=\"header-nav\">شريط القائمة العلوي</option><option value=\"hero-actions\">بجوار زر التحميل الرئيسي</option>\n      <option value=\"before-hero\">قبل الواجهة الرئيسية</option><option value=\"after-hero\">بعد الواجهة الرئيسية</option>\n      <option value=\"before-features\">قبل قسم المميزات</option><option value=\"after-features\">بعد قسم المميزات</option>\n      <option value=\"before-gallery\">قبل معرض الصور</option><option value=\"after-gallery\">بعد معرض الصور</option>\n      <option value=\"before-install\">قبل طريقة التثبيت</option><option value=\"after-install\">بعد طريقة التثبيت</option>\n      <option value=\"before-download\">قبل صندوق التحميل</option><option value=\"after-download\">بعد صندوق التحميل</option>\n      <option value=\"before-contact\">قبل التواصل</option><option value=\"after-contact\">بعد التواصل</option>\n      <option value=\"before-faq\">قبل الأسئلة الشائعة</option><option value=\"after-faq\">بعد الأسئلة الشائعة</option>\n      <option value=\"before-footer\">قبل نهاية الموقع</option>\n      <option value=\"floating-left\">زر عائم يسار الشاشة</option><option value=\"floating-right\">زر عائم يمين الشاشة</option>\n    </select>\n    <label>شكل الزر</label><select id=\"bt-style\"><option value=\"gradient\">متدرج بنفسجي</option><option value=\"secondary\">داكن</option><option value=\"outline\">إطار شفاف</option><option value=\"whatsapp\">أخضر</option></select>\n    <input type=\"hidden\" id=\"bt-edit-id\"><button type=\"button\" id=\"bt-add\" class=\"st-btn st-primary\" style=\"width:100%;margin-top:10px\">➕ إضافة الزر</button>\n    <p class=\"as-form-hint\">يمكن تعديل الزر أو حذفه من القائمة، ثم اضغط حفظ التعديلات لنشره.</p>\n  </div><div id=\"bt-list\"></div>\n</section>\n<section id=\"p-pages\" class=\"st-pane\">\n  <div class=\"st-card\"><strong>📄 إنشاء صفحة جانبية مستقلة</strong>\n    <label>عنوان الصفحة</label><input id=\"pg-title\" placeholder=\"مثال: من نحن\">\n    <label>عنوان فرعي</label><input id=\"pg-subtitle\" placeholder=\"نبذة قصيرة\">\n    <label>محتوى الصفحة</label><textarea id=\"pg-body\" rows=\"5\" placeholder=\"اكتب محتوى الصفحة هنا...\"></textarea>\n    <div class=\"st-grid2\">\n      <div><label>لون الخلفية</label><input type=\"color\" id=\"pg-bg\" value=\"#111422\"></div>\n      <div><label>لون النص</label><input type=\"color\" id=\"pg-color\" value=\"#f5f6ff\"></div>\n      <div><label>لون العنوان</label><input type=\"color\" id=\"pg-accent\" value=\"#a78bfa\"></div>\n      <div><label>عرض الصفحة</label><select id=\"pg-width\"><option value=\"760px\">واسعة</option><option value=\"620px\">متوسطة</option><option value=\"480px\">ضيقة</option></select></div>\n    </div>\n    <label>مكان فتح الصفحة</label><select id=\"pg-side\"><option value=\"right\">من اليمين</option><option value=\"left\">من اليسار</option></select>\n    <input type=\"hidden\" id=\"pg-edit-id\"><button type=\"button\" id=\"pg-add\" class=\"st-btn st-primary\" style=\"width:100%;margin-top:10px\">➕ إنشاء الصفحة</button>\n    <p class=\"as-form-hint\">كل صفحة تنشأ تحصل على رابط تلقائي في قائمة الموقع، ويمكن ربطها بأي زر أيضًا.</p>\n  </div><div id=\"pg-list\"></div>\n</section>\n<section id=\"p-elements\" class=\"st-pane\">\n  <div class=\"st-card\"><strong>🧩 إضافة أي عنصر إلى الموقع</strong>\n    <label>نوع العنصر</label><select id=\"el-type\"><option value=\"text\">عنوان ونص</option><option value=\"image\">صورة</option><option value=\"button\">زر ورابط</option><option value=\"banner\">شريط / إعلان</option><option value=\"divider\">فاصل</option></select>\n    <label>العنوان</label><input id=\"el-title\" placeholder=\"عنوان العنصر\">\n    <label>النص أو الوصف</label><textarea id=\"el-text\" rows=\"3\" placeholder=\"المحتوى...\"></textarea>\n    <label>رابط صورة HTTPS (للصور)</label><input id=\"el-image\" placeholder=\"https://...\">\n    <label>نص الزر (لنوع زر)</label><input id=\"el-label\" placeholder=\"اضغط هنا\">\n    <label>رابط الزر</label><input id=\"el-url\" placeholder=\"https://... أو مسار داخلي\">\n    <label>مكان العنصر</label><select id=\"el-position\">\n      <option value=\"top\">بداية الصفحة بعد القائمة</option><option value=\"before-hero\">قبل الواجهة الرئيسية</option><option value=\"after-hero\">بعد الواجهة الرئيسية</option>\n      <option value=\"before-features\">قبل قسم المميزات</option><option value=\"after-features\">بعد قسم المميزات</option>\n      <option value=\"before-gallery\">قبل معرض الصور</option><option value=\"after-gallery\">بعد معرض الصور</option>\n      <option value=\"before-install\">قبل طريقة التثبيت</option><option value=\"after-install\">بعد طريقة التثبيت</option>\n      <option value=\"before-download\">قبل صندوق التحميل</option><option value=\"after-download\">بعد صندوق التحميل</option>\n      <option value=\"before-contact\">قبل التواصل</option><option value=\"after-contact\">بعد التواصل</option>\n      <option value=\"before-faq\">قبل الأسئلة الشائعة</option><option value=\"after-faq\">بعد الأسئلة الشائعة</option>\n      <option value=\"before-footer\">قبل التذييل</option><option value=\"side-page\">داخل صفحة جانبية</option>\n    </select>\n    <label>الصفحة الجانبية المستهدفة (عند اختيار داخل صفحة جانبية)</label><select id=\"el-page\"><option value=\"\">اختر صفحة</option></select>\n    <div class=\"st-grid2\">\n      <div><label>محاذاة العنصر</label><select id=\"el-align\"><option value=\"center\">وسط</option><option value=\"right\">يمين</option><option value=\"left\">يسار</option></select></div>\n      <div><label>عرض العنصر</label><select id=\"el-width\"><option value=\"100%\">كامل</option><option value=\"85%\">85%</option><option value=\"65%\">65%</option><option value=\"50%\">50%</option></select></div>\n      <div><label>خلفية العنصر</label><input type=\"color\" id=\"el-bg\" value=\"#171827\"></div>\n      <div><label>لون النص</label><input type=\"color\" id=\"el-color\" value=\"#f5f6ff\"></div>\n    </div>\n    <input type=\"hidden\" id=\"el-edit-id\"><button type=\"button\" id=\"el-add\" class=\"st-btn st-primary\" style=\"width:100%;margin-top:10px\">➕ إضافة العنصر</button>\n    <p class=\"as-form-hint\">يمكنك وضع العنوان أو النص أو الصورة أو الزر أو الإعلان في أي منطقة متاحة أو داخل صفحة جانبية.</p>\n  </div><div id=\"el-list\"></div>\n</section>",
      ,
      "      \n<section id=\"p-visual\" class=\"st-pane\">\n  <div class=\"st-card\">\n    <strong>🖼️ محرر الموقع بالسحب والإفلات</strong>\n    <p class=\"as-v-help\">أضف صورة أو نصًا أو أيقونة أو زرًا. سيظهر العنصر فوق الموقع، ويمكنك سحبه إلى أي مكان وتغيير حجمه. اضغط «تفعيل السحب» لتحريك العناصر، ثم احفظ التعديلات.</p>\n    <div class=\"st-grid2\">\n      <button type=\"button\" id=\"as-v-add-text\" class=\"st-btn st-primary\">＋ إضافة نص</button>\n      <button type=\"button\" id=\"as-v-add-button\" class=\"st-btn\">＋ إضافة زر</button>\n      <button type=\"button\" id=\"as-v-upload\" class=\"st-btn\">⬆ رفع صورة من الجهاز</button>\n      <button type=\"button\" id=\"as-v-toggle\" class=\"st-btn\">✥ تفعيل السحب</button>\n    </div>\n    <input type=\"file\" id=\"as-v-file\" accept=\"image/png,image/jpeg,image/webp,image/gif\" class=\"st-hidden\">\n    <label>الأيقونات الجاهزة — اضغط لإضافتها للموقع</label>\n    <div class=\"as-v-icon-grid\" id=\"as-v-icons\">\n      <button type=\"button\" data-v-icon=\"⭐\">⭐</button><button type=\"button\" data-v-icon=\"✨\">✨</button><button type=\"button\" data-v-icon=\"❤️\">❤️</button><button type=\"button\" data-v-icon=\"🔥\">🔥</button><button type=\"button\" data-v-icon=\"🚀\">🚀</button><button type=\"button\" data-v-icon=\"💎\">💎</button>\n      <button type=\"button\" data-v-icon=\"📥\">📥</button><button type=\"button\" data-v-icon=\"📦\">📦</button><button type=\"button\" data-v-icon=\"🛒\">🛒</button><button type=\"button\" data-v-icon=\"🔔\">🔔</button><button type=\"button\" data-v-icon=\"💬\">💬</button><button type=\"button\" data-v-icon=\"☎️\">☎️</button>\n      <button type=\"button\" data-v-icon=\"✓\">✓</button><button type=\"button\" data-v-icon=\"＋\">＋</button><button type=\"button\" data-v-icon=\"→\">→</button><button type=\"button\" data-v-icon=\"◆\">◆</button><button type=\"button\" data-v-icon=\"●\">●</button><button type=\"button\" data-v-icon=\"✦\">✦</button>\n    </div>\n    <p id=\"as-v-upload-status\" class=\"st-note\">الصور تُرفع إلى Firebase Storage وتظل محفوظة كرابط داخل الموقع.</p>\n  </div>\n  <div class=\"st-card\">\n    <strong>🎨 تنسيق العنصر المحدد</strong>\n    <p id=\"as-v-selected-name\" class=\"st-note\">اختر عنصرًا من القائمة أو اضغط عليه بعد تفعيل السحب.</p>\n    <label>النص أو محتوى الزر / الأيقونة</label><input id=\"as-v-content\" placeholder=\"اكتب النص هنا\">\n    <label>رابط الزر (اختياري)</label><input id=\"as-v-link\" placeholder=\"https://... أو مسار داخل الموقع\">\n    <div class=\"as-v-property-grid\">\n      <div><label>حجم الخط / الأيقونة</label><input type=\"number\" id=\"as-v-font-size\" min=\"10\" max=\"140\" value=\"24\"></div>\n      <div><label>العرض بالبكسل</label><input type=\"number\" id=\"as-v-width\" min=\"40\" max=\"1600\" value=\"280\"></div>\n      <div><label>لون النص</label><input type=\"color\" id=\"as-v-color\" value=\"#ffffff\"></div>\n      <div><label>لون الخلفية</label><input type=\"color\" id=\"as-v-fill1\" value=\"#7954ec\"></div>\n      <div><label>لون التدرج الثاني</label><input type=\"color\" id=\"as-v-fill2\" value=\"#a17aff\"></div>\n      <div><label>لون الحدود</label><input type=\"color\" id=\"as-v-border-color\" value=\"#a78bfa\"></div>\n      <div><label>سمك الحدود</label><input type=\"number\" id=\"as-v-border-width\" min=\"0\" max=\"20\" value=\"0\"></div>\n      <div><label>استدارة الزوايا</label><input type=\"number\" id=\"as-v-radius\" min=\"0\" max=\"120\" value=\"14\"></div>\n    </div>\n    <label class=\"as-v-gradient-check\"><input type=\"checkbox\" id=\"as-v-gradient\"> تفعيل التدرج اللوني</label>\n    <label>الظل</label><select id=\"as-v-shadow\"><option value=\"none\">بدون ظل</option><option value=\"soft\">ظل ناعم</option><option value=\"strong\">ظل قوي</option></select>\n    <div class=\"st-grid2\">\n      <button type=\"button\" id=\"as-v-apply\" class=\"st-btn st-primary\">تطبيق التنسيق</button>\n      <button type=\"button\" id=\"as-v-delete\" class=\"st-btn st-danger\">حذف العنصر المحدد</button>\n    </div>\n  </div>\n  <div class=\"st-card\"><strong>📋 عناصر التصميم الحر</strong><div id=\"as-v-list\"><p class=\"st-note\">لم تتم إضافة عناصر بعد.</p></div></div>\n</section>\n" +
      "\n<section id=\"p-analytics\" class=\"st-pane\">\n  <div class=\"st-card\">\n    <strong>📊 إحصائيات زوار الموقع</strong>\n    <p class=\"st-note\">آخر 30 يومًا افتراضيًا. عنوان IP والموقع التقريبي متاحان لحساب الإدارة فقط.</p>\n    <div class=\"st-grid2\">\n      <div><label>الفترة الزمنية</label><select id=\"as-analytics-days\"><option value=\"7\">آخر 7 أيام</option><option value=\"30\" selected>آخر 30 يومًا</option></select></div>\n      <div style=\"display:flex;align-items:end\"><button type=\"button\" id=\"as-analytics-refresh\" class=\"st-btn st-primary\" style=\"width:100%\">↻ تحديث الإحصائيات</button></div>\n    </div>\n    <p id=\"as-analytics-status\" class=\"st-status\" role=\"status\">اضغط تحديث الإحصائيات لجلب البيانات.</p>\n  </div>\n  <div class=\"as-analytics-kpis\">\n    <div class=\"as-analytics-kpi\"><span>إجمالي الزيارات</span><strong id=\"as-kpi-visits\">—</strong></div>\n    <div class=\"as-analytics-kpi\"><span>الزوار الفريدون</span><strong id=\"as-kpi-unique\">—</strong></div>\n    <div class=\"as-analytics-kpi\"><span>نقرات التحميل</span><strong id=\"as-kpi-downloads\">—</strong></div>\n    <div class=\"as-analytics-kpi\"><span>الدول</span><strong id=\"as-kpi-countries\">—</strong></div>\n  </div>\n  <div class=\"st-card\"><strong>📈 الزيارات والتنزيلات حسب اليوم</strong>\n    <div class=\"as-analytics-legend\"><span>■ الزيارات</span><span>■ نقرات التحميل</span></div>\n    <canvas id=\"as-analytics-chart\" height=\"210\" aria-label=\"رسم الزيارات والتنزيلات اليومية\"></canvas>\n  </div>\n  <div class=\"st-card\"><strong>🌍 خريطة مواقع الزوار</strong>\n    <p class=\"st-note\">المواقع تقريبية على مستوى المدينة أو منطقة مزود الإنترنت، وليست عنوانًا منزليًا دقيقًا.</p>\n    <div id=\"as-analytics-map\" style=\"height:320px;border-radius:12px;overflow:hidden;background:#0b0d17;margin-top:10px\"></div>\n  </div>\n  <div class=\"st-card\"><strong>🏳️ الزيارات حسب الدولة</strong>\n    <div id=\"as-analytics-countries\" class=\"as-analytics-countries\"><p class=\"st-note\">لا توجد بيانات بعد.</p></div>\n  </div>\n  <div class=\"st-card\"><strong>🧭 أحدث الزيارات وعناوين IP</strong>\n    <p class=\"st-note\">يتم الاحتفاظ بسجلات الزيارات لمدة 30 يومًا ثم حذفها تلقائيًا عند وصول طلبات تتبع جديدة.</p>\n    <div class=\"as-analytics-table-wrap\"><table class=\"as-analytics-table\">\n      <thead><tr><th>التاريخ</th><th>IP</th><th>الموقع</th><th>الصفحة</th></tr></thead>\n      <tbody id=\"as-analytics-recent\"><tr><td colspan=\"4\">لا توجد بيانات بعد.</td></tr></tbody>\n    </table></div>\n  </div>\n</section>",
      "</div><div class='st-bottom'><button type='button' id='st-save' class='st-btn st-primary'>💾 حفظ التعديلات</button><button type='button' id='st-refresh' class='st-btn'>إعادة تحميل</button></div><div id='st-msg' class='st-status' role='status' style='margin:0 14px 12px'></div></div>"
    ].join("");
    document.body.appendChild(overlay);

    function setPanelSize(){
      var w=Math.max(320,Math.min(1800,Number(document.getElementById("st-panel-width").value)||480));
      var h=Math.max(360,Math.min(1400,Number(document.getElementById("st-panel-height").value)||760));
      overlay.style.width=w+"px";overlay.style.height=h+"px";
      document.getElementById("st-panel-width").value=w;document.getElementById("st-panel-height").value=h;
    }
    document.getElementById("st-panel-width").addEventListener("change",setPanelSize);
    document.getElementById("st-panel-height").addEventListener("change",setPanelSize);
    var panelDrag=null,head=overlay.querySelector(".st-head");
    head.addEventListener("pointerdown",function(event){
      if(event.button!==0||event.target.closest("button,input,select"))return;
      var rect=overlay.getBoundingClientRect();panelDrag={x:event.clientX,y:event.clientY,left:rect.left,top:rect.top};
      head.setPointerCapture(event.pointerId);event.preventDefault();
    });
    head.addEventListener("pointermove",function(event){
      if(!panelDrag)return;
      var left=panelDrag.left+event.clientX-panelDrag.x,top=panelDrag.top+event.clientY-panelDrag.y;
      left=Math.max(0,Math.min(window.innerWidth-overlay.offsetWidth,left));top=Math.max(0,Math.min(window.innerHeight-overlay.offsetHeight,top));
      overlay.style.left=left+"px";overlay.style.top=top+"px";overlay.style.right="auto";
    });
    function endPanelDrag(){panelDrag=null;}
    head.addEventListener("pointerup",endPanelDrag);head.addEventListener("pointercancel",endPanelDrag);
    fab.addEventListener("click", function () {
      var emailField = document.getElementById("st-em");
      if (emailField && !emailField.value.trim()) emailField.value = ADMIN_EMAIL;
      overlay.style.display = "flex";
    });
    document.getElementById("as-analytics-refresh").addEventListener("click", refreshAnalytics);
    document.getElementById("st-close").addEventListener("click", function () { overlay.style.display = "none"; });
    document.querySelectorAll("#studio-overlay .st-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        document.querySelectorAll("#studio-overlay .st-tab").forEach(function (t) { t.classList.toggle("active", t === tab); });
        document.querySelectorAll("#studio-overlay .st-pane").forEach(function (p) { p.classList.toggle("active", p.id === tab.getAttribute("data-t")); });
        if (tab.getAttribute("data-t") === "p-analytics") refreshAnalytics();
      });
    });
    document.getElementById("st-go").addEventListener("click", login);
    document.getElementById("st-pw").addEventListener("keydown", function (e) { if (e.key === "Enter") login(); });
    document.getElementById("st-logout").addEventListener("click", function () { auth.signOut(); });
    document.getElementById("st-save").addEventListener("click", save);
    document.getElementById("st-refresh").addEventListener("click", loadContent);
    document.getElementById("nb-add").addEventListener("click", addCard);
    document.getElementById("bt-add").addEventListener("click", addButton);
    document.getElementById("pg-add").addEventListener("click", addPage);
    document.getElementById("el-add").addEventListener("click", addElement);
    document.getElementById("as-v-add-text").addEventListener("click", function () { addVisualItem("text"); });
    document.getElementById("as-v-add-button").addEventListener("click", function () { addVisualItem("button"); });
    document.getElementById("as-v-upload").addEventListener("click", function () { document.getElementById("as-v-file").click(); });
    document.getElementById("as-v-file").addEventListener("change", uploadVisualImage);
    document.getElementById("as-v-toggle").addEventListener("click", function () { setVisualEditMode(!visualEditMode); });
    document.getElementById("as-v-icons").addEventListener("click", function (event) {
      var iconButton = event.target.closest("[data-v-icon]");
      if (iconButton) addVisualItem("icon", { text: iconButton.getAttribute("data-v-icon") });
    });
    document.getElementById("as-v-apply").addEventListener("click", applyVisualControls);
    document.getElementById("as-v-delete").addEventListener("click", deleteActiveVisualItem);
    document.getElementById("p-visual").addEventListener("input", function (event) {
      if (event.target && event.target.id !== "as-v-file") applyVisualControls(false);
    });
    document.getElementById("p-visual").addEventListener("change", function (event) {
      if (event.target && event.target.id === "as-v-gradient") applyVisualControls(false);
    });
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
    renderCustomButtons(Array.isArray(d.customButtons) ? d.customButtons : []);
    renderSidePages(Array.isArray(d.sidePages) ? d.sidePages : []);
    renderElements(Array.isArray(d.customElements) ? d.customElements : [], Array.isArray(d.sidePages) ? d.sidePages : []);
    renderVisualItems(Array.isArray(d.customCanvasItems) ? d.customCanvasItems : []);
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


  function makeId(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,7);
  }
  function field(id) { var el = document.getElementById(id); return el ? el.value : ""; }
  function refreshPageSelects() {
    ["bt-page","el-page"].forEach(function (id) {
      var select = document.getElementById(id); if (!select) return;
      var old = select.value, first = id === "bt-page" ? "لا يوجد – استخدم الرابط" : "اختر صفحة";
      select.textContent = "";
      var empty = document.createElement("option"); empty.value = ""; empty.textContent = first; select.appendChild(empty);
      draftPages.forEach(function (page) {
        var option = document.createElement("option"); option.value = page.id; option.textContent = page.title; select.appendChild(option);
      });
      if (draftPages.some(function (page) { return page.id === old; })) select.value = old;
    });
  }
  function makeDraftRow(listId, titleText, detailsText, onEdit, onDelete) {
    var list = document.getElementById(listId); if (!list) return;
    var row = document.createElement("div"); row.className = "st-card";
    var title = document.createElement("strong"); title.textContent = titleText;
    var details = document.createElement("p"); details.className = "st-note"; details.textContent = detailsText || "";
    var actions = document.createElement("div"); actions.className = "as-draft-actions";
    var edit = document.createElement("button"); edit.type = "button"; edit.className = "st-btn"; edit.textContent = "تعديل"; edit.addEventListener("click", onEdit);
    var del = document.createElement("button"); del.type = "button"; del.className = "st-btn st-danger"; del.textContent = "حذف"; del.addEventListener("click", onDelete);
    actions.appendChild(edit); actions.appendChild(del); row.appendChild(title); row.appendChild(details); row.appendChild(actions); list.appendChild(row);
  }
  function renderDraftButtons() {
    var list = document.getElementById("bt-list"); if (!list) return; list.textContent = "";
    if (!draftButtons.length) { var empty = document.createElement("p"); empty.className = "st-note"; empty.textContent = "لم تتم إضافة أزرار بعد."; list.appendChild(empty); }
    draftButtons.forEach(function (item) {
      var page = draftPages.find(function (p) { return p.id === item.pageId; });
      makeDraftRow("bt-list", (item.icon || "") + " " + item.label, "المكان: " + item.position + (page ? " · يفتح صفحة: " + page.title : " · الرابط: " + (item.url || "")), function () {
        document.getElementById("bt-edit-id").value = item.id;
        document.getElementById("bt-label").value = item.label || "";
        document.getElementById("bt-icon").value = item.icon || "";
        document.getElementById("bt-url").value = item.url || "";
        document.getElementById("bt-page").value = item.pageId || "";
        document.getElementById("bt-position").value = item.position || "header-nav";
        document.getElementById("bt-style").value = item.style || "gradient";
        document.getElementById("bt-add").textContent = "حفظ تعديل الزر";
      }, function () {
        draftButtons = draftButtons.filter(function (b) { return b.id !== item.id; });
        renderDraftButtons();
      });
    });
    refreshPageSelects();
  }
  function addButton() {
    var label = field("bt-label").trim(), pageId = field("bt-page"), rawUrl = field("bt-url").trim();
    var link = pageId ? "" : url(rawUrl, true);
    if (!label) { status("st-msg", "اكتب اسم الزر أولًا.", "error"); return; }
    if (pageId && !draftPages.some(function (p) { return p.id === pageId; })) { status("st-msg", "الصفحة المستهدفة غير موجودة.", "error"); return; }
    if (!pageId && !link) { status("st-msg", "أدخل رابطًا صالحًا أو اختر صفحة جانبية.", "error"); return; }
    var id = field("bt-edit-id");
    var item = {id:id || makeId("button"),label:label.slice(0,90),icon:field("bt-icon").trim().slice(0,12),url:link,pageId:pageId,position:field("bt-position"),style:field("bt-style")};
    var index = draftButtons.findIndex(function (b) { return b.id === id; });
    if (index >= 0) draftButtons[index] = item; else draftButtons.push(item);
    document.getElementById("bt-edit-id").value = "";
    document.getElementById("bt-label").value = ""; document.getElementById("bt-url").value = "";
    document.getElementById("bt-add").textContent = "➕ إضافة الزر";
    renderDraftButtons(); status("st-msg", "تم تحديث قائمة الأزرار. اضغط حفظ التعديلات لنشرها.", "success");
  }
  function renderDraftPages() {
    var list = document.getElementById("pg-list"); if (!list) return; list.textContent = "";
    if (!draftPages.length) { var empty = document.createElement("p"); empty.className = "st-note"; empty.textContent = "لا توجد صفحات جانبية بعد."; list.appendChild(empty); }
    draftPages.forEach(function (page) {
      makeDraftRow("pg-list", "📄 " + page.title, (page.subtitle || "بدون وصف") + " · تفتح من " + (page.side === "left" ? "اليسار" : "اليمين"), function () {
        document.getElementById("pg-edit-id").value = page.id;
        document.getElementById("pg-title").value = page.title || "";
        document.getElementById("pg-subtitle").value = page.subtitle || "";
        document.getElementById("pg-body").value = page.body || "";
        document.getElementById("pg-bg").value = color(page.background, "#111422");
        document.getElementById("pg-color").value = color(page.textColor, "#f5f6ff");
        document.getElementById("pg-accent").value = color(page.accent, "#a78bfa");
        document.getElementById("pg-width").value = page.width || "760px";
        document.getElementById("pg-side").value = page.side || "right";
        document.getElementById("pg-add").textContent = "حفظ تعديل الصفحة";
      }, function () {
        draftPages = draftPages.filter(function (p) { return p.id !== page.id; });
        draftButtons = draftButtons.map(function (b) { if (b.pageId === page.id) { b.pageId = ""; b.url = "#"; } return b; }).filter(function (b) { return b.url !== "#"; });
        draftElements = draftElements.filter(function (el) { return el.pageId !== page.id; });
        renderDraftPages(); renderDraftButtons(); renderDraftElements();
      });
    });
    refreshPageSelects();
  }
  function addPage() {
    var title = field("pg-title").trim();
    if (!title) { status("st-msg", "اكتب عنوان الصفحة أولًا.", "error"); return; }
    var id = field("pg-edit-id");
    var item = {id:id || makeId("page"),title:title.slice(0,100),subtitle:field("pg-subtitle").trim().slice(0,180),body:field("pg-body").slice(0,8000),background:color(field("pg-bg"),"#111422"),textColor:color(field("pg-color"),"#f5f6ff"),accent:color(field("pg-accent"),"#a78bfa"),width:field("pg-width"),side:field("pg-side")};
    var index = draftPages.findIndex(function (p) { return p.id === id; });
    if (index >= 0) draftPages[index] = item; else draftPages.push(item);
    ["pg-edit-id","pg-title","pg-subtitle","pg-body"].forEach(function (key) { document.getElementById(key).value = ""; });
    document.getElementById("pg-add").textContent = "➕ إنشاء الصفحة";
    renderDraftPages(); renderDraftButtons(); renderDraftElements();
    status("st-msg", "تم تجهيز الصفحة الجانبية. احفظ التعديلات لنشرها.", "success");
  }
  function renderDraftElements() {
    var list = document.getElementById("el-list"); if (!list) return; list.textContent = "";
    if (!draftElements.length) { var empty = document.createElement("p"); empty.className = "st-note"; empty.textContent = "لم تتم إضافة عناصر مخصصة بعد."; list.appendChild(empty); }
    draftElements.forEach(function (item) {
      var page = draftPages.find(function (p) { return p.id === item.pageId; });
      makeDraftRow("el-list", (item.type || "text") + " · " + (item.title || item.text || item.label || "عنصر"), "المكان: " + item.position + (page ? " · " + page.title : ""), function () {
        document.getElementById("el-edit-id").value = item.id;
        document.getElementById("el-type").value = item.type || "text";
        document.getElementById("el-title").value = item.title || "";
        document.getElementById("el-text").value = item.text || "";
        document.getElementById("el-image").value = item.imageUrl || "";
        document.getElementById("el-label").value = item.label || "";
        document.getElementById("el-url").value = item.url || "";
        document.getElementById("el-position").value = item.position || "after-hero";
        document.getElementById("el-page").value = item.pageId || "";
        document.getElementById("el-align").value = item.align || "center";
        document.getElementById("el-width").value = item.width || "100%";
        document.getElementById("el-bg").value = color(item.background, "#171827");
        document.getElementById("el-color").value = color(item.textColor, "#f5f6ff");
        document.getElementById("el-add").textContent = "حفظ تعديل العنصر";
      }, function () {
        draftElements = draftElements.filter(function (el) { return el.id !== item.id; });
        renderDraftElements();
      });
    });
    refreshPageSelects();
  }
  function addElement() {
    var type = field("el-type"), title = field("el-title").trim(), textValue = field("el-text").trim();
    var imageRaw = field("el-image").trim(), imageUrl = imageRaw ? url(imageRaw, false) : "";
    var buttonUrl = field("el-url").trim(), pageId = field("el-page"), position = field("el-position");
    if (type === "image" && !imageUrl) { status("st-msg", "أدخل رابط صورة صحيحًا يبدأ بـ HTTPS.", "error"); return; }
    if (type === "button" && !pageId && !url(buttonUrl, true)) { status("st-msg", "أدخل رابطًا صالحًا للزر أو اختر رابط صفحة جانبية.", "error"); return; }
    if (position === "side-page" && (!pageId || !draftPages.some(function (p) { return p.id === pageId; }))) { status("st-msg", "اختر الصفحة الجانبية التي سيظهر العنصر داخلها.", "error"); return; }
    if (type !== "divider" && !title && !textValue && !imageUrl && !field("el-label").trim()) { status("st-msg", "أضف محتوى للعنصر قبل الحفظ.", "error"); return; }
    var id = field("el-edit-id");
    var item = {id:id || makeId("element"),type:type,title:title.slice(0,120),text:textValue.slice(0,4000),imageUrl:imageUrl,label:field("el-label").trim().slice(0,100),url:pageId && type === "button" ? "" : (url(buttonUrl,true) || ""),pageId:pageId,position:position,align:field("el-align"),width:field("el-width"),background:color(field("el-bg"),"#171827"),textColor:color(field("el-color"),"#f5f6ff")};
    var index = draftElements.findIndex(function (el) { return el.id === id; });
    if (index >= 0) draftElements[index] = item; else draftElements.push(item);
    document.getElementById("el-edit-id").value = "";
    ["el-title","el-text","el-image","el-label","el-url"].forEach(function (key) { document.getElementById(key).value = ""; });
    document.getElementById("el-add").textContent = "➕ إضافة العنصر";
    renderDraftElements(); status("st-msg", "تمت إضافة العنصر إلى المسودة. اضغط حفظ التعديلات لنشره.", "success");
  }

  function createPositionArea(position, kind, areas) {
    if (areas[position]) return areas[position];
    var area = document.createElement("div");
    area.className = "as-dynamic-area";
    area.dataset.position = position;
    area.dataset.renderKind = kind;
    var target = null, parent = null, before = null;
    var selectors = {
      "top":"header","before-hero":".hero","after-hero":".hero",
      "before-features":"#features","after-features":"#features",
      "before-gallery":"#gallery","after-gallery":"#gallery",
      "before-install":"#install","after-install":"#install",
      "before-download":".download-box","after-download":".download-box",
      "before-contact":"#contact","after-contact":"#contact",
      "before-faq":".faq","after-faq":".faq","before-footer":"footer"
    };
    if (position === "floating-left" || position === "floating-right") {
      parent = document.body;
    } else {
      target = selectors[position] ? document.querySelector(selectors[position]) : null;
      if (target && position.indexOf("after-") === 0 && (position === "after-download" || position === "after-faq")) {
        var afterSection = target.closest("section"); parent = afterSection && afterSection.parentNode; before = afterSection && afterSection.nextSibling;
      } else if (target && position.indexOf("after-") === 0) {
        parent = target.parentNode; before = target.nextSibling;
      } else if (target && (position === "before-download" || position === "before-faq")) {
        var beforeSection = target.closest("section"); parent = beforeSection && beforeSection.parentNode; before = beforeSection;
      } else if (target) {
        if (position === "top") { parent = target.parentNode; before = target.nextSibling; }
        else { parent = target.parentNode; before = target; }
      }
    }
    if (parent) { parent.insertBefore(area, before || null); areas[position] = area; }
    return area;
  }
  function createPageLayer() {
    if (document.getElementById("as-page-overlay")) return;
    var overlay = document.createElement("div");
    overlay.id = "as-page-overlay"; overlay.className = "as-page-overlay";
    var panel = document.createElement("div"); panel.className = "as-page-panel"; panel.id = "as-page-panel";
    panel.innerHTML = "<div class='as-page-head'><strong id='as-page-heading'>صفحة</strong><button type='button' class='as-page-close' id='as-page-close'>✕ إغلاق</button></div><div class='as-page-content' id='as-page-content'></div>";
    overlay.appendChild(panel); document.body.appendChild(overlay);
    document.getElementById("as-page-close").addEventListener("click", closeSidePage);
    overlay.addEventListener("click", function (event) { if (event.target === overlay) closeSidePage(); });
    document.addEventListener("keydown", function (event) { if (event.key === "Escape") closeSidePage(); });
    document.addEventListener("click", function (event) {
      var trigger = event.target.closest ? event.target.closest("[data-as-page]") : null;
      if (!trigger) return;
      event.preventDefault(); openSidePage(trigger.getAttribute("data-as-page"));
    });
  }
  function closeSidePage() { var overlay = document.getElementById("as-page-overlay"); if (overlay) overlay.style.display = "none"; }
  function renderPageElement(item, parent) {
    var node = buildElementNode(item);
    if (node) parent.appendChild(node);
  }
  function openSidePage(id) {
    createPageLayer();
    var page = publishedPages.find(function (p) { return p.id === id; });
    if (!page) return;
    var overlay = document.getElementById("as-page-overlay"), panel = document.getElementById("as-page-panel");
    panel.style.background = color(page.background, "#111422");
    panel.style.color = color(page.textColor, "#f5f6ff");
    panel.style.width = "min(" + (page.width || "760px") + ",94vw)";
    panel.style.marginLeft = page.side === "left" ? "0" : "auto";
    panel.style.marginRight = page.side === "left" ? "auto" : "0";
    document.getElementById("as-page-heading").textContent = page.title;
    var content = document.getElementById("as-page-content"); content.textContent = "";
    var heading = document.createElement("h2"); heading.textContent = page.title; heading.style.color = color(page.accent, "#a78bfa");
    content.appendChild(heading);
    if (page.subtitle) { var sub = document.createElement("p"); sub.className = "as-page-subtitle"; sub.textContent = page.subtitle; content.appendChild(sub); }
    if (page.body) { var body = document.createElement("div"); body.className = "as-page-body"; body.textContent = page.body; content.appendChild(body); }
    draftSafePageElements(id, content);
    overlay.style.display = "flex";
    panel.scrollTop = 0;
  }
  function draftSafePageElements(pageId, content) {
    var items = window.__asPublishedElements || [];
    items.filter(function (item) { return item.position === "side-page" && item.pageId === pageId; }).forEach(function (item) { renderPageElement(item, content); });
  }
  function buildElementNode(item) {
    var wrapper = document.createElement("div"); wrapper.className = "as-element";
    wrapper.style.width = item.width || "100%";
    wrapper.style.marginLeft = item.align === "right" ? "0" : item.align === "left" ? "auto" : "auto";
    wrapper.style.marginRight = item.align === "left" ? "0" : item.align === "right" ? "auto" : "auto";
    wrapper.style.textAlign = item.align || "center";
    wrapper.style.background = item.type === "divider" ? "transparent" : color(item.background, "#171827");
    wrapper.style.color = color(item.textColor, "#f5f6ff");
    if (item.type === "divider") { var hr = document.createElement("hr"); hr.style.border = "0"; hr.style.borderTop = "1px solid " + color(item.textColor, "#8b8b9d"); wrapper.style.padding = "0"; wrapper.appendChild(hr); return wrapper; }
    if (item.type === "image") { var img = document.createElement("img"); img.src = url(item.imageUrl,false) || ""; img.alt = item.title || "صورة مضافة"; img.loading = "lazy"; wrapper.appendChild(img); }
    if (item.type === "text" || item.type === "banner") {
      if (item.title) { var heading = document.createElement("h3"); heading.textContent = item.title; wrapper.appendChild(heading); }
      if (item.text) { var paragraph = document.createElement("p"); paragraph.textContent = item.text; wrapper.appendChild(paragraph); }
    }
    if (item.type === "button") {
      var anchor = document.createElement("a"); anchor.className = "as-element-button"; anchor.textContent = item.label || item.title || "فتح";
      if (item.pageId) { anchor.href = "#"; anchor.setAttribute("data-as-page", item.pageId); }
      else { var target = url(item.url,true); if (!target) return wrapper; anchor.href = target; if (/^https:\/\//i.test(target) && new URL(target).origin !== location.origin) { anchor.target = "_blank"; anchor.rel = "noopener"; } }
      wrapper.appendChild(anchor);
    }
    return wrapper;
  }
  function renderCustomButtons(buttons) {
    document.querySelectorAll("[data-as-generated-button='1'],.as-dynamic-area[data-render-kind='buttons']").forEach(function (el) { el.remove(); });
    var areas = {}, nav = document.querySelector("header nav"), actions = document.querySelector(".hero .actions");
    (buttons || []).forEach(function (item) {
      var a = document.createElement("a"); a.className = "as-custom-button " + (item.style || "gradient"); a.setAttribute("data-as-generated-button","1");
      a.textContent = (item.icon ? item.icon + " " : "") + item.label;
      if (item.pageId) { a.href = "#"; a.setAttribute("data-as-page", item.pageId); }
      else { var target = url(item.url,true); if (!target) return; a.href = target; if (/^https:\/\//i.test(target) && new URL(target).origin !== location.origin) { a.target = "_blank"; a.rel = "noopener"; } }
      if (item.position === "header-nav" && nav) { a.style.padding = "5px 10px"; a.style.fontSize = "12px"; nav.appendChild(a); }
      else if (item.position === "hero-actions" && actions) actions.appendChild(a);
      else { var area = createPositionArea(item.position,"buttons",areas); if (area) area.appendChild(a); }
    });
  }
  function renderElements(elements, pages) {
    document.querySelectorAll(".as-dynamic-area[data-render-kind='elements']").forEach(function (el) { el.remove(); });
    window.__asPublishedElements = Array.isArray(elements) ? elements : [];
    var areas = {};
    (elements || []).filter(function (item) { return item.position !== "side-page"; }).forEach(function (item) {
      var node = buildElementNode(item), area = createPositionArea(item.position,"elements",areas);
      if (node && area) area.appendChild(node);
    });
  }
  function renderSidePages(pages) {
    publishedPages = Array.isArray(pages) ? pages : [];
    createPageLayer();
    document.querySelectorAll("[data-as-page-nav='1']").forEach(function (el) { el.remove(); });
    var nav = document.querySelector("header nav");
    if (nav) publishedPages.forEach(function (page) {
      var link = document.createElement("a"); link.href = "#"; link.textContent = page.title; link.setAttribute("data-as-page",page.id); link.setAttribute("data-as-page-nav","1"); nav.appendChild(link);
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
    draftButtons = Array.isArray(d.customButtons) ? d.customButtons.slice(0, 100) : [];
    draftPages = Array.isArray(d.sidePages) ? d.sidePages.slice(0, 50) : [];
    draftElements = Array.isArray(d.customElements) ? d.customElements.slice(0, 150) : [];
    draftVisualItems = Array.isArray(d.customCanvasItems) ? d.customCanvasItems.slice(0, 100) : [];
    activeVisualItemId = draftVisualItems.length ? draftVisualItems[0].id : null;
    renderDraftButtons(); renderDraftPages(); renderDraftElements(); renderVisualItems(draftVisualItems); renderVisualList(); fillVisualControls();
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


  function visualShadow(value) {
    if (value === "strong") return "0 18px 42px rgba(0,0,0,.42)";
    if (value === "soft") return "0 8px 24px rgba(0,0,0,.28)";
    return "none";
  }
  function addVisualItem(type, extra) {
    var item = Object.assign({
      id: makeId("visual"), type: type, text: type === "text" ? "اكتب النص هنا" : type === "button" ? "زر جديد" : "",
      imageUrl: "", href: type === "button" ? "#features" : "", leftPct: 35,
      topPx: Math.max(30, (window.scrollY || 0) + Math.round(window.innerHeight * 0.34)),
      width: type === "icon" ? 76 : type === "button" ? 210 : 280,
      fontSize: type === "icon" ? 42 : 24, color: "#ffffff", fill1: "#7954ec", fill2: "#a17aff",
      gradient: type === "button", borderColor: "#a78bfa", borderWidth: 0, radius: 14, shadow: "soft"
    }, extra || {});
    draftVisualItems.push(item); activeVisualItemId = item.id;
    renderVisualItems(draftVisualItems); renderVisualList(); fillVisualControls(item); setVisualEditMode(true);
    status("st-msg", "تمت إضافة العنصر إلى المعاينة. اسحبه إلى المكان المطلوب ثم احفظ التعديلات.", "success");
  }
  function visualNodeStyle(node, item) {
    node.style.position = "absolute"; node.style.left = Math.max(0, Math.min(100, Number(item.leftPct) || 0)) + "%";
    node.style.top = Math.max(0, Number(item.topPx) || 0) + "px";
    node.style.width = Math.max(40, Math.min(1600, Number(item.width) || 240)) + "px"; node.style.maxWidth = "95vw";
    node.style.color = color(item.color, "#ffffff"); node.style.fontSize = Math.max(10, Math.min(140, Number(item.fontSize) || 24)) + "px";
    node.style.border = Math.max(0, Math.min(20, Number(item.borderWidth) || 0)) + "px solid " + color(item.borderColor, "#a78bfa");
    node.style.borderRadius = Math.max(0, Math.min(120, Number(item.radius) || 0)) + "px"; node.style.boxShadow = visualShadow(item.shadow);
    node.style.background = item.gradient ? "linear-gradient(120deg," + color(item.fill1, "#7954ec") + "," + color(item.fill2, "#a17aff") + ")" : (item.type === "image" || item.type === "icon" ? "transparent" : color(item.fill1, "#7954ec"));
    node.style.padding = item.type === "image" || item.type === "icon" ? "0" : "10px 14px";
    node.style.textAlign = "center"; node.style.lineHeight = "1.45"; node.style.zIndex = item.type === "button" ? "90" : "85";
  }
  function renderVisualItems(items) {
    var old = document.getElementById("as-free-canvas"); if (old) old.remove();
    var canvas = document.createElement("div"); canvas.id = "as-free-canvas";
    (items || []).forEach(function (item) {
      if (!item || !item.id) return;
      var node;
      if (item.type === "image") {
        node = document.createElement("div"); var image = document.createElement("img");
        image.src = url(item.imageUrl, false) || ""; image.alt = String(item.text || "صورة مضافة"); image.loading = "lazy";
        image.style.width = "100%"; image.style.height = "auto";
        image.style.borderRadius = Math.max(0, Math.min(120, Number(item.radius) || 0)) + "px";
        image.style.boxShadow = visualShadow(item.shadow);
        image.style.border = Math.max(0, Math.min(20, Number(item.borderWidth) || 0)) + "px solid " + color(item.borderColor, "#a78bfa");
        node.appendChild(image);
      } else if (item.type === "button") {
        node = document.createElement("a"); node.href = url(item.href, true) || "#"; node.textContent = String(item.text || "زر");
        node.style.display = "inline-flex"; node.style.alignItems = "center"; node.style.justifyContent = "center";
        node.style.textDecoration = "none"; node.style.fontWeight = "800";
      } else {
        node = document.createElement("div"); node.textContent = String(item.text || (item.type === "icon" ? "✨" : ""));
        if (item.type === "icon") node.style.fontWeight = "900"; else node.style.whiteSpace = "pre-wrap";
      }
      node.className = "as-visual-item" + (visualEditMode && item.id === activeVisualItemId ? " as-v-picked" : "");
      node.setAttribute("data-as-visual-id", item.id); visualNodeStyle(node, item);
      var handle = document.createElement("span"); handle.className = "as-visual-resize"; handle.setAttribute("aria-label", "تغيير حجم العنصر"); node.appendChild(handle);
      node.addEventListener("pointerdown", function (event) {
        if (!visualEditMode || !currentUser) return;
        event.preventDefault(); event.stopPropagation(); activeVisualItemId = item.id;
        document.querySelectorAll(".as-visual-item").forEach(function (entry) { entry.classList.remove("as-v-picked"); });
        node.classList.add("as-v-picked"); fillVisualControls(item); renderVisualList();
        var startX = event.clientX, startY = event.clientY, originalLeft = Number(item.leftPct) || 0;
        var originalTop = Number(item.topPx) || 0, originalWidth = Number(item.width) || 240;
        var isResize = event.target.classList.contains("as-visual-resize");
        function move(moveEvent) {
          var dx = moveEvent.clientX - startX, dy = moveEvent.clientY - startY;
          if (isResize) { item.width = Math.max(60, Math.min(1600, originalWidth + dx)); node.style.width = item.width + "px"; }
          else { item.leftPct = Math.max(0, Math.min(96, originalLeft + (dx / Math.max(1, window.innerWidth)) * 100)); item.topPx = Math.max(0, originalTop + dy); node.style.left = item.leftPct + "%"; node.style.top = item.topPx + "px"; }
        }
        function stop() { document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", stop); document.removeEventListener("pointercancel", stop); fillVisualControls(item); renderVisualList(); }
        document.addEventListener("pointermove", move); document.addEventListener("pointerup", stop); document.addEventListener("pointercancel", stop);
      });
      node.addEventListener("click", function (event) {
        if (!visualEditMode) return;
        event.preventDefault(); event.stopPropagation(); activeVisualItemId = item.id; fillVisualControls(item);
        renderVisualItems(draftVisualItems); renderVisualList();
      });
      canvas.appendChild(node);
    });
    document.body.appendChild(canvas); document.documentElement.classList.toggle("as-v-editing", !!visualEditMode);
  }
  function renderVisualList() {
    var list = document.getElementById("as-v-list"); if (!list) return; list.textContent = "";
    if (!draftVisualItems.length) { var empty = document.createElement("p"); empty.className = "st-note"; empty.textContent = "لم تتم إضافة عناصر بعد."; list.appendChild(empty); return; }
    draftVisualItems.forEach(function (item) {
      var row = document.createElement("div"); row.className = "as-v-list-row"; var label = document.createElement("span");
      label.textContent = (item.type === "image" ? "🖼️ صورة" : item.type === "icon" ? "✦ أيقونة" : item.type === "button" ? "▣ زر" : "T نص") + " — " + String(item.text || item.id).slice(0,36);
      var select = document.createElement("button"); select.type = "button"; select.className = "st-btn"; select.textContent = "تحديد";
      select.addEventListener("click", function () { activeVisualItemId = item.id; fillVisualControls(item); renderVisualItems(draftVisualItems); renderVisualList(); });
      row.appendChild(label); row.appendChild(select); list.appendChild(row);
    });
  }
  function fillVisualControls(item) {
    item = item || draftVisualItems.find(function (entry) { return entry.id === activeVisualItemId; });
    var label = document.getElementById("as-v-selected-name");
    if (!item) { if (label) label.textContent = "اختر عنصرًا من القائمة."; return; }
    if (label) label.textContent = "العنصر المحدد: " + item.type + " · اسحب العنصر على الصفحة لتغيير مكانه.";
    var values = {"as-v-content":item.text || "","as-v-link":item.href || "","as-v-font-size":item.fontSize || 24,"as-v-width":item.width || 240,"as-v-color":color(item.color,"#ffffff"),"as-v-fill1":color(item.fill1,"#7954ec"),"as-v-fill2":color(item.fill2,"#a17aff"),"as-v-border-color":color(item.borderColor,"#a78bfa"),"as-v-border-width":item.borderWidth || 0,"as-v-radius":item.radius || 0,"as-v-gradient":!!item.gradient,"as-v-shadow":item.shadow || "none"};
    Object.keys(values).forEach(function (id) { var el = document.getElementById(id); if (el) { if (el.type === "checkbox") el.checked = !!values[id]; else el.value = values[id]; } });
  }
  function applyVisualControls(showMessage) {
    var item = draftVisualItems.find(function (entry) { return entry.id === activeVisualItemId; }); if (!item) return;
    item.text = document.getElementById("as-v-content").value.slice(0,500);
    var href = document.getElementById("as-v-link").value.trim(); if (href) item.href = url(href, true) || item.href || "#";
    item.fontSize = Math.max(10, Math.min(140, Number(document.getElementById("as-v-font-size").value) || 24));
    item.width = Math.max(40, Math.min(1600, Number(document.getElementById("as-v-width").value) || 240));
    item.color = color(document.getElementById("as-v-color").value, "#ffffff"); item.fill1 = color(document.getElementById("as-v-fill1").value, "#7954ec");
    item.fill2 = color(document.getElementById("as-v-fill2").value, "#a17aff"); item.borderColor = color(document.getElementById("as-v-border-color").value, "#a78bfa");
    item.borderWidth = Math.max(0, Math.min(20, Number(document.getElementById("as-v-border-width").value) || 0));
    item.radius = Math.max(0, Math.min(120, Number(document.getElementById("as-v-radius").value) || 0));
    item.gradient = document.getElementById("as-v-gradient").checked; item.shadow = document.getElementById("as-v-shadow").value;
    renderVisualItems(draftVisualItems);
    if (showMessage !== false) status("st-msg", "تم تحديث تنسيق العنصر في المعاينة. اضغط حفظ التعديلات للنشر.", "success");
  }
  function setVisualEditMode(enabled) {
    visualEditMode = !!enabled && !!currentUser; var button = document.getElementById("as-v-toggle");
    if (button) button.textContent = visualEditMode ? "✓ إيقاف السحب" : "✥ تفعيل السحب";
    renderVisualItems(draftVisualItems);
  }

  async function uploadVisualImage() {
    var input = document.getElementById("as-v-file"), file = input && input.files && input.files[0]; if (!file) return;
    var hint = document.getElementById("as-v-upload-status");
    try {
      if (!currentUser) throw new Error("سجّل الدخول بحساب الإدارة أولًا.");
      if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) throw new Error("الصيغ المدعومة: PNG وJPG وWEBP وGIF.");
      if (file.size > 5 * 1024 * 1024) throw new Error("حجم الصورة يجب ألا يتجاوز 5 ميجابايت.");
      if (hint) hint.textContent = "جارٍ طلب إذن رفع آمن من الخادم...";
      var token = await currentUser.getIdToken(true);
      var signatureResponse = await fetch(ANALYTICS_API_URL.replace(/\/$/, "") + "/admin/cloudinary-signature", {
        method: "POST", mode: "cors", cache: "no-store",
        headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" },
        body: "{}"
      });
      var signed = await signatureResponse.json();
      if (!signatureResponse.ok || !signed.ok) {
        if (signatureResponse.status === 401) throw new Error("انتهت جلسة الإدارة أو تعذر التحقق من حسابك.");
        if (signatureResponse.status === 404) throw new Error("خدمة Cloudflare Worker غير منشورة أو قديمة. أعد نشر Worker.");
        if (signatureResponse.status === 503) throw new Error("لم تُضف مفاتيح Cloudinary إلى Cloudflare Worker بعد.");
        throw new Error(signed.error || "تعذر الحصول على تصريح رفع الصورة.");
      }
      if (hint) hint.textContent = "جارٍ رفع الصورة إلى Cloudinary...";
      var form = new FormData();
      form.append("file", file, file.name);
      form.append("api_key", signed.apiKey);
      form.append("timestamp", String(signed.timestamp));
      form.append("folder", signed.folder);
      form.append("signature", signed.signature);
      var uploadResponse = await fetch("https://api.cloudinary.com/v1_1/" + encodeURIComponent(signed.cloudName) + "/image/upload", {
        method: "POST", body: form
      });
      var uploaded = await uploadResponse.json();
      if (!uploadResponse.ok || !uploaded.secure_url) throw new Error(uploaded && uploaded.error && uploaded.error.message ? uploaded.error.message : "رفض Cloudinary رفع الصورة.");
      addVisualItem("image", { imageUrl: uploaded.secure_url, text: file.name, width: 300 });
      if (hint) hint.textContent = "تم رفع الصورة إلى Cloudinary بنجاح. يمكنك سحبها وتغيير حجمها.";
      input.value = "";
    } catch (error) {
      if (hint) hint.textContent = error.message || "تعذر رفع الصورة.";
      status("st-msg", error.message || "تعذر رفع الصورة. راجع إعدادات Cloudinary وCloudflare.", "error");
    }
  }

  function deleteActiveVisualItem() {
    if (!activeVisualItemId) return;
    draftVisualItems = draftVisualItems.filter(function (item) { return item.id !== activeVisualItemId; });
    activeVisualItemId = draftVisualItems.length ? draftVisualItems[draftVisualItems.length - 1].id : null;
    renderVisualItems(draftVisualItems); renderVisualList(); fillVisualControls();
    status("st-msg", "تم حذف العنصر من المسودة. احفظ التعديلات لتأكيد الحذف.", "success");
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
      customCards:draftCards.slice(0,60),customButtons:draftButtons.slice(0,100),sidePages:draftPages.slice(0,50),customElements:draftElements.slice(0,150),customCanvasItems:draftVisualItems.slice(0,100),updatedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedBy:currentUser.email
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
      var snap = await db.collection("site").doc("content").get({ source: "server" }), data = snap.exists ? snap.data() : defaults;
      fill(data); apply(data); revealPublishedSite(); status("st-msg","تم تحميل إعدادات الموقع من Firebase.","success");
    } catch (e) { console.error("Admin content read failed:",e); revealPublishedSite(); status("st-msg","تعذر قراءة إعدادات الموقع من Firebase.","error"); }
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


  function analyticsStatus(message, isError) {
    var el = document.getElementById("as-analytics-status");
    if (!el) return;
    el.textContent = message;
    el.classList.toggle("as-analytics-status-error", !!isError);
  }
  function visitorBrowserId() {
    var key = "artboard_analytics_visitor_id";
    try {
      var value = localStorage.getItem(key);
      if (value && /^[a-zA-Z0-9_-]{16,100}$/.test(value)) return value;
      value = (window.crypto && crypto.randomUUID) ? crypto.randomUUID().replace(/-/g, "") :
        ("v" + Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2));
      localStorage.setItem(key, value);
      return value;
    } catch (e) {
      if (!window.__asVisitorId) window.__asVisitorId = "v" + Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      return window.__asVisitorId;
    }
  }
  function trackAnalyticsEvent(type) {
    if (!ANALYTICS_API_URL || ANALYTICS_API_URL.indexOf("REPLACE_") >= 0) return;
    var payload = {
      type: type,
      visitorId: visitorBrowserId(),
      path: location.pathname,
      referrer: (function () { try { var ref = new URL(document.referrer); return ref.origin + ref.pathname; } catch (e) { return ""; } })()
    };
    fetch(ANALYTICS_API_URL.replace(/\/$/, "") + "/track", {
      method: "POST",
      mode: "cors",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(function () {});
  }
  function initVisitorTracking() {
    if (window.__artboardAnalyticsTrackingStarted) return;
    window.__artboardAnalyticsTrackingStarted = true;
    trackAnalyticsEvent("visit");
    document.addEventListener("click", function (event) {
      var anchor = event.target && event.target.closest ? event.target.closest("a") : null;
      if (!anchor) return;
      var href = anchor.href || "";
      var fileDownload = anchor.hasAttribute("download") ||
        /\.(?:rar|zip|7z|exe|msi|dmg)(?:[?#]|$)/i.test(href) ||
        anchor.hasAttribute("data-analytics-download");
      if (fileDownload) trackAnalyticsEvent("download");
    }, true);
  }
  function loadLeaflet() {
    if (window.L) return Promise.resolve(window.L);
    if (analyticsLeafletPromise) return analyticsLeafletPromise;
    analyticsLeafletPromise = new Promise(function (resolve, reject) {
      if (!document.getElementById("as-leaflet-css")) {
        var css = document.createElement("link");
        css.id = "as-leaflet-css"; css.rel = "stylesheet";
        css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(css);
      }
      var script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = function () { resolve(window.L); };
      script.onerror = function () { analyticsLeafletPromise = null; reject(new Error("تعذر تحميل مكتبة الخريطة.")); };
      document.head.appendChild(script);
    });
    return analyticsLeafletPromise;
  }
  function drawAnalyticsChart(rows) {
    var canvas = document.getElementById("as-analytics-chart");
    if (!canvas) return;
    var rect = canvas.getBoundingClientRect(), width = Math.max(320, rect.width || 600), height = 210;
    var ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    canvas.style.width = "100%"; canvas.style.height = height + "px";
    var ctx = canvas.getContext("2d"); ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    var left = 34, right = 10, top = 12, bottom = 32;
    var chartW = width - left - right, chartH = height - top - bottom;
    var max = 1;
    rows.forEach(function (r) { max = Math.max(max, Number(r.visits) || 0, Number(r.downloads) || 0); });
    ctx.font = "10px Cairo,Tahoma,sans-serif";
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    for (var g = 0; g <= 4; g++) {
      var y = top + chartH - (chartH * g / 4);
      ctx.strokeStyle = "rgba(148,163,184,.18)"; ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(width - right, y); ctx.stroke();
      ctx.fillStyle = "#9ca3b8"; ctx.fillText(String(Math.round(max * g / 4)), left - 6, y);
    }
    var slot = chartW / Math.max(rows.length, 1), bw = Math.max(2, Math.min(12, slot * .28));
    rows.forEach(function (r, i) {
      var x = left + slot * i + slot / 2;
      var visits = Number(r.visits) || 0, downloads = Number(r.downloads) || 0;
      var vh = visits / max * chartH, dh = downloads / max * chartH;
      ctx.fillStyle = "#a78bfa"; ctx.fillRect(x - bw - 1, top + chartH - vh, bw, vh);
      ctx.fillStyle = "#67e8f9"; ctx.fillRect(x + 1, top + chartH - dh, bw, dh);
      if (rows.length <= 15 || i % Math.ceil(rows.length / 10) === 0 || i === rows.length - 1) {
        ctx.fillStyle = "#aeb6cc"; ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillText(String(r.day || "").slice(5), x, top + chartH + 8);
      }
    });
  }
  function completeDailySeries(rows, dayCount) {
    var lookup = {};
    (rows || []).forEach(function (row) { lookup[row.day] = row; });
    var output = [], today = new Date();
    today.setUTCHours(0,0,0,0);
    for (var offset = dayCount - 1; offset >= 0; offset--) {
      var date = new Date(today.getTime() - offset * 86400000);
      var key = date.toISOString().slice(0,10);
      var existing = lookup[key] || {};
      output.push({day:key,visits:Number(existing.visits || 0),downloads:Number(existing.downloads || 0)});
    }
    return output;
  }
  function analyticsCountryName(code) {
    if (!code) return "غير معروف";
    try {
      if (typeof Intl !== "undefined" && Intl.DisplayNames) {
        return new Intl.DisplayNames(["ar"], { type: "region" }).of(code) || code;
      }
    } catch (e) {}
    return code;
  }
  function renderAnalyticsCountries(rows) {
    var target = document.getElementById("as-analytics-countries");
    if (!target) return; target.textContent = "";
    if (!rows || !rows.length) { target.textContent = "لا توجد بيانات حسب الدولة حتى الآن."; return; }
    rows.forEach(function (row) {
      var line = document.createElement("div"); line.className = "as-analytics-country";
      var country = document.createElement("span"); country.textContent = analyticsCountryName(row.country);
      var count = document.createElement("strong"); count.textContent = Number(row.visitors || 0).toLocaleString("ar-EG") + " زائر";
      line.appendChild(country); line.appendChild(count); target.appendChild(line);
    });
  }
  function renderAnalyticsRecent(rows) {
    var body = document.getElementById("as-analytics-recent");
    if (!body) return; body.textContent = "";
    if (!rows || !rows.length) {
      var empty = document.createElement("tr"), cell = document.createElement("td");
      cell.colSpan = 4; cell.textContent = "لا توجد زيارات مسجلة في الفترة المحددة.";
      empty.appendChild(cell); body.appendChild(empty); return;
    }
    rows.forEach(function (row) {
      var tr = document.createElement("tr");
      var date = document.createElement("td");
      var parsed = new Date(row.created_at);
      date.textContent = isNaN(parsed.getTime()) ? String(row.created_at || "") : parsed.toLocaleString("ar-EG");
      var ip = document.createElement("td"); ip.textContent = row.ip_address || "غير متاح";
      ip.style.direction = "ltr"; ip.style.whiteSpace = "nowrap";
      var locationCell = document.createElement("td");
      locationCell.textContent = [row.city,row.region,analyticsCountryName(row.country)].filter(Boolean).join("، ") || "غير معروف";
      var path = document.createElement("td"); path.textContent = row.page_path || "/";
      path.style.direction = "ltr"; path.style.maxWidth = "130px"; path.style.overflowWrap = "anywhere";
      tr.appendChild(date); tr.appendChild(ip); tr.appendChild(locationCell); tr.appendChild(path); body.appendChild(tr);
    });
  }
  async function renderAnalyticsMap(points) {
    var container = document.getElementById("as-analytics-map");
    if (!container) return;
    try {
      await loadLeaflet();
      if (!analyticsMapInstance) {
        analyticsMapInstance = L.map(container, { scrollWheelZoom: false }).setView([25, 20], 2);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18,
          attribution: "&copy; OpenStreetMap contributors"
        }).addTo(analyticsMapInstance);
        analyticsMapLayer = L.layerGroup().addTo(analyticsMapInstance);
      }
      analyticsMapLayer.clearLayers();
      var bounds = [];
      (points || []).forEach(function (point) {
        var lat = Number(point.latitude), lon = Number(point.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
        var circle = L.circleMarker([lat, lon], {
          radius: Math.min(15, 6 + Number(point.visitors || 0)),
          color: "#c4b5fd", weight: 1, fillColor: "#7954ec", fillOpacity: 0.72
        });
        var popup = document.createElement("div");
        var strong = document.createElement("strong");
        strong.textContent = [point.city,point.region,analyticsCountryName(point.country)].filter(Boolean).join("، ") || "موقع غير معروف";
        var count = document.createElement("div");
        count.textContent = Number(point.visitors || 0).toLocaleString("ar-EG") + " زائر فريد";
        popup.appendChild(strong); popup.appendChild(count);
        circle.bindPopup(popup).addTo(analyticsMapLayer); bounds.push([lat,lon]);
      });
      if (bounds.length === 1) analyticsMapInstance.setView(bounds[0], 5);
      else if (bounds.length > 1) analyticsMapInstance.fitBounds(bounds, { padding: [24,24], maxZoom: 5 });
      setTimeout(function () { if (analyticsMapInstance) analyticsMapInstance.invalidateSize(); }, 120);
    } catch (error) {
      container.textContent = error.message || "تعذر عرض الخريطة.";
    }
  }
  async function refreshAnalytics() {
    if (!currentUser) { analyticsStatus("سجّل الدخول بحساب الإدارة أولًا.", true); return; }
    var button = document.getElementById("as-analytics-refresh");
    var days = document.getElementById("as-analytics-days");
    var range = days ? days.value : "30";
    if (button) { button.disabled = true; button.textContent = "جارٍ التحميل..."; }
    analyticsStatus("جارٍ جلب بيانات الزوار والتنزيلات...");
    try {
      var token = await currentUser.getIdToken(true);
      var response = await fetch(ANALYTICS_API_URL.replace(/\/$/, "") + "/admin/summary?days=" + encodeURIComponent(range), {
        method: "GET", mode: "cors", cache: "no-store",
        headers: { "Authorization": "Bearer " + token }
      });
      var data = await response.json();
      if (!response.ok || !data.ok) {
        if (response.status === 401) throw new Error("رفض الخادم التحقق من حساب الإدارة. تأكد من صحة Firebase API Key وأن البريد موثّق.");
        if (response.status === 404) throw new Error("خدمة التحليلات غير منشورة بعد على Cloudflare Worker.");
        throw new Error(data.error || "تعذر تحميل الإحصائيات.");
      }
      var summary = data.summary || {};
      [["as-kpi-visits",summary.visits],["as-kpi-unique",summary.unique_visitors],["as-kpi-downloads",summary.downloads],["as-kpi-countries",summary.countries]].forEach(function (pair) {
        var el = document.getElementById(pair[0]); if (el) el.textContent = Number(pair[1] || 0).toLocaleString("ar-EG");
      });
      renderAnalyticsCountries(data.countries || []);
      renderAnalyticsRecent(data.recent || []);
      drawAnalyticsChart(completeDailySeries(data.daily || [], Number(range) || 30));
      await renderAnalyticsMap(data.mapPoints || []);
      analyticsStatus("تم تحديث البيانات. النطاق: آخر " + range + " يومًا. الاحتفاظ بالسجلات: 30 يومًا.", false);
    } catch (error) {
      analyticsStatus(error.message || "تعذر الاتصال بخدمة التحليلات. تأكد من نشر Cloudflare Worker.", true);
      console.error("Analytics dashboard error:", error);
    } finally {
      if (button) { button.disabled = false; button.textContent = "↻ تحديث الإحصائيات"; }
    }
  }

  function revealPublishedSite() {
    if (window.__asSiteReady) return;
    window.__asSiteReady = true;
    document.documentElement.classList.remove("as-content-loading");
  }

  function start() {
    initVisitorTracking();
    addStyles(); buildPanel();
    try {
      if (!window.firebase) throw new Error("Firebase SDK غير متاح.");
      if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      db = firebase.firestore(); auth = firebase.auth();
      // Keep every open visitor tab synchronized with published site content.
      db.collection("site").doc("content").onSnapshot({ includeMetadataChanges: true }, function (snap) {
        if (snap.metadata && snap.metadata.fromCache) return;
        if (!snap.exists) { revealPublishedSite(); return; }
        var published = snap.data();
        apply(published);
        if (currentUser) fill(published);
        revealPublishedSite();
      }, function (error) {
        console.error("Artboard Studio live content listener failed:", error);
        revealPublishedSite();
      });
      auth.onAuthStateChanged(function (user) {
        if (user && user.email && user.email.toLowerCase() === ADMIN_EMAIL && user.emailVerified) { currentUser = user; showAdmin(); }
        else { currentUser = null; setVisualEditMode(false); if (user) auth.signOut(); showLogin("سجّل الدخول باستخدام بريد الإدارة الموثّق.",false); }
      });
      loadContent();
    } catch (e) { console.error("Admin initialization failed:",e); showLogin("تعذر تهيئة Firebase. تحقق من اتصال الموقع وإعدادات المشروع.",true); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",start); else start();
})();