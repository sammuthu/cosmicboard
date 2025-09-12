/**
 * Automated Test for PDF Viewer using Playwright
 * Tests document counts and PDF viewing functionality
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';

const BASE_URL = 'http://localhost:7777';
const TOKEN = 'acf42bf1db7047b8f6fced9eb611ea285faeef09e98efe1818f51edb687d2005';
const SCREENSHOTS_DIR = '/tmp/cosmicboard-test-screenshots';

async function setupAuth(page: Page) {
  // Set auth tokens in localStorage
  await page.addInitScript((token) => {
    localStorage.setItem('auth_tokens', JSON.stringify({
      accessToken: token,
      refreshToken: token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }));
  }, TOKEN);
}

async function ensureScreenshotsDir() {
  await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
}

test.describe('PDF Viewer Tests', () => {
  test.beforeAll(async () => {
    await ensureScreenshotsDir();
  });

  test('Document counts should match and PDF viewer should work', async ({ page }) => {
    // Setup authentication
    await setupAuth(page);
    
    // Step 1: Navigate to home page
    console.log('📍 Step 1: Navigating to home page...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '1-homepage.png'), fullPage: true });
    
    // Step 2: Find project with documents
    console.log('📍 Step 2: Finding project with documents...');
    const projectCards = page.locator('[class*="PrismCard"]');
    const projectCount = await projectCards.count();
    console.log(`  Found ${projectCount} projects`);
    
    let projectTitle = '';
    let docCountOnCard = 0;
    
    for (let i = 0; i < projectCount; i++) {
      const card = projectCards.nth(i);
      const text = await card.textContent();
      
      if (text && text.includes('Docs')) {
        const match = text.match(/(\d+)\s*Docs/);
        if (match && parseInt(match[1]) > 0) {
          docCountOnCard = parseInt(match[1]);
          const titleElement = await card.locator('h3').first();
          projectTitle = await titleElement.textContent() || 'Unknown';
          console.log(`✓ Found project: "${projectTitle}" with ${docCountOnCard} docs`);
          await card.screenshot({ path: path.join(SCREENSHOTS_DIR, '2-project-card.png') });
          
          // Click on the project
          await titleElement.click();
          break;
        }
      }
    }
    
    expect(docCountOnCard).toBeGreaterThan(0);
    
    // Step 3: Wait for project details page
    console.log('📍 Step 3: Project details page loaded...');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '3-project-details.png'), fullPage: true });
    
    // Step 4: Click on Scrolls tab
    console.log('📍 Step 4: Clicking on Scrolls tab...');
    const scrollsButton = await page.getByRole('button', { name: /Scrolls/i });
    await scrollsButton.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '4-scrolls-tab.png'), fullPage: true });
    
    // Step 5: Count documents in tab
    console.log('📍 Step 5: Counting documents in Scrolls tab...');
    const tableRows = page.locator('tbody tr');
    const docsInTab = await tableRows.count();
    console.log(`  Found ${docsInTab} documents in Scrolls tab`);
    
    // Verify counts match
    if (docsInTab === docCountOnCard) {
      console.log(`✓ Document counts match! (${docsInTab} = ${docCountOnCard})`);
    } else {
      console.log(`✗ Document count mismatch! Tab: ${docsInTab}, Card: ${docCountOnCard}`);
    }
    expect(docsInTab).toBe(docCountOnCard);
    
    // Step 6: Check for viewable files
    console.log('📍 Step 6: Checking for viewable PDFs...');
    const viewButtons = page.locator('button:has(svg)').filter({ hasNot: page.locator('[disabled]') });
    const viewButtonCount = await viewButtons.count();
    
    let viewableCount = 0;
    for (let i = 0; i < viewButtonCount; i++) {
      const button = viewButtons.nth(i);
      const isDisabled = await button.isDisabled();
      if (!isDisabled) {
        // Check if it has an eye icon (view button)
        const svgContent = await button.locator('svg').innerHTML();
        if (svgContent.includes('M1 12s4-8 11-8')) { // Part of eye icon path
          viewableCount++;
        }
      }
    }
    
    console.log(`  Found ${viewableCount} viewable files`);
    
    // Step 7: Open first PDF
    if (viewableCount > 0) {
      console.log('📍 Step 7: Opening first viewable file...');
      
      // Find and click first view button
      for (let i = 0; i < viewButtonCount; i++) {
        const button = viewButtons.nth(i);
        const isDisabled = await button.isDisabled();
        if (!isDisabled) {
          const svgContent = await button.locator('svg').innerHTML();
          if (svgContent.includes('M1 12s4-8 11-8')) {
            await button.click();
            break;
          }
        }
      }
      
      // Wait for PDF viewer to load
      await page.waitForTimeout(5000);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '7-pdf-viewer.png'), fullPage: true });
      
      // Check for errors
      const bodyText = await page.textContent('body');
      const hasError = bodyText.includes('Unexpected server response') || 
                      bodyText.includes('Failed to load');
      
      if (hasError) {
        console.log('✗ Error loading PDF viewer');
        // Try to get error details
        const errorElements = page.locator('[class*="alert"], [class*="error"]');
        const errorCount = await errorElements.count();
        if (errorCount > 0) {
          const errorText = await errorElements.first().textContent();
          console.log(`  Error: ${errorText}`);
        }
      } else {
        console.log('✓ PDF viewer opened successfully');
        
        // Check if PDF content is visible
        const pdfViewer = page.locator('[class*="pdf"], [class*="viewer"], canvas');
        const pdfVisible = await pdfViewer.count() > 0;
        
        if (pdfVisible) {
          console.log('✓ PDF content is visible');
        } else {
          console.log('⚠ PDF viewer opened but content not visible');
        }
      }
      
      expect(hasError).toBe(false);
      
      // Close the viewer
      const closeButton = page.locator('button:has(svg)').filter({ 
        has: page.locator('svg path[d*="M6 18L18 6M6 6l12 12"]') // X icon
      });
      if (await closeButton.count() > 0) {
        await closeButton.first().click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Step 8: Test API directly
    console.log('📍 Step 8: Testing backend API...');
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
          hasPDFs: data.some((item: any) => item.type === 'PDF'),
          hasRealPDFs: data.some((item: any) => item.mimeType === 'application/pdf')
        };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }, TOKEN);
    
    console.log(`✓ API returned ${apiResponse.count} PDF items`);
    console.log(`  Has real PDFs: ${apiResponse.hasRealPDFs}`);
    expect(apiResponse.success).toBe(true);
    expect(apiResponse.hasRealPDFs).toBe(true);
    
    // Summary
    console.log('\n📊 Test Summary:');
    console.log(`  • Project found: ✓`);
    console.log(`  • Document count match: ${docsInTab === docCountOnCard ? '✓' : '✗'}`);
    console.log(`  • Viewable files: ${viewableCount}`);
    console.log(`  • API working: ${apiResponse.success ? '✓' : '✗'}`);
    console.log(`\n📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);
  });
  
  test('PDF proxy endpoint should return file content', async ({ request }) => {
    console.log('📍 Testing PDF proxy endpoint directly...');
    
    // Get a real PDF ID
    const mediaResponse = await request.get('http://localhost:7779/api/media?type=PDF', {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    const mediaItems = await mediaResponse.json();
    const realPDF = mediaItems.find((item: any) => item.mimeType === 'application/pdf');
    
    if (realPDF) {
      console.log(`  Testing PDF: ${realPDF.name}`);
      
      // Test the proxy endpoint
      const proxyResponse = await request.get(
        `http://localhost:7779/api/media/${realPDF.id}/file?token=${TOKEN}`
      );
      
      expect(proxyResponse.status()).toBe(200);
      
      const contentType = proxyResponse.headers()['content-type'];
      console.log(`  Content-Type: ${contentType}`);
      
      // Should return PDF content
      expect(contentType).toContain('application/pdf');
      
      const body = await proxyResponse.body();
      console.log(`  Response size: ${body.length} bytes`);
      
      // PDF files start with %PDF
      const pdfHeader = body.toString('utf8', 0, 4);
      console.log(`  PDF header: ${pdfHeader}`);
      expect(pdfHeader).toBe('%PDF');
      
      console.log('✓ PDF proxy endpoint working correctly');
    } else {
      console.log('⚠ No real PDF files found to test');
    }
  });
});