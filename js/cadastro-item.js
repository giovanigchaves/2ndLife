// ========================================================
// Inicialização ao carregar a página
// ========================================================

window.addEventListener("DOMContentLoaded", () => {
  const usuario = getUsuarioAtual();

  // Se não estiver logado, redireciona
  if (!usuario) {
    window.location.href = "login.html";
    return;
  }

  preencherTopoComPerfil(usuario);
  carregarCategorias();
  configurarModaisDeCategoria();
  configurarEnderecoViaCEP();
  configurarUploadDeFotos();
  configurarFormularioCadastro(usuario);

  const itemEditando = JSON.parse(sessionStorage.getItem("itemEmEdicao"));
  if (itemEditando) {
    preencherFormularioParaEdicao(itemEditando);
  } else {
    preencherEnderecoDoPerfil(usuario);
  }
});

// ========================================================
// Utilitários Gerais
// ========================================================

function getUsuarioAtual() {
  const email = sessionStorage.getItem("usuarioLogado");
  const perfis = JSON.parse(localStorage.getItem("perfisUsuarios")) || {};
  return perfis[email] || null;
}

function preencherTopoComPerfil(usuario) {
  document.getElementById("fotoMiniatura").src =
    usuario.fotoPerfil || "assets/avatar-default.png";
  document.getElementById("nomeMiniatura").textContent =
    usuario.nome || "Usuário";
}

function toggleMenu() {
  const links = document.querySelector(".menu-links");
  links.classList.toggle("show");
}

function sair() {
  sessionStorage.removeItem("usuarioLogado");
  window.location.href = "login.html";
}

function acessarPerfil() {
  window.location.href = "perfil.html";
}

// ========================================================
// Modal: Nova Categoria e Gerenciamento
// ========================================================

function configurarModaisDeCategoria() {
  const usuario = getUsuarioAtual();

  const btnAbrir = document.getElementById("btnAddCategoria");
  const modal = document.getElementById("modalCategoria");
  const btnFechar = document.getElementById("fecharModalCategoria");
  const btnSalvar = document.getElementById("salvarCategoria");
  const inputNovaCategoria = document.getElementById("novaCategoria");
  const selectCategoria = document.getElementById("categoriaItem");

  if (btnAbrir && modal && inputNovaCategoria) {
    btnAbrir.addEventListener("click", () => {
      inputNovaCategoria.value = "";
      modal.classList.remove("hidden");
    });
  }

  if (btnFechar && modal) {
    btnFechar.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  }

  if (btnSalvar && inputNovaCategoria && selectCategoria && modal) {
    btnSalvar.addEventListener("click", () => {
      const novaCategoria = inputNovaCategoria.value.trim();
      if (novaCategoria) {
        salvarNovaCategoria(novaCategoria, usuario);
        carregarCategorias();
        selectCategoria.value = novaCategoria.toLowerCase();
        modal.classList.add("hidden");
      }
    });
  }

  const btnGerenciar = document.getElementById("btnGerenciarCategorias");
  const modalGerenciar = document.getElementById("modalGerenciar");
  const fecharGerenciar = document.getElementById("fecharGerenciarModal");
  const listaCategorias = document.getElementById("listaCategorias");
  const editarBox = document.getElementById("editarBox");
  const inputNovoNome = document.getElementById("novoNomeCategoria");
  const btnEditar = document.getElementById("editarCategoria");
  const btnConfirmarEdicao = document.getElementById("confirmarEdicao");
  const btnApagar = document.getElementById("apagarCategoria");
  const mensagemCategoria = document.getElementById("mensagemCategoria");

  if (btnGerenciar && modalGerenciar) {
    btnGerenciar.addEventListener("click", () => {
      atualizarListaGerenciar(usuario);

      // Oculta a modal de nova categoria
      const modalCategoria = document.getElementById("modalCategoria");
      if (modalCategoria) {
        modalCategoria.classList.add("hidden");
      }

      // Mostra a modal de gerenciamento
      modalGerenciar.classList.remove("hidden");

      editarBox.classList.add("hidden");
      inputNovoNome.value = "";
      mensagemCategoria.textContent = "";
    });
  }

  if (fecharGerenciar && modalGerenciar) {
    fecharGerenciar.addEventListener("click", () => {
      modalGerenciar.classList.add("hidden");
    });
  }

  // 1. Clique no botão EDITAR → mostra o input e botão Confirmar
  if (btnEditar && editarBox && inputNovoNome) {
    btnEditar.addEventListener("click", () => {
      const selecionada = listaCategorias.value;
      if (!selecionada) return;

      inputNovoNome.value = selecionada;
      editarBox.classList.remove("hidden");
    });
  }

  // 2. Clique no botão CONFIRMAR → edita a categoria e oculta campos
  if (btnConfirmarEdicao && inputNovoNome && editarBox) {
    btnConfirmarEdicao.addEventListener("click", () => {
      const novoNome = inputNovoNome.value.trim();
      const antigo = listaCategorias.value;
      const categorias = JSON.parse(localStorage.getItem("categorias")) || [];

      if (!novoNome) return;

      if (categorias.find((c) => c.nome === novoNome)) {
        mensagemCategoria.textContent = `O nome ${novoNome} já existe.`;
        return;
      }

      const index = categorias.findIndex((c) => c.nome === antigo);
      if (index >= 0) {
        categorias[index].nome = novoNome;
        localStorage.setItem("categorias", JSON.stringify(categorias));
        carregarCategorias();
        atualizarListaGerenciar(usuario);

        // Oculta os campos novamente
        inputNovoNome.value = "";
        editarBox.classList.add("hidden");
        mensagemCategoria.textContent = "";
      }
    });
  }

  let confirmandoExclusao = false;

  if (btnApagar) {
    btnApagar.addEventListener("click", () => {
      const categoriaSelecionada = listaCategorias.value;
      if (!categoriaSelecionada) return;

      // Primeiro clique - habilita confirmação
      if (!confirmandoExclusao) {
        btnApagar.textContent = "Confirmar";
        btnApagar.classList.add("confirmar-apagar");
        confirmandoExclusao = true;
        return;
      }

      // Segundo clique - executa exclusão
      let categorias = JSON.parse(localStorage.getItem("categorias")) || [];
      categorias = categorias.filter((c) => c.nome !== categoriaSelecionada);
      localStorage.setItem("categorias", JSON.stringify(categorias));

      carregarCategorias(); // atualiza select principal
      atualizarListaGerenciar(usuario); // atualiza select da modal

      // Resetar estado da interface
      editarBox.classList.add("hidden");
      inputNovoNome.value = "";
      confirmandoExclusao = false;
      btnApagar.textContent = "Apagar";
      btnApagar.classList.remove("confirmar-apagar");
      mensagemCategoria.textContent = "";
    });
  }
}

function atualizarListaGerenciar(usuario) {
  const listaCategorias = document.getElementById("listaCategorias");
  const categorias = JSON.parse(localStorage.getItem("categorias")) || [];
  const itens = JSON.parse(localStorage.getItem("itensCadastrados")) || [];

  listaCategorias.innerHTML = ""; // limpa o select

  categorias.forEach((cat) => {
    const criadaPeloUsuario = cat.criador === usuario.email;
    const estaEmUso = itens.some(
      (item) => item.categoria.toLowerCase() === cat.nome.toLowerCase()
    );

    if (criadaPeloUsuario && !estaEmUso) {
      const opt = document.createElement("option");
      opt.value = cat.nome;
      opt.textContent = cat.nome;
      listaCategorias.appendChild(opt);
    }
  });
}

// ========================================================
// Categorias - Carregamento e Armazenamento
// ========================================================

function carregarCategorias() {
  const select = document.getElementById("categoriaItem");
  if (!select) return;

  const categorias = JSON.parse(localStorage.getItem("categorias")) || [];
  select.innerHTML = '<option value="">Categoria</option>';

  categorias.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.nome.toLowerCase();
    option.textContent = cat.nome;
    select.appendChild(option);
  });
}

function salvarNovaCategoria(novaCategoria, usuario) {
  const categorias = JSON.parse(localStorage.getItem("categorias")) || [];
  const existe = categorias.some(
    (cat) => cat.nome.toLowerCase() === novaCategoria.toLowerCase()
  );
  if (!existe) {
    categorias.push({ nome: novaCategoria, criador: usuario.email });
    localStorage.setItem("categorias", JSON.stringify(categorias));
  }
}

// ========================================================
// Endereço - Auto-preenchimento via CEP (viacep API)
// ========================================================

function configurarEnderecoViaCEP() {
  const cepInput = document.getElementById("cep");
  if (!cepInput) return;

  cepInput.addEventListener("blur", async () => {
    const cep = cepInput.value.replace(/\D/g, "");
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
}

// ========================================================
// Upload de Fotos com pré-visualização
// ========================================================

function configurarUploadDeFotos() {
  const fotosInput = document.getElementById("fotosItem");
  if (!fotosInput) return;

  fotosInput.addEventListener("change", () => {
    const container = document.getElementById("previewFotosEdicao");
    container.innerHTML = "";

    if (fotosInput.files.length === 0) {
      container.style.display = "none";
      return;
    }

    container.style.display = "flex";
    Array.from(fotosInput.files).forEach((file) => {
      const fotoDiv = document.createElement("div");
      fotoDiv.classList.add("foto-preview");

      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);

      fotoDiv.appendChild(img);
      container.appendChild(fotoDiv);
    });
  });
}

// ========================================================
// Formulário - Cadastro de novo item
// ========================================================

function configurarFormularioCadastro(usuario) {
  const form = document.getElementById("formCadastroItem");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const item = await montarObjetoItem(usuario);
    if (!item) return;

    const itens = JSON.parse(localStorage.getItem("itensCadastrados")) || [];
    const itemEditando = JSON.parse(sessionStorage.getItem("itemEmEdicao"));

    if (itemEditando) {
      const index = itens.findIndex((i) => i.id === itemEditando.id);
      if (index !== -1) {
        item.id = itemEditando.id;
        item.dataCadastro = itemEditando.dataCadastro;
        itens[index] = item;
      }
      sessionStorage.removeItem("itemEmEdicao");
    } else {
      item.id = gerarIdUnico();
      item.dataCadastro = new Date().toISOString();
      itens.push(item);
    }

    localStorage.setItem("itensCadastrados", JSON.stringify(itens));
    atualizarPerfilComEndereco();
    const mensagem = itemEditando
      ? "Item editado com sucesso!"
      : "Item cadastrado com sucesso!";

    const destino = itemEditando
      ? sessionStorage.getItem("origemEdicao") || "dashboard.html"
      : "dashboard.html";

    // Exibe mensagem na modal e redireciona após 1.5 segundos
    exibirModalConfirmacao(mensagem);

    setTimeout(() => {
      window.location.href = destino;
    }, 1500);
  });
}

// ========================================================
// Montagem do objeto do item com validações
// ========================================================

async function montarObjetoItem(usuario) {
  // Lista de campos obrigatórios
  const camposObrigatorios = [
    "nomeItem",
    "descricaoItem",
    "categoriaItem",
    "quantidadeItem",
    "duracaoOferta",
    "telefoneProprietario",
    "cep",
    "rua",
    "numero",
    "bairro",
    "cidade",
    "estado",
  ];

  for (const id of camposObrigatorios) {
    const campo = document.getElementById(id);
    if (
      !campo ||
      campo.value.trim() === "" ||
      campo.value === "Categoria" ||
      campo.value === "Selecione"
    ) {
      exibirModalConfirmacao("Preencha todos os campos obrigatórios.");
      campo?.focus();
      return null;
    }
  }

  // Endereço
  const endereco = {
    cep: document.getElementById("cep").value.trim(),
    rua: document.getElementById("rua").value.trim(),
    bairro: document.getElementById("bairro").value.trim(),
    numero: document.getElementById("numero").value.trim(),
    cidade: document.getElementById("cidade").value.trim(),
    estado: document.getElementById("estado").value.trim(),
  };

  const fotosInput = document.getElementById("fotosItem");
  const arquivos = Array.from(fotosInput.files);
  let fotosBase64 = [];

  const itemEditando = JSON.parse(sessionStorage.getItem("itemEmEdicao"));

  if (arquivos.length > 0) {
    fotosBase64 = await Promise.all(arquivos.map(converterBase64));
  } else {
    if (!itemEditando) {
      exibirModalConfirmacao("É necessário cadastrar pelo menos uma imagem.");
      fotosInput.focus();
      return null;
    } else {
      fotosBase64 = itemEditando.fotos || [];
    }
  }

  return {
    nome: document.getElementById("nomeItem").value.trim(),
    descricao: document.getElementById("descricaoItem").value.trim(),
    categoria: document.getElementById("categoriaItem").value,
    quantidade: parseInt(document.getElementById("quantidadeItem").value),
    duracao: parseInt(document.getElementById("duracaoOferta").value),
    fotos: fotosBase64,
    emailCriador: usuario.email,
    telefoneCriador: document
      .getElementById("telefoneProprietario")
      .value.trim(),
    endereco,
    criador: usuario.nome,
  };
}

// ========================================================
// Edição de item - preenchimento automático do formulário
// ========================================================

function preencherFormularioParaEdicao(item) {
  document.getElementById("nomeItem").value = item.nome;
  document.getElementById("descricaoItem").value = item.descricao;
  document.getElementById("categoriaItem").value = item.categoria.toLowerCase();
  document.getElementById("quantidadeItem").value = item.quantidade;
  document.getElementById("duracaoOferta").value = parseInt(item.duracao);

  document.getElementById("cep").value = item.endereco?.cep || "";
  document.getElementById("rua").value = item.endereco?.rua || "";
  document.getElementById("numero").value = item.endereco?.numero || "";
  document.getElementById("bairro").value = item.endereco?.bairro || "";
  document.getElementById("cidade").value = item.endereco?.cidade || "";
  document.getElementById("estado").value = item.endereco?.estado || "";
  document.getElementById("telefoneProprietario").value =
    item.telefoneCriador || "";

  const titulo = document.querySelector(".logo");
  const botao = document.getElementById("botaoCadastroItem");
  if (titulo) titulo.textContent = "Editar Item";
  if (botao) botao.textContent = "Salvar Alterações";

  const container = document.getElementById("previewFotosEdicao");
  container.innerHTML = "";

  if (item.fotos?.length > 0) {
    item.fotos.forEach((foto) => {
      const div = document.createElement("div");
      div.classList.add("foto-preview");

      const img = document.createElement("img");
      img.src = foto;

      div.appendChild(img);
      container.appendChild(div);
    });
  }

  // REMOVE 'required' do input de fotos ao editar
  const inputFotos = document.getElementById("fotosItem");
  if (inputFotos) {
    inputFotos.removeAttribute("required");
  }
}

function preencherEnderecoDoPerfil(usuario) {
  const endereco = usuario.endereco || {};
  const campos = ["cep", "rua", "numero", "bairro", "cidade", "estado"];
  campos.forEach((campo) => {
    if (endereco[campo]) {
      document.getElementById(campo).value = endereco[campo];
    }
  });

  if (usuario.telefone) {
    document.getElementById("telefoneProprietario").value = usuario.telefone;
  }
}

function atualizarPerfilComEndereco() {
  const emailUsuario = sessionStorage.getItem("usuarioLogado");
  if (!emailUsuario) return;

  const perfis = JSON.parse(localStorage.getItem("perfisUsuarios")) || {};
  const perfil = perfis[emailUsuario];
  if (!perfil) return;

  perfil.telefone = document
    .getElementById("telefoneProprietario")
    .value.trim();
  perfil.endereco = {
    cep: document.getElementById("cep").value.trim(),
    rua: document.getElementById("rua").value.trim(),
    numero: document.getElementById("numero").value.trim(),
    bairro: document.getElementById("bairro").value.trim(),
    cidade: document.getElementById("cidade").value.trim(),
    estado: document.getElementById("estado").value.trim(),
  };

  perfis[emailUsuario] = perfil;
  localStorage.setItem("perfisUsuarios", JSON.stringify(perfis));
}

// ========================================================
// Feedback visual e helpers
// ========================================================

function exibirModalConfirmacao(texto) {
  const modal = document.querySelector(".modal-acao.modal-confirmacao");
  const mensagem = modal.querySelector("p");

  mensagem.textContent = texto;
  modal.classList.remove("hidden");
  modal.classList.add("show");

  setTimeout(() => {
    modal.classList.remove("show");
    modal.classList.add("hidden");
  }, 2000);
}

function converterBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function gerarIdUnico() {
  return (
    "item_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
  );
}
