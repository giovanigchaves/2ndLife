function loginUsuario() {
  const email = document.getElementById("emailLogin")?.value.trim();
  const senha = document.getElementById("senhaLogin")?.value;
  const mensagem = document.getElementById("mensagemLogin");

  if (!email || !senha || !mensagem) return false;

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const usuarioValido = usuarios.find(
    (u) => u.email === email && u.senha === senha
  );

  if (usuarioValido) {
    sessionStorage.setItem("usuarioLogado", JSON.stringify(usuarioValido));
    window.location.href = "dashboard.html";
  } else {
    mensagem.textContent = "E-mail ou senha incorretos. Tente novamente.";
    mensagem.classList.remove("ok");
    mensagem.classList.add("erro");
  }

  return false;
}
