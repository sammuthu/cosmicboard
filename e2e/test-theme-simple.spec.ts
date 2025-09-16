import { test, expect } from '@playwright/test'

test.describe('Theme Customization - Core Features', () => {
  test('verify theme customization save and load', async ({ page }) => {
    // Navigate directly to themes page (assuming user is logged in or will auto-login)
    await page.goto('http://localhost:7777/themes')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Take screenshot of initial gallery
    await page.screenshot({
      path: 'test-results/01-theme-gallery-initial.png',
      fullPage: true
    })

    // Verify Theme Gallery loaded
    await expect(page.locator('h1:has-text("Theme Gallery")')).toBeVisible({ timeout: 10000 })

    // Find Moon theme and click Customize
    const moonCard = page.locator('text=Moon').locator('..')
    await expect(moonCard).toBeVisible({ timeout: 10000 })

    // Click the Customize button for Moon theme
    await moonCard.locator('button:has-text("Customize")').click()

    // Wait for customize page to load
    await page.waitForURL('**/themes/moon/customize', { timeout: 10000 })

    // Take screenshot of customize page
    await page.screenshot({
      path: 'test-results/02-theme-customize-page.png',
      fullPage: true
    })

    // Verify customize page loaded
    const customizeTitle = page.locator('h1').filter({ hasText: /Customize.*Moon/i })
    await expect(customizeTitle).toBeVisible({ timeout: 10000 })

    // Find color inputs and change them
    const textPrimaryInput = page.locator('input[name="text.primary"]')
    await expect(textPrimaryInput).toBeVisible({ timeout: 10000 })

    // Save original value
    const originalValue = await textPrimaryInput.inputValue()
    console.log('Original primary text color:', originalValue)

    // Change the primary text color to a test value
    await textPrimaryInput.clear()
    await textPrimaryInput.fill('#FF00FF')

    // Change accent color
    const accentInput = page.locator('input[name="text.accent"]')
    await accentInput.clear()
    await accentInput.fill('#00FF00')

    // Wait for preview to update
    await page.waitForTimeout(1000)

    // Take screenshot after changes
    await page.screenshot({
      path: 'test-results/03-theme-customize-changed.png',
      fullPage: true
    })

    // Click Save button
    await page.click('button:has-text("Save Customization")')

    // Wait for save confirmation
    await expect(page.locator('text=Theme customization saved')).toBeVisible({ timeout: 10000 })

    // Take screenshot after save
    await page.screenshot({
      path: 'test-results/04-theme-customize-saved.png',
      fullPage: true
    })

    // Reload the page to verify persistence
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify the customized values are still there
    await expect(textPrimaryInput).toHaveValue('#FF00FF')
    await expect(accentInput).toHaveValue('#00FF00')

    // Take screenshot showing persisted values
    await page.screenshot({
      path: 'test-results/05-theme-customize-reloaded.png',
      fullPage: true
    })

    // Navigate back to gallery
    await page.click('text=Back to Gallery')
    await page.waitForURL('**/themes')

    // Verify Moon theme shows "Customized" badge
    const customizedMoon = page.locator('text=Moon').locator('..')
    await expect(customizedMoon.locator('text=Customized')).toBeVisible({ timeout: 10000 })

    // Take final screenshot
    await page.screenshot({
      path: 'test-results/06-theme-gallery-customized.png',
      fullPage: true
    })

    console.log('✅ Theme customization test completed successfully!')
  })
})