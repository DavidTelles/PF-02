# Septem Racing — Sistema de Gestão Motorsport

![Septem Racing](https://img.shields.io/badge/Septem-Racing-d4af37?style=for-the-badge&labelColor=0e0e0e)
![Node.js](https://img.shields.io/badge/Node.js-22.x-brightgreen?style=flat-square)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-lightgrey?style=flat-square)

> Plataforma completa para gestão de equipes de automobilismo — carros, corridas, pilotos e telemetria em tempo real.

---

## 📖 Sobre o Projeto

O **Septem Racing** é uma plataforma web desenvolvida para simular e gerenciar um ambiente de automobilismo profissional.

A aplicação permite o gerenciamento de:

* 👨‍🏎️ Pilotos
* 🚗 Carros
* 🏁 Corridas
* 👥 Equipes
* 📊 Rankings
* ⏱️ Tempos de volta
* 📈 Estatísticas de desempenho

Além disso, o sistema conta com uma interface inspirada em dashboards de Fórmula 1, exibindo informações em tempo real e comparativos de desempenho.

---

## ✨ Funcionalidades

### Área Pública

* Landing Page institucional
* FAQ interativo
* Cadastro de usuários
* Login de usuários

### Área Administrativa

* Dashboard principal
* Gestão de pilotos
* Gestão de equipes
* Gestão de carros
* Gestão de corridas
* Rankings dinâmicos
* Comparação de voltas
* Estatísticas de desempenho

### Dashboard de Corrida

* Visualização de classificação
* Circuito SVG animado
* Posição dos pilotos
* Melhor volta
* Última volta
* Comparação de desempenho
* Histórico de voltas

### Sistema de Ranking

Ao selecionar um piloto:

* Exibição de informações completas
* Última volta registrada
* Volta anterior
* Comparação automática
* Identificação de melhora ou piora de desempenho
* Indicadores visuais de evolução

---

## 🛠️ Tecnologias Utilizadas

### Front-End

* HTML5
* CSS3
* JavaScript (ES6+)

### Back-End

* Node.js
* Express.js

### Banco de Dados

* MySQL 8

### Segurança

* JWT (JSON Web Token)
* Bcrypt
* Helmet
* CORS

### Ferramentas

* Nodemon
* Dotenv
* Joi

---

## 📂 Estrutura do Projeto

```text
PF-02/
│
├── api/
│   ├── server.js
│   ├── app.js
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── models/
│   └── database/
│
├── src/
│   ├── pages/
│   │   ├── dashboard.html
│   │   ├── runners.html
│   │   ├── teams.html
│   │   ├── cars.html
│   │   ├── racings.html
│   │   ├── login.html
│   │   └── register.html
│   │
│   ├── styles/
│   └── scripts/
│
├── icons/
├── assets/
├── README.md
└── LICENSE
```

---

## ⚙️ Instalação

### Clonar o projeto

```bash
git clone https://github.com/seu-usuario/septem-racing.git
```

### Entrar na pasta

```bash
cd septem-racing
```

### Instalar dependências

```bash
cd api
npm install
```

### Configurar variáveis de ambiente

Criar um arquivo:

```env
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=septem_racing

JWT_SECRET=sua_chave_secreta
```

### Executar o servidor

```bash
npm start
```

Servidor:

```text
http://localhost:3000
```

---

## 🔐 Autenticação

O sistema utiliza:

* JWT para autenticação
* Bcrypt para criptografia de senhas
* Rotas protegidas para usuários autenticados

---

## 📊 Recursos de Destaque

### Comparação de Voltas

O sistema compara automaticamente:

```text
Volta Atual
vs
Volta Anterior
```

Exemplo:

```text
Volta Anterior: 01:32.451
Última Volta:   01:31.987

Diferença: -0.464s
```

Resultado:

* 🟢 Melhorou o desempenho
* 🔴 Piorou o desempenho
* ⚪ Manteve o mesmo ritmo

---

## 🎯 Objetivos do Projeto

* Aplicar conceitos de desenvolvimento Full Stack.
* Implementar autenticação segura.
* Trabalhar com APIs REST.
* Integrar banco de dados relacional.
* Desenvolver uma interface moderna e responsiva.
* Simular um ambiente de monitoramento de corridas.

---

## 👨‍💻 Desenvolvedores

* David Telles
* Enzo Kuramoto

Projeto desenvolvido como Produto Final do SENAI.

---

## 📄 Licença

Este projeto está licenciado sob a licença MIT.
