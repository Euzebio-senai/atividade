// ===== ROTAS ADICIONAIS DE API =====

// Rota para histórico de cálculos (simulada)
app.get('/api/historico', (req, res) => {
    // Em produção, isso viria de um banco de dados
    const historico = [
        { data: '2025-01-15', imc: 22.5, categoria: 'Peso adequado' },
        { data: '2025-01-10', imc: 23.1, categoria: 'Peso adequado' },
        { data: '2025-01-05', imc: 23.8, categoria: 'Peso adequado' }
    ];
    
    res.json({
        historico: historico,
        sucesso: true
    });
});

// Rota para estatísticas da aplicação
app.get('/api/stats', (req, res) => {
    res.json({
        totalCalculos: requestCounts.size * 10, // Simulado
        usuariosAtivos: requestCounts.size,
        mediaIMC: 24.2,
        categoriasMaisComuns: [
            { categoria: 'Peso adequado', porcentagem: 45 },
            { categoria: 'Sobrepeso', porcentagem: 30 },
            { categoria: 'Obesidade (grau I)', porcentagem: 15 },
            { categoria: 'Baixo peso (grau III)', porcentagem: 10 }
        ],
        sucesso: true
    });
});

// Rota para informações de saúde
app.get('/api/dicas', (req, res) => {
    const dicas = [
        {
            titulo: 'Alimentação Saudável',
            descricao: 'Consuma frutas, verduras e proteínas magras diariamente',
            categoria: 'nutricao'
        },
        {
            titulo: 'Exercícios Regulares', 
            descricao: 'Pratique pelo menos 150 minutos de atividade física por semana',
            categoria: 'exercicio'
        },
        {
            titulo: 'Hidratação',
            descricao: 'Beba pelo menos 2 litros de água por dia',
            categoria: 'hidratacao'
        },
        {
            titulo: 'Sono de Qualidade',
            descricao: 'Durma de 7 a 9 horas por noite para um bom metabolismo',
            categoria: 'sono'
        }
    ];
    
    res.json({
        dicas// Importar as dependências necessárias
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');

// Criar instância do Express
const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARES DE SEGURANÇA E PERFORMANCE =====
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https:", "data:"],
            connectSrc: ["'self'"],
            manifestSrc: ["'self'"]
        }
    }
}));

app.use(compression()); // Compressão gzip
app.use(express.json({ limit: '1mb' })); // Limite de payload
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Cache headers para recursos estáticos
app.use('/styles.css', (req, res, next) => {
    res.set('Cache-Control', 'public, max-age=86400'); // 24 horas
    next();
});

app.use('/sw.js', (req, res, next) => {
    res.set('Cache-Control', 'no-cache'); // Service worker sem cache
    next();
});

app.use(express.static('public', {
    maxAge: '1d', // Cache de 1 dia para arquivos estáticos
    etag: true
}));

// ===== FUNÇÃO AVANÇADA DE CÁLCULO DE IMC =====
function calcularIMC(peso, altura) {
    const imc = peso / (altura * altura);
    let categoria = '';
    let recomendacao = '';
    let cor = '';
    
    if (imc < 16) {
        categoria = 'Baixo peso (grau I)';
        recomendacao = 'Consulte um médico urgentemente';
        cor = '#ff4444';
    } else if (imc >= 16 && imc <= 16.99) {
        categoria = 'Baixo peso (grau II)';
        recomendacao = 'Busque orientação médica';
        cor = '#ff8844';
    } else if (imc >= 17 && imc <= 18.49) {
        categoria = 'Baixo peso (grau III)';
        recomendacao = 'Considere aumentar o peso com acompanhamento';
        cor = '#ffcc44';
    } else if (imc >= 18.50 && imc <= 24.99) {
        categoria = 'Peso adequado';
        recomendacao = 'Mantenha hábitos saudáveis';
        cor = '#44ff44';
    } else if (imc >= 25 && imc <= 29.99) {
        categoria = 'Sobrepeso';
        recomendacao = 'Considere exercícios e dieta balanceada';
        cor = '#ffaa44';
    } else if (imc >= 30 && imc <= 34.99) {
        categoria = 'Obesidade (grau I)';
        recomendacao = 'Busque acompanhamento médico';
        cor = '#ff7744';
    } else if (imc >= 35 && imc <= 39.99) {
        categoria = 'Obesidade (grau II)';
        recomendacao = 'Acompanhamento médico é importante';
        cor = '#ff5544';
    } else if (imc >= 40) {
        categoria = 'Obesidade (grau III)';
        recomendacao = 'Consulte um médico urgentemente';
        cor = '#ff3333';
    }
    
    return {
        valor: parseFloat(imc.toFixed(2)),
        categoria: categoria,
        recomendacao: recomendacao,
        cor: cor
    };
}

// ===== MIDDLEWARES DE LOGGING E ANÁLISE =====
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${req.ip}`);
    next();
});

// Rate limiting simples
const requestCounts = new Map();
const RATE_LIMIT = 100; // requests por IP por hora
const RATE_WINDOW = 60 * 60 * 1000; // 1 hora

app.use((req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    
    if (!requestCounts.has(ip)) {
        requestCounts.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    } else {
        const data = requestCounts.get(ip);
        if (now > data.resetTime) {
            data.count = 1;
            data.resetTime = now + RATE_WINDOW;
        } else {
            data.count++;
        }
        
        if (data.count > RATE_LIMIT) {
            return res.status(429).json({
                erro: 'Muitas requisições. Tente novamente em uma hora.',
                resetTime: new Date(data.resetTime).toISOString()
            });
        }
    }
    next();
});

// ===== ROTAS PRINCIPAIS =====
// Rota para carregar a página HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para o manifest PWA
app.get('/manifest.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
});

// Rota para o service worker
app.get('/sw.js', (req, res) => {
    res.setHeader('Service-Worker-Allowed', '/');
    res.sendFile(path.join(__dirname, 'public', 'sw.js'));
});

// Rota para processar os dados do formulário com validações avançadas
app.post('/calcular-imc', (req, res) => {
    try {
        // Extrair dados do corpo da requisição
        const { nome, altura, peso } = req.body;
        
        // Validações de entrada
        const errors = [];
        
        if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
            errors.push('Nome é obrigatório');
        } else if (nome.trim().length > 100) {
            errors.push('Nome deve ter no máximo 100 caracteres');
        }
        
        if (!altura) {
            errors.push('Altura é obrigatória');
        }
        
        if (!peso) {
            errors.push('Peso é obrigatório');
        }
        
        if (errors.length > 0) {
            return res.status(400).json({
                erro: errors.join(', '),
                sucesso: false
            });
        }
        
        // Converter e validar números
        const alturaNum = parseFloat(altura);
        const pesoNum = parseFloat(peso);
        
        if (isNaN(alturaNum) || alturaNum <= 0 || alturaNum > 3) {
            return res.status(400).json({
                erro: 'Altura deve ser um número entre 0.5 e 3 metros',
                sucesso: false
            });
        }
        
        if (isNaN(pesoNum) || pesoNum <= 0 || pesoNum > 1000) {
            return res.status(400).json({
                erro: 'Peso deve ser um número entre 1 e 1000 kg',
                sucesso: false
            });
        }
        
        // Calcular IMC com informações extras
        const resultado = calcularIMC(pesoNum, alturaNum);
        
        // Calcular peso ideal aproximado
        const pesoIdealMin = 18.5 * (alturaNum * alturaNum);
        const pesoIdealMax = 24.9 * (alturaNum * alturaNum);
        
        // Log da operação (sem dados pessoais)
        console.log(`Cálculo IMC realizado: IMC=${resultado.valor}, Categoria=${resultado.categoria}`);
        
        // Retornar resultado completo
        res.json({
            nome: nome.trim(),
            altura: alturaNum,
            peso: pesoNum,
            imc: resultado.valor,
            classificacao: resultado.categoria,
            recomendacao: resultado.recomendacao,
            cor: resultado.cor,
            pesoIdeal: {
                min: parseFloat(pesoIdealMin.toFixed(1)),
                max: parseFloat(pesoIdealMax.toFixed(1))
            },
            sucesso: true,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Erro ao processar cálculo IMC:', error);
        res.status(500).json({
            erro: 'Erro interno do servidor',
            sucesso: false
        });
    }
});

// Rota para obter a tabela de classificação IMC
app.get('/tabela-imc', (req, res) => {
    const tabelaIMC = [
        { faixa: 'Menos de 16', categoria: 'Baixo peso (grau I)' },
        { faixa: 'Entre 16 e 16,99', categoria: 'Baixo peso (grau II)' },
        { faixa: 'Entre 17 e 18,49', categoria: 'Baixo peso (grau III)' },
        { faixa: 'Entre 18,50 e 24,99', categoria: 'Peso adequado' },
        { faixa: 'Entre 25 e 29,99', categoria: 'Sobrepeso' },
        { faixa: 'Entre 30 e 34,99', categoria: 'Obesidade (grau I)' },
        { faixa: 'Entre 35 e 39,99', categoria: 'Obesidade (grau II)' },
        { faixa: 'A partir de 40', categoria: 'Obesidade (grau III)' }
    ];
    
    res.json(tabelaIMC);
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Acesse a aplicação no navegador!`);
});