const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Load .env if it exists locally for private development
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
        console.log('[Lumi Backend] Local .env file loaded successfully.');
    } catch (err) {
        console.error('[Lumi Backend] Failed to load .env:', err);
    }
}

// Initialize Stripe with key from environment (Render) or local .env
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'rk_test_placeholder');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Secure Stripe Checkout Endpoint
app.post('/api/checkout', async (req, res) => {
    try {
        console.log('[Lumi Backend] Creating Stripe Checkout session...');
        
        // Create a $19/month subscription session using the live restricted Stripe key
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: 'price_1Th9qyIIpPpxceA7z0ucGZOT',
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${req.headers.origin || 'http://localhost:3000'}/app.html?payment=success`,
            cancel_url: `${req.headers.origin || 'http://localhost:3000'}/index.html#pricing`,
        });

        console.log('[Lumi Backend] Stripe Checkout session created! URL:', session.url);
        res.json({ url: session.url });
    } catch (error) {
        console.error('[Lumi Backend] Error processing Stripe Checkout:', error);
        res.status(500).json({ error: error.message });
    }
});

// Fallback to index.html for unknown routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`💎  Lumi SaaS — Production Server Active  💎`);
    console.log(`🚀  Running locally at: http://localhost:${PORT}`);
    console.log(`🔒  Stripe Checkout configured with restricted live key (USD $19/month).`);
    console.log(`======================================================\n`);
});
