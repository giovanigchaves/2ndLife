// =============================================
// Inicialização da página
// =============================================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formLogin");

  // Event listener para submissão do formulário
  form.addEventListener("submit", function (e) {
    e.preventDefault(); // Evita reload da página
    realizarLogin();
  });
});

// =============================================
// Função principal de login: valida credenciais e inicia sessão
// =============================================

function realizarLogin() {
  const email = document.getElementById("emailLogin")?.value.trim();
  const senha = document.getElementById("senhaLogin")?.value;
  const mensagem = document.getElementById("mensagemLogin");

  // Validação básica de campos
  if (!email || !senha || !mensagem) {
    exibirMensagem("Preencha todos os campos.", false);
    return;
  }

  const perfis = JSON.parse(localStorage.getItem("perfisUsuarios")) || {};
  const usuarios = Object.values(perfis);

  const usuarioValido = usuarios.find(
    (usuario) =>
      usuario.email.toLowerCase() === email.toLowerCase() &&
      usuario.senha === senha
  );

  if (usuarioValido) {
    sessionStorage.setItem("usuarioLogado", usuarioValido.email);
    window.location.href = "dashboard.html";
  } else {
    exibirMensagem("E-mail ou senha incorretos. Tente novamente.", false);
  }
}

// =============================================
// Exibe mensagens visuais para o usuário
// =============================================

function exibirMensagem(texto, sucesso = false) {
  const mensagem = document.getElementById("mensagemLogin");
  if (!mensagem) return;

  mensagem.textContent = texto;
  mensagem.classList.toggle("ok", sucesso);
  mensagem.classList.toggle("erro", !sucesso);
}
