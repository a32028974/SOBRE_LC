function fitText(el) {
  let size = 72;
  el.style.fontSize = size + "pt";

  while (size > 10 && (el.scrollWidth > el.parentElement.clientWidth || el.scrollHeight > el.parentElement.clientHeight)) {
    size--;
    el.style.fontSize = size + "pt";
  }
}

function update() {
  const num = document.getElementById("num").value.toUpperCase();
  const ape = document.getElementById("ape").value.toUpperCase();
  const nom = document.getElementById("nom").value.toUpperCase();

  const vNum = document.getElementById("vNum");
  const vApe = document.getElementById("vApe");
  const vNom = document.getElementById("vNom");

  vNum.textContent = num;
  vApe.textContent = ape;
  vNom.textContent = nom;

  fitText(vNum);
  fitText(vApe);
  fitText(vNom);
}
