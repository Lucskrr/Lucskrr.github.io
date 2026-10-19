(function () {
  var raiz = document.documentElement;

  // tema: respeita o sistema e lembra a escolha (o armazenamento pode estar bloqueado)
  function lerTema() {
    try { return localStorage.getItem("tema"); } catch (e) { return null; }
  }
  function salvarTema(v) {
    try { localStorage.setItem("tema", v); } catch (e) { /* sem persistência, tudo bem */ }
  }
  var salvo = lerTema();
  if (salvo === "light" || salvo === "dark") raiz.setAttribute("data-theme", salvo);

  var botao = document.getElementById("tema");
  function temaAtual() {
    var forcado = raiz.getAttribute("data-theme");
    if (forcado) return forcado;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  function rotular() {
    if (botao) botao.textContent = temaAtual() === "dark" ? "☀ Claro" : "☾ Escuro";
  }
  if (botao) {
    botao.addEventListener("click", function () {
      var novo = temaAtual() === "dark" ? "light" : "dark";
      raiz.setAttribute("data-theme", novo);
      salvarTema(novo);
      rotular();
    });
  }
  rotular();

  // brilho que acompanha o cursor
  var reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduz) {
    window.addEventListener("pointermove", function (e) {
      raiz.style.setProperty("--mx", e.clientX + "px");
      raiz.style.setProperty("--my", e.clientY + "px");
    }, { passive: true });
  }

  // entrada dos blocos ao rolar
  var itens = document.querySelectorAll(".reveal");
  if (reduz || !("IntersectionObserver" in window)) {
    itens.forEach(function (el) { el.classList.add("in"); });
    return;
  }
  var obs = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("in"); obs.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  itens.forEach(function (el) { obs.observe(el); });
})();
