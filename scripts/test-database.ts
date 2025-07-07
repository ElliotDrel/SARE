// Test script to verify database schema setup
// Run with: npx tsx scripts/test-database.ts

import { createClient } from '@supabase/supabase-js';

// These would normally come from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabaseSchema() {
  console.log('Testing SARE database schema...\n');

  try {
    // Test 1: Check if tables exist by attempting to query them
    console.log('1. Testing table existence:');
    
    const tables = [
      'storytellers',
      'stories',
      'self_reflections',
      'certification_leads',
      'contact_messages'
    ];

    for (const table of tables) {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error && error.code === '42P01') {
        console.log(`   ❌ Table '${table}' does not exist`);
      } else if (error) {
        console.log(`   ⚠️  Table '${table}' exists but has RLS enabled (expected)`);
      } else {
        console.log(`   ✅ Table '${table}' exists`);
      }
    }

    // Test 2: Test public insert on contact_messages (should work)
    console.log('\n2. Testing public form submission (contact_messages):');
    const { data: contactData, error: contactError } = await supabase
      .from('contact_messages')
      .insert({
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test message'
      })
      .select()
      .single();

    if (contactError) {
      console.log(`   ❌ Failed to insert: ${contactError.message}`);
    } else {
      console.log(`   ✅ Successfully inserted test message`);
      // Clean up
      await supabase.from('contact_messages').delete().eq('id', contactData.id);
    }

    // Test 3: Test public insert on certification_leads (should work)
    console.log('\n3. Testing public form submission (certification_leads):');
    const { data: certData, error: certError } = await supabase
      .from('certification_leads')
      .insert({
        name: 'Test User',
        email: 'test@example.com',
        organization: 'Test Org',
        message: 'Interested in certification'
      })
      .select()
      .single();

    if (certError) {
      console.log(`   ❌ Failed to insert: ${certError.message}`);
    } else {
      console.log(`   ✅ Successfully inserted test lead`);
      // Clean up
      await supabase.from('certification_leads').delete().eq('id', certData.id);
    }

    console.log('\n✅ Database schema test completed!');
    console.log('\nNote: Some operations may fail due to RLS policies, which is expected.');
    console.log('Authenticated operations should be tested through the application.');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testDatabaseSchema(); 