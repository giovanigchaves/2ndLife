// proteção de rota
// inserido para poder utilizar o usuario logado em todo o arquivo.
let usuarioLogado = null;

if (window.location.pathname.includes("itens-cadastrados.html")) {
  usuarioLogado = JSON.parse(sessionStorage.getItem("usuarioLogado"));
  if (!usuarioLogado) {
    window.location.href = "login.html";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  carregarItensLista();
  preencherFiltros();

  document
    .getElementById("campoBusca")
    .addEventListener("input", aplicarFiltrosEBusca);
  document
    .getElementById("filtroCriador")
    .addEventListener("change", aplicarFiltrosEBusca);
  document
    .getElementById("filtroCategoria")
    .addEventListener("change", aplicarFiltrosEBusca);
  document
    .getElementById("ordenarPor")
    .addEventListener("change", aplicarFiltrosEBusca);

  document.getElementById("btnLimparFiltros").addEventListener("click", () => {
    document.getElementById("campoBusca").value = "";
    document.getElementById("filtroCriador").value = "";
    document.getElementById("filtroCategoria").value = "";
    document.getElementById("ordenarPor").value = "";
    aplicarFiltrosEBusca();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado"));
  if (!usuario) return;

  const perfis = JSON.parse(localStorage.getItem("perfisUsuarios")) || {};
  const perfil = perfis[usuario.email];

  const foto = document.getElementById("fotoMiniatura");
  const nome = document.getElementById("nomeMiniatura");

  if (foto && nome) {
    foto.src = perfil?.fotoPerfil || "assets/avatar-default.png";
    nome.textContent = usuario.nome;
  }
});

function abrirCadastroNovo() {
  sessionStorage.removeItem("itemEmEdicao");
  window.location.href = "cadastro-item.html";
}

function renderizarItem(item, container) {
  const itemDiv = document.createElement("div");
  itemDiv.classList.add("item-lista");

  const imagemMiniatura = item.fotos[0]
    ? `<img src="${item.fotos[0]}" alt="Imagem do item" class="miniatura" />`
    : "";

  itemDiv.innerHTML = `
    <div class="resumo-item">
      ${imagemMiniatura}
      <div class="info-resumida">
        <h3>${item.nome}</h3>
        <p>Duração: ${item.duracao}</p>
        <button class="btn-vermais" data-item='${JSON.stringify(
          item
        )}'>Ver mais</button>
      </div>
    </div>
  `;

  container.appendChild(itemDiv);
}

function carregarItensLista() {
  const container = document.getElementById("listaItens");
  const itens = JSON.parse(localStorage.getItem("itensCadastrados")) || [];

  container.innerHTML =
    itens.length === 0 ? "<p>Nenhum item cadastrado.</p>" : "";

  itens.forEach((item) => renderizarItem(item, container));
  configurarEventosVerMais(); // 👈 Função nova (ver abaixo)
}

// FUNÇÃO NOVA - ADICIONE ISSO
function abrirModalDetalhes(item) {
  const modal = document.getElementById("modalItem");
  const modalDetalhes = document.getElementById("modalDetalhes");

  // Formata as datas
  const dataCadastro = new Date(item.dataCadastro);
  const dataCadastroFormatada = dataCadastro.toLocaleDateString("pt-BR");

  // Calcula data de término
  const duracaoTexto = item.duracao.toLowerCase();
  let dataTermino = new Date(dataCadastro);
  if (duracaoTexto.includes("d")) {
    const dias = parseInt(duracaoTexto);
    dataTermino.setDate(dataCadastro.getDate() + dias);
  }
  const dataTerminoFormatada = dataTermino.toLocaleDateString("pt-BR");

  // Renderiza o modal (com botões por CLASSE)
  modalDetalhes.innerHTML = `
    <strong class="nomeUsuariostrong">Cadastrado por: 
      <strong class="nomeUsuarioCad">${item.criador}</strong>
    </strong>
    <hr/>
    <h2>${item.nome}</h2>
    <p><strong>Descrição:</strong> ${item.descricao}</p>
    <p><strong>Categoria:</strong> ${item.categoria}</p>
    <p><strong>Duração:</strong> ${item.duracao}</p>
    <p><strong>Data de Cadastro:</strong> ${dataCadastroFormatada}</p>
    <p><strong>Término:</strong> ${dataTerminoFormatada}</p>
    <hr/>
    <div class="fotos-detalhe">
      ${item.fotos
        .map((foto) => `<img src="${foto}" class="foto-detalhe" />`)
        .join("")}
    </div>
    
    ${
      item.criador === usuarioLogado?.nome
        ? `
      <div class="btns">
        <button class="btn-editar-modal">Editar</button>
        <button class="btn-excluir-modal">Excluir</button>
      </div>
    `
        : ""
    }
  `;
  modal.classList.remove("hidden");

  // Configura os eventos dos botões (CORRETO: usa classes)
  setTimeout(() => {
    const btnExcluir = modalDetalhes.querySelector(".btn-excluir-modal");
    const btnEditar = modalDetalhes.querySelector(".btn-editar-modal");
    const imagens = modalDetalhes.querySelectorAll(".foto-detalhe");

    imagens.forEach((img) => {
      img.addEventListener("click", () => {
        const visualizador = document.getElementById("visualizadorImagem");
        const imagemAmpliada = document.getElementById("imagemAmpliada");
        imagemAmpliada.src = img.src;
        visualizador.classList.remove("hidden");
      });
    });

    if (btnExcluir) {
      let confirmandoExclusao = false;

      btnExcluir.addEventListener("click", () => {
        if (!confirmandoExclusao) {
          btnExcluir.textContent = "Confirmar";
          btnExcluir.classList.add("confirmar-apagar");
          confirmandoExclusao = true;
        } else {
          const itens =
            JSON.parse(localStorage.getItem("itensCadastrados")) || [];
          const novosItens = itens.filter(
            (i) => i.nome !== item.nome || i.criador !== item.criador
          );
          localStorage.setItem("itensCadastrados", JSON.stringify(novosItens));

          fecharModal();
          carregarItensLista();

          // Mostra modal de confirmação personalizada
          const modalConfirmacao = document.querySelector(
            ".modal-acao.modal-confirmacao"
          );
          const textoModal = modalConfirmacao.querySelector("p");
          textoModal.textContent = "Item excluído com sucesso!";
          modalConfirmacao.classList.remove("hidden");
          modalConfirmacao.classList.add("show");

          setTimeout(() => {
            modalConfirmacao.classList.remove("show");
            modalConfirmacao.classList.add("hidden");
          }, 1500);
        }
      });

      // Cancela se o usuário clicar em qualquer outro botão/modal
      modalDetalhes.addEventListener("click", (e) => {
        if (!e.target.classList.contains("btn-excluir-modal")) {
          btnExcluir.textContent = "Excluir";
          btnExcluir.classList.remove("confirmar-apagar");
          confirmandoExclusao = false;
        }
      });
    }

    if (btnEditar) {
      btnEditar.addEventListener("click", () => {
        // Salva os dados do item em sessionStorage para edição
        sessionStorage.setItem("itemEmEdicao", JSON.stringify(item));

        // Redireciona para a página de edição
        window.location.href = "cadastro-item.html";
      });
    }
  }, 0);
}

// ✅ ADICIONAR ESTA FUNÇÃO NOVA (no início do arquivo)
function configurarEventosVerMais() {
  document.querySelectorAll(".btn-vermais").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = JSON.parse(btn.dataset.item);
      abrirModalDetalhes(item);
    });
  });
}

function preencherFiltros() {
  const itens = JSON.parse(localStorage.getItem("itensCadastrados")) || [];
  const criadores = [...new Set(itens.map((i) => i.criador))];
  const categorias = [...new Set(itens.map((i) => i.categoria))];

  const criadorSelect = document.getElementById("filtroCriador");
  const categoriaSelect = document.getElementById("filtroCategoria");

  criadores.forEach((nome) => {
    const opt = document.createElement("option");
    opt.value = nome;
    opt.textContent = nome;
    criadorSelect.appendChild(opt);
  });

  categorias.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoriaSelect.appendChild(opt);
  });
}

function aplicarFiltrosEBusca() {
  const campoBusca = document.getElementById("campoBusca").value.toLowerCase();
  const filtroCriador = document
    .getElementById("filtroCriador")
    .value.toLowerCase();
  const filtroCategoria = document
    .getElementById("filtroCategoria")
    .value.toLowerCase();
  const ordenarPor = document.getElementById("ordenarPor").value;

  const mostrarBotaoLimpar =
    campoBusca || filtroCriador || filtroCategoria || ordenarPor;

  const limparContainer = document.getElementById("limparFiltrosContainer");
  if (limparContainer) {
    limparContainer.classList.toggle("hidden", !mostrarBotaoLimpar);
  }

  let itens = JSON.parse(localStorage.getItem("itensCadastrados")) || [];

  // Filtro por busca (nome ou descrição)
  if (campoBusca) {
    itens = itens.filter((item) => {
      const textoBusca = campoBusca;

      const campos = [
        item.nome,
        item.descricao,
        item.categoria,
        item.duracao,
        item.criador,
        new Date(item.dataCadastro).toLocaleDateString("pt-BR"),
      ];

      return campos.some((campo) => campo?.toLowerCase().includes(textoBusca));
    });
  }

  // Filtro por criador
  if (filtroCriador) {
    itens = itens.filter(
      (item) => item.criador.toLowerCase() === filtroCriador
    );
  }

  // Filtro por categoria
  if (filtroCategoria) {
    itens = itens.filter(
      (item) => item.categoria.toLowerCase() === filtroCategoria
    );
  }

  // Ordenação
  if (ordenarPor) {
    itens.sort((a, b) => {
      switch (ordenarPor) {
        case "nome":
          return a.nome.localeCompare(b.nome);
        case "categoria":
          return a.categoria.localeCompare(b.categoria);
        case "data":
          return new Date(b.dataCadastro) - new Date(a.dataCadastro);
        case "duracao":
          return parseInt(a.duracao) - parseInt(b.duracao);
        case "termino":
          const dataA = new Date(a.dataCadastro);
          dataA.setDate(dataA.getDate() + parseInt(a.duracao));
          const dataB = new Date(b.dataCadastro);
          dataB.setDate(dataB.getDate() + parseInt(b.duracao));
          return dataA - dataB;
        default:
          return 0;
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
  configurarEventosVerMais(); // Reutiliza a mesma função
}

function fecharModal() {
  const modal = document.getElementById("modalItem");
  modal.classList.add("hidden");
}
function sair() {
  sessionStorage.removeItem("usuarioLogado");
  window.location.href = "login.html";
}

// EXPORTAR BACKUP com escolha de local
document
  .getElementById("btnExportarBackup")
  .addEventListener("click", async () => {
    const dados = {
      itens: JSON.parse(localStorage.getItem("itensCadastrados")) || [],
      categorias: JSON.parse(localStorage.getItem("categorias")) || [],
    };

    const jsonString = JSON.stringify(dados, null, 2);

    // Verifica suporte à API
    if (window.showSaveFilePicker) {
      try {
        const options = {
          suggestedName: "backup-2ndlife.json",
          types: [
            {
              description: "Arquivo JSON",
              accept: { "application/json": [".json"] },
            },
          ],
        };

        const handle = await window.showSaveFilePicker(options);
        const writable = await handle.createWritable();
        await writable.write(jsonString);
        await writable.close();

        alert("Backup exportado com sucesso!");
      } catch (err) {
        if (err.name !== "AbortError") {
          alert("Erro ao exportar o backup.");
          console.error(err);
        }
      }
    } else {
      // Fallback: download automático
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "backup-2ndlife.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  });

// IMPORTAR BACKUP (.json)
document.getElementById("btnImportarBackup").addEventListener("click", () => {
  document.getElementById("inputImportarBackup").click();
});

document
  .getElementById("inputImportarBackup")
  .addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const dados = JSON.parse(e.target.result);
        localStorage.setItem(
          "itensCadastrados",
          JSON.stringify(dados.itens || [])
        );
        localStorage.setItem(
          "categorias",
          JSON.stringify(dados.categorias || [])
        );

        // Exibe a nova modal ao invés de alert
        const modalConfirmacao = document.querySelector(
          ".modal-acao.modal-confirmacao"
        );
        const textoModal = modalConfirmacao.querySelector("p");
        textoModal.textContent = "Backup importado com sucesso!";
        modalConfirmacao.classList.remove("hidden");
        modalConfirmacao.classList.add("show");

        setTimeout(() => {
          modalConfirmacao.classList.remove("show");
          modalConfirmacao.classList.add("hidden");
          location.reload(); // Atualiza a tela após a mensagem
        }, 1500);
      } catch (error) {
        alert("Erro ao importar o backup. Verifique o arquivo.");
      }
    };
    reader.readAsText(file);
  });

// excluir item
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-excluir")) {
    const index = e.target.dataset.index;
    const itens = JSON.parse(localStorage.getItem("itensCadastrados")) || [];

    if (confirm("Tem certeza que deseja excluir este item?")) {
      itens.splice(index, 1);
      localStorage.setItem("itensCadastrados", JSON.stringify(itens));
      carregarItensLista();
    }
  }
});

function fecharVisualizadorImagem() {
  const visualizador = document.getElementById("visualizadorImagem");
  visualizador.classList.add("hidden");
}
