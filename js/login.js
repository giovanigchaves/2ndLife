function loginUsuario() {
  const email = document.getElementById("emailLogin")?.value.trim();
  const senha = document.getElementById("senhaLogin")?.value;
  const mensagem = document.getElementById("mensagemLogin");

  if (!email || !senha || !mensagem) return false;

  const perfis = JSON.parse(localStorage.getItem("perfisUsuarios")) || {};
  const usuarios = Object.values(perfis);

  const usuarioValido =
    usuarios.find(
      (usuario) =>
        usuario.email.toLowerCase() === email.toLowerCase() &&
        usuario.senha === senha
    ) || null;

  if (usuarioValido) {
    sessionStorage.setItem("usuarioLogado", usuarioValido.email);
    window.location.href = "dashboard.html";
  } else {
    mensagem.textContent = "E-mail ou senha incorretos. Tente novamente.";
    mensagem.classList.remove("ok");
    mensagem.classList.add("erro");
  }

  return false;
}
