exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const response = await fetch('https://api.replicate.com/v1/account', {
            headers: {
                'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
            }
        });
        const data = await response.json();
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                status: response.ok ? 'ok' : 'error',
                timestamp: new Date().toISOString(),
                replicateAuth: response.ok,
                account: response.ok ? data : null,
                error: !response.ok ? data.detail : null
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                status: 'error',
                timestamp: new Date().toISOString(),
                error: error.message
            })
        };
    }
};
