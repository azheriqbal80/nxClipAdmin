import { http, HttpResponse } from 'msw'

const ADMIN = {
  id: 'admin-1',
  email: 'admin@nxclip.com',
  username: 'admin',
  displayName: 'Admin User',
  plan: 'STUDIO',
  emailVerified: true,
  roles: ['admin'],
  createdAt: '2026-01-01T00:00:00.000Z',
  onboardingCompleted: true,
  onboardingPlan: null,
}

export const authHandlers = [
  http.post('*/auth/login', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string
      password?: string
    }
    const ok = !!body.email && (body.password?.length ?? 0) >= 4
    if (!ok) {
      return HttpResponse.json(
        { statusCode: 401, message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' },
        { status: 401 },
      )
    }
    return HttpResponse.json({
      user: { ...ADMIN, email: body.email },
      accessToken: `mock-access-${Date.now()}`,
      refreshToken: `mock-refresh-${Date.now()}`,
    })
  }),

  http.get('*/auth/me', ({ request }) => {
    if (!request.headers.get('Authorization')) {
      return HttpResponse.json(
        { statusCode: 401, message: 'Authentication required' },
        { status: 401 },
      )
    }
    return HttpResponse.json(ADMIN)
  }),

  http.post('*/auth/refresh', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { refreshToken?: string }
    if (!body.refreshToken) {
      return HttpResponse.json(
        { statusCode: 401, message: 'Invalid refresh token', code: 'INVALID_REFRESH_TOKEN' },
        { status: 401 },
      )
    }
    return HttpResponse.json({
      accessToken: `mock-access-${Date.now()}`,
      refreshToken: `mock-refresh-${Date.now()}`,
    })
  }),

  /** Mirrors live: the refresh token being revoked must be in the body. A
      bodiless call 400s, which is what silently broke sign-out once already. */
  http.post('*/auth/logout', async ({ request }) => {
    const body = (await request.json().catch(() => null)) as { refreshToken?: string } | null
    const token = body?.refreshToken ?? (body as { RefreshToken?: string } | null)?.RefreshToken
    if (!token) {
      return HttpResponse.json(
        {
          title: 'One or more validation errors occurred.',
          status: 400,
          errors: { RefreshToken: ['The RefreshToken field is required.'] },
        },
        { status: 400 },
      )
    }
    return new HttpResponse(null, { status: 204 })
  }),
]
