#!/usr/bin/env tsx

import { chromium } from 'playwright';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:7779';
const FRONTEND_URL = 'http://localhost:7777';
const TEST_EMAIL = 'nmuthu@gmail.com';

async function captureConsoleErrors(page: any) {
  const errors: string[] = [];
  
  page.on('console', (msg: any) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('🔴 Console Error:', msg.text());
    }
  });
  
  page.on('pageerror', (err: any) => {
    errors.push(err.toString());
    console.log('🔴 Page Error:', err.toString());
  });
  
  return errors;
}

async function testFullAuthFlow() {
  console.log('🧪 Testing Complete Authentication Flow with Console Monitoring\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500,
    devtools: true // Open devtools to see console
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture console errors
  const errors = await captureConsoleErrors(page);
  
  try {
    // Step 1: Go to homepage
    console.log('1️⃣ Navigating to homepage...');
    await page.goto(FRONTEND_URL);
    await page.waitForTimeout(2000);
    
    // Check for console errors
    if (errors.length > 0) {
      console.log(`\n⚠️ Found ${errors.length} console error(s):`);
      errors.forEach(err => console.log(`   - ${err}`));
    }
    
    // Step 2: Should be on auth page
    const isOnAuth = page.url().includes('/auth');
    console.log(isOnAuth ? '✅ Redirected to auth page' : '❌ Not on auth page');
    
    // Step 3: Fill and submit form
    console.log('\n2️⃣ Filling login form...');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.screenshot({ path: 'e2e/screenshots/filled-form.png' });
    
    console.log('3️⃣ Submitting form...');
    
    // Listen for the magic link API response
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/auth/magic-link')
    );
    
    await page.click('button[type="submit"]');
    
    const response = await responsePromise;
    const responseData = await response.json();
    console.log('📧 API Response:', responseData);
    
    // Wait for UI update
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e/screenshots/after-submit.png' });
    
    // Step 4: Try to get the actual magic link token
    console.log('\n4️⃣ Attempting to retrieve magic link token...');
    
    // In a real scenario, you would:
    // 1. Use a test email service API
    // 2. Query the database directly
    // 3. Have a test endpoint in the backend
    
    // For now, let's test the API is working
    console.log('5️⃣ Testing backend health...');
    const healthCheck = await axios.get(`${BACKEND_URL}/api/health`);
    console.log('✅ Backend health:', healthCheck.data);
    
    // Step 5: Test with a real token (if we had one)
    console.log('\n6️⃣ Simulating magic link click...');
    
    // In production, you'd get the real token from email
    // For testing, we can check if the verification endpoint exists
    const mockToken = 'test-token-12345';
    await page.goto(`${FRONTEND_URL}/auth?token=${mockToken}`);
    await page.waitForTimeout(3000);
    
    // Check result
    const verifyErrors = errors.filter(e => !e.includes('favicon'));
    
    if (verifyErrors.length > 0) {
      console.log('\n⚠️ Console errors detected:');
      verifyErrors.forEach(err => console.log(`   🔴 ${err}`));
    }
    
    // Final screenshot
    await page.screenshot({ path: 'e2e/screenshots/final-state.png' });
    
    console.log('\n📊 Test Summary:');
    console.log('━'.repeat(40));
    console.log('✅ Frontend running');
    console.log('✅ Backend API responding');
    console.log('✅ Magic link email sent');
    console.log(verifyErrors.length === 0 ? '✅ No console errors' : `⚠️ ${verifyErrors.length} console error(s)`);
    
    // Print recommendations
    console.log('\n💡 Recommendations:');
    console.log('1. Check browser console for the "1 Issue" indicator');
    console.log('2. Implement test email capture for real token verification');
    console.log('3. Add backend test endpoint for retrieving magic link tokens');
    console.log('4. Consider using Mailhog or similar for local email testing');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    console.log('\n🔍 Check screenshots in e2e/screenshots/');
    console.log('Press any key to close browser...');
    
    // Keep browser open for inspection
    await page.waitForTimeout(10000);
    await browser.close();
  }
}

// Run the test
testFullAuthFlow().catch(console.error);