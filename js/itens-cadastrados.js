document.addEventListener("DOMContentLoaded", () => {
  // obtém usuário logado.
  const usuarioLogado = JSON.parse(sessionStorage.getItem("usuarioLogado"));

  // se usuário nao estiver logado redireciona(controle).
  if (!usuarioLogado) {
    window.location.href = "login.html";
    return;
  }

  const perfis = JSON.parse(localStorage.getItem("perfisUsuarios")) || {};
  const perfil = perfis[usuarioLogado.email];

  const foto = document.getElementById("fotoMiniatura");
  const nome = document.getElementById("nomeMiniatura");

  carregarItensLista();
  preencherFiltros();

  // campo de busca e filtros
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

  // foto e nome do perfil no menu
  if (foto && nome) {
    foto.src = perfil?.fotoPerfil || "assets/avatar-default.png";
    nome.textContent = usuarioLogado.nome;
  }
});

// carrega os itens cadastrados
function carregarItensLista() {
  const container = document.getElementById("listaItens");
  const itens = JSON.parse(localStorage.getItem("itensCadastrados")) || [];

  // mensagem caso nao tenha item cadastrado
  container.innerHTML =
    itens.length === 0 ? "<p>Nenhum item cadastrado.</p>" : "";

  // Chama funçao renderizar item, utiliza o foreach para mandar item a item...
  itens.forEach((item) => renderizarItem(item, container));
  //
  configurarEventosVerMais();
}

// esta dentro do foreach inserindo item a item...
function renderizarItem(item, container) {
  const itemDiv = document.createElement("div");
  itemDiv.classList.add("item-lista");

  const imagemMiniatura = item.fotos[0]
    ? `<img src="${item.fotos[0]}" alt="Imagem do item" class="miniatura" />`
    : "";

  // no button temos o data-item - obtem todos os dados do item.
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

  // insere a div criada como 'filho' da div principal (listaItens)
  container.appendChild(itemDiv);
}

// adicionar evento de click nos botoes 'Ver mais'
function configurarEventosVerMais() {
  document.querySelectorAll(".btn-vermais").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = JSON.parse(btn.dataset.item);
      abrirModalDetalhes(item);
    });
  });
}

// obtem o item da funçao 'configurarEventosVerMais'
// atribui os itens na modal detalhes
function abrirModalDetalhes(item) {
  // obtem a modal de detalhes do item
  const modal = document.getElementById("modalItem");

  // onde vai ser inserido os detalhes
  const modalDetalhes = document.getElementById("modalDetalhes");

  // confirmaçao de usuario logado.
  const usuarioLogado = JSON.parse(sessionStorage.getItem("usuarioLogado"));

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

  // formata a data de termino
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

  // Configura os eventos dos botões.
  // setTimeout so é carregado depois que o navegador carrega a modal.(evitando null)
  setTimeout(() => {
    // obtem os botoes criados acima.
    const btnExcluir = modalDetalhes.querySelector(".btn-excluir-modal");
    const btnEditar = modalDetalhes.querySelector(".btn-editar-modal");
    const imagens = modalDetalhes.querySelectorAll(".foto-detalhe");

    // adicionando evento de click nas imagens, exibindo a imagem ampliada
    imagens.forEach((img) => {
      img.addEventListener("click", () => {
        const visualizador = document.getElementById("visualizadorImagem");
        const imagemAmpliada = document.getElementById("imagemAmpliada");
        imagemAmpliada.src = img.src;
        visualizador.classList.remove("hidden");
      });
    });

    // configurando botao excluir
    if (btnExcluir) {
      let confirmandoExclusao = false;

      // altera o nome do botao escluir para confirmar...
      btnExcluir.addEventListener("click", () => {
        if (!confirmandoExclusao) {
          btnExcluir.textContent = "Confirmar";
          btnExcluir.classList.add("confirmar-apagar");
          confirmandoExclusao = true;
        } else {
          // se clicar no botao confirmar...
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

    // configurando botao editar
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

// preenchendo as opçoes de filtros...
function preencherFiltros() {
  const itens = JSON.parse(localStorage.getItem("itensCadastrados")) || [];

  // obtem apenas o nome dos criadores (sem duplicatas) e retorna como array
  const criadores = [...new Set(itens.map((i) => i.criador))];

  // obtem apenas o nome das categorias (sem duplicatas) e retorna como array
  const categorias = [...new Set(itens.map((i) => i.categoria))];

  const criadorSelect = document.getElementById("filtroCriador");
  const categoriaSelect = document.getElementById("filtroCategoria");

  // insere no options os nomes dos criadores...
  criadores.forEach((nome) => {
    const opt = document.createElement("option");
    opt.value = nome;
    opt.textContent = nome;
    criadorSelect.appendChild(opt);
  });
  // insere no options os nomes das categorias...
  categorias.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoriaSelect.appendChild(opt);
  });
}

// funçao chamada sempre que o input ou options é alterado
function aplicarFiltrosEBusca() {
  // obtem o valor digitado no input
  const campoBusca = document.getElementById("campoBusca").value.toLowerCase();

  // obtem o valor selecionado no filtro criador
  const filtroCriador = document
    .getElementById("filtroCriador")
    .value.toLowerCase();

  // obtem o valor selecionado no filtro categoria
  const filtroCategoria = document
    .getElementById("filtroCategoria")
    .value.toLowerCase();

  // obtem o valor selecionado no filtro ordenado por
  const ordenarPor = document.getElementById("ordenarPor").value;

  // se retornar algo (é porque tem algum filtro)
  const mostrarBotaoLimpar =
    campoBusca || filtroCriador || filtroCategoria || ordenarPor;

  // obtem o elemento do botao limpar filtro
  const limparContainer = document.getElementById("limparFiltrosContainer");

  // se o elemento existir...
  if (limparContainer) {
    // se mostrarBotaoLimpar estiver vazio insere hiddem.(!mostrarBotaoLimpar)
    limparContainer.classList.toggle("hidden", !mostrarBotaoLimpar);
  }

  // obtem os itens cadastrados
  let itens = JSON.parse(localStorage.getItem("itensCadastrados")) || [];

  // realiza o filtro do imput buscar...
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

      // se retornar true mantem o item no array
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

  // Ordenação ('a' vem antes de 'b' define ordem crescende ou decrescente)
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

  // depois de realizado os filtros (exibe os itens)
  exibirItensFiltrados(itens);
}

// ############################################
// ############################################
// continuar daqui...
// ############################################
// ############################################

function abrirCadastroNovo() {
  sessionStorage.removeItem("itemEmEdicao");
  window.location.href = "cadastro-item.html";
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
