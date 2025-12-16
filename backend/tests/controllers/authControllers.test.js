import { afterEach, expect, jest } from '@jest/globals';

// Mock Supabase `insert`, `signup` and `from` methods for signUp tests
const insertMock = jest.fn();
const signupMock = jest.fn();
const fromMock = jest.fn(() => ({
    insert: insertMock
}));

// Mock Supabase `signInWithPassword` method for login tests
const loginMock = jest.fn();

// Mock Supabase `updateUser` method for updateAuthUser tests
const updateMock = jest.fn();

// Mock Supabase `delete` method for deleteUser tests
const deleteMock = jest.fn();

// Create a Supabase mock
jest.unstable_mockModule('../../src/supabase.js', () => ({
    supabase: {
        auth: {
            signUp: signupMock,
            signInWithPassword: loginMock,
            updateUser: updateMock,
            admin: {
                deleteUser: deleteMock
            }
        },
        from: fromMock
    }
}));

const { signUp, login, updateAuthUser, deleteUser } = await import('../../src/controllers/authControllers.js')

describe('signUp authController tests', () => {
    const signUpOptions = ["user@test.com", "password", "user test"];

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('successfully signs up and inserts user', async () => {
        signupMock.mockResolvedValueOnce({
            data: {
                user: {
                    id: 'mock-userID'
                }
            },
            error: null
        });
        insertMock.mockResolvedValueOnce({ error: null });

        const result = await signUp("user@test.com", "password", "user test");

        // Check mocked signUp, from and insert were called correctly,
        // and the correct data was returned.
        expect(signupMock).toHaveBeenCalledTimes(1);
        expect(signupMock).toHaveBeenCalledWith({
            email: "user@test.com",
            password: "password",
        });

        // Check mocked from and insert were called, and returned the correct data
        expect(fromMock).toHaveBeenCalledWith('users');

        expect(insertMock).toHaveBeenCalledWith({
            user_id: "mock-userID",
            username: "user test"
        });

        expect(result).toEqual({
            user: {
                id: 'mock-userID'
            }
        });
    });

    it('throws email already in use error if signUp error contains "already registered"', async () => {
        signupMock.mockResolvedValueOnce({
            data: null,
            error: {
                message: 'Email already registered'
            }
        });

        // Check mocked signUp threw an error, so mocked insert was not called
        await expect(signUp(...signUpOptions))
            .rejects
            .toThrow('Email already in use');

        expect(insertMock).not.toHaveBeenCalled();
    });

    it('throws error if signUp fails for other reasons', async () => {
        signupMock.mockResolvedValueOnce({
            data: null,
            error: {
                message: 'Unexpected error'
            }
        });

        // Check mocked signUp threw an error, so mocked insert was not called
        await expect(signUp(...signUpOptions))
            .rejects
            .toThrow('Unexpected error');

        expect(insertMock).not.toHaveBeenCalled();
    });

    it('throws username already taken error if insert error contained duplicate key value', async () => {
        signupMock.mockResolvedValueOnce({
            data: {
                user: {
                    id: 'mock-userID'
                }
            },
            error: null
        });

        insertMock.mockResolvedValueOnce({
            error: {
                message: 'duplicate key value violates unique constraint',
                code: '23505'
            }
        });

        // Check mocked insert was called and threw an error
        await expect(signUp(...signUpOptions))
            .rejects
            .toThrow('Username already taken')

        expect(insertMock).toHaveBeenCalled();
    });

    it('throws error if insert fails for other reasons', async () => {
        signupMock.mockResolvedValueOnce({
            data: {
                user: {
                    id: 'mock-userID'
                }
            },
            error: null
        });

        insertMock.mockResolvedValueOnce({
            error: {
                message: 'Unexpected error',
                code: '99999'
            }
        });

        // Check mocked insert was called and threw an error
        await expect(signUp(...signUpOptions))
            .rejects
            .toThrow('Unexpected error')

        expect(insertMock).toHaveBeenCalled();
    });
});

describe('login authController tests', () => {
    const loginOptions = ["user@test.com", "password"];

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('successfully logs in and returns user data', async () => {
        const mockUserData = {
            user: {
                id: 'mock-userID',
                email: 'user@test.com'
            },
            session: {
                access_token: 'mock-token'
            }
        };

        loginMock.mockResolvedValueOnce({
            data: mockUserData,
            error: null
        });

        const result = await login(...loginOptions);

        // Check mocked login was called and returned the correct data
        expect(loginMock).toHaveBeenCalledWith({
            email: 'user@test.com',
            password: 'password'
        });

        expect(result).toEqual(mockUserData);
    });

    it('throws error if login fails', async () => {
        const loginError = new Error('Invalid login credentials');

        loginMock.mockResolvedValueOnce({
            data: null,
            error: loginError
        });

        // Check mocked login was called and threw an error
        await expect(login(...loginOptions))
            .rejects
            .toThrow('Invalid login credentials');

        expect(loginMock).toHaveBeenCalled();
    });
});

describe('updateAuthUser authController tests', () => {
    const token = 'mock_token';
    const updates = {
        email: 'newemail@test.com'
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('successfully updates user and returns data', async () => {
        const mockData = {
            user: {
                id: 'userID',
                email: 'newemail@test.com'
            }
        };

        updateMock.mockResolvedValueOnce({
            data: mockData,
            error: null
        });

        const result = await updateAuthUser(token, updates);

        // Check mocked updateAuthUser was called correctly,
        // and returned the correct data.
        expect(updateMock).toHaveBeenCalledWith(
            updates,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        expect(result).toEqual(mockData);
    });

    it('throws error if updateUser fails', async () => {
        const updateError = new Error('Update failed');

        updateMock.mockResolvedValueOnce({
            data: null,
            error: updateError
        });

        // Check mocked updateUser was called and threw an error
        await expect(updateAuthUser(token, updates))
            .rejects
            .toThrow('Update failed');

        expect(updateMock).toHaveBeenCalled();
    });
});

describe('deleteUser authController tests', () => {
    const userID = 'mock-userID';

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('successfully deletes a user', async () => {
        deleteMock.mockResolvedValueOnce({
            error: null
        });

        // Check deleteUser mock was called once and processed successfully
        await expect(deleteUser(userID))
            .resolves
            .toBeUndefined();

        expect(deleteMock).toHaveBeenCalledWith(userID);
        expect(deleteMock).toHaveBeenCalledTimes(1);
    });

    it('throws error if deletion fails', async () => {
        const deleteError = new Error('User deletion failed');

        deleteMock.mockResolvedValueOnce({
            error: deleteError
        });

        // Check deleteUser mock was called once and failed as expected
        await expect(deleteUser(userID))
            .rejects
            .toThrow('User deletion failed');

        expect(deleteMock).toHaveBeenCalledWith(userID);
        expect(deleteMock).toHaveBeenCalledTimes(1);
    });
});
