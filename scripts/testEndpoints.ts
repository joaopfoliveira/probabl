#!/usr/bin/env tsx

/**
 * Test script for the new betting tips API endpoints
 * 
 * Usage:
 *   npx tsx scripts/testEndpoints.ts
 * 
 * Make sure your development server is running on http://localhost:3000
 */

const BASE_URL = 'http://localhost:3000';

// Sample daily tips data
const sampleTipsData = {
  version: 2,
  dateISO: '2025-09-02',
  generatedAt: new Date().toISOString(),
  generatedBy: 'test-script',
  tips: [
    {
      id: 'test-tip-001',
      betType: 'single',
      risk: 'safe',
      legs: [
        {
          sport: 'football',
          league: 'Premier League',
          event: { 
            name: 'Arsenal vs Chelsea',
            home: 'Arsenal', 
            away: 'Chelsea' 
          },
          market: 'Match Result',
          selection: 'Arsenal Win',
          avgOdds: 2.10,
          bookmakers: [
            { name: 'Bet365', odds: 2.10 },
            { name: 'Betfair', odds: 2.05 },
            { name: 'William Hill', odds: 2.15 }
          ]
        }
      ],
      rationale: 'Arsenal has strong home form and Chelsea is missing key players. This looks like a solid bet.',
      result: 'pending'
    },
    {
      id: 'test-tip-002',
      betType: 'accumulator',
      risk: 'medium',
      legs: [
        {
          sport: 'football',
          league: 'La Liga',
          event: { 
            name: 'Barcelona vs Real Madrid',
            home: 'Barcelona', 
            away: 'Real Madrid' 
          },
          market: 'Both Teams To Score',
          selection: 'Yes',
          avgOdds: 1.75,
          bookmakers: [
            { name: 'Bet365', odds: 1.75 },
            { name: 'Betfair', odds: 1.73 }
          ]
        },
        {
          sport: 'football',
          league: 'Bundesliga',
          event: { 
            name: 'Bayern vs Dortmund',
            home: 'Bayern Munich', 
            away: 'Borussia Dortmund' 
          },
          market: 'Over/Under 2.5 Goals',
          selection: 'Over 2.5',
          avgOdds: 1.60,
          bookmakers: [
            { name: 'Bet365', odds: 1.60 },
            { name: 'William Hill', odds: 1.58 }
          ]
        }
      ],
      combined: {
        avgOdds: 2.80,
        bookmakers: [
          { name: 'Bet365', odds: 2.80 },
          { name: 'Betfair', odds: 2.75 }
        ]
      },
      rationale: 'Classic El Clasico should see goals from both sides, while Bayern vs Dortmund is always high-scoring.',
      result: 'pending'
    }
  ]
};

async function testCreateTipsEndpoint() {
  console.log('🧪 Testing POST /api/tips/create...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/tips/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sampleTipsData),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Create endpoint test passed!');
      console.log('📄 Response:', JSON.stringify(result, null, 2));
      return true;
    } else {
      console.log('❌ Create endpoint test failed!');
      console.log('📄 Error:', JSON.stringify(result, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ Create endpoint test failed with error:', error);
    return false;
  }
}

async function testUpdateResultEndpoint() {
  console.log('\n🧪 Testing POST /api/tips/update-result...');
  
  // Test updating the first tip to "won"
  try {
    const updateData = {
      tipId: 'test-tip-001',
      result: 'won' as const,
      date: '2025-09-02' // Use the date we just created
    };
    
    const response = await fetch(`${BASE_URL}/api/tips/update-result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Update result endpoint test passed!');
      console.log('📄 Response:', JSON.stringify(result, null, 2));
      
      // Test updating second tip to "loss" (without specifying date)
      console.log('\n🧪 Testing update without date parameter...');
      
      const updateData2 = {
        tipId: 'test-tip-002',
        result: 'loss' as const
      };
      
      const response2 = await fetch(`${BASE_URL}/api/tips/update-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData2),
      });
      
      const result2 = await response2.json();
      
      if (response2.ok) {
        console.log('✅ Update without date test passed!');
        console.log('📄 Response:', JSON.stringify(result2, null, 2));
        return true;
      } else {
        console.log('❌ Update without date test failed!');
        console.log('📄 Error:', JSON.stringify(result2, null, 2));
        return false;
      }
    } else {
      console.log('❌ Update result endpoint test failed!');
      console.log('📄 Error:', JSON.stringify(result, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ Update result endpoint test failed with error:', error);
    return false;
  }
}

async function testGetDocumentation() {
  console.log('\n📚 Testing GET endpoints documentation...');
  
  try {
    const [createDoc, updateDoc] = await Promise.all([
      fetch(`${BASE_URL}/api/tips/create`),
      fetch(`${BASE_URL}/api/tips/update-result`)
    ]);
    
    const createDocResult = await createDoc.json();
    const updateDocResult = await updateDoc.json();
    
    console.log('✅ Documentation endpoints working!');
    console.log('📖 Create endpoint docs available at: GET /api/tips/create');
    console.log('📖 Update endpoint docs available at: GET /api/tips/update-result');
    
    return true;
  } catch (error) {
    console.log('❌ Documentation endpoints failed:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting API Endpoints Test Suite\n');
  console.log(`🌐 Testing against: ${BASE_URL}`);
  console.log('⚠️  Make sure your development server is running!\n');
  
  const results = [];
  
  // Test documentation endpoints
  results.push(await testGetDocumentation());
  
  // Test create endpoint
  results.push(await testCreateTipsEndpoint());
  
  // Test update result endpoint (only if create succeeded)
  if (results[results.length - 1]) {
    results.push(await testUpdateResultEndpoint());
  } else {
    console.log('⏭️  Skipping update test because create test failed');
  }
  
  // Summary
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Your endpoints are ready to use.');
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.');
  }
  
  console.log('\n💡 Tips for using the endpoints:');
  console.log('   - Use POST /api/tips/create to add new daily tips');
  console.log('   - Use POST /api/tips/update-result to change tip results');
  console.log('   - Check the created file: data/daily/2025-09-02.json');
  console.log('   - Visit your app to see the updated data in the UI');
}

// Run the tests
main().catch(console.error);
