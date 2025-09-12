#!/usr/bin/env tsx

import { chromium, Page } from 'playwright';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execAsync = promisify(exec);

const BACKEND_URL = 'http://localhost:7779';
const FRONTEND_URL = 'http://localhost:7777';
const TEST_EMAIL = 'nmuthu@gmail.com';

interface TestResult {
  step: string;
  success: boolean;
  message: string;
  screenshot?: string;
}

class AuthTester {
  private results: TestResult[] = [];
  
  async run() {
    console.log('🚀 Advanced Authentication Testing Framework\n');
    console.log('━'.repeat(50));
    
    const browser = await chromium.launch({ 
      headless: false,
      slowMo: 300 
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      // Test 1: Initial Navigation
      await this.testInitialNavigation(page);
      
      // Test 2: Login Form
      await this.testLoginForm(page);
      
      // Test 3: Magic Link Send
      await this.testMagicLinkSend(page);
      
      // Test 4: Direct Backend Test
      await this.testBackendDirectly();
      
      // Test 5: Mock Authentication
      await this.testMockAuth(page);
      
      // Print results
      this.printResults();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    } finally {
      await browser.close();
    }
  }
  
  private async testInitialNavigation(page: Page) {
    console.log('\n📍 Test 1: Initial Navigation');
    
    await page.goto(FRONTEND_URL);
    await page.waitForLoadState('networkidle');
    
    const url = page.url();
    const redirected = url.includes('/auth');
    
    await page.screenshot({ 
      path: 'e2e/screenshots/test1-initial.png', 
      fullPage: true 
    });
    
    this.results.push({
      step: 'Initial Navigation',
      success: redirected,
      message: redirected ? 'Correctly redirected to /auth' : 'Did not redirect to auth',
      screenshot: 'test1-initial.png'
    });
    
    console.log(redirected ? '  ✅ Redirected to auth' : '  ❌ No redirect');
  }
  
  private async testLoginForm(page: Page) {
    console.log('\n📍 Test 2: Login Form Interaction');
    
    // Check form elements
    const emailInput = await page.$('input[type="email"]');
    const submitButton = await page.$('button[type="submit"]');
    
    if (emailInput && submitButton) {
      await emailInput.fill(TEST_EMAIL);
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: 'e2e/screenshots/test2-form-filled.png', 
        fullPage: true 
      });
      
      this.results.push({
        step: 'Login Form',
        success: true,
        message: 'Form elements found and filled',
        screenshot: 'test2-form-filled.png'
      });
      
      console.log('  ✅ Form filled successfully');
    } else {
      this.results.push({
        step: 'Login Form',
        success: false,
        message: 'Form elements not found',
      });
      console.log('  ❌ Form elements missing');
    }
  }
  
  private async testMagicLinkSend(page: Page) {
    console.log('\n📍 Test 3: Magic Link Send');
    
    // Set up response listener
    let apiSuccess = false;
    let apiMessage = '';
    
    page.once('response', async (response) => {
      if (response.url().includes('/api/auth/magic-link')) {
        apiSuccess = response.ok();
        try {
          const data = await response.json();
          apiMessage = data.message || data.error || '';
        } catch {}
      }
    });
    
    // Click submit
    await page.click('button[type="submit"]');
    
    // Wait for response
    await page.waitForTimeout(2000);
    
    // Check for success/error message
    const successMsg = await page.$('text=/sent|success/i');
    const errorMsg = await page.$('text=/error|failed/i');
    
    await page.screenshot({ 
      path: 'e2e/screenshots/test3-after-submit.png', 
      fullPage: true 
    });
    
    const success = !!successMsg && apiSuccess;
    
    this.results.push({
      step: 'Magic Link Send',
      success,
      message: success ? `Email sent: ${apiMessage}` : `Failed: ${apiMessage}`,
      screenshot: 'test3-after-submit.png'
    });
    
    console.log(success ? '  ✅ Magic link sent' : '  ❌ Send failed');
    if (apiMessage) console.log(`  📧 ${apiMessage}`);
  }
  
  private async testBackendDirectly() {
    console.log('\n📍 Test 4: Direct Backend API Test');
    
    try {
      const { stdout } = await execAsync(`
        curl -X POST ${BACKEND_URL}/api/auth/magic-link \\
          -H "Content-Type: application/json" \\
          -d '{"email":"${TEST_EMAIL}","isSignup":false}' \\
          -s
      `);
      
      const response = JSON.parse(stdout);
      const success = !!response.message && !response.error;
      
      this.results.push({
        step: 'Backend API',
        success,
        message: response.message || response.error || 'Unknown response'
      });
      
      console.log(success ? '  ✅ Backend API working' : '  ❌ Backend API failed');
      
      // Try to get the token from backend logs or database
      // This would require backend modification to expose test endpoints
      
    } catch (error: any) {
      this.results.push({
        step: 'Backend API',
        success: false,
        message: error.message
      });
      console.log('  ❌ Backend test failed:', error.message);
    }
  }
  
  private async testMockAuth(page: Page) {
    console.log('\n📍 Test 5: Mock Authentication');
    
    // Inject mock auth
    await page.evaluate(() => {
      localStorage.setItem('auth_tokens', JSON.stringify({
        accessToken: 'test-token',
        refreshToken: 'test-refresh',
        expiry: new Date(Date.now() + 3600000).toISOString()
      }));
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        email: 'nmuthu@gmail.com',
        name: 'Test User'
      }));
    });
    
    await page.goto(FRONTEND_URL);
    await page.waitForLoadState('networkidle');
    
    const onMainPage = !page.url().includes('/auth');
    
    if (onMainPage) {
      // Look for user menu
      const userButton = await page.$('button:has-text("nmuthu")');
      
      if (userButton) {
        await userButton.click();
        await page.waitForTimeout(500);
        
        await page.screenshot({ 
          path: 'e2e/screenshots/test5-user-menu.png', 
          fullPage: true 
        });
        
        this.results.push({
          step: 'Mock Auth',
          success: true,
          message: 'Successfully logged in with mock auth',
          screenshot: 'test5-user-menu.png'
        });
        
        console.log('  ✅ Mock auth successful');
      } else {
        this.results.push({
          step: 'Mock Auth',
          success: false,
          message: 'Logged in but user menu not found'
        });
        console.log('  ⚠️ User menu not visible');
      }
    } else {
      this.results.push({
        step: 'Mock Auth',
        success: false,
        message: 'Mock auth did not log in user'
      });
      console.log('  ❌ Mock auth failed');
    }
  }
  
  private printResults() {
    console.log('\n' + '━'.repeat(50));
    console.log('📊 TEST RESULTS SUMMARY\n');
    
    const passed = this.results.filter(r => r.success).length;
    const total = this.results.length;
    const percentage = Math.round((passed / total) * 100);
    
    this.results.forEach((result, i) => {
      const icon = result.success ? '✅' : '❌';
      console.log(`${i + 1}. ${icon} ${result.step}`);
      console.log(`   ${result.message}`);
      if (result.screenshot) {
        console.log(`   📸 Screenshot: e2e/screenshots/${result.screenshot}`);
      }
    });
    
    console.log('\n' + '━'.repeat(50));
    console.log(`🎯 Overall: ${passed}/${total} tests passed (${percentage}%)`);
    
    if (percentage === 100) {
      console.log('🎉 All tests passed! Authentication system is working perfectly.');
    } else if (percentage >= 75) {
      console.log('👍 Most tests passed. Minor issues to address.');
    } else if (percentage >= 50) {
      console.log('⚠️ Some tests failing. Review authentication flow.');
    } else {
      console.log('❌ Critical issues detected. Authentication needs fixes.');
    }
    
    // Save results to file
    this.saveResults();
  }
  
  private async saveResults() {
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.success).length,
        failed: this.results.filter(r => !r.success).length
      }
    };
    
    await fs.writeFile(
      'e2e/test-results.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n📁 Results saved to e2e/test-results.json');
  }
}

// Run the tests
const tester = new AuthTester();
tester.run().catch(console.error);