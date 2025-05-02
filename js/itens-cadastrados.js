// =============================================
// Inicialização da página
// =============================================
document.addEventListener("DOMContentLoaded", () => {
  const emailUsuarioLogado = sessionStorage.getItem("usuarioLogado");
  if (!emailUsuarioLogado) {
    window.location.href = "login.html";
    return;
  }

  const perfis = JSON.parse(localStorage.getItem("perfisUsuarios")) || {};
  const perfil = perfis[emailUsuarioLogado];

  document.getElementById("fotoMiniatura").src =
    perfil?.fotoPerfil || "assets/avatar-default.png";
  document.getElementById("nomeMiniatura").textContent = perfil?.nome || "";

  carregarItensLista();
  preencherFiltros();
  configurarEventosFiltros();
  configurarResponsividadeBackup();

  // Eventos para os links de backup no menu superior (responsivo)
  // BOTÃO GRANDE: Exportar (desktop)
  document
    .getElementById("btnExportarBackup")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      exportarBackup();
    });

  // BOTÃO GRANDE: Importar (desktop)
  document
    .getElementById("btnImportarBackup")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("inputImportarBackup").click();
    });

  // INPUT FILE invisível — usado por todos
  document
    .getElementById("inputImportarBackup")
    ?.addEventListener("change", importarBackup);

  // LINKS DO MENU (modo responsivo)
  document
    .getElementById("linkExportarBackup")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      exportarBackup();
    });

  document
    .getElementById("linkImportarBackup")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("inputImportarBackup").click();
    });
});

// =============================================
// Renderização de Itens Ativos (não expirados)
// =============================================
function carregarItensLista() {
  const container = document.getElementById("listaItens");
  let itens = JSON.parse(localStorage.getItem("itensCadastrados")) || [];
  itens = filtrarItensAtivos(itens);

  container.innerHTML =
    itens.length === 0 ? "<p>Nenhum item disponível.</p>" : "";
  itens.forEach((item) => renderizarItem(item, container));
  configurarEventosVerMais();
}

function filtrarItensAtivos(itens) {
  const hoje = new Date();
  return itens.filter((item) => {
    const dataCadastro = new Date(item.dataCadastro);
    const dataFim = new Date(
      dataCadastro.getTime() + parseInt(item.duracao) * 86400000
    );
    return dataFim > hoje;
  });
}

function renderizarItem(item, container) {
  const div = document.createElement("div");
  div.classList.add("item-lista");

  const imagem = item.fotos?.[0]
    ? `<img src="${item.fotos[0]}" alt="Imagem do item" class="miniatura">`
    : "";
  div.innerHTML = `
    <div class="resumo-item">
      ${imagem}
      <div class="info-resumida">
        <h3>${item.nome}</h3>
        <p><strong>Cidade:</strong><br> ${item.endereco?.cidade || "N/A"}</p>
        <p><strong>Categoria:</strong><br> ${item.categoria}</p>
        <button class="btn-vermais" data-item='${JSON.stringify(
          item
        )}'>Ver mais</button>
      </div>
    </div>
  `;
  container.appendChild(div);
}

function configurarEventosVerMais() {
  document.querySelectorAll(".btn-vermais").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = JSON.parse(btn.dataset.item);
      sessionStorage.setItem("itemDetalhado", JSON.stringify(item));
      sessionStorage.setItem("origemDetalhes", window.location.pathname);
      window.location.href = "detalhes-item.html";
    });
  });
}

// =============================================
// Filtros e Ordenações
// =============================================
function preencherFiltros() {
  const itens = filtrarItensAtivos(
    JSON.parse(localStorage.getItem("itensCadastrados")) || []
  );
  const criadores = [...new Set(itens.map((i) => i.criador))];
  const categorias = [...new Set(itens.map((i) => i.categoria))];
  const cidades = [...new Set(itens.map((i) => i.endereco?.cidade || "N/A"))];

  preencherSelect("filtroCriador", criadores);
  preencherSelect("filtroCategoria", categorias);
  preencherSelect("filtroCidade", cidades);
}

function preencherSelect(id, valores) {
  const select = document.getElementById(id);
  valores.forEach((val) => {
    const opt = document.createElement("option");
    opt.value = val;
    opt.textContent = val;
    select.appendChild(opt);
  });
}

function configurarEventosFiltros() {
  const ids = [
    "campoBusca",
    "filtroCriador",
    "filtroCategoria",
    "filtroCidade",
    "ordenarPor",
  ];
  ids.forEach((id) => {
    document.getElementById(id).addEventListener("input", aplicarFiltrosEBusca);
  });
  document.getElementById("btnLimparFiltros").addEventListener("click", () => {
    ids.forEach((id) => (document.getElementById(id).value = ""));
    aplicarFiltrosEBusca();
  });
}

function aplicarFiltrosEBusca() {
  let itens = filtrarItensAtivos(
    JSON.parse(localStorage.getItem("itensCadastrados")) || []
  );

  const campoBusca = document.getElementById("campoBusca").value.toLowerCase();
  const filtroCriador = document
    .getElementById("filtroCriador")
    .value.toLowerCase();
  const filtroCategoria = document
    .getElementById("filtroCategoria")
    .value.toLowerCase();
  const filtroCidade = document
    .getElementById("filtroCidade")
    .value.toLowerCase();
  const ordenarPor = document.getElementById("ordenarPor").value;

  const btnLimpar = document.getElementById("limparFiltrosContainer");
  btnLimpar.classList.toggle(
    "hidden",
    !(
      campoBusca ||
      filtroCriador ||
      filtroCategoria ||
      filtroCidade ||
      ordenarPor
    )
  );

  if (campoBusca) {
    itens = itens.filter((item) => {
      const campos = [
        item.nome,
        item.descricao,
        item.categoria,
        item.criador,
        item.endereco?.cidade,
        item.endereco?.estado,
        item.endereco?.rua,
        item.endereco?.bairro,
        item.endereco?.cep,
      ];
      return campos.some((campo) => campo?.toLowerCase().includes(campoBusca));
    });
  }

  if (filtroCriador)
    itens = itens.filter((i) => i.criador.toLowerCase() === filtroCriador);
  if (filtroCategoria)
    itens = itens.filter((i) => i.categoria.toLowerCase() === filtroCategoria);
  if (filtroCidade)
    itens = itens.filter(
      (i) => (i.endereco?.cidade || "").toLowerCase() === filtroCidade
    );

  if (ordenarPor) {
    itens.sort((a, b) => {
      switch (ordenarPor) {
        case "nome":
          return a.nome.localeCompare(b.nome);
        case "cidade":
          return (a.endereco?.cidade || "").localeCompare(
            b.endereco?.cidade || ""
          );
        case "categoria":
          return a.categoria.localeCompare(b.categoria);
        case "data":
          return new Date(b.dataCadastro) - new Date(a.dataCadastro);
        case "duracao":
          return parseInt(a.duracao) - parseInt(b.duracao);
        case "termino": {
          const dataA = new Date(
            new Date(a.dataCadastro).getTime() + parseInt(a.duracao) * 86400000
          );
          const dataB = new Date(
            new Date(b.dataCadastro).getTime() + parseInt(b.duracao) * 86400000
          );
          return dataA - dataB;
        }
      }
    });
  }

  exibirItensFiltrados(itens);
}

function exibirItensFiltrados(itens) {
  const container = document.getElementById("listaItens");
  container.innerHTML =
    itens.length === 0 ? "<p>Nenhum item encontrado.</p>" : "";
  itens.forEach((item) => renderizarItem(item, container));
  configurarEventosVerMais();
}

// =============================================
// Exportar / Importar Backup
// =============================================
async function exportarBackup() {
  const dados = {
    itensCadastrados:
      JSON.parse(localStorage.getItem("itensCadastrados")) || [],
    categorias: JSON.parse(localStorage.getItem("categorias")) || [],
    ofertas: JSON.parse(localStorage.getItem("ofertas")) || [],
    perfisUsuarios: JSON.parse(localStorage.getItem("perfisUsuarios")) || {},
  };

  const jsonString = JSON.stringify(dados, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });

  // Tenta usar a API moderna se suportada
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: "backup-2ndlife.json",
        types: [
          {
            description: "Arquivo JSON",
            accept: { "application/json": [".json"] },
          },
        ],
      });

      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();

      setTimeout(() => {
        exibirModalConfirmacao("Backup exportado com sucesso!");
      }, 300);

      return;
    } catch (err) {
      if (err.name !== "AbortError") {
        exibirModalConfirmacao("Erro ao exportar o backup.");
        console.error(err);
      }
      // Se o usuário cancelar, faz nada
      return;
    }
  }

  // Fallback para navegadores que não suportam showSaveFilePicker
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "backup-2ndlife.json";
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  setTimeout(() => {
    exibirModalConfirmacao("Backup exportado com sucesso!");
  }, 300);
}

function importarBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const dados = JSON.parse(e.target.result);
      localStorage.setItem(
        "itensCadastrados",
        JSON.stringify(dados.itensCadastrados || [])
      );
      localStorage.setItem(
        "categorias",
        JSON.stringify(dados.categorias || [])
      );
      localStorage.setItem("ofertas", JSON.stringify(dados.ofertas || []));
      localStorage.setItem(
        "perfisUsuarios",
        JSON.stringify(dados.perfisUsuarios || {})
      );

      exibirModalConfirmacao("Backup importado com sucesso!", () => {
        location.reload();
      });
    } catch (error) {
      exibirModalConfirmacao("Erro ao importar o backup. Verifique o arquivo.");
    }
  };
  reader.readAsText(file);
}

// =============================================
// Ajuste de layout para mostrar links de backup em telas pequenas
// =============================================
function configurarResponsividadeBackup() {
  function ajustarLinks() {
    const largura = window.innerWidth;
    document
      .getElementById("linkExportarBackup")
      .classList.toggle("hidden", largura > 1150);
    document
      .getElementById("linkImportarBackup")
      .classList.toggle("hidden", largura > 1150);
  }
  ajustarLinks();
  window.addEventListener("resize", ajustarLinks);
}

// =============================================
// Funções auxiliares do topo
// =============================================
function toggleMenu() {
  const links = document.querySelector(".menu-links");
  links.classList.toggle("show");
}

function abrirCadastroNovo() {
  sessionStorage.removeItem("itemEmEdicao");
  window.location.href = "cadastro-item.html";
}

function sair() {
  sessionStorage.removeItem("usuarioLogado");
  window.location.href = "login.html";
}

// =============================================
// EXIBE MODAL COM CONFIRMAÇOES.
// =============================================

function exibirModalConfirmacao(texto, callback) {
  const modal = document.querySelector(".modal-acao.modal-confirmacao");
  const mensagem = modal.querySelector(".modal-acao-content p");

  if (!modal || !mensagem) return;

  mensagem.textContent = texto;
  modal.classList.remove("hidden");
  modal.classList.add("show");

  setTimeout(() => {
    modal.classList.remove("show");
    modal.classList.add("hidden");
    if (typeof callback === "function") callback();
  }, 1800);
}
