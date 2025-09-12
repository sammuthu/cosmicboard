#!/usr/bin/env node

/**
 * Automated Test Script for PDF Viewer
 * This script tests the PDF viewer functionality by:
 * 1. Taking screenshots at each step
 * 2. Verifying document counts
 * 3. Testing PDF viewing through the proxy endpoint
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:7777';
const SCREENSHOTS_DIR = '/tmp/cosmicboard-test-screenshots';
const TOKEN = 'acf42bf1db7047b8f6fced9eb611ea285faeef09e98efe1818f51edb687d2005';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function ensureScreenshotsDir() {
  try {
    await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
    log(`✓ Screenshots directory created: ${SCREENSHOTS_DIR}`, 'green');
  } catch (error) {
    log(`✗ Failed to create screenshots directory: ${error.message}`, 'red');
  }
}

async function takeScreenshot(page, name) {
  const filename = path.join(SCREENSHOTS_DIR, `${Date.now()}-${name}.png`);
  await page.screenshot({ path: filename, fullPage: true });
  log(`  📸 Screenshot saved: ${filename}`, 'blue');
  return filename;
}

async function testPDFViewer() {
  let browser;
  try {
    // Initialize
    await ensureScreenshotsDir();
    log('\n🚀 Starting PDF Viewer Test Suite', 'yellow');
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: false, // Set to true for CI/CD
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set authentication
    await page.evaluateOnNewDocument((token) => {
      localStorage.setItem('auth_tokens', JSON.stringify({
        accessToken: token,
        refreshToken: token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }));
    }, TOKEN);
    
    // Step 1: Navigate to home page
    log('\n📍 Step 1: Navigating to home page...', 'yellow');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    await takeScreenshot(page, '1-homepage');
    
    // Step 2: Find project with documents
    log('\n📍 Step 2: Finding project with documents...', 'yellow');
    const projectCard = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[class*="PrismCard"]'));
      for (const card of cards) {
        const docsText = card.textContent;
        if (docsText && docsText.includes('Docs')) {
          const match = docsText.match(/(\d+)\s*Docs/);
          if (match && parseInt(match[1]) > 0) {
            return {
              title: card.querySelector('h3')?.textContent || 'Unknown',
              docCount: parseInt(match[1]),
              element: true
            };
          }
        }
      }
      return null;
    });
    
    if (!projectCard) {
      log('✗ No project with documents found', 'red');
      return;
    }
    
    log(`✓ Found project: "${projectCard.title}" with ${projectCard.docCount} docs`, 'green');
    await takeScreenshot(page, '2-project-card');
    
    // Step 3: Click on the project
    log('\n📍 Step 3: Clicking on project...', 'yellow');
    await page.click('[class*="PrismCard"] h3');
    await page.waitForTimeout(3000);
    await takeScreenshot(page, '3-project-details');
    
    // Step 4: Click on Scrolls tab
    log('\n📍 Step 4: Clicking on Scrolls tab...', 'yellow');
    const scrollsTab = await page.$('button:has-text("Scrolls")');
    if (scrollsTab) {
      await scrollsTab.click();
    } else {
      // Try alternative selector
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const scrollsButton = buttons.find(btn => btn.textContent.includes('Scrolls'));
        if (scrollsButton) scrollsButton.click();
      });
    }
    await page.waitForTimeout(2000);
    await takeScreenshot(page, '4-scrolls-tab');
    
    // Step 5: Count documents in Scrolls tab
    log('\n📍 Step 5: Counting documents in Scrolls tab...', 'yellow');
    const docsInTab = await page.evaluate(() => {
      const rows = document.querySelectorAll('tbody tr');
      return rows.length;
    });
    
    log(`  Found ${docsInTab} documents in Scrolls tab`, 'blue');
    
    // Step 6: Verify counts match
    if (docsInTab === projectCard.docCount) {
      log(`✓ Document counts match! (${docsInTab} = ${projectCard.docCount})`, 'green');
    } else {
      log(`✗ Document count mismatch! Tab: ${docsInTab}, Card: ${projectCard.docCount}`, 'red');
    }
    
    // Step 7: Check for viewable PDFs
    log('\n📍 Step 7: Checking for viewable PDFs...', 'yellow');
    const viewableFiles = await page.evaluate(() => {
      const viewButtons = Array.from(document.querySelectorAll('button'));
      const enabledViewButtons = viewButtons.filter(btn => {
        const svg = btn.querySelector('svg');
        const hasEyeIcon = svg && svg.innerHTML.includes('Eye');
        const isDisabled = btn.disabled || btn.getAttribute('disabled') !== null;
        return hasEyeIcon && !isDisabled;
      });
      return enabledViewButtons.length;
    });
    
    log(`  Found ${viewableFiles} viewable files`, 'blue');
    
    // Step 8: Click on first viewable file
    if (viewableFiles > 0) {
      log('\n📍 Step 8: Opening first viewable file...', 'yellow');
      await page.evaluate(() => {
        const viewButtons = Array.from(document.querySelectorAll('button'));
        const firstEnabledView = viewButtons.find(btn => {
          const svg = btn.querySelector('svg');
          const hasEyeIcon = svg && svg.innerHTML.includes('Eye');
          const isDisabled = btn.disabled || btn.getAttribute('disabled') !== null;
          return hasEyeIcon && !isDisabled;
        });
        if (firstEnabledView) firstEnabledView.click();
      });
      
      await page.waitForTimeout(5000); // Wait for PDF to load
      await takeScreenshot(page, '8-pdf-viewer');
      
      // Check for PDF viewer or error
      const hasError = await page.evaluate(() => {
        const errorText = document.body.textContent;
        return errorText.includes('Unexpected server response') || 
               errorText.includes('Failed to load');
      });
      
      if (hasError) {
        log('✗ Error loading PDF viewer', 'red');
        const errorMessage = await page.evaluate(() => {
          const alerts = Array.from(document.querySelectorAll('[class*="alert"], [class*="error"]'));
          return alerts.map(el => el.textContent).join('\n');
        });
        log(`  Error details: ${errorMessage}`, 'red');
      } else {
        log('✓ PDF viewer opened successfully', 'green');
      }
      
      // Close the viewer
      const closeButton = await page.$('button:has([class*="X"])');
      if (closeButton) {
        await closeButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Step 9: Test API directly
    log('\n📍 Step 9: Testing backend API...', 'yellow');
    const apiResponse = await page.evaluate(async (token) => {
      try {
        const response = await fetch('http://localhost:7779/api/media?type=PDF', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        return {
          success: true,
          count: data.length,
          hasPDFs: data.some(item => item.type === 'PDF'),
          sample: data[0]
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }, TOKEN);
    
    if (apiResponse.success) {
      log(`✓ API returned ${apiResponse.count} PDF items`, 'green');
      if (apiResponse.sample) {
        log(`  Sample: ${apiResponse.sample.name}`, 'blue');
      }
    } else {
      log(`✗ API error: ${apiResponse.error}`, 'red');
    }
    
    // Final summary
    log('\n📊 Test Summary:', 'yellow');
    log(`  • Project found: ✓`, 'green');
    log(`  • Document count match: ${docsInTab === projectCard.docCount ? '✓' : '✗'}`, 
        docsInTab === projectCard.docCount ? 'green' : 'red');
    log(`  • Viewable files: ${viewableFiles}`, viewableFiles > 0 ? 'green' : 'yellow');
    log(`  • API working: ${apiResponse.success ? '✓' : '✗'}`, 
        apiResponse.success ? 'green' : 'red');
    log(`\n📁 Screenshots saved to: ${SCREENSHOTS_DIR}`, 'blue');
    
  } catch (error) {
    log(`\n✗ Test failed with error: ${error.message}`, 'red');
    console.error(error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testPDFViewer().then(() => {
  log('\n✅ Test completed', 'green');
  process.exit(0);
}).catch((error) => {
  log(`\n❌ Test failed: ${error.message}`, 'red');
  process.exit(1);
});