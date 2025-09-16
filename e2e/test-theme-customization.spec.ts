import { test, expect } from '@playwright/test'

test.describe('Theme Customization System', () => {
  const testUserEmail = 'nmuthu@gmail.com'

  test.beforeEach(async ({ page }) => {
    // Go to home page
    await page.goto('http://localhost:7777')

    // Check if already logged in
    const profileIcon = page.locator('[data-testid="profile-dropdown"]')
    if (!(await profileIcon.isVisible())) {
      // Need to login - click Auth button
      await page.click('text=Auth')

      // Enter email
      await page.fill('input[type="email"]', testUserEmail)
      await page.click('button:has-text("Send Magic Link")')

      // Wait for magic link to be sent
      await expect(page.locator('text=Magic link sent')).toBeVisible()

      // Get magic link from backend logs or email
      // For testing, we'll simulate the magic link process
      const response = await page.request.get('http://localhost:7779/api/auth/test-magic-link', {
        params: { email: testUserEmail }
      })

      if (response.ok()) {
        const { token } = await response.json()
        await page.goto(`http://localhost:7777/auth/verify?token=${token}`)
      }

      // Wait for redirect to home after successful login
      await page.waitForURL('http://localhost:7777/')
    }
  })

  test('should navigate to theme gallery and show existing themes', async ({ page }) => {
    // Click on profile dropdown
    await page.click('[data-testid="profile-dropdown"]')

    // Click on Customize Themes option
    await page.click('text=Customize Themes')

    // Wait for navigation to themes page
    await page.waitForURL('**/themes')

    // Verify page title
    await expect(page.locator('h1:has-text("Theme Gallery")')).toBeVisible()

    // Wait for themes to load and verify at least 8 themes exist
    const themeCards = page.locator('[data-testid="theme-card"]')
    await expect(themeCards.first()).toBeVisible({ timeout: 10000 })
    const themeCount = await themeCards.count()
    expect(themeCount).toBeGreaterThanOrEqual(8)

    // Take screenshot of theme gallery
    await page.screenshot({
      path: 'test-results/theme-gallery.png',
      fullPage: true
    })

    // Verify specific themes exist
    const expectedThemes = ['Moon', 'Sun', 'Daylight', 'Comet', 'Earth', 'Rocket', 'Saturn', 'Sparkle']
    for (const themeName of expectedThemes) {
      await expect(page.locator(`text=${themeName}`)).toBeVisible()
    }
  })

  test('should customize a theme and save changes', async ({ page }) => {
    // Navigate to themes
    await page.goto('http://localhost:7777/themes')

    // Find the Moon theme and click Customize
    const moonCard = page.locator('[data-testid="theme-card"]:has-text("Moon")')
    await moonCard.locator('button:has-text("Customize")').click()

    // Wait for customize page
    await page.waitForURL('**/themes/*/customize')

    // Verify customize page loaded
    await expect(page.locator('h1:has-text("Customize")')).toBeVisible()

    // Take before screenshot
    await page.screenshot({
      path: 'test-results/theme-customize-before.png',
      fullPage: true
    })

    // Find and change the primary text color
    const primaryTextInput = page.locator('input[name="text.primary"]')
    await primaryTextInput.clear()
    await primaryTextInput.fill('#FF00FF') // Change to magenta

    // Change accent color
    const accentInput = page.locator('input[name="text.accent"]')
    await accentInput.clear()
    await accentInput.fill('#00FF00') // Change to green

    // Preview should update immediately
    await page.waitForTimeout(500) // Small delay for preview to update

    // Take screenshot showing changes in preview
    await page.screenshot({
      path: 'test-results/theme-customize-changed.png',
      fullPage: true
    })

    // Save the customization
    await page.click('button:has-text("Save Customization")')

    // Wait for save to complete
    await expect(page.locator('text=Theme customization saved!')).toBeVisible()

    // Navigate back to gallery
    await page.click('text=Back to Gallery')

    // Verify the Moon theme now shows "Customized" badge
    const customizedMoonCard = page.locator('[data-testid="theme-card"]:has-text("Moon")')
    await expect(customizedMoonCard.locator('text=Customized')).toBeVisible()

    // Take screenshot showing customized badge
    await page.screenshot({
      path: 'test-results/theme-gallery-customized.png',
      fullPage: true
    })
  })

  test('should persist customization after page reload', async ({ page }) => {
    // Navigate directly to Moon theme customize page
    await page.goto('http://localhost:7777/themes/moon/customize')

    // Wait for page to load
    await expect(page.locator('h1:has-text("Customize")')).toBeVisible()

    // Check if our previous customization is loaded
    const primaryTextInput = page.locator('input[name="text.primary"]')
    const accentInput = page.locator('input[name="text.accent"]')

    // Verify custom colors are loaded
    await expect(primaryTextInput).toHaveValue('#FF00FF')
    await expect(accentInput).toHaveValue('#00FF00')

    // Take screenshot showing persisted values
    await page.screenshot({
      path: 'test-results/theme-customize-persisted.png',
      fullPage: true
    })
  })

  test('should apply customized theme as active', async ({ page }) => {
    // Navigate to themes
    await page.goto('http://localhost:7777/themes')

    // Find the customized Moon theme and apply it
    const moonCard = page.locator('[data-testid="theme-card"]:has-text("Moon")')
    await moonCard.locator('button:has-text("Apply")').click()

    // Wait for theme to be applied
    await expect(moonCard.locator('text=Active')).toBeVisible()

    // Reload page to verify theme is applied
    await page.reload()

    // Check that the custom colors are applied to the page
    // The custom primary text color should be visible
    const bodyStyles = await page.evaluate(() => {
      return window.getComputedStyle(document.body).getPropertyValue('--text-primary')
    })

    // Our custom magenta color should be applied
    expect(bodyStyles).toContain('255') // RGB value for magenta contains 255

    // Take screenshot showing applied custom theme
    await page.screenshot({
      path: 'test-results/theme-applied-custom.png',
      fullPage: true
    })
  })

  test('should reset theme customization to defaults', async ({ page }) => {
    // Navigate to Moon theme customize page
    await page.goto('http://localhost:7777/themes/moon/customize')

    // Wait for page to load
    await expect(page.locator('h1:has-text("Customize")')).toBeVisible()

    // Click Reset button
    await page.click('button:has-text("Reset to Default")')

    // Confirm reset in dialog
    await page.click('button:has-text("Yes, Reset")')

    // Wait for reset to complete
    await expect(page.locator('text=Theme reset to default!')).toBeVisible()

    // Verify colors are back to defaults
    const primaryTextInput = page.locator('input[name="text.primary"]')
    const defaultMoonPrimaryColor = '#E0E7FF' // Default Moon theme primary text
    await expect(primaryTextInput).toHaveValue(defaultMoonPrimaryColor)

    // Navigate back to gallery
    await page.click('text=Back to Gallery')

    // Verify the Moon theme no longer shows "Customized" badge
    const moonCard = page.locator('[data-testid="theme-card"]:has-text("Moon")')
    await expect(moonCard.locator('text=Customized')).not.toBeVisible()

    // Take screenshot showing reset theme
    await page.screenshot({
      path: 'test-results/theme-gallery-reset.png',
      fullPage: true
    })
  })

  test('should handle multiple theme customizations', async ({ page }) => {
    // Navigate to themes
    await page.goto('http://localhost:7777/themes')

    // Customize Sun theme
    const sunCard = page.locator('[data-testid="theme-card"]:has-text("Sun")')
    await sunCard.locator('button:has-text("Customize")').click()

    // Change a color
    const sunPrimaryInput = page.locator('input[name="text.primary"]')
    await sunPrimaryInput.clear()
    await sunPrimaryInput.fill('#FFD700') // Gold color

    // Save
    await page.click('button:has-text("Save Customization")')
    await expect(page.locator('text=Theme customization saved!')).toBeVisible()

    // Back to gallery
    await page.click('text=Back to Gallery')

    // Customize Comet theme
    const cometCard = page.locator('[data-testid="theme-card"]:has-text("Comet")')
    await cometCard.locator('button:has-text("Customize")').click()

    // Change a color
    const cometPrimaryInput = page.locator('input[name="text.primary"]')
    await cometPrimaryInput.clear()
    await cometPrimaryInput.fill('#FF4500') // Orange-red color

    // Save
    await page.click('button:has-text("Save Customization")')
    await expect(page.locator('text=Theme customization saved!')).toBeVisible()

    // Back to gallery
    await page.click('text=Back to Gallery')

    // Verify both themes show customized badge
    await expect(sunCard.locator('text=Customized')).toBeVisible()
    await expect(cometCard.locator('text=Customized')).toBeVisible()

    // Take final screenshot
    await page.screenshot({
      path: 'test-results/theme-gallery-multiple-custom.png',
      fullPage: true
    })
  })
})