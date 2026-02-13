import { describe, it, expect, vi, beforeEach } from 'vitest';

// Stub fetch before importing authOptions to ensure it uses the stub
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

// Now import the module under test
import { authOptions, authorize } from './auth';

describe('Auth Configuration', () => {
  beforeEach(() => {
    fetchMock.mockClear();
  });

  describe('authorize function', () => {
    it('should return null if email is missing', async () => {
      const result = await authorize({ password: 'any' });
      expect(result).toBeNull();
    });

    it('should return user object on successful login', async () => {
      const mockUser = {
        id: 'u1',
        name: 'Test User',
        email: 'test@example.com',
        avatar: 'avatar.png',
        role: 'ADMIN',
        needsOnboarding: false
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser
      });

      const result = await authorize({
        email: 'test@example.com',
        password: 'password',
        otp: '123456'
      });

      expect(result).not.toBeNull();
      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        image: mockUser.avatar,
        role: mockUser.role,
        needsOnboarding: mockUser.needsOnboarding
      });
      
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8080/api/login",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password',
            otp: '123456'
          })
        })
      );
    });

    it('should return null if login fails', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false
      });

      const result = await authorize({
        email: 'test@example.com',
        password: 'wrong'
      });

      expect(result).toBeNull();
    });

    it('should return null on network error', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      const result = await authorize({
        email: 'test@example.com',
        password: 'any'
      });

      expect(result).toBeNull();
    });
  });

  describe('callbacks', () => {
    it('jwt callback should add custom fields to token', async () => {
      const token = { sub: 'u1' };
      const user = { role: 'ADMIN', needsOnboarding: true };
      
      const result = await (authOptions.callbacks as any).jwt({ token, user });
      
      expect(result.role).toBe('ADMIN');
      expect(result.needsOnboarding).toBe(true);
    });

    it('session callback should add custom fields to session', async () => {
      const session = { user: { name: 'Test' } };
      const token = { role: 'ADMIN', needsOnboarding: true, sub: 'u1' };
      
      const result = await (authOptions.callbacks as any).session({ session, token });
      
      expect(result.user.role).toBe('ADMIN');
      expect(result.user.needsOnboarding).toBe(true);
      expect(result.user.id).toBe('u1');
    });
  });
});
