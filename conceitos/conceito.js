(function () {
  // nos projetos conceito os botões do negócio fictício não abrem conversa: mostram o que fariam num site real
  var aviso = document.createElement("div");
  aviso.className = "toast";
  aviso.setAttribute("role", "status");
  aviso.setAttribute("aria-live", "polite");
  document.body.appendChild(aviso);
  var tempo;

  document.querySelectorAll("[data-demo]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      aviso.innerHTML = "Num site real, este botão abre o WhatsApp do negócio com a mensagem pronta: <em>“" +
        el.getAttribute("data-demo") + "”</em>. <a href=\"../sites.html#planos\">Quero um assim</a>";
      aviso.classList.add("on");
      clearTimeout(tempo);
      tempo = setTimeout(function () { aviso.classList.remove("on"); }, 6000);
    });
  });
})();
