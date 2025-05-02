// =============================================
// INICIALIZAÇÃO AO CARREGAR A PÁGINA
// =============================================
document.addEventListener("DOMContentLoaded", () => {
  const emailLogado = sessionStorage.getItem("usuarioLogado");
  if (!emailLogado) return;

  const perfis = JSON.parse(localStorage.getItem("perfisUsuarios")) || {};
  const perfil = perfis[emailLogado];
  if (!perfil) return;

  // Preenche dados pessoais
  document.getElementById("fotoMiniatura").src =
    perfil.fotoPerfil || "assets/avatar-default.png";
  document.getElementById("previewFoto").src =
    perfil.fotoPerfil || "assets/avatar-default.png";
  document.getElementById("nomeMiniatura").textContent =
    perfil.nome || "Usuário";
  document.getElementById("nomePerfil").value = perfil.nome || "";
  document.getElementById("emailPerfil").value = perfil.email || "";
  document.getElementById("telefonePerfil").value = perfil.telefone || "";

  // Preenche endereço salvo
  const end = perfil.endereco || {};
  document.getElementById("cep").value = end.cep || "";
  document.getElementById("rua").value = end.rua || "";
  document.getElementById("numero").value = end.numero || "";
  document.getElementById("bairro").value = end.bairro || "";
  document.getElementById("cidade").value = end.cidade || "";
  document.getElementById("estado").value = end.estado || "";
});

// =============================================
// ATUALIZA O PREVIEW DA FOTO DE PERFIL AO SELECIONAR ARQUIVO
// =============================================
document.getElementById("fotoPerfil").addEventListener("change", function () {
  const arquivo = this.files[0];
  if (!arquivo) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    document.getElementById("previewFoto").src = e.target.result;
    document.getElementById("fotoMiniatura").src = e.target.result;
  };
  reader.readAsDataURL(arquivo);
});

// =============================================
// BUSCA AUTOMÁTICA DO ENDEREÇO COM BASE NO CEP
// =============================================
document.getElementById("cep").addEventListener("blur", function () {
  const cep = this.value.replace(/\D/g, "");
  if (cep.length !== 8) return;

  fetch(`https://viacep.com.br/ws/${cep}/json/`)
    .then((res) => res.json())
    .then((dados) => {
      if (dados.erro) return;

      document.getElementById("rua").value = dados.logradouro || "";
      document.getElementById("bairro").value = dados.bairro || "";
      document.getElementById("cidade").value = dados.localidade || "";
      document.getElementById("estado").value = dados.uf || "";
    });
});

// =============================================
// SALVA AS INFORMAÇÕES ATUALIZADAS DO PERFIL
// =============================================
document.getElementById("formPerfil").addEventListener("submit", function (e) {
  e.preventDefault();

  const emailLogado = sessionStorage.getItem("usuarioLogado");
  if (!emailLogado) return;

  const perfis = JSON.parse(localStorage.getItem("perfisUsuarios")) || {};
  const fotoPreview = document.getElementById("previewFoto").src;

  const perfilAnterior = perfis[emailLogado] || {};

  perfis[emailLogado] = {
    ...perfilAnterior, // preserva dados anteriores como a senha
    nome: document.getElementById("nomePerfil").value.trim(),
    email: document.getElementById("emailPerfil").value.trim(),
    telefone: document.getElementById("telefonePerfil").value.trim(),
    fotoPerfil: fotoPreview,
    endereco: {
      cep: document.getElementById("cep").value.trim(),
      rua: document.getElementById("rua").value.trim(),
      numero: document.getElementById("numero").value.trim(),
      bairro: document.getElementById("bairro").value.trim(),
      cidade: document.getElementById("cidade").value.trim(),
      estado: document.getElementById("estado").value.trim(),
    },
  };

  localStorage.setItem("perfisUsuarios", JSON.stringify(perfis));
  exibirModalConfirmacao("Perfil atualizado com sucesso!", () => {
    window.location.reload();
  });
});

// =============================================
// FUNÇÕES DE NAVEGAÇÃO / MENU
// =============================================
function toggleMenu() {
  const links = document.querySelector(".menu-links");
  links.classList.toggle("show");
}

function abrirCadastroNovo() {
  sessionStorage.removeItem("itemEmEdicao");
  sessionStorage.setItem("origemEdicao", window.location.pathname);
  window.location.href = "cadastro-item.html";
}

function sair() {
  sessionStorage.removeItem("usuarioLogado");
  window.location.href = "login.html";
}

// =============================================
// FUNÇÃO QUE EXIBE A MODAL
// =============================================

function exibirModalConfirmacao(texto, callback) {
  const modal = document.querySelector(".modal-acao.modal-confirmacao");
  const mensagem = modal.querySelector("p");

  mensagem.textContent = texto;
  modal.classList.remove("hidden");
  modal.classList.add("show");

  setTimeout(() => {
    modal.classList.remove("show");
    modal.classList.add("hidden");
    if (typeof callback === "function") callback();
  }, 1500);
}
