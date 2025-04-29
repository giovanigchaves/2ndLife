function cadastrarUsuario() {
  const nome = document.getElementById("nomeCadastro")?.value.trim();
  const email = document.getElementById("emailCadastro")?.value.trim();
  const senha = document.getElementById("senhaCadastro")?.value;
  const confirmacao = document.getElementById("senhaConfirmacao")?.value;
  const mensagem = document.getElementById("mensagemCadastro");

  if (!nome || !email || !senha || !confirmacao || !mensagem) return false;

  if (senha !== confirmacao) {
    return false;
  }

  const perfis = JSON.parse(localStorage.getItem("perfisUsuarios")) || {};
  const emailExistente = perfis[email];

  if (emailExistente) {
    mensagem.textContent = "Este e-mail já está cadastrado.";
    mensagem.classList.remove("ok");
    mensagem.classList.add("erro");
    return false;
  }

  const novoUsuario = { nome, email, senha };
  perfis[email] = novoUsuario;
  localStorage.setItem("perfisUsuarios", JSON.stringify(perfis));
  
  sessionStorage.setItem("usuarioLogado", novoUsuario.email);

  mensagem.textContent = "Cadastro realizado com sucesso!";
  mensagem.classList.remove("erro");
  mensagem.classList.add("ok");

  // Pequeno delay para usuário ver a mensagem
  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 1000);

  return false;
}

function validarSenhas() {
  const senha = document.getElementById("senhaCadastro")?.value;
  const confirmacao = document.getElementById("senhaConfirmacao")?.value;
  const mensagem = document.getElementById("mensagemSenha");
  const campoConfirmacao = document.getElementById("senhaConfirmacao");

  if (!senha || !confirmacao || !mensagem || !campoConfirmacao) return;

  mensagem.textContent = "";

  if (confirmacao === "") {
    campoConfirmacao.classList.remove("input-ok", "input-erro");
    return;
  }

  if (senha.startsWith(confirmacao)) {
    campoConfirmacao.classList.add("input-ok");
    campoConfirmacao.classList.remove("input-erro");
  } else {
    campoConfirmacao.classList.add("input-erro");
    campoConfirmacao.classList.remove("input-ok");
    mensagem.textContent = "As senhas não coincidem!";
    mensagem.classList.remove("ok");
    mensagem.classList.add("erro");
  }
}
function abrirCadastroNovo() {
  sessionStorage.removeItem("itemEmEdicao");
  window.location.href = "cadastro-item.html";
}
