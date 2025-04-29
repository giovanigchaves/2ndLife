# 2ndLife - Sistema de Doação e Trocas de Itens

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Status](https://img.shields.io/badge/status-completo-brightgreen?style=for-the-badge)


## 🏠 Sobre o Projeto

Este projeto foi desenvolvido através do programa de formação **Movitalent**, uma iniciativa da empresa <a href="https://www.moviplu.com/" target="_blank">Muviplu</a>

O objetivo é capacitar talentos para criarem soluções reais com tecnologias modernas e boas práticas.

---

 ***Asse o projeto no GitHub Pages***  **<a href="https://giovanigchaves.github.io/2ndLife/" target="_blank">GitHub Pages</a>**.



---
   
<img src="https://github.com/user-attachments/assets/729e147e-96f0-4418-b9b5-8b3b9f7198ce" width="100px" height="100px" alt="2ndLife">

---

**2ndLife** é um sistema completo de marketplace social para **doação, trocas e leilões de itens**. O projeto conecta pessoas que desejam doar ou receber produtos de forma organizada, transparente e segura.

---

## 🌟 Funcionalidades

- Cadastro de usuários com dados pessoais e endereço
- Cadastro de itens com múltiplas fotos, descrição e durabilidade do leilão
- Sistema de ofertas com três tipos:
  - **Pagarei**
  - **Retirar Gratuitamente**
  - **Cobro pela Retirada**
- Escolha automática da melhor oferta ao final do leilão
- Mensagem de parabenização ao ganhador
- Painel com filtros por criador, categoria, cidade e ordenação por diversos critérios (inclusive endereço)
- Sistema de exportação/importação completo de dados (itens, ofertas, categorias, usuários)
- Edição de perfil com foto, telefone, endereço, etc.
- Responsividade para dispositivos desktop e mobile

---

## 🛠️ Tecnologias Utilizadas

- **HTML5**
- **CSS3**
- **JavaScript Puro**
- **LocalStorage + SessionStorage** (armazenamento local e sessão)

---

## 📁 Estrutura de Arquivos

```
/
|-- index.html
|-- login.html
|-- cadastro.html
|-- dashboard.html
|-- cadastro-item.html
|-- itens-cadastrados.html
|-- detalhes-item.html
|-- perfil.html
|
|-- css/
|    |-- global.css
|    |-- login.css
|    |-- cadastro.css
|    |-- dashboard.css
|    |-- cadastro-item.css
|    |-- itens-cadastrados.css
|    |-- detalhes-item.css
|    |-- perfil.css
|
|-- js/
|    |-- index.js
|    |-- login.js
|    |-- cadastro.js
|    |-- dashboard.js
|    |-- cadastro-item.js
|    |-- itens-cadastrados.js
|    |-- detalhes-item.js
|    |-- perfil.js
|
|-- backup-2ndlife.json (exemplo de exportação)
```
## 📒 Exportação e Importação de Dados

O sistema permite:

- **Exportar** backup completo (itens, ofertas, categorias, perfis)
- **Importar** esse backup para restaurar ou transferir dados

A funcionalidade é acessível pela tela "Itens Cadastrados".

---

## 📉 Fluxo do Sistema

1. Cadastro do usuário com nome, email, senha, telefone e endereço
2. Login pelo email e senha (case insensitive)
3. Cadastro de novo item com até 4 fotos, tempo de leilão, e endereço preenchido automaticamente
4. Outros usuários podem acessar e fazer ofertas
5. O sistema avalia a melhor oferta com base em:
   - Tipo de oferta (prioridade: Pagarei > Grátis > Cobro)
   - Valor ofertado (quando aplicável)
6. Ao fim do leilão, o item é removido da lista pública e direcionado ao dashboard do ganhador e do criador
7. A interface fornece os telefones dos envolvidos para combinar a retirada

---

## 📄 Filtros e Ordenação Inteligentes

- Filtros por: **Criador**, **Categoria**, **Cidade**
- Campo de busca abrangente: nome, descrição, categoria, criador, cidade, estado, bairro, rua, cep
- Ordenação por: **Nome**, **Data**, **Categoria**, **Duração**, **Término**, **Cidade**

---

## 🏆 Destaques Técnicos

- **Login case insensitive** (para evitar erros de maiúsculas)
- **Atualização de perfil integrada** ao cadastro de item
- **Foto de perfil e nome renderizados no menu**
- **Validação completa dos campos** e mensagens de feedback

---

