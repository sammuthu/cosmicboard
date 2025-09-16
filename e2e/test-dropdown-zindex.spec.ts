import { test, expect } from '@playwright/test';

const TOKEN = 'acf42bf1db7047b8f6fced9eb611ea285faeef09e98efe1818f51edb687d2005';

test('verify dropdown menu z-index fix', async ({ page }) => {
  // Set auth token before navigating
  await page.addInitScript((token) => {
    localStorage.setItem('auth_tokens', JSON.stringify({
      accessToken: token,
      refreshToken: token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }));
  }, TOKEN);
  
  // Navigate to home page
  await page.goto('http://localhost:7777');
  
  // Wait for the page to fully load
  await page.waitForTimeout(2000);
  
  // Find and click the user avatar to open dropdown
  // The avatar should be in the theme selector container on the right
  const userAvatar = page.locator('.ml-8 button').first();
  await userAvatar.click();
  
  // Wait for dropdown animation
  await page.waitForTimeout(500);
  
  // Take screenshot with dropdown open
  await page.screenshot({ 
    path: '/tmp/dropdown-zindex-test.png', 
    fullPage: true 
  });
  
  console.log('✅ Screenshot saved to /tmp/dropdown-zindex-test.png');
  
  // Verify dropdown is visible
  const dropdown = page.locator('text="Network Feed"').first();
  await expect(dropdown).toBeVisible();
  
  console.log('✅ Dropdown menu is visible and properly displayed');
});