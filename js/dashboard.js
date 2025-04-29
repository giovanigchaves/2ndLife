// dashboard.js

// Proteção da rota e carregamento
window.addEventListener("DOMContentLoaded", () => {
  const emailUsuarioLogado = sessionStorage.getItem("usuarioLogado");
  const perfis = JSON.parse(localStorage.getItem("perfisUsuarios")) || {};
  const usuario = perfis[emailUsuarioLogado];

  if (!usuario) {
    window.location.href = "login.html";
    return;
  }

  const boasVindas = document.getElementById("boasVindas");
  if (boasVindas) boasVindas.textContent = `Bem-vindo, ${usuario.nome}!`;

  if (usuario.fotoPerfil)
    document.getElementById("fotoMiniatura").src = usuario.fotoPerfil;

  document.getElementById("nomeMiniatura").textContent = usuario.nome;

  carregarMeusItens(usuario);
  carregarMinhasOfertas(usuario);
});

function sair() {
  sessionStorage.removeItem("usuarioLogado");
  window.location.href = "login.html";
}

function carregarMeusItens(usuario) {
  const container = document.getElementById("meusItens");
  container.innerHTML = "";
  const itens = JSON.parse(localStorage.getItem("itensCadastrados")) || [];
  const meusItens = itens.filter((item) => item.criador === usuario.nome);

  if (meusItens.length === 0) {
    container.innerHTML = "<p>Você ainda não cadastrou nenhum item.</p>";
    return;
  }

  meusItens.forEach((item) => {
    const card = criarCardItem(item);
    container.appendChild(card);
  });
}

function carregarMinhasOfertas(usuario) {
  const container = document.getElementById("minhasOfertas");
  container.innerHTML = "";
  const ofertas = JSON.parse(localStorage.getItem("ofertas")) || [];
  const itens = JSON.parse(localStorage.getItem("itensCadastrados")) || [];
  const minhas = ofertas.filter((o) => o.interessado === usuario.nome);

  if (minhas.length === 0) {
    container.innerHTML = "<p>Você ainda não fez nenhuma oferta.</p>";
    return;
  }

  minhas.forEach((oferta) => {
    const item = itens.find((i) => i.id === oferta.itemId);
    if (!item) return;

    const fim = new Date(
      new Date(item.dataCadastro).getTime() + parseInt(item.duracao) * 86400000
    );
    const expirado = fim < new Date();
    const todasOfertas = ofertas.filter((o) => o.itemId === item.id);
    const maior = todasOfertas.sort(
      (a, b) => parseFloat(b.valor) - parseFloat(a.valor)
    )[0];
    let status = expirado
      ? maior?.interessado === usuario.nome
        ? "✅ Você venceu o lance"
        : "❌ Outro usuário venceu"
      : `⏳ Termina em ${Math.ceil((fim - new Date()) / 86400000)} dia(s)`;

    const card = criarCardItem(item, oferta, status);
    container.appendChild(card);
  });
}

function criarCardItem(item, oferta = null, status = null) {
  const div = document.createElement("div");
  div.className = "card-item";

  const ofertas = JSON.parse(localStorage.getItem("ofertas")) || [];
  const emailUsuarioLogado = sessionStorage.getItem("usuarioLogado");
  const perfis = JSON.parse(localStorage.getItem("perfisUsuarios")) || {};
  const usuario = perfis[emailUsuarioLogado];

  const ofertasRecebidas = ofertas.filter(
    (oferta) => oferta.itemId === item.id
  );

  if (
    item.criador &&
    usuario.nome &&
    item.criador.toLowerCase() === usuario.nome.toLowerCase() &&
    ofertasRecebidas.length > 0
  ) {
    div.classList.add("item-com-lance");
  }

  const img = document.createElement("img");
  img.src = item.fotos?.[0] || "assets/no-image.png";

  const info = document.createElement("div");
  info.className = "card-info";

  const h4 = document.createElement("h4");
  h4.textContent = item.nome;

  const cat = document.createElement("p");
  cat.textContent = `Categoria: ${item.categoria}`;

  const statusEl = document.createElement("p");
  statusEl.textContent = status || `⏳ Termina em ${item.duracao}`;

  info.appendChild(h4);
  info.appendChild(cat);
  info.appendChild(statusEl);

  const ofertasDoItem = ofertas.filter((o) => o.itemId === item.id);
  if (ofertasDoItem.length > 0) {
    const maiorLance = Math.max(
      ...ofertasDoItem.map((o) => parseFloat(o.valor))
    );
    const lanceAtual = document.createElement("p");
    lanceAtual.innerHTML = `🏷️ Lance Atual: <b>R$ ${maiorLance.toFixed(2)}</b>`;
    info.appendChild(lanceAtual);
  }

  div.appendChild(img);
  div.appendChild(info);

  div.addEventListener("click", () => abrirDetalhesItem(item));

  return div;
}

function abrirDetalhesItem(item) {
  sessionStorage.setItem("itemDetalhado", JSON.stringify(item));
  sessionStorage.setItem("origemDetalhes", window.location.pathname); // armazena a origem
  window.location.href = "detalhes-item.html";
}
// ao clicar no botao Cadastrar Item, direciona para pagina de cadastro.
function abrirCadastroNovo() {
  sessionStorage.removeItem("itemEmEdicao");
  window.location.href = "cadastro-item.html";
}
// Acessar Perfil
function acessarPerfil() {
  window.location.href = "perfil.html";
}
function toggleMenu() {
  const links = document.querySelector(".menu-links");
  links.classList.toggle("show");
}
