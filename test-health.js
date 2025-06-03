// Simple health check test
import fetch from 'node-fetch';

async function testHealth() {
    try {
        console.log('🔍 Testing health endpoint...');
        const response = await fetch('http://localhost:3002/api/health');
        const data = await response.json();
        
        if (response.ok && data.status === 'ok') {
            console.log('✅ Health check passed');
            console.log('✅ Replicate API authentication:', data.replicateAuth ? 'SUCCESS' : 'FAILED');
            console.log('📊 Account:', data.account?.username || 'Unknown');
        } else {
            console.log('❌ Health check failed:', data.error);
        }
    } catch (error) {
        console.log('❌ Connection failed:', error.message);
        console.log('💡 Make sure the server is running: npm start');
    }
}

testHealth();
