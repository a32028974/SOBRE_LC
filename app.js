(() => {
  const $ = (id) => document.getElementById(id);

  const KEY = "sobre_lc_clientes_v0";

  const defaults = {
    num: "7912/2",
    ape: "",
    nom: "",
    offx: 105,
    offy: 15,
    maxNum: 72, minNum: 16,
    maxApe: 64, minApe: 14,
    maxNom: 56, minNom: 14,
    guides: true
  };

  function loadState(){
    try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
    catch { return {}; }
  }

  function saveState(patch){
    const st = loadState();
    const next = { ...st, ...patch };
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  }

  function toUpperSafe(v){
    return (v ?? "").toString().trim().toUpperCase();
  }

  function setVar(name, v, unit){
    document.documentElement.style.setProperty(name, `${v}${unit}`);
  }

  // --- Auto-fit estilo Excel: baja font-size y si hace falta ajusta escala final
  function fitToBox(span, maxPt, minPt){
    const box = span.parentElement;
    if(!box) return;

    // reset
    span.style.transform = "scale(1)";
    span.style.fontSize = `${maxPt}pt`;

    // forzar layout
    span.getBoundingClientRect();

    const bw = box.clientWidth;
    const bh = box.clientHeight;
    if(bw <= 0 || bh <= 0) return;

    let pt = maxPt;
    // achico pt hasta entrar por ancho o alto
    while(pt > minPt && (span.scrollWidth > bw || span.scrollHeight > bh)){
      pt -= 1;
      span.style.fontSize = `${pt}pt`;
    }

    // ajuste fino con scale por si aún toca bordes (casos extremos)
    span.getBoundingClientRect();
    const sw = span.scrollWidth || 1;
    const sh = span.scrollHeight || 1;

    const sx = bw / sw;
    const sy = bh / sh;
    const s = Math.min(1, sx, sy);

    if(s < 1){
      span.style.transform = `scale(${s})`;
    }
  }

  function applyGuides(on){
    const sheet = $("sheet");
    if(on) sheet.classList.add("show-guides");
    else sheet.classList.remove("show-guides");
  }

  // Escala la hoja para que entre en el viewport (vista previa)
  function updatePreviewScale(){
    const sheet = $("sheet");
    const viewport = sheet.parentElement; // .sheetViewport
    if(!viewport) return;

    // ancho útil dentro del panel (resto padding)
    const maxW = viewport.clientWidth - 20;
    const maxH = Math.max(420, window.innerHeight - 200);

    // medimos hoja en px sin transform (temporal)
    const prev = sheet.style.transform;
    sheet.style.transform = "none";
    const rect = sheet.getBoundingClientRect();
    const w = rect.width || 1;
    const h = rect.height || 1;
    sheet.style.transform = prev;

    const s = Math.min(maxW / w, maxH / h, 1);
    document.documentElement.style.setProperty("--preview-scale", String(s));
  }

  function refresh(){
    const num = toUpperSafe($("num").value) || "—";
    const ape = toUpperSafe($("ape").value) || "APELLIDO";
    const nom = toUpperSafe($("nom").value) || "NOMBRE";

    $("tNum").textContent = num;
    $("tApe").textContent = ape;
    $("tNom").textContent = nom;

    const maxNum = parseFloat($("maxNum").value) || defaults.maxNum;
    const minNum = parseFloat($("minNum").value) || defaults.minNum;
    const maxApe = parseFloat($("maxApe").value) || defaults.maxApe;
    const minApe = parseFloat($("minApe").value) || defaults.minApe;
    const maxNom = parseFloat($("maxNom").value) || defaults.maxNom;
    const minNom = parseFloat($("minNom").value) || defaults.minNom;

    fitToBox($("tNum"), maxNum, minNum);
    fitToBox($("tApe"), maxApe, minApe);
    fitToBox($("tNom"), maxNom, minNom);
  }

  function saveAll(){
    const offx = parseFloat($("offx").value);
    const offy = parseFloat($("offy").value);

    if(Number.isFinite(offx)) setVar("--off-x", offx, "mm");
    if(Number.isFinite(offy)) setVar("--off-y", offy, "mm");

    const patch = {
      num: $("num").value,
      ape: $("ape").value,
      nom: $("nom").value,
      offx: Number.isFinite(offx) ? offx : defaults.offx,
      offy: Number.isFinite(offy) ? offy : defaults.offy,
      maxNum: parseFloat($("maxNum").value) || defaults.maxNum,
      minNum: parseFloat($("minNum").value) || defaults.minNum,
      maxApe: parseFloat($("maxApe").value) || defaults.maxApe,
      minApe: parseFloat($("minApe").value) || defaults.minApe,
      maxNom: parseFloat($("maxNom").value) || defaults.maxNom,
      minNom: parseFloat($("minNom").value) || defaults.minNom,
      guides: $("showGuides").checked
    };

    saveState(patch);
    updatePreviewScale();
    refresh();
    alert("Guardado ✅");
  }

  function resetOffsets(){
    $("offx").value = defaults.offx;
    $("offy").value = defaults.offy;
    setVar("--off-x", defaults.offx, "mm");
    setVar("--off-y", defaults.offy, "mm");
    saveState({ offx: defaults.offx, offy: defaults.offy });
    updatePreviewScale();
    refresh();
  }

  function init(){
    const st = { ...defaults, ...loadState() };

    $("num").value = st.num ?? defaults.num;
    $("ape").value = st.ape ?? defaults.ape;
    $("nom").value = st.nom ?? defaults.nom;

    $("offx").value = st.offx ?? defaults.offx;
    $("offy").value = st.offy ?? defaults.offy;

    $("maxNum").value = st.maxNum ?? defaults.maxNum;
    $("minNum").value = st.minNum ?? defaults.minNum;
    $("maxApe").value = st.maxApe ?? defaults.maxApe;
    $("minApe").value = st.minApe ?? defaults.minApe;
    $("maxNom").value = st.maxNom ?? defaults.maxNom;
    $("minNom").value = st.minNom ?? defaults.minNom;

    $("showGuides").checked = (st.guides ?? true);

    setVar("--off-x", (st.offx ?? defaults.offx), "mm");
    setVar("--off-y", (st.offy ?? defaults.offy), "mm");

    applyGuides($("showGuides").checked);

    updatePreviewScale();
    refresh();

    // segunda pasada (fuentes/layout)
    requestAnimationFrame(() => {
      updatePreviewScale();
      refresh();
    });
  }

  // Eventos
  $("btnUpdate").addEventListener("click", () => { updatePreviewScale(); refresh(); });
  $("btnSave").addEventListener("click", saveAll);
  $("btnReset").addEventListener("click", resetOffsets);

  $("btnPrint").addEventListener("click", () => {
    updatePreviewScale();
    refresh();
    window.print();
  });

  $("showGuides").addEventListener("change", (e) => {
    applyGuides(e.target.checked);
    saveState({ guides: e.target.checked });
  });

  ["num","ape","nom"].forEach(id => {
    $(id).addEventListener("input", () => refresh());
  });

  // recalcular preview si cambia el tamaño
  window.addEventListener("resize", () => {
    updatePreviewScale();
    refresh();
  });

  // CLAVE: antes de imprimir, recalcular fit sin escala preview
  window.addEventListener("beforeprint", () => {
    // en print.css el sheet queda transform:none, así que refresco ahí también
    refresh();
    requestAnimationFrame(refresh);
  });

  init();
})();
