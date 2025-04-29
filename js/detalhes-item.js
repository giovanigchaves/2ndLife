// detalhes-item.js (corrigido e completo)

window.addEventListener("DOMContentLoaded", () => {
  const item = JSON.parse(sessionStorage.getItem("itemDetalhado"));
  const emailUsuarioLogado = sessionStorage.getItem("usuarioLogado");
  const perfis = JSON.parse(localStorage.getItem("perfisUsuarios")) || {};
  const usuario = perfis[emailUsuarioLogado];

  if (!item || !usuario) {
    window.location.href = "dashboard.html";
    return;
  }

  const ehCriador = item.criador.toLowerCase() === usuario.nome.toLowerCase();

  preencherDadosItem(item);
  configurarBotaoFechar();
  carregarImagens(item);
  configurarAcoesUsuario(item, usuario, ehCriador);
  configurarExibicaoOfertas(item, usuario, ehCriador);
  configurarFechamentoModalOferta();
});

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

  document.getElementById("cidadeItem").textContent =
    item.endereco?.cidade || "-";
  document.getElementById("bairroItem").textContent =
    item.endereco?.bairro || "-";
  document.getElementById("ruaItem").textContent = item.endereco?.rua || "-";
  document.getElementById("numeroItem").textContent =
    item.endereco?.numero || "-";
}

function configurarBotaoFechar() {
  document.getElementById("fecharPagina").addEventListener("click", () => {
    const origem = sessionStorage.getItem("origemDetalhes");
    window.location.href = origem || "dashboard.html";
  });
}

function carregarImagens(item) {
  const fotosContainer = document.getElementById("fotosItem");
  fotosContainer.innerHTML = "";

  const fotos = item.fotos || [];
  if (fotos.length === 0) {
    fotosContainer.innerHTML = "<p>Sem imagens disponíveis.</p>";
  } else {
    fotos.forEach((foto) => {
      const img = document.createElement("img");
      img.src = foto;
      img.classList.add("foto-detalhe");
      img.addEventListener("click", () => abrirVisualizacaoImagem(foto));
      fotosContainer.appendChild(img);
    });
  }
}

function configurarAcoesUsuario(item, usuario, ehCriador) {
  const btnEditar = document.getElementById("editarItem");
  const btnExcluir = document.getElementById("excluirItem");
  const container = document.getElementById("botaoOfertaContainer");

  const todasOfertas = JSON.parse(localStorage.getItem("ofertas")) || [];
  const minhaOferta = todasOfertas.find(
    (oferta) =>
      oferta.itemId === item.id &&
      oferta.interessado.toLowerCase() === usuario.nome.toLowerCase()
  );

  const hoje = new Date();
  const dataCadastro = new Date(item.dataCadastro);
  const dataFim = new Date(
    dataCadastro.getTime() + parseInt(item.duracao) * 24 * 60 * 60 * 1000
  );
  const expirado = dataFim <= hoje;

  if (ehCriador) {
    btnEditar.style.display = "inline-block";
    btnExcluir.style.display = "inline-block";
    container.classList.add("hidden");
  } else {
    btnEditar.style.display = "none";
    btnExcluir.style.display = "none";

    container.innerHTML = "";

    if (!minhaOferta && !expirado) {
      const botao = document.createElement("button");
      botao.textContent = "Fazer uma oferta";
      botao.className = "btn-ofertar";
      botao.addEventListener("click", () => abrirFormularioOferta(item));
      container.appendChild(botao);
      container.classList.remove("hidden");
    } else {
      container.classList.add("hidden");
    }
  }

  configurarEventosEdicaoExclusao(item);
}

function exibirResumoOferta(oferta, container) {
  if (!container.querySelector("h3")) {
    const titulo = document.createElement("h3");
    titulo.textContent = "💬 Ofertas Recebidas";
    container.appendChild(titulo);
  }

  const resumo = document.createElement("div");
  resumo.className = "resumo-oferta";

  let texto = "";
  if (oferta.tipo === "pagarei") {
    texto = `💸 Você ofertou R$ ${parseFloat(oferta.valor).toFixed(
      2
    )} para adquirir este item.`;
  } else if (oferta.tipo === "cobro") {
    texto = `🚚 Você propôs cobrar R$ ${parseFloat(oferta.valor).toFixed(
      2
    )} para retirar este item.`;
  } else {
    texto = `🤝 Você se propôs a retirar este item gratuitamente.`;
  }

  if (oferta.mensagem) {
    texto += `<br>📝 <i>Mensagem:</i> "${oferta.mensagem}"`;
  }

  resumo.innerHTML = texto;
  container.appendChild(resumo);
}

function configurarEventosEdicaoExclusao(item) {
  const btnEditar = document.getElementById("editarItem");
  const btnExcluir = document.getElementById("excluirItem");
  let confirmandoExclusao = false;

  btnEditar.addEventListener("click", () => {
    sessionStorage.setItem("itemEmEdicao", JSON.stringify(item));
    const origemDetalhes = sessionStorage.getItem("origemDetalhes");
    sessionStorage.setItem("origemEdicao", origemDetalhes || "dashboard.html");
    window.location.href = "cadastro-item.html";
  });

  btnExcluir.addEventListener("click", () => {
    if (!confirmandoExclusao) {
      btnExcluir.textContent = "Confirmar";
      btnExcluir.classList.add("confirmar-apagar");
      confirmandoExclusao = true;
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
      confirmandoExclusao = false;
    }
  });
}

function configurarExibicaoOfertas(item) {
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
    dataCadastro.getTime() + parseInt(item.duracao) * 24 * 60 * 60 * 1000
  );
  const expirado = dataFim <= hoje; // 🔥 Controle de expiração

  container.classList.remove("hidden");
  lista.innerHTML = "";

  if (expirado) {
    if (ofertasDoItem.length > 0) {
      const melhorOferta = ofertasDoItem[0];

      // 🎯 Buscar dados de perfil para pegar nomes e telefones
      const perfilProprietario = perfis[item.emailCriador] || {};
      const perfilGanhador = perfis[melhorOferta.interessadoEmail] || {};

      const nomeProprietario = perfilProprietario.nome || "Proprietário";
      const telefoneProprietario =
        perfilProprietario.telefone || "Não informado";

      const nomeGanhador = perfilGanhador.nome || melhorOferta.interessado;
      const telefoneGanhador = perfilGanhador.telefone || "Não informado";

      // 🎉 Cria o container completo
      const div = document.createElement("div");
      div.className = "oferta-recebida";

      let texto = `
        🎉 Parabéns <b>${nomeGanhador}</b>, você já pode retirar o item!<br><br>
      `;

      if (melhorOferta.tipo === "pagarei") {
        texto += `💸 <b>${nomeGanhador}</b> ofereceu R$ ${parseFloat(
          melhorOferta.valor
        ).toFixed(2)}.<br>`;
      } else if (melhorOferta.tipo === "cobro") {
        texto += `🚚 <b>${nomeGanhador}</b> cobrou R$ ${parseFloat(
          melhorOferta.valor
        ).toFixed(2)} para retirar.<br>`;
      } else {
        texto += `🤝 <b>${nomeGanhador}</b> se propôs a retirar gratuitamente.<br><br>`;
      }

      if (melhorOferta.mensagem) {
        texto += `📝 <i>Mensagem:</i> "${melhorOferta.mensagem}"<br><br>`;
      }

      // 📱 Telefones personalizados com nomes
      texto += `
        📱 Telefone de <b>${nomeProprietario}</b> (proprietário): <b>${telefoneProprietario}</b><br><br>
        📱 Telefone de <b>${nomeGanhador}</b> (novo dono): <b>${telefoneGanhador}</b><br><br>
      `;

      // Mensagem amigável
      texto += `
        😉 <b>Agora é só combinar a retirada do item!</b> 😁
      `;

      div.innerHTML = texto;
      lista.appendChild(div);
    } else {
      lista.innerHTML = "<p>Nenhuma oferta recebida durante o leilão.</p>";
    }
  } else {
    lista.innerHTML = ofertasDoItem.length
      ? ""
      : "<p>Nenhuma oferta recebida ainda.</p>";

    ofertasDoItem.forEach((oferta) => {
      renderizarOferta(oferta, lista);
    });
  }
}

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

    if (telefoneInput) {
      telefoneInput.value = perfilUsuario.telefone || "";
    }

    tipoSelect.addEventListener("change", () => {
      if (tipoSelect.value === "pagarei" || tipoSelect.value === "cobro") {
        campoValor.classList.remove("hidden");
      } else {
        campoValor.classList.add("hidden");
      }
    });

    configurarEnvioOferta(item);
  }
}

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

    if (!tipo) {
      alert("Selecione o tipo de oferta.");
      return;
    }

    if ((tipo === "pagarei" || tipo === "cobro") && !valorInput) {
      alert("Informe o valor para esta oferta.");
      return;
    }

    if (!telefoneOferta) {
      alert("Por favor, informe seu telefone para contato.");
      return;
    }

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

function configurarFechamentoModalOferta() {
  const botaoFechar = document.getElementById("fecharOferta");
  const modal = document.getElementById("modalOferta");

  if (botaoFechar && modal) {
    botaoFechar.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  }
}

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

function fecharVisualizadorImagem() {
  const visualizador = document.getElementById("visualizadorImagem");
  const imagemAmpliada = document.getElementById("imagemAmpliada");

  if (visualizador && imagemAmpliada) {
    visualizador.classList.add("hidden");
    imagemAmpliada.src = "";
  }
}

function renderizarOferta(oferta, container) {
  const div = document.createElement("div");
  div.className = "oferta-recebida"; // Mantemos o mesmo padrão visual

  let texto = "";
  if (oferta.tipo === "pagarei") {
    texto = `💸 <b>${oferta.interessado}</b> oferece R$ ${parseFloat(
      oferta.valor
    ).toFixed(2)}.`;
  } else if (oferta.tipo === "cobro") {
    texto = `🚚 <b>${oferta.interessado}</b> cobra R$ ${parseFloat(
      oferta.valor
    ).toFixed(2)} para retirar.`;
  } else {
    texto = `🤝 <b>${oferta.interessado}</b> se propõe a retirar gratuitamente.`;
  }

  if (oferta.mensagem) {
    texto += `<br>📝 <i>Mensagem:</i> "${oferta.mensagem}"`;
  }

  div.innerHTML = texto;
  container.appendChild(div);
}
