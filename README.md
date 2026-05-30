# Septem Racing — Sistema de Gestão Motorsport

![Septem Racing](https://img.shields.io/badge/Septem-Racing-d4af37?style=for-the-badge&labelColor=0e0e0e)
![Node.js](https://img.shields.io/badge/Node.js-22.x-brightgreen?style=flat-square)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-lightgrey?style=flat-square)

> Plataforma completa para gestão de equipes de automobilismo — carros, corridas, pilotos e telemetria em tempo real.

---

## 📸 Screenshots

| Landing Page | Dashboard |
|---|---|
| *(screenshot-landing.png)* | *(screenshot-dashboard.png)* |

| Cars | Teams |
|---|---|
| *(screenshot-cars.png)* | *(screenshot-teams.png)* |

---

## 📋 Descrição

O **Septem Racing** é um sistema de gerenciamento desenvolvido para equipes de corrida. Através de uma interface moderna e responsiva, gestores e engenheiros podem acompanhar dados de corrida em tempo real, gerenciar a frota de veículos, organizar equipes de pilotos e manter um calendário atualizado de provas.

O sistema foi desenvolvido com foco em:
- Interface premium com estética motorsport (preto & dourado)
- Design responsivo para desktop, tablet e mobile
- Animações fluidas sem comprometer a performance
- Componentes visuais reutilizáveis e consistentes

---

## ✨ Funcionalidades

### Área Pública (Sem Login)
- **Landing Page** — Apresentação do sistema com estatísticas, funcionalidades e CTAs
- **FAQ** — Perguntas frequentes com accordion interativo
- **Login / Cadastro** — Autenticação de usuários via API

### Área Autenticada
- **Dashboard ao vivo** — Acompanhe dados de corrida: tempo de volta, gap para o líder, posição no circuito, G-force e velocidade por setor
- **Mapa do Circuito** — Visualização SVG animada com ponto do carro percorrendo o traçado
- **Cars** — Tabela completa da frota com status, piloto e histórico
- **Racings** — Calendário de corridas com resultados e status ao vivo
- **Teams** — Classificação de equipes e pilotos com pontuações

---

## 🛠 Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | HTML5, CSS3, JavaScript ES6+ |
| Fontes | Barlow Condensed + DM Sans (Google Fonts) |
| Backend | Node.js + Express.js |
| Banco de Dados | MySQL 8.0 |
| Autenticação | bcrypt (hash de senhas) |
| API | REST — JSON |

---

## 📁 Estrutura de Pastas

```
PF-02/
├── index.html                  # Landing page pública
├── README.md
├── LICENSE
├── icons/
│   ├── about.png
│   └── logout.png
├── src/
│   ├── styles/
│   │   └── style.css           # Stylesheet global
│   └── pages/
│       ├── dashboard.html      # Dashboard principal (autenticado)
│       ├── carros.html         # Gestão de carros
│       ├── corrida.html        # Calendário de corridas
│       ├── time.html           # Equipes e pilotos
│       ├── login.html          # Login
│       ├── cadastro.html       # Cadastro de usuário
│       └── faq.html            # Perguntas frequentes
└── api/
    ├── app.js                  # Configuração Express
    ├── server.js               # Inicialização do servidor
    ├── db.js                   # Conexão com MySQL
    ├── package.json
    └── routes/
        └── users.js            # Rotas de usuários
```

---

## 🚀 Instalação

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- [MySQL](https://dev.mysql.com/downloads/) 8.0+
- npm ou yarn

### 1. Clone o repositório

```bash
git clone https://github.com/DavidTelles/PF-02.git
cd PF-02
```

### 2. Instale as dependências da API

```bash
cd api
npm install
```

### 3. Configure o banco de dados

Crie o banco de dados e as tabelas executando o script DDL:

```bash
mysql -u root -p < api/sql/DDL.sql
```

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env` dentro da pasta `api/`:

```env
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=septem_racing
PORT=3000
```

### 5. Inicie o servidor

```bash
# Dentro da pasta api/
npm start

# Ou com nodemon para desenvolvimento:
npm run dev
```

O servidor estará disponível em: `http://localhost:3000`

---

## ▶️ Como Executar o Projeto

### Frontend

O frontend é estático — basta abrir os arquivos HTML diretamente no navegador ou servir com qualquer servidor estático:

```bash
# Opção 1: extensão Live Server (VS Code)
# Clique com botão direito em index.html → "Open with Live Server"

# Opção 2: http-server via npm
npx http-server . -p 5500

# Opção 3: Python
python3 -m http.server 5500
```

Acesse: `http://localhost:5500`

### API

```bash
cd api && npm start
# API disponível em: http://localhost:3000
```

---

## 📖 Guia de Uso

### Criar uma Conta
1. Acesse a landing page (`index.html`)
2. Clique em **"Criar Conta Gratuita"** ou **"Começar Agora"**
3. Preencha nome, email e senha
4. Clique em **"Cadastrar"**

### Fazer Login
1. Acesse `/src/pages/login.html`
2. Digite seu email e senha
3. Clique em **"Entrar no Grid"**

### Acompanhar Corrida
1. Após o login, acesse o **Dashboard**
2. Os dados de corrida são exibidos em cards com animações
3. O mapa do circuito mostra o carro se movendo pelo traçado em tempo real
4. A tabela de voltas exibe os tempos por setor

### Gerenciar Carros
1. No menu lateral, clique em **"Cars"**
2. Visualize a frota completa com status, piloto e histórico
3. Use o botão **"+ Adicionar Carro"** para cadastrar novos veículos

### Visualizar Classificação
1. No menu lateral, clique em **"Teams"**
2. Veja a classificação de equipes e pilotos com pontuação acumulada

---

## 🎨 Sistema de Design

### Paleta de Cores

| Variável | Valor | Uso |
|---|---|---|
| `--black` | `#080808` | Background principal |
| `--gold` | `#d4af37` | Destaque / CTA |
| `--surface-2` | `#161616` | Cards e painéis |
| `--text-primary` | `#f0ede6` | Texto principal |
| `--text-secondary` | `#9a9690` | Texto secundário |

### Tipografia

- **Display**: Barlow Condensed (títulos, métricas, labels em caps)
- **Body**: DM Sans (textos, labels, botões)

### Componentes

- `.stat-card` — Card de métrica com efeito tilt 3D
- `.panel` — Container com header e corpo
- `.badge` — Indicador de status colorido
- `.btn` — Botão em variações primary/ghost
- `.faq-item` — Accordion animado
- `.table-wrapper` — Tabela responsiva com estilo dark

---

## 🔌 Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/users/create` | Cria novo usuário |

**Body — POST /users/create:**
```json
{
  "name": "Nome do Usuário",
  "email": "usuario@email.com",
  "password": "senha123"
}
```

---

## 🔮 Melhorias Futuras

- [ ] Autenticação JWT com sessões persistentes
- [ ] Integração com dados de telemetria real-time via WebSockets
- [ ] Gráficos de performance com Chart.js ou D3.js
- [ ] Modo escuro / claro configurável pelo usuário
- [ ] Sistema de notificações push para alertas de corrida
- [ ] Exportação de relatórios em PDF
- [ ] Painel administrativo para gestão de usuários
- [ ] Histórico completo de temporadas anteriores
- [ ] Comparativo de pilotos com radar chart
- [ ] App mobile com Progressive Web App (PWA)

---

## 👥 Créditos

Desenvolvido como projeto frontend para o curso SENAI.

**Design System:** Inspired by motorsport telemetry dashboards 

---

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

<div align="center">
  <strong>SEPTEM RACING</strong> — Gestão Motorsport Profissional
</div>
