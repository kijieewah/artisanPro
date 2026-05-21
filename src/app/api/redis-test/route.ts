// app/api/test-redis/route.ts
import { NextResponse } from "next/server";
import { getRedisClient } from "~/lib/redis";

export async function GET() {
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
    
    return NextResponse.json({
      success: true,
      message: 'Redis Cloud connection test passed!',
      testValue: value,
      ping: pingResult
    });
    
  } catch (error) {
    console.error('❌ Redis Cloud connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}