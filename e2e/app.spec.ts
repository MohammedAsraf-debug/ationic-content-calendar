import { expect, test, type Page } from '@playwright/test'

// These mirror the production allowlist enforced in firestore.rules.
const MOHAMMED = { email: 'sudalaikannan.work@gmail.com', password: 'Test1234!' }
const TEAM = { email: 'ationic.it@gmail.com', password: 'Test1234!' }
const OUTSIDER = { email: 'outsider@ationic.com', password: 'Test1234!' }

const MONTH_HEADING =
  /^(January|February|March|April|May|June|July|August|September|October|November|December) \d{4}$/

async function login(page: Page, creds = MOHAMMED) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(creds.email)
  await page.getByLabel('Password').fill(creds.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('link', { name: 'Calendar' })).toBeVisible()
  // Wait for the first realtime snapshot before asserting on counts.
  await expect(page.getByText('Loading content…')).toHaveCount(0)
}

async function addContent(page: Page, input: { title: string; date: string; type?: string }) {
  await page.getByRole('button', { name: 'Add Content' }).first().click()
  await page.getByLabel('Content Title').fill(input.title)
  await page.getByLabel('Publish Date').fill(input.date)
  if (input.type) await page.getByLabel('Content Type').selectOption(input.type)
  await page.getByRole('button', { name: 'Create content' }).click()
  await expect(page.getByText('Content added to the calendar')).toBeVisible()
}

const notesBox = (page: Page) =>
  page.getByPlaceholder('Feedback, blockers, who is shooting this…')

const AUTH_URL = 'http://127.0.0.1:9099'
const DOCS = 'http://127.0.0.1:8080/v1/projects/demo-ationic/databases/(default)/documents'

/** Real ID token from the auth emulator, so Firestore evaluates the real rules. */
async function signInViaEmulator(
  request: import('@playwright/test').APIRequestContext,
  creds: { email: string; password: string },
) {
  const res = await request.post(
    `${AUTH_URL}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`,
    { data: { email: creds.email, password: creds.password, returnSecureToken: true } },
  )
  expect(res.ok(), `sign in as ${creds.email}`).toBeTruthy()
  const body = await res.json()
  return { token: body.idToken as string, uid: body.localId as string }
}

test.describe('Ationic Content Hub', () => {
  test('blocks unauthenticated access and rejects bad credentials', async ({ page }) => {
    await page.goto('/content')
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()

    await page.getByLabel('Email').fill(MOHAMMED.email)
    await page.getByLabel('Password').fill('wrong-password')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByText('Incorrect email or password.')).toBeVisible()
  })

  test('signs in and renders the dashboard', async ({ page }) => {
    await login(page)
    await expect(page).toHaveURL(/\/calendar/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(MONTH_HEADING)
    await expect(page.getByText('Upcoming Content')).toBeVisible()
    await expect(page.getByText('Production Pipeline')).toBeVisible()
    for (const key of ['planned', 'reels', 'carousels', 'inProduction', 'scheduled', 'published']) {
      await expect(page.getByTestId(`stat-${key}`)).toBeVisible()
    }
    for (const day of ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']) {
      await expect(page.getByText(day, { exact: true }).first()).toBeVisible()
    }
  })

  test('navigates between months and returns to today', async ({ page }) => {
    await login(page)
    const heading = page.getByRole('heading', { level: 1 })
    const current = await heading.textContent()
    expect(current).toMatch(MONTH_HEADING)

    await page.getByRole('button', { name: 'Next month' }).click()
    await expect(heading).not.toHaveText(current ?? '')
    await page.getByRole('button', { name: 'Previous month' }).click()
    await expect(heading).toHaveText(current ?? '')
    await page.getByRole('button', { name: 'Next month' }).click()
    await page.getByRole('button', { name: 'Today' }).click()
    await expect(heading).toHaveText(current ?? '')
  })

  test('creates content and it appears on the calendar', async ({ page }) => {
    await login(page)
    const before = Number(await page.getByTestId('stat-planned').textContent())
    const title = `E2E Meta Ads Mistakes ${Date.now()}`

    await addContent(page, { title, date: '2026-10-05', type: 'Reel' })

    const dayCell = page.getByTestId('day-2026-10-05')
    const card = dayCell.getByTestId('calendar-item').filter({ hasText: title })
    await expect(card).toBeVisible()
    await expect(card.getByText('REEL')).toBeVisible()
    await expect(card.getByText('Idea')).toBeVisible()
    await expect(page.getByTestId('stat-planned')).toHaveText(String(before + 1))
    await expect(page.getByTestId('stat-reels')).toBeVisible()

    await card.click()
    await expect(page.getByTestId('content-title')).toHaveValue(title)
    await page.getByRole('button', { name: 'Delete' }).click()
    await page.getByRole('button', { name: 'Delete content' }).click()
    await expect(page.getByText('Content deleted')).toBeVisible()
  })

  test('calendar quick filters update the grid', async ({ page }) => {
    await login(page)
    const title = `E2E Filtered Reel ${Date.now()}`
    await addContent(page, { title, date: '2026-10-03', type: 'Reel' })
    const dayCell = page.getByTestId('day-2026-10-03')

    await page.getByRole('button', { name: 'Carousels', exact: true }).click()
    await expect(dayCell.getByText(title)).toHaveCount(0)
    await page.getByRole('button', { name: 'Reels', exact: true }).click()
    await expect(dayCell.getByText(title)).toBeVisible()
    await page.getByRole('button', { name: 'All', exact: true }).click()
    await expect(dayCell.getByText(title)).toBeVisible()
  })

  test('opens the workspace, autosaves edits and keeps them after reload', async ({ page }) => {
    await login(page)
    const title = `E2E Workspace ${Date.now()}`
    await addContent(page, { title, date: '2026-10-06' })

    await page.getByText(title).first().click()
    await expect(page.getByTestId('content-title')).toHaveValue(title)

    await notesBox(page).fill('Notes from e2e run')
    await expect(page.getByTestId('save-indicator')).toHaveText(/Saved|Saving|Unsaved/)

    await page.waitForTimeout(1500)
    await expect(page.getByTestId('save-indicator')).toHaveText(/^Saved /)

    await page.reload()
    await expect(notesBox(page)).toHaveValue('Notes from e2e run')
    await expect(page.getByTestId('content-title')).toHaveValue(title)

    await page.getByRole('button', { name: 'Delete' }).click()
    await page.getByRole('button', { name: 'Delete content' }).click()
    await expect(page.getByText('Content deleted')).toBeVisible()
  })

  test('changes production status with one click', async ({ page }) => {
    await login(page)
    const title = `E2E Status ${Date.now()}`
    await addContent(page, { title, date: '2026-10-07' })
    await page.getByText(title).first().click()

    await page.getByTestId('stage-Edit').click()
    await expect(page.getByText('Editing').first()).toBeVisible()

    await page.waitForTimeout(1200)
    await page.reload()
    await expect(page.getByTestId('stage-Edit')).toContainText('Editing')

    await page.getByTestId('stage-Published').click()
    await page.waitForTimeout(1200)
    await page.reload()
    await expect(page.getByTestId('stage-Published')).toContainText('Published')

    // Detailed status dropdown also works.
    await page.getByLabel('Detailed status').selectOption('Review')
    await page.waitForTimeout(1200)
    await page.reload()
    await expect(page.getByLabel('Detailed status')).toHaveValue('Review')

    await page.getByRole('button', { name: 'Delete' }).click()
    await page.getByRole('button', { name: 'Delete content' }).click()
    await expect(page.getByText('Content deleted')).toBeVisible()
  })

  test('duplicates content into a numbered copy', async ({ page }) => {
    await login(page)
    const title = `E2E Duplicate ${Date.now()}`
    await addContent(page, { title, date: '2026-10-08' })
    await page.getByText(title).first().click()

    await page.getByRole('button', { name: 'Duplicate' }).click()
    await expect(page).toHaveURL(/\/content\/[A-Za-z0-9]+$/)
    await expect(page.getByTestId('content-title')).toHaveValue(`${title} #2`)

    await page.getByRole('button', { name: 'Delete' }).click()
    await page.getByRole('button', { name: 'Delete content' }).click()
    await expect(page.getByText('Content deleted')).toBeVisible()
  })

  test('searches and filters the content list', async ({ page }) => {
    await login(page)
    await page.getByRole('link', { name: 'Content' }).click()
    await expect(page.getByRole('heading', { name: 'Content' })).toBeVisible()

    const marker = `E2E List ${Date.now()}`
    await page.getByRole('button', { name: 'Add Content' }).first().click()
    await page.getByLabel('Content Title').fill(marker)
    await page.getByLabel('Publish Date').fill('2026-10-09')
    await page.getByRole('button', { name: 'Create content' }).click()
    await expect(page.getByText('Content added to the calendar')).toBeVisible()

    await page.getByLabel('Search content').fill(marker)
    await expect(page.getByText(marker).first()).toBeVisible()

    await page.getByLabel('Search content').fill('')
    await page.getByRole('button', { name: 'Stories', exact: true }).click()
    await expect(page.getByText(marker)).toHaveCount(0)

    await page.getByRole('button', { name: 'All', exact: true }).click()
    await page.getByLabel('Search content').fill(marker)
    await page.getByText(marker).first().click()
    await page.getByRole('button', { name: 'Delete' }).click()
    await page.getByRole('button', { name: 'Delete content' }).click()
    await expect(page.getByText('Content deleted')).toBeVisible()
  })

  test('applies a template when creating content', async ({ page }) => {
    await login(page)
    const title = `E2E Template ${Date.now()}`
    await page.getByRole('button', { name: 'Add Content' }).first().click()
    await page.getByLabel('Content Title').fill(title)
    await page.getByLabel('Publish Date').fill('2026-10-21')
    await page.getByLabel('Template').selectOption('Carousel')
    await expect(page.getByText('Will populate')).toBeVisible()
    await page.getByRole('button', { name: 'Create content' }).click()
    await expect(page.getByText('Content added to the calendar')).toBeVisible()

    await page.getByText(title).first().click()
    await expect(page.getByTestId('content-title')).toHaveValue(title)
    await expect(page.getByText('Slide 1', { exact: true })).toBeVisible()
    await expect(page.getByText('Slide 7', { exact: true })).toBeVisible()
    await expect(page.getByPlaceholder('Slide 1 copy…')).toHaveValue(/SLIDE 1 — HOOK/)
    await page.getByRole('button', { name: 'Delete' }).click()
    await page.getByRole('button', { name: 'Delete content' }).click()
    await expect(page.getByText('Content deleted')).toBeVisible()
  })

  test('shows analytics for the current month', async ({ page }) => {
    await login(page)
    await page.getByRole('link', { name: 'Analytics' }).click()
    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible()
    await expect(page.getByText('Output · last 6 months')).toBeVisible()
    await expect(page.getByTestId('stat-planned')).toBeVisible()
  })

  test('supports deep links and refresh on /content/:id', async ({ page }) => {
    await login(page)
    const title = `E2E Deep Link ${Date.now()}`
    await addContent(page, { title, date: '2026-10-12' })
    await page.getByText(title).first().click()
    const url = page.url()

    await page.goto(url)
    await expect(page.getByTestId('content-title')).toHaveValue(title)
    await page.reload()
    await expect(page.getByTestId('content-title')).toHaveValue(title)

    await page.getByRole('button', { name: 'Delete' }).click()
    await page.getByRole('button', { name: 'Delete content' }).click()
    await expect(page.getByText('Content deleted')).toBeVisible()
  })

  test('creates many content items sequentially without the create button sticking', async ({
    page,
  }) => {
    await login(page)
    const created: string[] = []
    const unique = Date.now()

    // Regression: `saving` used to be reset only on the error path, so the very
    // first successful create left the modal permanently disabled for every
    // later open in the same page session. Each round below re-opens the modal
    // and asserts the button is enabled again before submitting.
    for (let i = 1; i <= 12; i++) {
      const title = `E2E Bulk Create ${String(i).padStart(2, '0')} ${unique}`
      await page.getByRole('button', { name: 'Add Content' }).first().click()
      await expect(page.getByRole('dialog')).toBeVisible()

      const submit = page.getByRole('button', { name: 'Create content' })
      await expect(submit, `create button is enabled on round ${i}`).toBeEnabled()
      await expect(submit).not.toHaveText(/Creating/)

      await page.getByLabel('Content Title').fill(title)
      await page.getByLabel('Publish Date').fill('2026-10-14')
      await submit.click()

      // Every create must finish: the modal closes and the success toast lands.
      await expect(page.getByRole('dialog'), `modal closes on round ${i}`).toHaveCount(0)
      // Toasts stack for a few seconds, so match the newest one only.
      await expect(page.getByText('Content added to the calendar').first()).toBeVisible()
      created.push(title)
    }

    // Every item reached Firestore, not just the modal round-trip.
    await page.getByRole('link', { name: 'Content' }).click()
    for (const title of created) {
      await page.getByLabel('Search content').fill(title)
      await expect(page.getByText(title).first(), `list shows "${title}"`).toBeVisible()
    }

    // Cleanup, one row at a time.
    for (const title of created) {
      await page.getByLabel('Search content').fill(title)
      await page.getByText(title).first().click()
      await page.getByRole('button', { name: 'Delete' }).click()
      await page.getByRole('button', { name: 'Delete content' }).click()
      await expect(page.getByText('Content deleted')).toBeVisible()
      await page.goto('/content')
    }
  })

  test('surfaces a useful error and stays usable when a create fails', async ({ page }) => {
    await login(page)

    await page.getByRole('button', { name: 'Add Content' }).first().click()
    // Firestore rejects documents over 1 MiB with a terminal error, so the write
    // fails for real (and is not retried by the SDK) instead of being mocked.
    await page.getByLabel('Content Title').fill('X'.repeat(1_200_000))
    await page.getByLabel('Publish Date').fill('2026-10-14')

    await page.getByRole('button', { name: 'Create content' }).click()

    // A useful message naming the problem, and the modal must stay open.
    const alert = page.getByRole('alert')
    await expect(alert).toBeVisible()
    await expect(alert).toContainText(/title/i)
    await expect(page.getByRole('dialog')).toBeVisible()

    // The button returns to normal so the user can fix the input and retry.
    const submit = page.getByRole('button', { name: 'Create content' })
    await expect(submit).toBeEnabled()
    await expect(submit).not.toHaveText(/Creating/)

    const retryTitle = `E2E Create Failure ${Date.now()}`
    await page.getByLabel('Content Title').fill(retryTitle)
    await submit.click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.getByText('Content added to the calendar').first()).toBeVisible()

    // Clean up the successful retry.
    await page.goto('/content')
    await page.getByText(retryTitle).first().click()
    await page.getByRole('button', { name: 'Delete' }).click()
    await page.getByRole('button', { name: 'Delete content' }).click()
    await expect(page.getByText('Content deleted').first()).toBeVisible()
  })

  test('denies Firestore access to an authenticated user outside the allowlist', async ({ request }) => {
    const { token, uid } = await signInViaEmulator(request, OUTSIDER)
    const headers = { authorization: `Bearer ${token}` }

    // Direct REST calls, no browser involved: the rules must reject this account.
    // Every payload below satisfies the attribution rules, so the email allowlist
    // is the only reason these calls are rejected.
    const read = await request.get(`${DOCS}/content`, { headers })
    expect(read.status()).toBe(403)
    expect((await read.json()).error.message).toMatch(/insufficient permissions|false for/i)

    const write = await request.patch(`${DOCS}/content/rules-denied`, {
      headers,
      data: {
        fields: {
          title: { stringValue: 'Rules test' },
          publishDate: { stringValue: '2026-10-01' },
          createdBy: { stringValue: uid },
          updatedBy: { stringValue: uid },
        },
      },
    })
    expect(write.status()).toBe(403)

    // Its own profile document: rejected by the email check, not the uid check.
    const profile = await request.patch(`${DOCS}/users/${uid}`, {
      headers,
      data: { fields: { displayName: { stringValue: 'Outsider' } } },
    })
    expect(profile.status()).toBe(403)
  })

  test('lets both allowlisted accounts read and write normally', async ({ request }) => {
    for (const creds of [MOHAMMED, TEAM]) {
      const { token, uid } = await signInViaEmulator(request, creds)
      const headers = { authorization: `Bearer ${token}` }

      expect((await request.get(`${DOCS}/content`, { headers })).status()).toBe(200)

      const docName = `rules-check-${uid}`
      const created = await request.patch(`${DOCS}/content/${docName}`, {
        headers,
        data: {
          fields: {
            title: { stringValue: 'Rules allowlist check' },
            publishDate: { stringValue: '2026-10-01' },
            createdBy: { stringValue: uid },
            updatedBy: { stringValue: uid },
          },
        },
      })
      expect(created.status(), `create as ${creds.email}`).toBe(200)

      const patched = await request.patch(
        `${DOCS}/content/${docName}?updateMask.fieldPaths=title&updateMask.fieldPaths=updatedBy`,
        {
          headers,
          data: {
            fields: {
              title: { stringValue: 'Rules allowlist check (edited)' },
              updatedBy: { stringValue: uid },
            },
          },
        },
      )
      expect(patched.status(), `update as ${creds.email}`).toBe(200)

      expect((await request.delete(`${DOCS}/content/${docName}`, { headers })).status()).toBe(200)
    }
  })

  test('rejects an account that is not on the allowlist and keeps every route locked', async ({
    page,
  }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(OUTSIDER.email)
    await page.getByLabel('Password').fill(OUTSIDER.password)
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByText('This email address is not authorized.')).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)

    // The session must be gone: every protected route stays behind the login page.
    for (const route of ['/calendar', '/content', '/analytics']) {
      await page.goto(route)
      await expect(page).toHaveURL(/\/login$/)
      await expect(page.getByRole('link', { name: 'Calendar' })).toHaveCount(0)
    }

    // A reload must not resurrect the rejected session either.
    await page.reload()
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()

    // The allowlisted teammates are unaffected.
    await page.getByLabel('Email').fill(MOHAMMED.email)
    await page.getByLabel('Password').fill(MOHAMMED.password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('link', { name: 'Calendar' })).toBeVisible()
  })

  test('signs out and blocks the dashboard again', async ({ page }) => {
    await login(page)
    await page.getByRole('button', { name: /Mohammed|mohammed/ }).click()
    await page.getByRole('menuitem', { name: 'Sign out' }).click()
    await expect(page).toHaveURL(/\/login$/)
  })

  test('offers Google sign-in and reports a cancelled pop-up', async ({ page, context }) => {
    await page.goto('/login')
    const googleButton = page.getByRole('button', { name: 'Continue with Google' })
    await expect(googleButton).toBeVisible()

    // The email/password form is untouched by the Google option.
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()

    const popupPromise = context.waitForEvent('page')
    await googleButton.click()
    const popup = await popupPromise
    await popup.close()

    await expect(page.getByText('Google sign-in was cancelled.')).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)

    // Email/password sign-in still works after a cancelled pop-up.
    await page.getByLabel('Email').fill(MOHAMMED.email)
    await page.getByLabel('Password').fill(MOHAMMED.password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('link', { name: 'Calendar' })).toBeVisible()
  })

  test('never overwrites a custom profile display name on login', async ({ page, request }) => {
    const authHeader = { authorization: 'Bearer owner' }
    const base = 'http://127.0.0.1:8080/v1/projects/demo-ationic/databases/(default)/documents'

    const listed = await request.get(`${base}/users`, { headers: authHeader })
    expect(listed.ok()).toBeTruthy()
    const { documents } = await listed.json()
    const mine = documents.find((d: any) => d.fields?.email?.stringValue === MOHAMMED.email)
    expect(mine, 'seeded user document').toBeTruthy()

    const docName = mine.name.split('/documents/')[1]
    const patch = (displayName: string) =>
      request.patch(`${base}/${docName}?updateMask.fieldPaths=displayName`, {
        headers: authHeader,
        data: { fields: { displayName: { stringValue: displayName } } },
      })

    const custom = 'Mohammed (Chief Editor)'
    expect((await patch(custom)).ok()).toBeTruthy()
    try {
      await login(page)
      await expect(page.getByRole('button', { name: custom })).toBeVisible()
    } finally {
      await patch('Mohammed')
    }
  })

  test('syncs updates between two sessions in realtime', async ({ browser }) => {
    const contextA = await browser.newContext()
    const contextB = await browser.newContext()
    const pageA = await contextA.newPage()
    const pageB = await contextB.newPage()

    await login(pageA, MOHAMMED)
    await login(pageB, TEAM)

    const title = `E2E Realtime ${Date.now()}`
    await addContent(pageA, { title, date: '2026-10-02' })
    await pageA.getByText(title).first().click()
    await pageA.getByTestId('stage-Review').click()

    // Team member sees the new item and the status change without reloading.
    await pageB.goto('/calendar')
    await expect(pageB.getByText(title).first()).toBeVisible()
    await expect(pageB.getByTestId('day-2026-10-02').getByText('Review')).toBeVisible()

    // Edit from B, observe from A.
    await pageB.getByText(title).first().click()
    await expect(pageB.getByTestId('content-title')).toHaveValue(title)
    await notesBox(pageB).fill('Note from team member')

    await expect(notesBox(pageA)).toHaveValue('Note from team member')
    await expect(pageA.getByText('Updated By').or(pageA.getByText('Last Updated By'))).toBeVisible()

    // Cleanup from session A — session B is pushed back to the list.
    await pageA.getByRole('button', { name: 'Delete' }).click()
    await pageA.getByRole('button', { name: 'Delete content' }).click()
    await expect(pageA.getByText('Content deleted')).toBeVisible()
    await expect(pageB).toHaveURL(/\/content$/)

    await contextA.close()
    await contextB.close()
  })
})