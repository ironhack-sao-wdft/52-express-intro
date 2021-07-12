// Instalar o Nodemon globalmente (para todos os projetos):
// npm install -g nodemon
// O Nodemon é um pacote que recarrega o servidor automaticamente toda vez que o código é alterado

// Sintaxe CommonJS: no lugar de 'import' usamos o require, e no lugar de 'export default' usamos module.exports
const express = require("express");
const { v4: uuidv4 } = require("uuid");
// O código acima é a mesma coisa que `import express from 'express'`

// Importando a array de objetos que simula nosso banco de dados
const contactsArr = require("./data");

// 1. Instanciar o Express para criar um aplicativo
const app = express();

// 5. Configurar o servidor Express para aceitar requisições com corpo (body) no formato JSON
app.use(express.json());

// 2. Criar uma rota do verbo GET que retorna o texto 'Hello world'
// Os métodos HTTP no Express sempre recebem 2 argumentos: o primeiro é uma string dizeno qual rota receberá as requisições, e o segundo é uma função que é executada quando essa requisição é recebida
app.get("/hello", (request, response) => {
  // A callback dos métodos HTTP aceita 2 parâmetros: request e response, que representam a requisição enviada pelo cliente e a resposta enviada pelo servidor
  console.log("A rota /hello foi chamada");
  return response.send("Hello world!"); // Usamos o objeto de resposta para responder algo ao cliente
});

// Pesquisar um elemento na array usamos query params (parâmetros de pesquisa)
app.get("/contacts/search", (req, res) => {
  // Parâmetros de pesquisa (a porção da URL depois do `?`) ficam disponíveis no Express no objeto 'query'

  const queryParams = req.query;

  // Caso a busca tenha sido feita com a URL ?popularity=10
  console.log(queryParams); // { popularity: '10' }

  // Iterar sobre cada propriedade do objeto queryParams
  for (let key in queryParams) {
    const foundContact = contactsArr.find((contactElement) => {
      if (typeof contactElement[key] === "number") {
        return Math.round(contactElement[key]) === Math.round(queryParams[key]);
      }
      return contactElement[key]
        .toLowerCase()
        .includes(queryParams[key].toLowerCase());
    });

    if (foundContact) {
      return res.json(foundContact);
    } else {
      return res.json({ msg: "Contact not found." });
    }
  }

  res.json(queryParams);
});

// Responde todos os contatos
app.get("/contacts", (req, res) => {
  // Retornando a array contacts (que tem todos os contatos) em formato JSON
  return res.json(contactsArr);
});

// Responde um contato específico filtrando pelo ID
app.get("/contacts/:id", (req, res) => {
  // Para definir parâmetros de rota no Express, usamos a mesma sintaxe do React Router (:nome-do-parametro), que torna essa porção da URL dinâmica (aceitando qualquer texto)
  // O Express disponibiliza os parâmetros de rota no objeto `params` dentro de req:
  const id = req.params.id;

  const foundContact = contactsArr.find((contactElement) => {
    return contactElement.id === id;
  });

  if (foundContact) {
    return res.json(foundContact);
  } else {
    return res.json({ msg: "Contact not found." });
  }
});

// Criar um novo contato
app.post("/contacts", (req, res) => {
  // O objeto body é o objeto que guarda as informações enviadas no corpo da requisição (no React, o state que enviamos de segundo parâmetro no axios.post). Somente os métodos post e put têm o objeto body.
  const formData = req.body;

  const newContact = {
    id: uuidv4(),
    name: formData.name,
    pictureUrl: formData.pictureUrl,
    popularity: formData.popularity,
  };

  // ATENÇÃO: Estamos salvando o novo contato somente na memória do servidor, desta forma, quando o processo do Node for reiniciado, a memória é resetada e os novos registros perdidos
  contactsArr.push(newContact);

  return res.json(newContact);
});

// Editar um contato
app.put("/contacts/:id", (req, res) => {
  const formData = req.body;

  // Encontrar registro existente
  const id = req.params.id;

  const foundContact = contactsArr.find((contactElement) => {
    return contactElement.id === id;
  });

  // Encontrar o índice desse registro na array
  const index = contactsArr.indexOf(foundContact);

  // São necessários dois spreads para primeiro salvar o que já existe, e depois sobrescrever com as novas informações
  contactsArr[index] = { ...foundContact, ...formData };

  return res.json(contactsArr[index]);
});

// Deletar um contato
app.delete("/contacts/:id", (req, res) => {
  const index = contactsArr.findIndex((contactElement) => {
    return contactElement.id === req.params.id;
  });

  if (index > 0) {
    contactsArr.splice(index, 1);
    return res.json({ msg: "Contact deleted successfully" });
  } else {
    return res.json({ msg: "Contact not found." });
  }
});

// 3. Escutar requisições HTTP em uma porta específica:
app.listen(4000, () => {
  console.log("Servidor está no ar, escutando requisições na porta 4000!");
});
