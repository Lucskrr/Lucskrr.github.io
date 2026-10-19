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

  // origem do contato: ?utm_source=... na URL ou, se não houver, o site de onde a pessoa veio.
  // A origem vai só dentro da mensagem do WhatsApp; nada é gravado no navegador.
  function origemDoVisitante() {
    var origem = "";
    try { origem = new URLSearchParams(window.location.search).get("utm_source") || ""; } catch (e) { /* sem origem */ }
    if (!origem && document.referrer) {
      try {
        var host = new URL(document.referrer).hostname.replace(/^www\./, "");
        if (host && host !== window.location.hostname) origem = host;
      } catch (e) { /* referrer inválido */ }
    }
    return origem.replace(/[^\w.\-]/g, "").slice(0, 40);
  }
  var origem = origemDoVisitante();
  var texto = "Olá Lucca! Vi seu portfólio e gostaria de conversar." + (origem ? " (origem: " + origem + ")" : "");
  document.querySelectorAll("a[data-wa]").forEach(function (a) {
    a.href = "https://wa.me/5541998861768?text=" + encodeURIComponent(texto);
  });

  // botão do diagnóstico gratuito: mensagem própria, para o negócio completar o nome
  var textoDiag = "Olá Lucca! Quero o diagnóstico gratuito de presença no Google do meu negócio." +
    (origem ? " (origem: " + origem + ")" : "") + "\nNome do negócio: ";
  document.querySelectorAll("a[data-wa-diag]").forEach(function (a) {
    a.href = "https://wa.me/5541998861768?text=" + encodeURIComponent(textoDiag);
  });

  // formulário de proposta: só aparece se houver um endereço de envio configurado
  var form = document.getElementById("form-contato");
  if (form) {
    var endpoint = (form.getAttribute("data-endpoint") || "").trim();
    var caixa = document.getElementById("diag");
    if (!endpoint) {
      form.hidden = true;
      if (caixa) caixa.classList.add("so-um");
    } else {
      var campoOrigem = form.querySelector("input[name=origem]");
      if (campoOrigem) campoOrigem.value = origem || "direto";
      var status = document.getElementById("form-status");
      var botao = form.querySelector("button[type=submit]");
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        status.className = "form-status";
        if (!form.checkValidity()) { form.reportValidity(); return; }
        var dados = new FormData(form);
        if (dados.get("_gotcha")) { return; } // robô: ignora em silêncio
        botao.disabled = true;
        status.textContent = "Enviando...";
        fetch(endpoint, { method: "POST", body: dados, headers: { Accept: "application/json" } })
          .then(function (r) {
            if (!r.ok) { throw new Error("falha " + r.status); }
            form.reset();
            if (campoOrigem) campoOrigem.value = origem || "direto";
            status.className = "form-status ok";
            status.textContent = "Recebi! Respondo em breve pelo contato que você informou.";
            if (window.goatcounter && typeof window.goatcounter.count === "function") {
              window.goatcounter.count({ path: "formulario-enviado", title: "Formulário enviado", event: true });
            }
          })
          .catch(function () {
            status.className = "form-status erro";
            status.textContent = "Não consegui enviar agora. Tente de novo ou chame no WhatsApp.";
          })
          .then(function () { botao.disabled = false; });
      });
    }
  }

  // contagem de cliques nos contatos (só age se o GoatCounter estiver carregado)
  document.querySelectorAll("a[data-goal]").forEach(function (a) {
    a.addEventListener("click", function () {
      if (window.goatcounter && typeof window.goatcounter.count === "function") {
        window.goatcounter.count({ path: a.getAttribute("data-goal"), title: a.textContent.trim(), event: true });
      }
    });
  });

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
