import { http, HttpResponse } from 'msw';

// Use wildcard to match any domain
const baseUrl = 'http://localhost';

export const handlers = [
  // Auth endpoints
  http.post(`${baseUrl}/api/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { username: string; password: string };
    if (body.username === 'testuser' && body.password === 'password') {
      return HttpResponse.json({
        user: {
          id: 1,
          username: 'testuser',
          role: 'user',
          dark_mode: true,
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
        },
        token: 'mock-token',
      });
    }
    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }),

  http.get(`${baseUrl}/api/auth/check-admin`, () => {
    return HttpResponse.json({ hasAdmin: true });
  }),

  http.post(`${baseUrl}/api/auth/initial-admin`, async ({ request }) => {
    const body = (await request.json()) as { username: string; password: string };
    return HttpResponse.json({
      user: {
        id: 1,
        username: body.username,
        role: 'admin',
        dark_mode: true,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      },
      token: 'admin-token',
    });
  }),

  http.post(`${baseUrl}/api/auth/verify`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (authHeader === 'Bearer mock-token') {
      return HttpResponse.json({
        user: {
          id: 1,
          username: 'testuser',
          role: 'user',
          dark_mode: true,
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
        },
        token: 'new-token',
      });
    }
    return HttpResponse.json({ error: 'Invalid token' }, { status: 401 });
  }),

  http.put(`${baseUrl}/api/auth/preferences`, async ({ request }) => {
    const body = (await request.json()) as { dark_mode: boolean };
    return HttpResponse.json({
      user: {
        id: 1,
        username: 'testuser',
        role: 'user',
        dark_mode: body.dark_mode,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      },
    });
  }),

  http.put(`${baseUrl}/api/auth/change-password`, async ({ request }) => {
    const body = (await request.json()) as { currentPassword: string; newPassword: string };
    if (body.currentPassword === 'oldpass') {
      return HttpResponse.json({ message: 'Password changed successfully' });
    }
    return HttpResponse.json({ error: 'Invalid current password' }, { status: 400 });
  }),

  // OTP endpoints
  http.get(`${baseUrl}/api/otp`, () => {
    return HttpResponse.json({
      available: [
        {
          id: 1,
          code: '123456',
          status: 'unused',
          created_at: '2023-01-01',
          created_by: 1,
          used_at: null,
          used_by: null,
        },
        {
          id: 2,
          code: '789012',
          status: 'unused',
          created_at: '2023-01-02',
          created_by: 1,
          used_at: null,
          used_by: null,
        },
      ],
      recentlyUsed: [],
      totalAvailable: 2,
    });
  }),

  http.put(`${baseUrl}/api/otp/:id/use`, ({ params }) => {
    return HttpResponse.json({ message: `OTP ${params.id} marked as used` });
  }),

  // Admin OTP endpoints
  http.post(`${baseUrl}/api/admin/otp`, async ({ request }) => {
    const body = (await request.json()) as { codes: string[] };
    return HttpResponse.json({ count: body.codes.length });
  }),

  http.post(`${baseUrl}/api/admin/otp/file`, async () => {
    return HttpResponse.json({ count: 10 });
  }),

  http.get(`${baseUrl}/api/admin/otp`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    return HttpResponse.json({
      otps: [
        {
          id: 1,
          code: '123456',
          status: status === 'used' ? 'used' : 'unused',
          created_at: '2023-01-01',
          created_by: 1,
          used_at: null,
          used_by: null,
        },
      ],
      stats: {
        total: 1,
        used: status === 'used' ? 1 : 0,
        unused: status === 'used' ? 0 : 1,
      },
    });
  }),

  http.delete(`${baseUrl}/api/admin/otp/:id`, ({ params }) => {
    return HttpResponse.json({ message: `OTP ${params.id} deleted` });
  }),

  http.post(`${baseUrl}/api/admin/otp/bulk/delete`, async ({ request }) => {
    const body = (await request.json()) as { ids: number[] };
    return HttpResponse.json({ count: body.ids.length });
  }),

  http.post(`${baseUrl}/api/admin/otp/bulk/mark-used`, async ({ request }) => {
    const body = (await request.json()) as { ids: number[] };
    return HttpResponse.json({ count: body.ids.length });
  }),

  http.post(`${baseUrl}/api/admin/otp/bulk/mark-unused`, async ({ request }) => {
    const body = (await request.json()) as { ids: number[] };
    return HttpResponse.json({ count: body.ids.length });
  }),

  // Admin user endpoints
  http.get(`${baseUrl}/api/admin/users`, () => {
    return HttpResponse.json({
      users: [
        {
          id: 1,
          username: 'user1',
          role: 'user',
          dark_mode: true,
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
        },
        {
          id: 2,
          username: 'admin1',
          role: 'admin',
          dark_mode: false,
          created_at: '2023-01-02',
          updated_at: '2023-01-02',
        },
      ],
    });
  }),

  http.post(`${baseUrl}/api/admin/users`, async ({ request }) => {
    const body = (await request.json()) as { username: string; password: string; role: string };
    return HttpResponse.json({
      user: {
        id: 3,
        username: body.username,
        role: body.role,
        dark_mode: true,
        created_at: '2023-01-03',
        updated_at: '2023-01-03',
      },
    });
  }),

  http.put(`${baseUrl}/api/admin/users/:id`, async ({ params, request }) => {
    const body = (await request.json()) as { role?: string; password?: string };
    return HttpResponse.json({
      user: {
        id: Number(params.id),
        username: 'updateduser',
        role: body.role || 'user',
        dark_mode: false,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      },
    });
  }),

  http.delete(`${baseUrl}/api/admin/users/:id`, ({ params }) => {
    return HttpResponse.json({ message: `User ${params.id} deleted` });
  }),

  // Admin settings endpoints
  http.get(`${baseUrl}/api/admin/settings`, () => {
    return HttpResponse.json({
      settings: { app_name: 'OTP Manager', version: '1.0.0' },
    });
  }),

  http.put(`${baseUrl}/api/admin/settings`, async ({ request }) => {
    const body = (await request.json()) as { settings: Record<string, string> };
    return HttpResponse.json({
      message: 'Settings updated',
      settings: body.settings,
    });
  }),

  http.get(`${baseUrl}/api/admin/backup`, () => {
    return HttpResponse.arrayBuffer(new ArrayBuffer(8));
  }),

  // Parser endpoints
  http.get(`${baseUrl}/api/parsers/metadata`, () => {
    return HttpResponse.json([
      { id: 'vendor1', name: 'Vendor 1', description: 'Parser for Vendor 1' },
      { id: 'vendor2', name: 'Vendor 2', description: 'Parser for Vendor 2' },
    ]);
  }),
];
