module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const response = await fetch('https://api.replicate.com/v1/account', {
            headers: {
                'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
            }
        });
        const data = await response.json();
        
        res.json({ 
            status: response.ok ? 'ok' : 'error',
            timestamp: new Date().toISOString(),
            replicateAuth: response.ok,
            account: response.ok ? data : null,
            error: !response.ok ? data.detail : null
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
}
