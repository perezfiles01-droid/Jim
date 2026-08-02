/* ===================================================================
   Shell: left nav switches which dashboard is mounted. Only one
   dashboard is in the DOM at a time, which is why both can keep their
   original element ids untouched.
   =================================================================== */
function switchTo(key){
  const d=DASHBOARDS[key];
  if(!d)return;
  document.getElementById("view").innerHTML=d.html;
  document.getElementById("side-ver").textContent=d.ver;
  document.getElementById("crumb-b").textContent=d.crumb;
  document.getElementById("asof").textContent=d.asof;
  document.querySelectorAll("#nav a[data-d]").forEach(a=>a.classList.toggle("on",a.dataset.d===key));
  d.init();
}
document.querySelectorAll("#nav a[data-d]").forEach(a=>a.onclick=()=>switchTo(a.dataset.d));
switchTo("ov");
