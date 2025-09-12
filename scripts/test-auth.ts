#!/usr/bin/env tsx

import axios from 'axios';
import { chromium } from 'playwright';

const BACKEND_URL = 'http://localhost:7779';
const FRONTEND_URL = 'http://localhost:7777';
const TEST_EMAIL = 'nmuthu@gmail.com';

async function interceptMagicLink(): Promise<string | null> {
  return new Promise((resolve) => {
    let intercepted = false;
    
    // Create an axios interceptor to capture the magic link
    const interceptor = axios.interceptors.request.use((config) => {
      if (config.url?.includes('/api/auth/magic-link') && !intercepted) {
        intercepted = true;
        // Wait a bit then check for the token in backend
        setTimeout(async () => {
          try {
            // In a real scenario, we'd intercept the email or database
            // For now, we'll simulate getting the token
            console.log('📧 Magic link would be sent to:', TEST_EMAIL);
            resolve('simulated-token');
          } catch (err) {
            resolve(null);
          }
        }, 1000);
      }
      return config;
    });
    
    // Clean up after timeout
    setTimeout(() => {
      axios.interceptors.request.eject(interceptor);
      if (!intercepted) resolve(null);
    }, 10000);
  });
}

async function testAuthFlow() {
  console.log('🚀 Starting automated authentication test...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Slow down for visibility
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Step 1: Navigate to app
    console.log('1️⃣ Navigating to app...');
    await page.goto(FRONTEND_URL);
    await page.waitForTimeout(1000);
    
    // Step 2: Should redirect to auth
    const url = page.url();
    if (url.includes('/auth')) {
      console.log('✅ Redirected to auth page');
    } else {
      console.log('❌ Did not redirect to auth page');
    }
    
    // Step 3: Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/1-login-page.png', fullPage: true });
    console.log('📸 Screenshot saved: 1-login-page.png');
    
    // Step 4: Fill email
    console.log(`2️⃣ Filling email: ${TEST_EMAIL}`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.screenshot({ path: 'e2e/screenshots/2-email-filled.png', fullPage: true });
    
    // Step 5: Click send magic link
    console.log('3️⃣ Clicking "Send Magic Link"...');
    
    // Set up request interception to capture the API call
    page.on('response', async (response) => {
      if (response.url().includes('/api/auth/magic-link')) {
        const body = await response.json().catch(() => null);
        console.log('📬 Magic link API response:', body);
      }
    });
    
    await page.click('button[type="submit"]');
    
    // Step 6: Wait for confirmation
    try {
      await page.waitForSelector('text=/Check your email|sent/i', { timeout: 5000 });
      console.log('✅ Email sent confirmation shown');
      await page.screenshot({ path: 'e2e/screenshots/3-email-sent.png', fullPage: true });
    } catch (err) {
      console.log('⚠️ Email confirmation not shown, checking for error...');
      const errorElement = await page.$('text=/Failed|Error/i');
      if (errorElement) {
        const errorText = await errorElement.textContent();
        console.log('❌ Error:', errorText);
        await page.screenshot({ path: 'e2e/screenshots/3-error.png', fullPage: true });
      }
    }
    
    // Step 7: Test API directly
    console.log('\n4️⃣ Testing API directly...');
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/magic-link`, {
        email: TEST_EMAIL,
        isSignup: false
      });
      console.log('✅ Direct API call successful:', response.data);
    } catch (err: any) {
      console.log('❌ Direct API call failed:', err.response?.data || err.message);
    }
    
    // Step 8: Test verification with mock token
    console.log('\n5️⃣ Testing verification flow...');
    const mockToken = 'test-token-123';
    await page.goto(`${FRONTEND_URL}/auth?token=${mockToken}`);
    await page.waitForTimeout(2000);
    
    // Check result
    const verifyUrl = page.url();
    if (verifyUrl === FRONTEND_URL + '/') {
      console.log('✅ Successfully redirected to home after verification');
    } else {
      console.log('⚠️ Verification did not redirect (expected with mock token)');
    }
    
    await page.screenshot({ path: 'e2e/screenshots/4-after-verify.png', fullPage: true });
    
    // Step 9: Test with localStorage auth
    console.log('\n6️⃣ Testing with mock authentication...');
    await page.evaluate(() => {
      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiry: new Date(Date.now() + 3600000).toISOString()
      };
      const mockUser = {
        id: '1',
        email: 'nmuthu@gmail.com',
        name: 'Test User'
      };
      localStorage.setItem('auth_tokens', JSON.stringify(mockTokens));
      localStorage.setItem('user', JSON.stringify(mockUser));
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Check if we're on the main page now
    const finalUrl = page.url();
    if (!finalUrl.includes('/auth')) {
      console.log('✅ Mock auth successful - on main page');
      await page.screenshot({ path: 'e2e/screenshots/5-logged-in.png', fullPage: true });
      
      // Check for user menu
      const userButton = await page.$('button:has-text("nmuthu")');
      if (userButton) {
        console.log('✅ User menu visible');
        await userButton.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'e2e/screenshots/6-user-menu.png', fullPage: true });
      }
    } else {
      console.log('⚠️ Still on auth page after mock login');
    }
    
    console.log('\n✨ Test completed! Check e2e/screenshots/ for visual results.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testAuthFlow().catch(console.error);