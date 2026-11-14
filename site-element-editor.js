/* Artboard Studio — original website element editor */
(function () {
  "use strict";
  var ADMIN_EMAIL="rafathamed9@gmail.com",db=null,auth=null,user=null,enabled=false,selected=null,edits=[],undoStack=[],redoStack=[],drag=null,appliedKeys=[],uiReady=false;
  function addCss(){
    if(document.getElementById("as-dom-editor-css"))return;
    var st=document.createElement("style");st.id="as-dom-editor-css";
    st.textContent=[
      ".as-dom-edit-on,.as-dom-edit-on *{cursor:crosshair!important}",
      ".as-dom-selected{outline:2px dashed #22d3ee!important;outline-offset:3px!important}",
      ".as-dom-edited{translate:var(--as-dom-translate,0px 0px)!important;scale:var(--as-dom-scale,1)!important}",
      ".as-dom-inline{display:inline-block!important}",
      ".as-dom-deleted{display:none!important}",
      ".as-dom-layer{position:relative!important;z-index:var(--as-dom-z,1)!important}",
      "#as-dom-editor-card{margin:10px 0;padding:12px;border:1px solid #3b4260;border-radius:10px;background:#171b2e;color:#f8fafc;font:12px Cairo,Tahoma,sans-serif}",
      "#as-dom-editor-card button{border:0;border-radius:7px;padding:8px 10px;background:#343954;color:#fff;cursor:pointer;font:700 11px Cairo,Tahoma,sans-serif}",
      "#as-dom-editor-card button.primary{background:#7954ec}#as-dom-editor-card button.danger{background:#b91c1c}",
      "#as-dom-editor-card .as-dom-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:8px}",
      "#as-dom-editor-card label{display:block;margin:8px 0 4px;color:#d8def0}",
      "#as-dom-editor-card input{width:100%;box-sizing:border-box;padding:8px;border:1px solid #333954;border-radius:7px;background:#0b0d17;color:#fff}",
      "#as-dom-editor-card .hint{color:#b9bdd0;line-height:1.7;font-size:11px}#as-dom-editor-card .status{margin-top:8px;color:#c4b5fd;line-height:1.6}"
    ].join("\n");document.head.appendChild(st);
  }
  function keyFor(el){
    if(!el||el===document.body||el===document.documentElement)return "";
    var parts=[],node=el;
    while(node&&node!==document.body){
      var tag=String(node.tagName||"").toLowerCase();if(!tag||/^(script|style|link|meta)$/.test(tag))return "";
      var n=1,prev=node;while((prev=prev.previousElementSibling))if(prev.tagName===node.tagName)n++;
      parts.unshift(tag+":nth-of-type("+n+")");node=node.parentElement;
    }
    return node===document.body?"body > "+parts.join(" > "):"";
  }
  function resolve(key){try{return key?document.querySelector(key):null;}catch(_){return null;}}
  function snapshot(){return edits.map(function(x){return Object.assign({},x);});}
  function remember(){undoStack.push(snapshot());if(undoStack.length>50)undoStack.shift();redoStack=[];}
  function clearApplied(){
    appliedKeys.forEach(function(key){var el=resolve(key);if(!el)return;
      el.classList.remove("as-dom-edited","as-dom-deleted","as-dom-layer","as-dom-selected","as-dom-inline");
      ["--as-dom-translate","--as-dom-scale","--as-dom-z"].forEach(function(p){el.style.removeProperty(p);});
    });appliedKeys=[];
  }
  function applyOne(el,item){
    if(!el||!item)return;if(getComputedStyle(el).display==="inline")el.classList.add("as-dom-inline");el.classList.add("as-dom-edited");
    el.style.setProperty("--as-dom-translate",(Number(item.x)||0)+"px "+(Number(item.y)||0)+"px");
    el.style.setProperty("--as-dom-scale",String(Math.max(.25,Math.min(3,Number(item.scale)||1))));
    el.classList.toggle("as-dom-deleted",!!item.deleted);
    if(Number(item.z)>0){el.classList.add("as-dom-layer");el.style.setProperty("--as-dom-z",String(Math.max(1,Math.min(9999,Number(item.z)||1))));}
    else{el.classList.remove("as-dom-layer");el.style.removeProperty("--as-dom-z");}
  }
  function applyAll(){
    clearApplied();edits.forEach(function(item){var el=resolve(item.key);
      if(!el||el.closest("#studio-overlay")||el.id==="open-admin-fab"||el.closest("#as-free-canvas"))return;
      applyOne(el,item);appliedKeys.push(item.key);
    });if(selected&&!document.contains(selected))selected=null;
  }
  function findEdit(el){
    var key=keyFor(el),item=edits.find(function(x){return x.key===key;});
    if(!item){item={key:key,x:0,y:0,scale:1,z:0,deleted:false};edits.push(item);}return item;
  }
  function status(msg,error){var box=document.getElementById("as-dom-status");if(box){box.textContent=msg;box.style.color=error?"#fca5a5":"#c4b5fd";}}
  function selectElement(el){
    if(!el)return;document.querySelectorAll(".as-dom-selected").forEach(function(x){x.classList.remove("as-dom-selected");});
    selected=el;el.classList.add("as-dom-selected");var item=findEdit(el),label=document.getElementById("as-dom-current");
    if(label)label.textContent="المحدد: "+el.tagName.toLowerCase()+(el.id?" #"+el.id:"")+" — "+String(el.innerText||el.alt||"").trim().slice(0,55);
    document.getElementById("as-dom-x").value=item.x||0;document.getElementById("as-dom-y").value=item.y||0;
    document.getElementById("as-dom-scale").value=Math.round((Number(item.scale)||1)*100);document.getElementById("as-dom-z").value=item.z||0;
  }
  function pickable(target){
    if(!target||!target.closest)return null;
    var el=target.closest("h1,h2,h3,h4,p,a,button,img,figure,article,section,header,footer,nav,li,details,summary,div,span");
    if(!el||el===document.body||el.closest("#studio-overlay")||el.id==="open-admin-fab"||el.closest("#as-free-canvas"))return null;return el;
  }
  function pointerDown(e){
    if(!enabled||!user||e.button!==0)return;
    if(e.target.closest&&(e.target.closest("#studio-overlay")||e.target.id==="open-admin-fab"))return;
    var el=pickable(e.target);if(!el)return;e.preventDefault();e.stopPropagation();selectElement(el);
    var item=findEdit(el);remember();drag={el:el,item:item,sx:e.clientX,sy:e.clientY,x:Number(item.x)||0,y:Number(item.y)||0};
    document.addEventListener("pointermove",pointerMove,true);document.addEventListener("pointerup",pointerUp,true);
  }
  function pointerMove(e){
    if(!drag)return;drag.item.x=Math.round(drag.x+e.clientX-drag.sx);drag.item.y=Math.round(drag.y+e.clientY-drag.sy);
    applyOne(drag.el,drag.item);document.getElementById("as-dom-x").value=drag.item.x;document.getElementById("as-dom-y").value=drag.item.y;
  }
  function pointerUp(){if(!drag)return;document.removeEventListener("pointermove",pointerMove,true);document.removeEventListener("pointerup",pointerUp,true);drag=null;}
  function setEnabled(on){
    enabled=!!on&&!!user;document.documentElement.classList.toggle("as-dom-edit-on",enabled);
    var b=document.getElementById("as-dom-enable");if(b)b.textContent=enabled?"✓ إيقاف التحرير":"✥ تفعيل التحرير الحر";
    if(enabled)document.addEventListener("pointerdown",pointerDown,true);
    else{document.removeEventListener("pointerdown",pointerDown,true);document.removeEventListener("pointermove",pointerMove,true);document.removeEventListener("pointerup",pointerUp,true);document.querySelectorAll(".as-dom-selected").forEach(function(x){x.classList.remove("as-dom-selected");});selected=null;}
  }
  function updateControls(){
    if(!selected)return;var item=findEdit(selected);remember();
    item.x=Math.max(-5000,Math.min(5000,Number(document.getElementById("as-dom-x").value)||0));
    item.y=Math.max(-5000,Math.min(5000,Number(document.getElementById("as-dom-y").value)||0));
    item.scale=Math.max(.25,Math.min(3,(Number(document.getElementById("as-dom-scale").value)||100)/100));
    item.z=Math.max(0,Math.min(9999,Number(document.getElementById("as-dom-z").value)||0));applyOne(selected,item);
    status("تم تطبيق التعديلات على المعاينة. اضغط حفظ لنشرها.");
  }
  function deleteSelected(){
    if(!selected){status("حدد عنصرًا من الصفحة أولًا.",true);return;}
    var tag=selected.tagName.toLowerCase();
    if(/^(section|header|footer|nav|main|article)$/.test(tag)&&!window.confirm("هذا عنصر حاوية وقد يؤدي إخفاؤه إلى إخفاء محتوى كامل. هل تريد المتابعة؟"))return;
    if(!window.confirm("هل تريد حذف العنصر المحدد من الموقع؟"))return;
    var item=findEdit(selected);remember();item.deleted=true;applyOne(selected,item);selected.classList.remove("as-dom-selected");selected=null;
    document.getElementById("as-dom-current").textContent="تم حذف العنصر من المعاينة. يمكنك التراجع أو الحفظ.";status("تم إخفاء العنصر. اضغط حفظ لتأكيد الحذف.");
  }
  function layer(z){if(!selected)return;var item=findEdit(selected);remember();item.z=z;applyOne(selected,item);document.getElementById("as-dom-z").value=z;}
  function restore(stack,other){
    if(!stack.length)return;other.push(snapshot());edits=stack.pop().map(function(x){return Object.assign({},x);});applyAll();
    if(selected&&document.contains(selected))selectElement(selected);
  }
  function undo(){restore(undoStack,redoStack);}function redo(){restore(redoStack,undoStack);}
  async function save(){
    if(!user||user.email.toLowerCase()!==ADMIN_EMAIL)return;
    var b=document.getElementById("as-dom-save");b.disabled=true;b.textContent="جارٍ الحفظ...";
    try{await db.collection("site").doc("content").set({customDomEdits:edits.slice(0,500)},{merge:true});status("تم حفظ تحريك وحذف العناصر في Firebase بنجاح.");}
    catch(e){status("تعذر الحفظ: "+(e.message||"خطأ غير معروف"),true);}
    finally{b.disabled=false;b.textContent="💾 حفظ تحريك العناصر";}
  }
  function buildUi(){
    if(uiReady)return;var pane=document.getElementById("p-visual");if(!pane)return;addCss();
    var card=document.createElement("div");card.id="as-dom-editor-card";
    card.innerHTML='<strong>🧭 تحكم حر في كل عناصر الموقع</strong><p class="hint">فعّل التحرير ثم انقر على أي عنصر أصلي في الصفحة: العناوين، النصوص، الصور، الأزرار، البطاقات والأقسام. اسحب العنصر مباشرة لتحريكه، أو عدّل الحجم والطبقة. حذف العنصر يخفيه دون إتلاف محتواه نهائيًا، ويمكن التراجع قبل الحفظ.</p><button type="button" id="as-dom-enable" class="primary">✥ تفعيل التحرير الحر</button><p id="as-dom-current" class="status">لم يتم تحديد عنصر.</p><div class="as-dom-grid"><div><label>الإزاحة الأفقية px</label><input id="as-dom-x" type="number" value="0"></div><div><label>الإزاحة الرأسية px</label><input id="as-dom-y" type="number" value="0"></div><div><label>الحجم %</label><input id="as-dom-scale" type="number" min="25" max="300" value="100"></div><div><label>ترتيب الطبقة</label><input id="as-dom-z" type="number" min="0" max="9999" value="0"></div></div><div class="as-dom-grid"><button type="button" id="as-dom-apply" class="primary">تطبيق القيم</button><button type="button" id="as-dom-delete" class="danger">حذف العنصر</button><button type="button" id="as-dom-front">إحضار للأمام</button><button type="button" id="as-dom-back">إرسال للخلف</button><button type="button" id="as-dom-undo">↶ تراجع</button><button type="button" id="as-dom-redo">↷ إعادة</button><button type="button" id="as-dom-save" class="primary">💾 حفظ تحريك العناصر</button></div><p id="as-dom-status" class="status">سجّل الدخول بحساب الإدارة لبدء التحرير.</p>';
    pane.insertBefore(card,pane.firstChild);
    document.getElementById("as-dom-enable").addEventListener("click",function(){setEnabled(!enabled);});
    document.getElementById("as-dom-apply").addEventListener("click",updateControls);
    document.getElementById("as-dom-delete").addEventListener("click",deleteSelected);
    document.getElementById("as-dom-front").addEventListener("click",function(){layer(999);});
    document.getElementById("as-dom-back").addEventListener("click",function(){layer(1);});
    document.getElementById("as-dom-undo").addEventListener("click",undo);
    document.getElementById("as-dom-redo").addEventListener("click",redo);
    document.getElementById("as-dom-save").addEventListener("click",save);
    uiReady=true;if(!user)card.style.display="none";
  }
  function init(){
    if(!window.firebase||!firebase.apps.length)return;db=firebase.firestore();auth=firebase.auth();
    auth.onAuthStateChanged(function(u){
      user=u&&u.email&&u.email.toLowerCase()===ADMIN_EMAIL&&u.emailVerified?u:null;
      var card=document.getElementById("as-dom-editor-card");if(card)card.style.display=user?"":"none";
      if(!user)setEnabled(false);else status("تم التحقق من حساب الإدارة. يمكنك تحرير عناصر الموقع.");
    });
    db.collection("site").doc("content").onSnapshot(function(snap){if(snap.exists){edits=Array.isArray(snap.data().customDomEdits)?snap.data().customDomEdits.slice(0,500):[];applyAll();}});
    var observer=new MutationObserver(function(){buildUi();});observer.observe(document.body,{childList:true,subtree:true});buildUi();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();