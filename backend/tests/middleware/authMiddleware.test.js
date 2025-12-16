import { beforeEach, expect, jest } from '@jest/globals';

// Mock Supabase `auth.getUser` method
const getUserMock = jest.fn();

// Create a Supabase mock
jest.unstable_mockModule('../../src/supabase.js', () => ({
    supabase: {
        auth: {
            getUser: getUserMock
        }
    }
}));

const { requireAuth } = await import('../../src/middleware/authMiddleware.js');

describe('requireAuth middleware tests', () => {
    let res, req, next;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock req, res and next
        req = { headers: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    it('attaches user to request and calls next if token is valid', async () => {
        req.headers.authorization = 'Bearer valid';

        const mockUser = { id: 'ab12', email: 'user@test.com'};

        // Mocking Supabase returning the valid user
        getUserMock.mockResolvedValue({
            data: { user: mockUser },
            error: null
        });

        await requireAuth(req, res, next);

        // Check user was attached to the request,
        // and the middleware function continued.
        expect(getUserMock).toHaveBeenCalledWith('valid');
        expect(req.user).toEqual(mockUser);
        expect(next).toHaveBeenCalled();
    });

    it('sends a 401 response if token is invalid', async () => {
        req.headers.authorization = 'Bearer invalid';

        // Mocking Supabase rejecting the token
        getUserMock.mockResolvedValue({
            data: { user: null },
            error: new Error('Invalid token')
        });

        await requireAuth(req, res, next);

        // Check response has the correct error code and message,
        // and the middleware function didn't continue,
        // but that getUser was still called.
        expect(getUserMock).toHaveBeenCalledWith('invalid');
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
        expect(next).not.toHaveBeenCalled();
    });

    it('sends a 401 response if token is not present', async () => {
        await requireAuth(req, res, next);

        // Check response has the correct error code and message,
        // and the middleware function didn't continue.
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Missing token' });
        expect(next).not.toHaveBeenCalled();
    });
});
