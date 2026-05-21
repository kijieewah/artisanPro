// scripts/test-redis.js
const { getRedisClient } = require('./redis');

async function testRedisConnection() {
  try {
    console.log('🧪 Testing Redis Cloud connection...');
    
    const client = await getRedisClient();
    
    // Test SET
    await client.set('test_key', 'Hello Redis Cloud!');
    console.log('✅ SET operation successful');
    
    // Test GET
    const value = await client.get('test_key');
    console.log('✅ GET operation successful:', value);
    
    // Test connection with PING
    const pingResult = await client.ping();
    console.log('✅ PING successful:', pingResult);
    
    console.log('🎉 Redis Cloud connection test passed!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Redis Cloud connection test failed:', error);
    process.exit(1);
  }
}

testRedisConnection();