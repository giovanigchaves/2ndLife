document.addEventListener("DOMContentLoaded", () => {
  const usuarioLogado = JSON.parse(sessionStorage.getItem("usuarioLogado"));
  if (!usuarioLogado) {
    window.location.href = "login.html";
    return;
  }

  const emailUsuario = usuarioLogado.email;
  const form = document.getElementById("formPerfil");
  const preview = document.getElementById("previewFoto");
  const inputFoto = document.getElementById("fotoPerfil");

  // Carregar dados do perfil, se existirem
  const perfis = JSON.parse(localStorage.getItem("perfisUsuarios")) || {};

  const perfilAtual = perfis[emailUsuario];

  // preenche o campo existente, nome e email
  document.getElementById("nomePerfil").value = usuarioLogado.nome || "";
  document.getElementById("emailPerfil").value = usuarioLogado.email || "";

  if (perfilAtual) {
    document.getElementById("nomePerfil").value = perfilAtual.nome || "";
    document.getElementById("telefonePerfil").value =
      perfilAtual.telefone || "";
    document.getElementById("cep").value = perfilAtual.cep || "";
    document.getElementById("rua").value = perfilAtual.rua || "";
    document.getElementById("bairro").value = perfilAtual.bairro || "";
    document.getElementById("numero").value = perfilAtual.numero || "";
    document.getElementById("cidade").value = perfilAtual.cidade || "";
    document.getElementById("estado").value = perfilAtual.estado || "";

    if (perfilAtual.fotoPerfil) {
      preview.innerHTML = `<img src="${perfilAtual.fotoPerfil}" class="foto-preview" />`;
    }
  }

  // Buscar endereço ao preencher o CEP
  document.getElementById("cep").addEventListener("blur", async () => {
    const cep = document.getElementById("cep").value.replace(/\D/g, "");
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

  // Preview da foto
  inputFoto.addEventListener("change", () => {
    const file = inputFoto.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        preview.innerHTML = `<img src="${reader.result}" class="foto-preview" />`;
      };
      reader.readAsDataURL(file);
    }
  });

  // Salvar perfil
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    let fotoPerfilBase64 = perfilAtual?.fotoPerfil || "";

    const novaFoto = inputFoto.files[0];
    if (novaFoto) {
      const reader = new FileReader();
      fotoPerfilBase64 = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(novaFoto);
      });
    }

    const dadosAtualizados = {
      nome: document.getElementById("nomePerfil").value.trim(),
      telefone: document.getElementById("telefonePerfil").value.trim(),
      cep: document.getElementById("cep").value.trim(),
      rua: document.getElementById("rua").value.trim(),
      bairro: document.getElementById("bairro").value.trim(),
      numero: document.getElementById("numero").value.trim(),
      cidade: document.getElementById("cidade").value.trim(),
      estado: document.getElementById("estado").value.trim(),
      fotoPerfil: fotoPerfilBase64,
    };

    perfis[emailUsuario] = dadosAtualizados;
    localStorage.setItem("perfisUsuarios", JSON.stringify(perfis));

    // Modal de confirmação (caso queira usar uma)
    alert("Perfil salvo com sucesso!");
  });

  const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado"));
  if (!usuario) return;

  const perfil = perfis[usuario.email];

  const foto = document.getElementById("fotoMiniatura");
  const nome = document.getElementById("nomeMiniatura");

  if (foto && nome) {
    foto.src = perfil?.fotoPerfil || "assets/avatar-default.png";
    nome.textContent = usuario.nome;
  }
});

function abrirCadastroNovo() {
  sessionStorage.removeItem("itemEmEdicao");
  window.location.href = "cadastro-item.html";
}

function sair() {
  sessionStorage.removeItem("usuarioLogado");
  window.location.href = "login.html";
}
