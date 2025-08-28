const { Client, LocalAuth } = require("whatsapp-web.js");
const { clienteJaContatadoHoje, registrarInteracao } = require("./database");
const qrcode = require("qrcode-terminal");
const express = require("express");
const fs = require("fs");

// Verificar se a pasta de sessão existe, se não, criá-la
const SESSION_DIR = './sessions';
if (!fs.existsSync(SESSION_DIR)){
    fs.mkdirSync(SESSION_DIR);
}

// Configuração do cliente WhatsApp
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: SESSION_DIR
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

// Variável para armazenar o QR Code
let qrData = "";

// Evento quando o cliente estiver pronto
client.on("ready", () => {
    console.log("Cliente WhatsApp está pronto!");
    qrData = "Cliente WhatsApp está pronto!"; // Atualiza a mensagem do QR Code
});

// Evento quando uma mensagem é recebida
client.on("message", async msg => {
    if (msg.from === "status@broadcast" || msg.fromMe) {
        return;
    }

    const telefone = msg.from;
    console.log(`Mensagem recebida de: ${telefone}`);
    
    const agora = new Date();
    const hora = agora.getHours();
    
    if (hora < 8 || hora >= 18) {
        try {
            await msg.reply("Nosso horário de atendimento é das 08h às 18h. Retornaremos sua mensagem no próximo período útil.");
            console.log(`Mensagem de fora de horário enviada para: ${telefone}`);
        } catch (error) {
            console.error(`Erro ao enviar mensagem de fora de horário para ${telefone}:`, error);
        }
        return;
    }
    
    try {
        const jaContatado = await clienteJaContatadoHoje(telefone);
        
        if (!jaContatado) {
            await msg.reply("Olá, seja bem-vindo à empresa X. Em alguns instantes iremos te atender.");
            console.log(`Mensagem de boas-vindas enviada para: ${telefone}`);
            await registrarInteracao(telefone);
            console.log(`Interação registrada para: ${telefone}`);
        } else {
            console.log(`Cliente ${telefone} já foi contatado hoje. Nenhuma mensagem automática enviada.`);
        }
    } catch (error) {
        console.error(`Erro ao processar mensagem de ${telefone}:`, error);
    }
});

// Evento para QR Code
client.on("qr", qr => {
    console.log("QR Code recebido, escaneie com seu WhatsApp:");
    qrcode.generate(qr, {small: true});
    qrData = qr; // Armazena o QR Code para exibição na web
});

// Evento para autenticação
client.on("authenticated", () => {
    console.log("Autenticação bem-sucedida!");
    qrData = "Autenticação bem-sucedida!"; // Atualiza a mensagem do QR Code
});

// Evento para erro de autenticação
client.on("auth_failure", msg => {
    console.error("Falha na autenticação:", msg);
    qrData = "Falha na autenticação!"; // Atualiza a mensagem do QR Code
});

// Evento para desconexão
client.on("disconnected", (reason) => {
    console.log("Cliente desconectado:", reason);
    qrData = "Cliente desconectado!"; // Atualiza a mensagem do QR Code
});

// Inicializar o cliente
client.initialize();

// Configuração do servidor web
const app = express();
const port = 3000;

// Rota para exibir o QR Code
app.get("/", (req, res) => {
    if (qrData === "Cliente WhatsApp está pronto!") {
        res.send("<h1>Cliente WhatsApp está pronto!</h1>");
    } else if (qrData === "Autenticação bem-sucedida!") {
        res.send("<h1>Autenticação bem-sucedida!</h1>");
    } else if (qrData === "Falha na autenticação!") {
        res.send("<h1>Falha na autenticação!</h1>");
    } else if (qrData === "Cliente desconectado!") {
        res.send("<h1>Cliente desconectado!</h1>");
    } else {
        const qrCodeImage = `https://quickchart.io/qr?text=${encodeURIComponent(qrData)}&size=300`;
        res.send(`
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
                <h1>Escaneie o QR Code abaixo com seu WhatsApp:</h1>
                <img src="${qrCodeImage}" alt="QR Code" />
            </div>
        `);
    }
});

// Iniciar o servidor web
app.listen(port, () => {
    console.log(`Servidor web iniciado em http://localhost:${port}`);
});
