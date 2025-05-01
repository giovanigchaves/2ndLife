// =============================================
// INICIALIZAÇÃO AO CARREGAR A PÁGINA
// =============================================
document.addEventListener("DOMContentLoaded", () => {
  const item = JSON.parse(sessionStorage.getItem("itemDetalhado"));
  const emailUsuarioLogado = sessionStorage.getItem("usuarioLogado");
  const perfis = JSON.parse(localStorage.getItem("perfisUsuarios")) || {};
  const usuario = perfis[emailUsuarioLogado];

  // Se faltar dados essenciais, redireciona para o dashboard
  if (!item || !usuario) {
    window.location.href = "dashboard.html";
    return;
  }

  const ehCriador = item.criador.toLowerCase() === usuario.nome.toLowerCase();

  preencherDadosItem(item);
  carregarImagens(item);
  configurarBotaoFechar();
  configurarAcoesUsuario(item, usuario, ehCriador);
  configurarExibicaoOfertas(item, usuario, ehCriador);
  configurarFechamentoModalOferta();
});

// =============================================
// EXIBE OS DADOS DO ITEM NOS CAMPOS HTML
// =============================================
function preencherDadosItem(item) {
  document.getElementById("criadorItem").textContent = item.criador;
  document.getElementById("tituloItem").textContent = item.nome;
  document.getElementById("descricaoItem").textContent =
    item.descricao || "Sem descrição";
  document.getElementById("categoriaItem").textContent = item.categoria;
  document.getElementById("quantidadeItem").textContent = item.quantidade || 1;
  document.getElementById("prazoItem").textContent = item.duracao;

  const dataCadastro = new Date(item.dataCadastro);
  document.getElementById("dataCadastroItem").textContent =
    dataCadastro.toLocaleDateString("pt-BR");

  const dias = parseInt(item.duracao);
  const dataTermino = new Date(dataCadastro);
  dataTermino.setDate(dataCadastro.getDate() + dias);
  document.getElementById("dataTerminoItem").textContent =
    dataTermino.toLocaleDateString("pt-BR");

  const hoje = new Date();
  const diasRestantes = Math.max(
    0,
    Math.ceil((dataTermino - hoje) / (1000 * 60 * 60 * 24))
  );
  document.getElementById(
    "diasRestantesItem"
  ).textContent = `${diasRestantes} dia${diasRestantes !== 1 ? "s" : ""}`;

  document.getElementById("cepItem").textContent = item.endereco?.cep || "-";
  document.getElementById("ruaItem").textContent = item.endereco?.rua || "-";
  document.getElementById("numeroItem").textContent =
    item.endereco?.numero || "-";
  document.getElementById("bairroItem").textContent =
    item.endereco?.bairro || "-";
  document.getElementById("cidadeItem").textContent =
    item.endereco?.cidade || "-";
  document.getElementById("estadoItem").textContent =
    item.endereco?.estado || "-";
}

// =============================================
// CARREGA A GALERIA DE IMAGENS DO ITEM
// =============================================
function carregarImagens(item) {
  const fotosContainer = document.getElementById("fotosItem");
  fotosContainer.innerHTML = "";

  const fotos = item.fotos || [];
  if (fotos.length === 0) {
    fotosContainer.innerHTML = "<p>Sem imagens disponíveis.</p>";
    return;
  }

  fotos.forEach((foto) => {
    const img = document.createElement("img");
    img.src = foto;
    img.classList.add("foto-detalhe");
    img.addEventListener("click", () => abrirVisualizacaoImagem(foto));
    fotosContainer.appendChild(img);
  });
}

// =============================================
// CONFIGURA O BOTÃO DE FECHAR PÁGINA
// =============================================
function configurarBotaoFechar() {
  document.getElementById("fecharPagina").addEventListener("click", () => {
    const origem = sessionStorage.getItem("origemDetalhes");
    window.location.href = origem || "dashboard.html";
  });
}

// =============================================
// EXIBE OU ESCONDE BOTÕES DE AÇÃO CONFORME PERFIL
// =============================================
function configurarAcoesUsuario(item, usuario, ehCriador) {
  const btnEditar = document.getElementById("editarItem");
  const btnExcluir = document.getElementById("excluirItem");
  const container = document.getElementById("botaoOfertaContainer");

  const ofertas = JSON.parse(localStorage.getItem("ofertas")) || [];
  const minhaOferta = ofertas.find(
    (of) =>
      of.itemId === item.id &&
      of.interessado.toLowerCase() === usuario.nome.toLowerCase()
  );

  const hoje = new Date();
  const dataCadastro = new Date(item.dataCadastro);
  const dataFim = new Date(
    dataCadastro.getTime() + parseInt(item.duracao) * 86400000
  );
  const expirado = dataFim <= hoje;

  if (ehCriador) {
    btnEditar.style.display = "inline-block";
    btnExcluir.style.display = "inline-block";
    container.classList.add("hidden");
  } else {
    btnEditar.style.display = "none";
    btnExcluir.style.display = "none";

    if (!minhaOferta && !expirado) {
      const botao = document.createElement("button");
      botao.textContent = "Fazer uma oferta";
      botao.className = "btn-ofertar";
      botao.addEventListener("click", () => abrirFormularioOferta(item));
      container.innerHTML = "";
      container.appendChild(botao);
      container.classList.remove("hidden");
    } else {
      container.classList.add("hidden");
    }
  }

  configurarEventosEdicaoExclusao(item);
}

// =============================================
// CONFIGURA EVENTOS DOS BOTÕES EDITAR / EXCLUIR
// =============================================
function configurarEventosEdicaoExclusao(item) {
  const btnEditar = document.getElementById("editarItem");
  const btnExcluir = document.getElementById("excluirItem");
  let confirmando = false;

  btnEditar.addEventListener("click", () => {
    sessionStorage.setItem("itemEmEdicao", JSON.stringify(item));
    sessionStorage.setItem(
      "origemEdicao",
      sessionStorage.getItem("origemDetalhes") || "dashboard.html"
    );
    window.location.href = "cadastro-item.html";
  });

  btnExcluir.addEventListener("click", () => {
    if (!confirmando) {
      btnExcluir.textContent = "Confirmar";
      btnExcluir.classList.add("confirmar-apagar");
      confirmando = true;
    } else {
      let itens = JSON.parse(localStorage.getItem("itensCadastrados")) || [];
      itens = itens.filter((i) => i.id !== item.id);
      localStorage.setItem("itensCadastrados", JSON.stringify(itens));
      window.location.href = "dashboard.html";
    }
  });

  document.addEventListener("click", (e) => {
    if (e.target.id !== "excluirItem") {
      btnExcluir.textContent = "Excluir";
      btnExcluir.classList.remove("confirmar-apagar");
      confirmando = false;
    }
  });
}
// =============================================
// EXIBE A LISTA DE OFERTAS RECEBIDAS OU RESULTADO FINAL
// =============================================
function configurarExibicaoOfertas(item, usuario, ehCriador) {
  const container = document.getElementById("ofertasRecebidas");
  const lista = document.getElementById("listaOfertas");
  if (!container || !lista) return;

  const todasOfertas = JSON.parse(localStorage.getItem("ofertas")) || [];
  const perfis = JSON.parse(localStorage.getItem("perfisUsuarios")) || {};
  const ofertasDoItem = todasOfertas.filter(
    (oferta) => oferta.itemId === item.id
  );

  const hoje = new Date();
  const dataCadastro = new Date(item.dataCadastro);
  const dataFim = new Date(
    dataCadastro.getTime() + parseInt(item.duracao) * 86400000
  );
  const expirado = dataFim <= hoje;

  container.classList.remove("hidden");
  lista.innerHTML = "";

  if (expirado && ofertasDoItem.length > 0) {
    const melhorOferta = ofertasDoItem[0];
    const perfilProprietario = perfis[item.emailCriador] || {};
    const perfilGanhador = perfis[melhorOferta.interessadoEmail] || {};

    const nomeProprietario = perfilProprietario.nome || "Proprietário";
    const telefoneProprietario = perfilProprietario.telefone || "Não informado";
    const nomeGanhador = perfilGanhador.nome || melhorOferta.interessado;
    const telefoneGanhador = perfilGanhador.telefone || "Não informado";

    const div = document.createElement("div");
    div.className = "oferta-recebida";

    let texto = `🎉 Parabéns <b>${nomeGanhador}</b>, você já pode retirar o item!<br><br>`;
    if (melhorOferta.tipo === "pagarei")
      texto += `💸 Ofereceu R$ ${parseFloat(melhorOferta.valor).toFixed(
        2
      )}.<br>`;
    else if (melhorOferta.tipo === "cobro")
      texto += `🚚 Cobrou R$ ${parseFloat(melhorOferta.valor).toFixed(2)}.<br>`;
    else texto += `🤝 Retira gratuitamente.<br>`;

    if (melhorOferta.mensagem)
      texto += `📝 <i>Mensagem:</i> "${melhorOferta.mensagem}"<br><br>`;

    texto += `📱 Telefone do <b>${nomeProprietario}</b>: <b>${telefoneProprietario}</b><br>
              📱 Telefone do <b>${nomeGanhador}</b>: <b>${telefoneGanhador}</b><br><br>
              😉 <b>Combinem a retirada!</b>`;

    div.innerHTML = texto;
    lista.appendChild(div);
  } else {
    if (ofertasDoItem.length === 0) {
      lista.innerHTML = "<p>Nenhuma oferta recebida ainda.</p>";
    } else {
      ofertasDoItem.forEach((oferta) => renderizarOferta(oferta, lista));
    }
  }
}

// =============================================
// ABRE O FORMULÁRIO DE OFERTA
// =============================================
function abrirFormularioOferta(item) {
  const modal = document.getElementById("modalOferta");
  const tipoSelect = document.getElementById("tipoOferta");
  const campoValor = document.getElementById("campoValor");
  const inputValor = document.getElementById("valorOferta");
  const inputMensagem = document.getElementById("mensagemOferta");

  if (modal && tipoSelect && campoValor && inputValor && inputMensagem) {
    modal.classList.remove("hidden");
    tipoSelect.value = "";
    inputValor.value = "";
    inputMensagem.value = "";
    campoValor.classList.add("hidden");

    const telefoneInput = document.getElementById("telefoneOferta");
    const emailUsuarioLogado = sessionStorage.getItem("usuarioLogado");
    const perfis = JSON.parse(localStorage.getItem("perfisUsuarios")) || {};
    const usuario = perfis[emailUsuarioLogado];
    const perfilUsuario = perfis[usuario.email] || {};

    if (telefoneInput) telefoneInput.value = perfilUsuario.telefone || "";

    tipoSelect.addEventListener("change", () => {
      if (tipoSelect.value === "pagarei" || tipoSelect.value === "cobro")
        campoValor.classList.remove("hidden");
      else campoValor.classList.add("hidden");
    });

    configurarEnvioOferta(item);
  }
}

// =============================================
// ENVIA A OFERTA DO USUÁRIO PARA O ITEM
// =============================================
function configurarEnvioOferta(item) {
  const botaoEnviar = document.getElementById("enviarOferta");
  if (!botaoEnviar) return;

  botaoEnviar.onclick = () => {
    const tipo = document.getElementById("tipoOferta").value;
    const valorInput = document.getElementById("valorOferta").value.trim();
    const mensagem = document.getElementById("mensagemOferta").value.trim();
    const emailUsuarioLogado = sessionStorage.getItem("usuarioLogado");
    const perfis = JSON.parse(localStorage.getItem("perfisUsuarios")) || {};
    const usuario = perfis[emailUsuarioLogado];
    const telefoneOferta = document
      .getElementById("telefoneOferta")
      .value.trim();

    if (!tipo) return alert("Selecione o tipo de oferta.");
    if ((tipo === "pagarei" || tipo === "cobro") && !valorInput)
      return alert("Informe o valor.");
    if (!telefoneOferta) return alert("Informe seu telefone para contato.");

    const valor = tipo === "gratis" ? 0 : parseFloat(valorInput);

    const novaOferta = {
      itemId: item.id,
      interessado: usuario.nome,
      interessadoEmail: usuario.email,
      telefoneInteressado: telefoneOferta,
      tipo: tipo,
      valor: valor.toFixed(2),
      mensagem: mensagem,
    };

    let ofertasExistentes = JSON.parse(localStorage.getItem("ofertas")) || [];

    const ofertaAtual = ofertasExistentes.find((o) => o.itemId === item.id);

    let deveSubstituir = false;

    if (!ofertaAtual) {
      ofertasExistentes.push(novaOferta);
      deveSubstituir = true;
    } else {
      const tipoAtual = ofertaAtual.tipo;
      const valorAtual = parseFloat(ofertaAtual.valor);

      if (tipoAtual === "cobro") {
        if (novaOferta.tipo === "cobro" && valor < valorAtual) {
          deveSubstituir = true;
        } else if (
          novaOferta.tipo === "pagarei" ||
          novaOferta.tipo === "gratis"
        ) {
          deveSubstituir = true;
        }
      } else if (tipoAtual === "gratis") {
        if (novaOferta.tipo === "pagarei") {
          deveSubstituir = true;
        }
      } else if (tipoAtual === "pagarei") {
        if (novaOferta.tipo === "pagarei" && valor > valorAtual) {
          deveSubstituir = true;
        }
      }
    }

    const perfilUsuario = perfis[usuario.email] || {};

    if (!perfilUsuario.telefone || perfilUsuario.telefone !== telefoneOferta) {
      perfilUsuario.telefone = telefoneOferta;
      perfis[usuario.email] = perfilUsuario;
      localStorage.setItem("perfisUsuarios", JSON.stringify(perfis));
    }

    if (deveSubstituir) {
      // Remove oferta atual se existir
      const index = ofertasExistentes.findIndex((o) => o.itemId === item.id);
      if (index !== -1) {
        ofertasExistentes.splice(index, 1, novaOferta);
      } else {
        ofertasExistentes.push(novaOferta);
      }
      localStorage.setItem("ofertas", JSON.stringify(ofertasExistentes));

      alert("Oferta enviada com sucesso e registrada como melhor oferta!");
      document.getElementById("modalOferta").classList.add("hidden");
      window.location.reload();
    } else {
      alert("Sua oferta não é melhor do que a atual e não foi registrada.");
    }
  };
}

// =============================================
// FECHA O MODAL DE OFERTA
// =============================================
function configurarFechamentoModalOferta() {
  const botaoFechar = document.getElementById("fecharOferta");
  const modal = document.getElementById("modalOferta");

  if (botaoFechar && modal) {
    botaoFechar.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  }
}

// =============================================
// ABRE VISUALIZAÇÃO AMPLIADA DA IMAGEM
// =============================================
function abrirVisualizacaoImagem(fotoUrl) {
  const imagemAmpliada = document.getElementById("imagemAmpliada");
  const visualizador = document.getElementById("visualizadorImagem");

  if (imagemAmpliada && visualizador) {
    imagemAmpliada.src = fotoUrl;
    imagemAmpliada.style.width = "auto";
    imagemAmpliada.style.height = "auto";
    visualizador.classList.remove("hidden");
  }
}

// =============================================
// FECHA VISUALIZADOR DE IMAGEM
// =============================================
function fecharVisualizadorImagem() {
  const visualizador = document.getElementById("visualizadorImagem");
  const imagemAmpliada = document.getElementById("imagemAmpliada");

  if (visualizador && imagemAmpliada) {
    visualizador.classList.add("hidden");
    imagemAmpliada.src = "";
  }
}

// =============================================
// RENDERIZA UMA OFERTA INDIVIDUAL NA LISTA
// =============================================
function renderizarOferta(oferta, container) {
  const div = document.createElement("div");
  div.className = "oferta-recebida";

  let texto = "";
  if (oferta.tipo === "pagarei")
    texto = `💸 <b>${oferta.interessado}</b> oferece R$ ${parseFloat(
      oferta.valor
    ).toFixed(2)}.`;
  else if (oferta.tipo === "cobro")
    texto = `🚚 <b>${oferta.interessado}</b> cobra R$ ${parseFloat(
      oferta.valor
    ).toFixed(2)} para retirar.`;
  else texto = `🤝 <b>${oferta.interessado}</b> retira gratuitamente.`;

  if (oferta.mensagem) texto += `<br>📝 <i>${oferta.mensagem}</i>`;

  div.innerHTML = texto;
  container.appendChild(div);
}
