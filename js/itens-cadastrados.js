document.addEventListener("DOMContentLoaded", () => {
  const emailUsuarioLogado = sessionStorage.getItem("usuarioLogado");

  if (!emailUsuarioLogado) {
    window.location.href = "login.html";
    return;
  }

  const perfis = JSON.parse(localStorage.getItem("perfisUsuarios")) || {};
  const perfil = perfis[emailUsuarioLogado];

  const foto = document.getElementById("fotoMiniatura");
  const nome = document.getElementById("nomeMiniatura");

  if (foto && nome) {
    foto.src = perfil?.fotoPerfil || "assets/avatar-default.png";
    nome.textContent = perfil?.nome || "";
  }

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

  document
    .getElementById("filtroCidade")
    .addEventListener("change", aplicarFiltrosEBusca);

  document.getElementById("btnLimparFiltros").addEventListener("click", () => {
    document.getElementById("campoBusca").value = "";
    document.getElementById("filtroCriador").value = "";
    document.getElementById("filtroCategoria").value = "";
    document.getElementById("filtroCidade").value = "";
    document.getElementById("ordenarPor").value = "";
    aplicarFiltrosEBusca();
  });

  // foto e nome do perfil no menu
  if (foto && nome) {
    foto.src = perfil?.fotoPerfil || "assets/avatar-default.png";
    nome.textContent = perfil?.nome || "";
  }

  const tipoOfertaSelect = document.getElementById("tipoOferta");
  const campoValor = document.getElementById("campoValor");

  // Mostrar ou ocultar o campo de valor conforme tipo de oferta
  tipoOfertaSelect.addEventListener("change", () => {
    const tipo = tipoOfertaSelect.value;
    campoValor.classList.toggle(
      "hidden",
      tipo === "retirarGratis" || tipo === ""
    );
  });

  document
    .getElementById("linkExportarBackup")
    ?.addEventListener("click", () => {
      document.getElementById("btnExportarBackup").click();
    });

  document
    .getElementById("linkImportarBackup")
    ?.addEventListener("click", () => {
      document.getElementById("btnImportarBackup").click();
    });

  function ajustarLinksBackup() {
    const larguraTela = window.innerWidth;
    const exportarLink = document.getElementById("linkExportarBackup");
    const importarLink = document.getElementById("linkImportarBackup");

    if (larguraTela <= 1150) {
      exportarLink?.classList.remove("hidden");
      importarLink?.classList.remove("hidden");
    } else {
      exportarLink?.classList.add("hidden");
      importarLink?.classList.add("hidden");
    }
  }

  // Executa uma vez ao carregar
  ajustarLinksBackup();

  // Escuta quando a tela mudar de tamanho
  window.addEventListener("resize", ajustarLinksBackup);
});

// carrega os itens cadastrados
function carregarItensLista() {
  const container = document.getElementById("listaItens");
  let itens = JSON.parse(localStorage.getItem("itensCadastrados")) || [];

  const hoje = new Date();

  // 🔥 Remove os itens expirados
  itens = itens.filter((item) => {
    const dataCadastro = new Date(item.dataCadastro);
    const dataFim = new Date(
      dataCadastro.getTime() + parseInt(item.duracao) * 24 * 60 * 60 * 1000
    );
    return dataFim > hoje; // Só exibe itens ainda válidos
  });

  container.innerHTML =
    itens.length === 0 ? "<p>Nenhum item disponível.</p>" : "";

  itens.forEach((item) => renderizarItem(item, container));
  configurarEventosVerMais();
}

// esta dentro do foreach inserindo item a item...
function renderizarItem(item, container) {
  const itemDiv = document.createElement("div");
  itemDiv.classList.add("item-lista");

  const imagemMiniatura = item.fotos[0]
    ? `<img src="${item.fotos[0]}" alt="Imagem do item" class="miniatura" />`
    : "";

  // Calcula data de término
  const dataCadastro = new Date(item.dataCadastro);
  const diasDuracao = parseInt(item.duracao);
  const dataTermino = new Date(
    dataCadastro.getTime() + diasDuracao * 24 * 60 * 60 * 1000
  );
  const dataTerminoFormatada = dataTermino.toLocaleDateString("pt-BR");
  const hoje = new Date();
  const diffMs = dataTermino.getTime() - hoje.getTime();
  const diasRestantes = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  itemDiv.innerHTML = `
    <div class="resumo-item">
      ${imagemMiniatura}
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

function abrirModalDetalhes(item) {
  sessionStorage.setItem("itemDetalhado", JSON.stringify(item));
  sessionStorage.setItem("origemDetalhes", window.location.pathname); // armazena a origem
  window.location.href = "detalhes-item.html";
}

// preenchendo as opçoes de filtros...
function preencherFiltros() {
  const itens = JSON.parse(localStorage.getItem("itensCadastrados")) || [];

  // obtem apenas o nome dos criadores (sem duplicatas) e retorna como array
  const criadores = [...new Set(itens.map((i) => i.criador))];

  // obtem apenas o nome das categorias (sem duplicatas) e retorna como array
  const categorias = [...new Set(itens.map((i) => i.categoria))];

  const cidades = [...new Set(itens.map((i) => i.endereco?.cidade || "N/A"))];

  const criadorSelect = document.getElementById("filtroCriador");
  const categoriaSelect = document.getElementById("filtroCategoria");
  const cidadeSelect = document.getElementById("filtroCidade");

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
  cidades.forEach((cidade) => {
    const opt = document.createElement("option");
    opt.value = cidade;
    opt.textContent = cidade;
    cidadeSelect.appendChild(opt);
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

  const filtroCidade = document
    .getElementById("filtroCidade")
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
        item.endereco?.cidade,
        item.endereco?.estado,
        item.endereco?.rua,
        item.endereco?.bairro,
        item.endereco?.cep,
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
  // Filtro por cidade
  if (filtroCidade) {
    itens = itens.filter(
      (item) => (item.endereco?.cidade || "").toLowerCase() === filtroCidade
    );
  }

  // Ordenação ('a' vem antes de 'b' define ordem crescende ou decrescente)
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

//renderiza os iten filtrados na tela.
function exibirItensFiltrados(itens) {
  const container = document.getElementById("listaItens");
  container.innerHTML =
    itens.length === 0 ? "<p>Nenhum item encontrado.</p>" : "";

  itens.forEach((item) => renderizarItem(item, container));
  configurarEventosVerMais();
}

// ao clicar no botao Cadastrar Item, direciona para pagina de cadastro.
function abrirCadastroNovo() {
  sessionStorage.removeItem("itemEmEdicao");
  window.location.href = "cadastro-item.html";
}

// fecha modal detalhes do item quando clicado no X.
function fecharModal() {
  const modal = document.getElementById("modalItem");
  modal.classList.add("hidden");
}

// ao clicar no botao sair desloga e direciona para a pagina de login.
function sair() {
  sessionStorage.removeItem("usuarioLogado");
  window.location.href = "login.html";
}

// fecha a modal que visualiza a imagem.
function fecharVisualizadorImagem() {
  const visualizador = document.getElementById("visualizadorImagem");
  visualizador.classList.add("hidden");
}

// EXPORTAR BACKUP com escolha de local
document
  .getElementById("btnExportarBackup")
  .addEventListener("click", async () => {
    const dados = {
      itensCadastrados:
        JSON.parse(localStorage.getItem("itensCadastrados")) || [],
      categorias: JSON.parse(localStorage.getItem("categorias")) || [],
      ofertas: JSON.parse(localStorage.getItem("ofertas")) || [],
      perfisUsuarios: JSON.parse(localStorage.getItem("perfisUsuarios")) || {},
    };

    const jsonString = JSON.stringify(dados, null, 2);

    // Verifica suporte à API (salvar como)
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
      // Fallback: download automático (navegadores antigos)
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

        // exibe modal de confirmaçao.
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

let itemAtualOferta = null;

function abrirModalOferta(item) {
  itemAtualOferta = item;

  const modal = document.getElementById("modalOferta");
  const form = document.getElementById("formOferta");
  const tipoSelect = document.getElementById("tipoOferta");
  const inputValor = document.getElementById("valorOferta");
  const campoValor = document.getElementById("campoValor");

  if (!modal || !form || !tipoSelect || !inputValor || !campoValor) {
    console.error("Erro: elementos da modal não encontrados.");
    return;
  }

  form.reset();
  campoValor.classList.add("hidden");
  modal.classList.remove("hidden");

  // Formatar valor
  inputValor.removeEventListener("input", formatarComoMoeda);
  inputValor.addEventListener("input", formatarComoMoeda);

  // Mostrar ou esconder campo de valor com base na seleção
  tipoSelect.addEventListener("change", () => {
    const tipo = tipoSelect.value;
    campoValor.classList.toggle(
      "hidden",
      tipo === "" || tipo === "retirarGratis"
    );
  });

  // ✅ Registra o evento de envio no momento certo
  form.onsubmit = function (e) {
    e.preventDefault();

    const emailUsuarioLogado = sessionStorage.getItem("usuarioLogado");
    const perfis = JSON.parse(localStorage.getItem("perfisUsuarios")) || {};
    const usuario = perfis[emailUsuarioLogado];

    const tipoOferta = tipoSelect.value;
    const valorBruto = inputValor.value;
    const mensagem = document.getElementById("mensagemOferta");

    if (!usuario || !mensagem) {
      console.error("Erro ao capturar dados do formulário.");
      return;
    }

    const valor =
      tipoOferta === "pagarei" || tipoOferta === "cobro"
        ? valorBruto.replace(/[^\d,]/g, "").replace(",", ".")
        : "0";

    const todasOfertas = JSON.parse(localStorage.getItem("ofertas")) || [];

    // ⚠️ VERIFICAÇÃO: se já existe uma oferta deste usuário para este item
    const ofertaExistente = todasOfertas.find(
      (oferta) =>
        oferta.itemId === itemAtualOferta.id &&
        oferta.interessado.trim().toLowerCase() ===
          usuario.nome.trim().toLowerCase()
    );

    if (ofertaExistente) {
      alert("Você já enviou uma oferta para este item.");
      fecharModalOferta();
      return;
    }

    // ✅ Criar nova oferta
    const novaOferta = {
      itemId: itemAtualOferta.id,
      itemNome: itemAtualOferta.nome,
      itemCriador: itemAtualOferta.criador,
      interessado: usuario.nome,
      tipo: tipoOferta,
      valor: valor || "0",
      mensagem: mensagem.value.trim(),
      data: new Date().toISOString(),
    };

    todasOfertas.push(novaOferta);
    localStorage.setItem("ofertas", JSON.stringify(todasOfertas));

    fecharModalOferta();

    const modalConfirmacao = document.querySelector(
      ".modal-acao.modal-confirmacao"
    );
    const textoModal = modalConfirmacao.querySelector("p");
    textoModal.textContent = "Oferta enviada com sucesso!";
    modalConfirmacao.classList.remove("hidden");
    modalConfirmacao.classList.add("show");

    setTimeout(() => {
      modalConfirmacao.classList.remove("show");
      modalConfirmacao.classList.add("hidden");
    }, 1500);
  };
}

function fecharModalOferta() {
  document.getElementById("modalOferta").classList.add("hidden");
}

function formatarComoMoeda(e) {
  let valor = e.target.value;

  // Remove tudo que não for número
  valor = valor.replace(/\D/g, "");

  if (valor === "") {
    e.target.value = "";
    return;
  }

  // Converte para centavos
  valor = (parseInt(valor, 10) / 100).toFixed(2);

  // Formata para BRL
  const valorFormatado = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

  e.target.value = valorFormatado;
}
function toggleMenu() {
  const links = document.querySelector(".menu-links");
  links.classList.toggle("show");
}
