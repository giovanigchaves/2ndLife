// ao carregar a pagina
document.addEventListener("DOMContentLoaded", () => {
  // obtém usuário logado.
  const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado"));

  // se usuário nao estiver logado redireciona(controle).
  if (!usuario) {
    window.location.href = "login.html";
    return;
  }

  // verifica se existe perfis de usuários no localStorage
  const perfis = JSON.parse(localStorage.getItem("perfisUsuarios")) || {};

  // obtém os dados do perfil do usuario
  const perfil = perfis[usuario.email];

  // Preenche automaticamente os campos de endereço se já tiver salvo
  if (
    perfil.cep &&
    perfil.rua &&
    perfil.numero &&
    perfil.bairro &&
    perfil.cidade &&
    perfil.estado
  ) {
    document.getElementById("cep").value = perfil.cep;
    document.getElementById("rua").value = perfil.rua;
    document.getElementById("numero").value = perfil.numero;
    document.getElementById("bairro").value = perfil.bairro;
    document.getElementById("cidade").value = perfil.cidade;
    document.getElementById("estado").value = perfil.estado;
  }

  // obtém o elemento foto e nome do perfil no html
  const foto = document.getElementById("fotoMiniatura");
  const nome = document.getElementById("nomeMiniatura");

  // se existir o html insere os dados.
  if (foto && nome) {
    foto.src = perfil?.fotoPerfil || "assets/avatar-default.png";
    nome.textContent = usuario.nome;
  }

  // #####################################################
  //  Modal de nova categoria (abrir, salvar, fechar)
  // #####################################################

  // obtém os elementos da modal do html
  const btnAbrir = document.getElementById("btnAddCategoria");
  const modal = document.getElementById("modalCategoria");
  const btnFechar = document.getElementById("fecharModalCategoria");
  const btnSalvar = document.getElementById("salvarCategoria");
  const inputNovaCategoria = document.getElementById("novaCategoria");
  const selectCategoria = document.getElementById("categoriaItem");

  // Garante que todos os elementos existem antes de adicionar os eventos
  if (
    btnAbrir &&
    modal &&
    btnFechar &&
    btnSalvar &&
    inputNovaCategoria &&
    selectCategoria
  ) {
    carregarCategorias();

    // abre modal Nova Categoria
    btnAbrir.addEventListener("click", () => {
      inputNovaCategoria.value = "";
      modal.classList.remove("hidden");
    });

    // fecha modal Nova Categoria
    btnFechar.addEventListener("click", () => {
      modal.classList.add("hidden");
    });

    // Salva nova categoria registrada
    btnSalvar.addEventListener("click", () => {
      // obtem a categoria removendo os espaços em branco
      const novaCategoria = inputNovaCategoria.value.trim();

      if (novaCategoria !== "") {
        salvarNovaCategoria(novaCategoria);
        carregarCategorias();

        // seleciona categoria criada
        selectCategoria.value = novaCategoria.toLowerCase();

        modal.classList.add("hidden");
      }
    });
  }

  // #####################################################
  //  Geremciar Categorias
  // #####################################################

  // obtém os elementos da modal do html
  const btnGerenciar = document.getElementById("btnGerenciarCategorias");
  const btnEditar = document.getElementById("editarCategoria");
  const btnApagar = document.getElementById("apagarCategoria");
  const btnConfirmarEdicao = document.getElementById("confirmarEdicao");
  const modalGerenciar = document.getElementById("modalGerenciar");
  const fecharGerenciar = document.getElementById("fecharGerenciarModal");
  const listaCategorias = document.getElementById("listaCategorias");
  const editarBox = document.getElementById("editarBox");
  const inputNovoNome = document.getElementById("novoNomeCategoria");
  const mensagemCategoria = document.getElementById("mensagemCategoria");

  // deixa a mensagem de confirmaçao em branco
  mensagemCategoria.textContent = "";

  // se existirem os elementos html
  if (btnGerenciar && modalGerenciar && fecharGerenciar && listaCategorias) {
    // obtem o elemento da modal nova categoria
    const modalNovaCategoria = document.getElementById("modalCategoria");

    // se clicar no botao gerenciar categoria
    btnGerenciar.addEventListener("click", () => {
      // deixa a mensagem de confirmaçao em branco
      mensagemCategoria.textContent = "";

      // oculta a modal nova categoria.
      if (
        modalNovaCategoria &&
        !modalNovaCategoria.classList.contains("hidden")
      ) {
        modalNovaCategoria.classList.add("hidden");
      }

      // atualiza as categorias no option (com filtro).
      atualizarListaGerenciar();

      //exibe a modal gerenciar categorias
      modalGerenciar.classList.remove("hidden");
    });

    // Quando o usuário trocar a categoria selecionada, limpa o campo de edição
    listaCategorias.addEventListener("change", () => {
      editarBox.classList.add("hidden"); // esconde o bloco de edição
      inputNovoNome.value = ""; // limpa o input de texto editar cat.
    });

    // fecha modal gerenciar categoria
    fecharGerenciar.addEventListener("click", () => {
      modalGerenciar.classList.add("hidden");
      editarBox.classList.add("hidden");
      carregarCategorias(); // atualiza a lista de categorias no option
    });

    // ao clicar no botao editar categoria, exibe o input para edição.
    btnEditar.addEventListener("click", () => {
      // obtem a categoria selecionada
      const selecionada = listaCategorias.value;

      inputNovoNome.value = selecionada;
      editarBox.classList.remove("hidden");
    });

    // atualiza o nome da categoria editado.
    btnConfirmarEdicao.addEventListener("click", () => {
      // obtem o nome editado da categoria
      const novoNome = inputNovoNome.value.trim();
      // obtem o nome antigo
      const antigo = listaCategorias.value;

      if (novoNome && antigo) {
        // obtem as categorias existentes em localStorage
        let categorias = JSON.parse(localStorage.getItem("categorias")) || [];

        // verifica se existe outra categoria com o mesmo nome.
        const cat = categorias.find((c) => c.nome === novoNome);

        // se existir envia uma mensagem
        if (cat) {
          mensagemCategoria.textContent = `Lamento ${usuario.nome} o nome ${novoNome} ja esta em uso!`;
          return;
        }

        // obtem o index (posição no arrey do item a ser alterado) da categoria
        const index = categorias.findIndex((cat) => cat.nome === antigo);

        // se encontrar o item a ser alterado (antigo)
        if (index > -1) {
          categorias[index].nome = novoNome; //atribui o novo nome
          localStorage.setItem("categorias", JSON.stringify(categorias));
          atualizarListaGerenciar();
          editarBox.classList.add("hidden");
          inputNovoNome.value = "";
          carregarCategorias(); // Atualiza o select (categoias) da tela principal.
        }
      }
    });

    // apagar um categoria
    // variavel para confirmaçao de exclusao.
    let confirmandoExclusao = false;

    btnApagar.addEventListener("click", () => {
      // obtem usuario logado
      const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado"));

      // obtem a categoria selecionada
      const categoria = listaCategorias.value;

      // obtem as categorias de localStorage
      let categorias = JSON.parse(localStorage.getItem("categorias")) || [];

      // altera o nome do botao apagar para Confirmar
      if (!confirmandoExclusao) {
        btnApagar.textContent = "Confirmar";
        btnApagar.classList.add("confirmar-apagar");
        confirmandoExclusao = true;

        // se foi clicado em Confirmar
      } else {
        // obtem todos as categorias menos a antiga
        categorias = categorias.filter((c) => c.nome !== categoria);
        // adiciona as categorias atualizadas em localStorage
        localStorage.setItem("categorias", JSON.stringify(categorias));

        atualizarListaGerenciar();
        carregarCategorias();

        editarBox.classList.add("hidden");
        confirmandoExclusao = false;
        btnApagar.textContent = "Apagar";
        btnApagar.classList.remove("confirmar-apagar");
        mensagemCategoria.textContent = "";
      }
    });

    // Cancela o estado de confirmação se clicar no botao editar
    btnEditar.addEventListener("click", () => {
      confirmandoExclusao = false;
      btnApagar.textContent = "Apagar";
      btnApagar.classList.remove("confirmar-apagar");
    });

    // Cancela o estado de confirmação se clicar no botao fechar modal
    fecharGerenciar.addEventListener("click", () => {
      confirmandoExclusao = false;
      btnApagar.textContent = "Apagar";
      btnApagar.classList.remove("confirmar-apagar");
    });

    // Cancela o estado de confirmação se clicar no select de categorias
    listaCategorias.addEventListener("click", () => {
      confirmandoExclusao = false;
      btnApagar.textContent = "Apagar";
      btnApagar.classList.remove("confirmar-apagar");
    });
  }

  // #####################################################
  //  Preenche o formulário se estiver editando um item (MODO EDIÇÃO)
  // #####################################################

  // Garante que as categorias sejam carregadas antes
  carregarCategorias();

  // indica que esta no modo edição (quando é redirecionado para editar o item)
  const itemEditando = JSON.parse(sessionStorage.getItem("itemEmEdicao"));

  console.log(itemEditando);

  // Torna global para uso posterior
  window.fotosAntigas = [];

  // atribui o valor dos campos do item a ser editado
  if (itemEditando) {
    // Aguarda o carregamento do select de categoria (evita erro)
    setTimeout(() => {
      document.getElementById("categoriaItem").value =
        itemEditando.categoria.toLowerCase();
    }, 100);

    document.getElementById("nomeItem").value = itemEditando.nome;
    document.getElementById("descricaoItem").value = itemEditando.descricao;
    document.getElementById("duracaoOferta").value = parseInt(
      itemEditando.duracao
    );

    document.querySelector(".logo").textContent = "Editar Item";
    document.querySelector(".btn-cadastro").textContent = "Salvar Alterações";

    // Torna o campo de fotos opcional durante edição
    const fotosInput = document.getElementById("fotosItem");
    if (fotosInput.hasAttribute("required")) {
      fotosInput.removeAttribute("required");
    }

    // Mostrar fotos antigas
    window.fotosAntigas = [...itemEditando.fotos];
    const previewContainer = document.getElementById("previewFotosEdicao");
    previewContainer.innerHTML = "";

    window.fotosAntigas.forEach((foto, index) => {
      const fotoDiv = document.createElement("div");
      fotoDiv.classList.add("foto-preview");

      const img = document.createElement("img");
      img.src = foto;

      const btnRemover = document.createElement("button");
      btnRemover.classList.add("btn-remover-foto");
      btnRemover.textContent = "x";

      // remove foto se solicitado
      btnRemover.addEventListener("click", () => {
        window.fotosAntigas = window.fotosAntigas.filter((f) => f !== foto);
        fotoDiv.remove();
      });

      fotoDiv.appendChild(img);
      fotoDiv.appendChild(btnRemover);
      previewContainer.appendChild(fotoDiv);
    });
  }

  // Adiciona o evento de fotos
  const fotosInput = document.getElementById("fotosItem");
  if (fotosInput) {
    fotosInput.addEventListener("change", () => {
      configurarCampoFotos(fotosInput);
    });
  }

  // #####################################################
  //  Salvar item cadastrado
  // #####################################################

  //obtem todo o formulario
  const formCadastroItem = document.getElementById("formCadastroItem");

  if (formCadastroItem) {
    formCadastroItem.addEventListener("submit", async function (e) {
      e.preventDefault();

      const nomeItem = document.getElementById("nomeItem").value.trim();
      const descricaoItem = document
        .getElementById("descricaoItem")
        .value.trim();

      const quantidade = parseInt(
        document.getElementById("quantidadeItem").value
      );

      const categoria = document.getElementById("categoriaItem").value;

      const fotosInput = document.getElementById("fotosItem");
      const arquivos = Array.from(fotosInput.files);

      const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado"));
      const nomeCriador = usuario?.nome || "Desconhecido";

      const dias = parseInt(document.getElementById("duracaoOferta").value);
      const duracao = dias === 1 ? "1 Dia" : `${dias} Dias`;

      // Endereço sempre manual
      const enderecoFinal = {
        cep: document.getElementById("cep").value.trim(),
        rua: document.getElementById("rua").value.trim(),
        bairro: document.getElementById("bairro").value.trim(),
        numero: document.getElementById("numero").value.trim(),
        cidade: document.getElementById("cidade").value.trim(),
        estado: document.getElementById("estado").value.trim(),
      };

      // Validação dos campos
      const enderecoIncompleto = Object.values(enderecoFinal).some((v) => !v);
      if (enderecoIncompleto) {
        const modalConfirmacao = document.querySelector(
          ".modal-acao.modal-confirmacao"
        );
        const textoModal = modalConfirmacao.querySelector("p");
        textoModal.textContent =
          "Por favor, preencha todos os campos de endereço.";
        modalConfirmacao.classList.remove("hidden");
        modalConfirmacao.classList.add("show");

        setTimeout(() => {
          modalConfirmacao.classList.remove("show");
          modalConfirmacao.classList.add("hidden");
        }, 2000);

        return;
      }

      // Converter fotos em base64
      const converterBase64 = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };
      const fotosBase64 = await Promise.all(arquivos.map(converterBase64));
      const fotosFinal = (window.fotosAntigas || []).concat(fotosBase64);

      // montando como deve ser salvo no json
      const item = {
        nome: nomeItem,
        descricao: descricaoItem,
        quantidade,
        categoria,
        duracao,
        fotos: fotosFinal,
        dataCadastro: new Date().toISOString(),
        criador: nomeCriador,
        endereco: enderecoFinal,
      };

      // Buscar itens existentes e salvar o novo
      const itensExistentes =
        JSON.parse(localStorage.getItem("itensCadastrados")) || [];

      const itemEditando = JSON.parse(sessionStorage.getItem("itemEmEdicao"));

      // Verifica se há pelo menos uma imagem (nova ou antiga)
      const fotosAntigas = window.fotosAntigas || [];

      if (arquivos.length === 0 && fotosAntigas.length === 0) {
        const modalConfirmacao = document.querySelector(
          ".modal-acao.modal-confirmacao"
        );
        const textoModal = modalConfirmacao.querySelector("p");
        textoModal.textContent =
          "É necessário cadastrar pelo menos uma imagem para o item.";
        modalConfirmacao.classList.remove("hidden");
        modalConfirmacao.classList.add("show");

        setTimeout(() => {
          modalConfirmacao.classList.remove("show");
          modalConfirmacao.classList.add("hidden");
        }, 2000);
        return; // Impede o envio do formulário
      }

      // nao permite que na ediçao seja salvo sem imagem
      if (
        arquivos.length === 0 &&
        (!window.fotosAntigas || window.fotosAntigas.length === 0)
      ) {
        const modalConfirmacao = document.querySelector(
          ".modal-acao.modal-confirmacao"
        );
        const textoModal = modalConfirmacao.querySelector("p");
        textoModal.textContent =
          "É necessário cadastrar pelo menos uma imagem para o item.";
        modalConfirmacao.classList.remove("hidden");
        modalConfirmacao.classList.add("show");

        setTimeout(() => {
          modalConfirmacao.classList.remove("show");
          modalConfirmacao.classList.add("hidden");
        }, 2000);
        return; // Impede o envio do formulário
      }

      if (itemEditando) {
        const index = itensExistentes.findIndex(
          (i) =>
            i.nome === itemEditando.nome && i.criador === itemEditando.criador
        );
        if (index !== -1) {
          item.dataCadastro = itemEditando.dataCadastro; // mantém data original
          itensExistentes[index] = item;
        }
        sessionStorage.removeItem("itemEmEdicao");
      } else {
        itensExistentes.push(item);
      }

      localStorage.setItem("itensCadastrados", JSON.stringify(itensExistentes));

      // exibe modal confirmaçao
      const modalConfirmacao = document.querySelector(".modal-confirmacao");

      // Atualiza a mensagem do modal dinamicamente
      const textoModal = modalConfirmacao.querySelector("p");
      if (itemEditando) {
        textoModal.textContent = "Item atualizado com sucesso!";
      } else {
        textoModal.textContent = "Item cadastrado com sucesso!";
      }

      modalConfirmacao.classList.add("show");
      modalConfirmacao.classList.remove("hidden");

      setTimeout(() => {
        modalConfirmacao.classList.remove("show");
        modalConfirmacao.classList.add("hidden");
        window.location.href = "itens-cadastrados.html";
      }, 1000);

      // Resetar formulário
      e.target.reset();
    });
  }

  // #####################################################
  //  Carregar dados no formulário se estiver editando
  // #####################################################

  if (itemEditando) {
    document.getElementById("nomeItem").value = itemEditando.nome;
    document.getElementById("descricaoItem").value = itemEditando.descricao;
    document.getElementById("categoriaItem").value =
      itemEditando.categoria.toLowerCase();
    document.getElementById("duracaoOferta").value = parseInt(
      itemEditando.duracao
    );

    // Altera título e botão
    const titulo = document.querySelector(".logo");
    const botao = document.querySelector(".btn-cadastro");
    if (titulo) titulo.textContent = "Editar Item";
    if (botao) botao.textContent = "Salvar Alterações";
  }
});

// Carrega categorias no select de categoria
function carregarCategorias() {
  // obtém o elemento da categoria do html
  const selectCategoria = document.getElementById("categoriaItem");

  // se NAO existir o html de categorias sai da função.
  if (!selectCategoria) return;

  // obtem as categorias de localStorage
  const categoriasSalvas = JSON.parse(localStorage.getItem("categorias")) || [];

  // Limpa o select (menos a primeira opção "Selecione")
  selectCategoria.innerHTML = '<option value="">Selecione</option>';

  // preenche o option categoria
  categoriasSalvas.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.nome.toLowerCase();
    option.textContent = cat.nome;
    selectCategoria.appendChild(option);
  });
}

// Salva nova categoria no localStorage se não existir ainda
function salvarNovaCategoria(novaCategoria) {
  // obtem as categorias existentes.
  let categorias = JSON.parse(localStorage.getItem("categorias")) || [];

  // Evita duplicadas (case-insensitive)
  const existe = categorias.some(
    (cat) => cat.nome.toLowerCase() === novaCategoria.toLowerCase()
  );

  // se categoria nao existir insere
  if (!existe) {
    const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado"));
    const novaCategoriaObj = {
      nome: novaCategoria,
      criador: usuario.email,
    };

    // adiciona categoria no final da fila
    categorias.push(novaCategoriaObj);
    // atualiza categorias em localStorage
    localStorage.setItem("categorias", JSON.stringify(categorias));
  }
}

// atualiza lista de categorias
function atualizarListaGerenciar() {
  // obtem usuario logado
  const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado"));
  // obtem as categorias existentes
  const categorias = JSON.parse(localStorage.getItem("categorias")) || [];

  // apaga o html existente na lista de categorias
  listaCategorias.innerHTML = "";

  // insere uma nova lista de categorias (com filtro)
  categorias.forEach((cat) => {
    // Exibe apenas se foi criada pelo usuário logado E não estiver em uso
    if (cat.criador === usuario.email && !categoriaEmUso(cat.nome)) {
      const opt = document.createElement("option");
      opt.value = cat.nome;
      opt.textContent = cat.nome;
      listaCategorias.appendChild(opt);
    }
  });
}

// Verifica se uma categoria está sendo usada em algum item
function categoriaEmUso(nomeCategoria) {
  // obtem todos os itens cadastrados
  const itens = JSON.parse(localStorage.getItem("itensCadastrados")) || [];

  // verifica se a categoria esta em uso por algum item.
  return itens.some(
    (item) => item.categoria.toLowerCase() === nomeCategoria.toLowerCase()
  );
}

// Função para configurar o campo de fotos
function configurarCampoFotos(fotosInput) {
  // obtem as fotos existentes
  const previewContainer = document.getElementById("previewFotos");
  // Limpa as prévias de fotos anteriores
  previewContainer.innerHTML = "";

  // Exibe prévia das novas fotos
  for (const foto of fotosInput.files) {
    const fotoDiv = document.createElement("div");
    fotoDiv.classList.add("foto-preview");

    const img = document.createElement("img");
    img.src = URL.createObjectURL(foto);
    fotoDiv.appendChild(img);

    previewContainer.appendChild(fotoDiv);
  }
}

// funcao sair
function sair() {
  sessionStorage.removeItem("usuarioLogado");
  window.location.href = "login.html";
}

// Acessar Perfil
function acessarPerfil() {
  window.location.href = "perfil.html";
}

document.getElementById("cep")?.addEventListener("blur", async () => {
  const cep = document.getElementById("cep").value.replace(/\D/g, "");
  if (cep.length !== 8) return;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();

    if (!data.erro) {
      document.getElementById("rua").value = data.logradouro || "";
      document.getElementById("bairro").value = data.bairro || "";
      document.getElementById("cidade").value = data.localidade || "";
      document.getElementById("estado").value = data.uf || "";
    }
  } catch (err) {
    console.error("Erro ao buscar CEP:", err);
  }
});
