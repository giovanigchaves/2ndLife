// ===========================================
// Inicialização ao carregar a página
// ===========================================

window.addEventListener("DOMContentLoaded", () => {
  const usuario = getUsuarioAtual();

  // Se não estiver logado, redireciona para o login
  if (!usuario) {
    window.location.href = "login.html";
    return;
  }

  // Atualiza saudação e perfil visual
  document.getElementById("boasVindas").textContent = `Olá, ${usuario.nome}!`;
  document.getElementById("fotoMiniatura").src =
    usuario.fotoPerfil || "assets/avatar-default.png";
  document.getElementById("nomeMiniatura").textContent = usuario.nome;

  // Carrega informações do painel
  carregarMeusItens(usuario);
  carregarMinhasOfertas(usuario);
});

// ===========================================
// Função utilitária: obter usuário atual logado
// ===========================================

function getUsuarioAtual() {
  const email = sessionStorage.getItem("usuarioLogado");
  if (!email) return null;

  const perfis = JSON.parse(localStorage.getItem("perfisUsuarios")) || {};
  return perfis[email] || null;
}

// ===========================================
// Sessão: Meus Itens (criados pelo usuário)
// ===========================================

function carregarMeusItens(usuario) {
  const container = document.getElementById("meusItens");
  container.innerHTML = "";

  const todosItens = JSON.parse(localStorage.getItem("itensCadastrados")) || [];

  // Filtra apenas os itens criados por este usuário
  const meusItens = todosItens.filter((item) => item.criador === usuario.nome);

  if (meusItens.length === 0) {
    container.innerHTML = "<p>Você ainda não cadastrou nenhum item.</p>";
    return;
  }

  // Renderiza cada item
  meusItens.forEach((item) => {
    const card = criarCardItem(item, null, null);
    container.appendChild(card);
  });
}

// ===========================================
// Sessão: Minhas Ofertas (feitas pelo usuário)
// ===========================================

function carregarMinhasOfertas(usuario) {
  const container = document.getElementById("minhasOfertas");
  container.innerHTML = "";

  const todasOfertas = JSON.parse(localStorage.getItem("ofertas")) || [];
  const todosItens = JSON.parse(localStorage.getItem("itensCadastrados")) || [];

  // Seleciona apenas as ofertas feitas por este usuário
  const minhasOfertas = todasOfertas.filter(
    (o) => o.interessado === usuario.nome
  );

  if (minhasOfertas.length === 0) {
    container.innerHTML = "<p>Você ainda não fez nenhuma oferta.</p>";
    return;
  }

  // Para cada oferta feita, busca o item correspondente e monta card
  minhasOfertas.forEach((oferta) => {
    const item = todosItens.find((i) => i.id === oferta.itemId);
    if (!item) return;

    const expirado = itemEstaExpirado(item);
    const melhoresOfertas = todasOfertas.filter((o) => o.itemId === item.id);

    // Ordena ofertas pelo valor (maior primeiro)
    melhoresOfertas.sort((a, b) => parseFloat(b.valor) - parseFloat(a.valor));
    const melhorOferta = melhoresOfertas[0];

    // Determina o status da oferta do usuário
    let status = "";

    if (expirado) {
      status =
        melhorOferta?.interessado === usuario.nome
          ? "✅ Você venceu o lance"
          : "❌ Outro usuário venceu";
    } else {
      const diasRestantes = calcularDiasRestantes(item);
      console.log(diasRestantes);
      status = `⏳ Termina em ${diasRestantes} dia${
        diasRestantes !== 1 ? "s" : ""
      }`;
    }

    const card = criarCardItem(item, oferta, status);
    container.appendChild(card);
  });
}

// ===========================================
// Criação visual do card de item
// ===========================================

function criarCardItem(item, oferta = null, status = null) {
  const div = document.createElement("div");
  div.className = "card-item";

  // Verifica se o item tem ofertas recebidas (se for criador)
  const usuario = getUsuarioAtual();
  const todasOfertas = JSON.parse(localStorage.getItem("ofertas")) || [];
  const ofertasDoItem = todasOfertas.filter((o) => o.itemId === item.id);

  const ehCriador = item.criador.toLowerCase() === usuario.nome.toLowerCase();
  const possuiOfertas = ofertasDoItem.length > 0;

  if (ehCriador && possuiOfertas) {
    div.classList.add("item-com-lance"); // altera o estilo
  }

  // Imagem do item (ou padrão)
  const img = document.createElement("img");
  img.src = item.fotos?.[0] || "assets/no-image.png";

  // Informações do item
  const info = document.createElement("div");
  info.className = "card-info";

  const nome = document.createElement("h4");
  nome.textContent = item.nome;

  const categoria = document.createElement("p");
  categoria.textContent = `Categoria: ${item.categoria}`;

  const statusEl = document.createElement("p");

  let diasRestantes = calcularDiasRestantes(item);

  if (status) {
    statusEl.textContent = status;
  } else {
    statusEl.textContent = `⏳ Termina em ${diasRestantes} dia${
      diasRestantes !== 1 ? "s" : ""
    }`;
  }

  // Aplica a classe se o item estiver expirado OU o usuário tiver vencido
  if (diasRestantes <= 0 || status === "✅ Você venceu o lance") {
    div.classList.add("item-expirado");
  }

  info.appendChild(nome);
  info.appendChild(categoria);
  info.appendChild(statusEl);

  // Se houver ofertas, mostra lance atual
  if (ofertasDoItem.length > 0) {
    const maiorLance = Math.max(
      ...ofertasDoItem.map((o) => parseFloat(o.valor))
    );
    const lanceAtual = document.createElement("p");
    lanceAtual.innerHTML = `🏷️ Lance Atual: <b>R$ ${maiorLance.toFixed(2)}</b>`;
    info.appendChild(lanceAtual);
  }

  // Monta o card final
  div.appendChild(img);
  div.appendChild(info);

  // Clique abre os detalhes do item
  div.addEventListener("click", () => abrirDetalhesItem(item));

  return div;
}

// ===========================================
// Funções auxiliares
// ===========================================

function abrirDetalhesItem(item) {
  sessionStorage.setItem("itemDetalhado", JSON.stringify(item));
  sessionStorage.setItem("origemDetalhes", window.location.pathname);
  window.location.href = "detalhes-item.html";
}

function itemEstaExpirado(item) {
  const dataCadastro = new Date(item.dataCadastro);
  const dias = parseInt(item.duracao);
  const dataFim = new Date(dataCadastro.getTime() + dias * 86400000);
  return new Date() > dataFim;
}

function calcularDiasRestantes(item) {
  const dataCadastro = new Date(item.dataCadastro);
  const dias = parseInt(item.duracao);
  const dataFim = new Date(dataCadastro.getTime() + dias * 86400000);
  const hoje = new Date();
  const diffMs = dataFim - hoje;
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function abrirCadastroNovo() {
  sessionStorage.removeItem("itemEmEdicao");
  window.location.href = "cadastro-item.html";
}

function acessarPerfil() {
  window.location.href = "perfil.html";
}

function sair() {
  sessionStorage.removeItem("usuarioLogado");
  window.location.href = "login.html";
}

function toggleMenu() {
  const links = document.querySelector(".menu-links");
  links.classList.toggle("show");
}
