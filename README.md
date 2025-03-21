# Robô Trader Automatizado - Binance Futures

Este é um robô trader automatizado desenvolvido para operar na plataforma **Binance Futures**. Ele utiliza estratégias baseadas em indicadores técnicos como **SAR (Parabolic SAR)**, **EMA (Média Móvel Exponencial)** e o **Índice de Medo e Ganância (Fear and Greed Index)** para tomar decisões de compra e venda. O robô foi desenvolvido em **Node.js** e se conecta à API da Binance para executar operações em tempo real.

---

## AVISOS

- **VOCÊ DEVE TER CONHECIMENTOS BÁSICOS DE LÓGICA DE PROGRAMAÇÃO E DE ALGORITMOS PARA USAR ESTE ROBÔ.**
- **EU NÃO ME RESPONSABILIZO PELO USO INDEVIDO DESTE ROBÔ TRADER, BUGS QUE ELE POSSA TER OU A LÓGICA DE TRADING QUE VOCÊ VENHA A APLICAR.**
- **EU NÃO ME RESPONSABILIZO POR PERDAS FINANCEIRAS E NÃO DOU CONSELHOS DE INVESTIMENTO.**
- **CRIPTOMOEDAS É INVESTIMENTO DE RISCO, TENHA ISSO EM MENTE.**
- **NÃO COMPARTILHE SUAS VARIÁVEIS DE AMBIENTE E ARQUIVO `.ENV` COM NINGUÉM, NEM COMIGO.**
- **AO USAR ESTE ROBÔ, VOCÊ ASSUME QUALQUER RISCO FINANCEIRO QUE ELE POSSA LHE CAUSAR.**
- **NÃO DESENVOLVO PARA TERCEIROS.**

---

## Funcionalidades

- **Operações Automatizadas**: Compra e venda de contratos futuros na Binance.
- **Indicadores Técnicos**:
  - **SAR (Parabolic SAR)**: Identifica pontos de reversão de tendência.
  - **EMA (Média Móvel Exponencial)**: Ajuda a identificar tendências de mercado.
  - **Fear and Greed Index**: Avalia o sentimento do mercado (medo ou ganância).
- **Gerenciamento de Risco**: Alavancagem configurável e controle de margem inicial.
- **WebSocket**: Conexão em tempo real com a Binance para receber atualizações de preço.

---

## Tecnologias Utilizadas

- **Node.js**: Ambiente de execução JavaScript.
- **Binance API**: Integração com a API da Binance para operações de trading.
- **WebSocket**: Conexão em tempo real com o stream de preços da Binance.
- **Axios**: Requisições HTTP para buscar dados externos (Fear and Greed Index).
- **dotenv**: Gerenciamento de variáveis de ambiente.
- **Indicadores Técnicos**: Implementação manual de SAR e EMA.

---

## Como Configurar e Executar

### Pré-requisitos
- Node.js instalado (versão 16 ou superior).
- Conta na Binance com API Key e Secret Key geradas.
- Conhecimento básico de trading e criptomoedas.

### Passos para Configuração

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/elielmsilvatec/conect-binance-futures
   cd conect-binance-futures

### Instale as dependências:
   npm install

### Instale as dependências:
API_KEY=sua_api_key_aqui
SECRET_KEY=sua_secret_key_aqui
API_URL=https://testnet.binancefuture.com/fapi
STREAM_URL=wss://fstream.binance.com/ws/

/robo-trader-binance
│
├── /node_modules          # Dependências do projeto
├── /api                   # Integração com a API da Binance
├── index.js               # Arquivo principal do robô
├── .env                   # Variáveis de ambiente
├── package.json           # Dependências e scripts
└── README.md              # Este arquivo