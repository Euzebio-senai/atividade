// server.js

// Importa o módulo Express, que é a base do nosso servidor web.
const express = require('express');

// Cria o nosso aplicativo (servidor).
const app = express();
const port = 3000;

// Permite que nosso servidor entenda os dados enviados de um formulário HTML.
app.use(express.urlencoded({ extended: true }));

// Rota inicial: Quando alguém acessa a página principal (http://localhost:3000),
// o servidor envia este HTML de volta.
app.get('/', (req, res) => {
    const htmlForm = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Calculadora de IMC Simples</title>
            <style>
                body { font-family: sans-serif; text-align: center; background-color: #f0f0f0; padding-top: 50px; }
                .container { max-width: 400px; margin: auto; padding: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                input { width: 100%; padding: 8px; margin: 5px 0; box-sizing: border-box; }
                button { background-color: #4CAF50; color: white; padding: 10px 15px; border: none; cursor: pointer; width: 100%; margin-top: 10px; }
                h1 { color: #333; }
                h2 { color: #555; margin-top: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Calcular seu IMC</h1>
                <form action="/calcular" method="POST">
                    <input type="text" name="nome" placeholder="Seu Nome" required>
                    <input type="number" name="altura" step="0.01" placeholder="Sua Altura (ex: 1.75)" required>
                    <input type="number" name="peso" step="0.01" placeholder="Seu Peso (ex: 70.5)" required>
                    <button type="submit">Calcular</button>
                </form>
            </div>
        </body>
        </html>
    `;
    res.send(htmlForm);
});

// Rota de cálculo: Quando o formulário é enviado, o servidor processa os dados aqui.
app.post('/calcular', (req, res) => {
    // Pega o nome, altura e peso do formulário.
    const { nome, altura, peso } = req.body;

    // Converte os valores para números decimais.
    const alturaFloat = parseFloat(altura);
    const pesoFloat = parseFloat(peso);
    
    let imc = 0;
    // Calcula o IMC, mas apenas se a altura for maior que zero para evitar erros.
    if (alturaFloat > 0) {
        imc = pesoFloat / (alturaFloat * alturaFloat);
    }

    let classificacao;
    // Classifica o IMC com base na sua imagem.
    if (imc < 16) {
        classificacao = 'Baixo peso (grau I)';
    } else if (imc >= 16 && imc <= 16.99) {
        classificacao = 'Baixo peso (grau II)';
    } else if (imc >= 17 && imc <= 18.49) {
        classificacao = 'Baixo peso (grau III)';
    } else if (imc >= 18.50 && imc <= 24.99) {
        classificacao = 'Peso adequado';
    } else if (imc >= 25 && imc <= 29.99) {
        classificacao = 'Sobrepeso';
    } else if (imc >= 30 && imc <= 34.99) {
        classificacao = 'Obesidade (grau I)';
    } else if (imc >= 35 && imc <= 39.99) {
        classificacao = 'Obesidade (grau II)';
    } else {
        classificacao = 'Obesidade (grau III)';
    }

    // Cria a página de resultado com os dados processados e a classificação.
    const resultadoHtml = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Resultado do IMC</title>
            <style>
                body { font-family: sans-serif; text-align: center; background-color: #f0f0f0; padding-top: 50px; }
                .container { max-width: 400px; margin: auto; padding: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                h1 { color: #333; }
                .back-btn { background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; margin-top: 20px; display: inline-block; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Resultado do IMC</h1>
                <p>Olá, <strong>${nome}</strong>!</p>
                <p>Seu IMC é: <strong>${imc.toFixed(2)}</strong></p>
                <p>Sua classificação é: <strong>${classificacao}</strong></p>
                <a href="/" class="back-btn">Calcular Novamente</a>
            </div>
        </body>
        </html>
    `;
    res.send(resultadoHtml);
});

// Faz o servidor começar a "ouvir" por requisições na porta 3000.
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
