const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Carregar .env se existir localmente para desenvolvimento privado
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    process.env[key.trim()] = valueParts.join('=').trim();
                }
            }
        });
        console.log('[Lumi Backend] Arquivo .env carregado localmente.');
    } catch (err) {
        console.error('[Lumi Backend] Falha ao carregar .env:', err);
    }
}

// Inicializar Stripe com chave do ambiente (Render) ou .env local
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'rk_test_placeholder');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do Lumi
app.use(express.static(path.join(__dirname)));

// Endpoint do Checkout Seguro do Stripe
app.post('/api/checkout', async (req, res) => {
    try {
        console.log('[Lumi Backend] Iniciando sessão do Stripe Checkout...');
        
        // Criar uma sessão de assinatura de R$ 47/mês dinamicamente com a chave restrita live do Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: 'Lumi Premium — Gestão de Salão & Estúdio',
                            description: 'Acesso total e ilimitado à plataforma Lumi: Agenda, Controle de Clientes, Fluxo de Caixa, Estoque e Mensagens Automatizadas.',
                            images: ['https://raw.githubusercontent.com/JhoniLot/estetica-1.0/main/logo.png'],
                        },
                        unit_amount: 4700, // R$ 47.00
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${req.headers.origin || 'http://localhost:3000'}/app.html?payment=success`,
            cancel_url: `${req.headers.origin || 'http://localhost:3000'}/index.html#pricing`,
        });

        console.log('[Lumi Backend] Sessão Stripe Checkout criada com sucesso! URL:', session.url);
        res.json({ url: session.url });
    } catch (error) {
        console.error('[Lumi Backend] Erro ao processar Stripe Checkout:', error);
        res.status(500).json({ error: error.message });
    }
});

// Fallback para index.html nas rotas desconhecidas
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`💎  Lumi SaaS — Servidor de Produção Ativo  💎`);
    console.log(`🚀  Acesse localmente em: http://localhost:${PORT}`);
    console.log(`🔒  Checkout Stripe configurado com chave restrita.`);
    console.log(`======================================================\n`);
});
