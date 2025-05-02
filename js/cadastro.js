// ========================================================
// Inicialização ao carregar a página
// ========================================================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formCadastroUsuario");

  // Valida senhas enquanto digita
  const campoConfirmacao = document.getElementById("senhaConfirmacao");
  campoConfirmacao.addEventListener("input", validarSenhas);

  // Submissão do formulário
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    cadastrarUsuario();
  });
});

// ========================================================
// Valida se a senha e confirmação são compatíveis
// ========================================================

function validarSenhas() {
  const senha = document.getElementById("senhaCadastro")?.value;
  const confirmacao = document.getElementById("senhaConfirmacao")?.value;
  const mensagem = document.getElementById("mensagemCadastro");
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
    mensagem.textContent = "";
    mensagem.classList.remove("erro");
    mensagem.classList.remove("ok");
  } else {
    campoConfirmacao.classList.add("input-erro");
    campoConfirmacao.classList.remove("input-ok");
    mensagem.textContent = "As senhas não coincidem!";
    mensagem.classList.remove("ok");
    mensagem.classList.add("erro");
  }
}

// ========================================================
// Realiza o cadastro de usuário e salva no localStorage
// ========================================================

function cadastrarUsuario() {
  const nome = document.getElementById("nomeCadastro").value.trim();
  const email = document.getElementById("emailCadastro").value.trim();
  const senha = document.getElementById("senhaCadastro").value;
  const confirmacao = document.getElementById("senhaConfirmacao").value;
  const mensagem = document.getElementById("mensagemCadastro");

  if (!nome || !email || !senha || !confirmacao) {
    exibirMensagem("Preencha todos os campos.", false);
    return;
  }

  if (senha !== confirmacao) {
    exibirMensagem("As senhas não coincidem!", false);
    return;
  }

  const perfis = JSON.parse(localStorage.getItem("perfisUsuarios")) || {};

  if (perfis[email]) {
    exibirMensagem("Este e-mail já está cadastrado.", false);
    return;
  }

  const novoUsuario = { nome, email, senha };
  perfis[email] = novoUsuario;

  localStorage.setItem("perfisUsuarios", JSON.stringify(perfis));
  sessionStorage.setItem("usuarioLogado", email);

  exibirMensagem("Cadastro realizado com sucesso!", true);

  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 1000);
}

// ========================================================
// Exibe mensagens visuais no formulário
// ========================================================

function exibirMensagem(texto, sucesso = false) {
  const mensagem = document.getElementById("mensagemCadastro");
  mensagem.textContent = texto;
  mensagem.classList.toggle("ok", sucesso);
  mensagem.classList.toggle("erro", !sucesso);
}
