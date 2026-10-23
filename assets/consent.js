(function () {
  // ID de métricas do GA4 (G-XXXXXXX). Vazio = nada do Google carrega e o banner não aparece.
  var GA_ID = "G-BCLD06LL15";
  if (!GA_ID) return;

  // Consent Mode v2: tudo negado até a pessoa escolher
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  gtag("consent", "default", {
    ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
    analytics_storage: "denied", wait_for_update: 500
  });

  var CHAVE = "consent_v1";
  function lerEscolha() {
    try { return JSON.parse(localStorage.getItem(CHAVE) || "null"); } catch (e) { return null; }
  }
  function salvarEscolha(v) {
    try { localStorage.setItem(CHAVE, JSON.stringify(v)); } catch (e) { /* sem persistência, o banner volta na próxima visita */ }
  }
  function aplicar(esc) {
    var a = esc.analiticos ? "granted" : "denied";
    var m = esc.marketing ? "granted" : "denied";
    gtag("consent", "update", { analytics_storage: a, ad_storage: m, ad_user_data: m, ad_personalization: m });
  }

  var salva = lerEscolha();
  if (salva) aplicar(salva);

  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
  document.head.appendChild(s);
  gtag("js", new Date());
  gtag("config", GA_ID);

  // banner: três botões com o mesmo peso, e "Personalizar" abre os interruptores
  function montarBanner() {
    if (document.getElementById("cookies")) return document.getElementById("cookies");
    var atual = lerEscolha() || { analiticos: false, marketing: false };
    var el = document.createElement("div");
    el.id = "cookies";
    el.className = "cookies";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Preferências de cookies");
    el.innerHTML =
      '<p><strong>Cookies</strong> Uso cookies do Google para medir as visitas e os anúncios. Você escolhe. ' +
      '<a href="privacidade.html">Saiba mais</a></p>' +
      '<div class="cookies-opcoes" hidden>' +
        '<label><input type="checkbox" checked disabled> Necessários <small>(sempre ativos)</small></label>' +
        '<label><input type="checkbox" data-c="analiticos"' + (atual.analiticos ? " checked" : "") + '> Analíticos <small>(Google Analytics)</small></label>' +
        '<label><input type="checkbox" data-c="marketing"' + (atual.marketing ? " checked" : "") + '> Marketing <small>(Google Ads)</small></label>' +
      '</div>' +
      '<div class="cookies-botoes">' +
        '<button type="button" class="btn" data-acao="rejeitar">Rejeitar</button>' +
        '<button type="button" class="btn" data-acao="personalizar">Personalizar</button>' +
        '<button type="button" class="btn" data-acao="aceitar">Aceitar todos</button>' +
      '</div>';
    document.body.appendChild(el);

    var opcoes = el.querySelector(".cookies-opcoes");
    function escolher(esc) {
      esc.data = new Date().toISOString();
      salvarEscolha(esc);
      aplicar(esc);
      el.hidden = true;
    }
    el.addEventListener("click", function (e) {
      var acao = e.target.getAttribute && e.target.getAttribute("data-acao");
      if (acao === "aceitar") escolher({ analiticos: true, marketing: true });
      if (acao === "rejeitar") escolher({ analiticos: false, marketing: false });
      if (acao === "personalizar") {
        if (opcoes.hidden) { opcoes.hidden = false; e.target.textContent = "Salvar escolha"; return; }
        escolher({
          analiticos: el.querySelector('[data-c="analiticos"]').checked,
          marketing: el.querySelector('[data-c="marketing"]').checked
        });
      }
    });
    return el;
  }

  function iniciar() {
    if (!salva) montarBanner();
    document.querySelectorAll("[data-cookies]").forEach(function (b) {
      b.hidden = false;
      b.addEventListener("click", function () {
        var el = montarBanner();
        el.hidden = false;
        el.querySelector(".cookies-opcoes").hidden = false;
        el.querySelector('[data-acao="personalizar"]').textContent = "Salvar escolha";
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
