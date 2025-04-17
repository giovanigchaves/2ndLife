// Boas-vindas na dashboard e proteção de rota
if (window.location.pathname.includes("dashboard.html")) {
  const usuarioLogado = JSON.parse(sessionStorage.getItem("usuarioLogado"));
  if (usuarioLogado) {
    const titulo = document.getElementById("boasVindas");
    if (titulo) {
      titulo.textContent = "Bem-vindo(a), " + usuarioLogado.nome + "!";
    }
  } else {
    window.location.href = "login.html";
  }
}
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

function sair() {
  sessionStorage.removeItem("usuarioLogado");
  window.location.href = "login.html";
}
function verItensCadastrados() {
  window.location.href = "itens-cadastrados.html";
}
function CadastrarItem() {
  sessionStorage.removeItem("itemEmEdicao");
  window.location.href = "cadastro-item.html";
}
function abrirCadastroNovo() {
  sessionStorage.removeItem("itemEmEdicao");
  window.location.href = "cadastro-item.html";
}
