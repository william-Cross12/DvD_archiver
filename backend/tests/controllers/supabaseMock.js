// Mock the supabase client so it can be tested effectively

const mockSupabase = {
    auth: {
        signUp: jest.fn(() => ({
            data: {
                user: {
                    id: 'mock-userID'
                }
            },
            error: null
        })),
    },
    from: jest.fn(() => ({
        insert: jest.fn(() => ({
            error: null
        })),
    })),
};

export default mockSupabase;
