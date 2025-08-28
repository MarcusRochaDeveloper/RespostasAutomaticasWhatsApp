# Sistema de Resposta Automática WhatsApp

Este projeto implementa um sistema de resposta automática para WhatsApp usando a biblioteca `whatsapp-web.js`.

## Funcionalidades

- Responde automaticamente a mensagens recebidas no WhatsApp.
- Envia uma mensagem de boas-vindas na primeira mensagem do dia de cada cliente.
- Informa aos clientes quando estão fora do horário de atendimento.
- Mantém sessão ativa para evitar escanear o QR Code toda vez.

## Regras de Negócio

### Mensagem de Boas-Vindas
- Na primeira mensagem do dia de cada cliente, o sistema responde:
  > "Olá, seja bem-vindo à empresa X. Em alguns instantes iremos te atender."
- Esta mensagem só é enviada uma vez por cliente por dia.

### Mensagem Fora do Horário
- Horário de atendimento: 08h–18h.
- Se o cliente enviar mensagem fora do horário, o sistema responde:
  > "Nosso horário de atendimento é das 08h às 18h. Retornaremos sua mensagem no próximo período útil."
- Esta mensagem é disparada sempre que o cliente escrever fora do horário.

### Mensagens Subsequentes no Mesmo Dia (Dentro do Horário)
- Não disparam novas respostas automáticas.

## Tecnologias Utilizadas

- Node.js
- whatsapp-web.js
- SQLite

## Como Configurar e Executar

### Pré-requisitos

- Node.js instalado em sua máquina.
- Um smartphone com WhatsApp instalado e conectado à internet.

### Passos

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd RespostasAutomaticasWhatsapp
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Execute o projeto:**
   ```bash
   npm start
   ```
   ou, para desenvolvimento com reinicialização automática:
   ```bash
   npm run dev
   ```

4. **Escaneie o QR Code:**
   - Ao executar o projeto, um QR Code será exibido no terminal.
   - Alternativamente, você pode acessar `http://localhost:3000` em seu navegador para ver o QR Code.
   - Abra o WhatsApp no seu smartphone.
   - Vá em "Configurações" > "WhatsApp Web".
   - Use a função de escanear QR Code do WhatsApp para escanear o QR Code exibido no terminal ou no navegador.

5. **Pronto!**
   - O sistema estará ativo e pronto para responder automaticamente às mensagens recebidas.

## Estrutura do Projeto

- `index.js`: Arquivo principal que contém a lógica do bot.
- `database.js`: Gerencia a conexão com o banco de dados SQLite e operações relacionadas aos clientes.
- `package.json`: Arquivo de configuração do projeto Node.js.
- `README.md`: Este arquivo com instruções.
- `.gitignore`: Arquivo para ignorar diretórios/arquivos no Git.
- `sessions/`: Diretório onde as sessões do WhatsApp Web são armazenadas.
- `clientes.db`: Arquivo do banco de dados SQLite.

## Observações Técnicas

- A sessão é mantida no disco via `LocalAuth`, evitando necessidade de escanear QR Code toda vez.
- O banco de dados SQLite é usado para registrar a data da última interação de cada cliente.
- Esta solução não é oficial e depende do WhatsApp Web, podendo sofrer instabilidades ou bloqueio se usada em larga escala.
