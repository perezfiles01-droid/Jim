/* ===================================================================
   app.js
   Shell wiring. Only one dashboard is mounted in the DOM at a time,
   which is why every dashboard is free to use its own element ids
   without checking whether another dashboard already took them.

   Per dashboard state, the selected department, the sort field, the
   page number, lives in each module's closure, so switching away and
   back returns you to where you were.
   =================================================================== */
function switchTo(key){
  const d = DASHBOARDS[key];
  if (!d) return;
  document.getElementById("view").innerHTML = d.html;
  document.getElementById("side-ver").textContent = d.ver;
  document.getElementById("crumb-b").textContent = d.crumb;
  document.getElementById("asof").textContent = d.asof;
  document.querySelectorAll("#nav a[data-d]").forEach(a => a.classList.toggle("on", a.dataset.d === key));
  window.scrollTo(0, 0);
  d.init();
  if (location.hash.slice(1) !== key) history.replaceState(null, "", "#" + key);
}
document.querySelectorAll("#nav a[data-d]").forEach(a => a.onclick = () => switchTo(a.dataset.d));
window.addEventListener("hashchange", () => switchTo(location.hash.slice(1) || "bo"));

/* Open on the hash if there is one, so a link to a dashboard works. */
switchTo(DASHBOARDS[location.hash.slice(1)] ? location.hash.slice(1) : "bo");
