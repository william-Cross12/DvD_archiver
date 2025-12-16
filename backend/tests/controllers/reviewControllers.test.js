import { afterEach, expect, jest } from '@jest/globals';

// Mock Supabase `select`, `eq`, `order` and `from` methods for getReview tests
const selectMock = jest.fn();
const eqMock = jest.fn();
const orderMock = jest.fn();
const fromMock = jest.fn(() => ({
    select: selectMock
}));

// Create a Supabase mock
jest.unstable_mockModule('../../src/supabase.js', () => ({
    supabase: {
        from: fromMock
    }
}));

const { getReviewsByUser } = await import('../../src/controllers/reviewControllers.js');

describe('getReviewsByUser reviewController tests', () => {
    const userID = 'mock-userID';

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('successfully returns reviews for a user', async () => {
        const mockReviews = [{
            id: 1,
            review: 'Amazing'
        }];

        selectMock.mockReturnValue({
            eq: eqMock.mockReturnValue({
                order: orderMock.mockResolvedValueOnce({
                    data: mockReviews,
                    error: null
                })
            })
        });

        // Checked the expected mocked functions were called correcty,
        // and that the correct data was returned
        await expect(getReviewsByUser(userID))
            .resolves
            .toEqual(mockReviews);

        expect(fromMock).toHaveBeenCalledWith('filmReviews');
        expect(selectMock).toHaveBeenCalledWith('*');
        expect(eqMock).toHaveBeenCalledWith('user_id', userID);
        expect(orderMock).toHaveBeenCalledWith('created_at', {
            ascending: false
        });
    });

    it('throws error if Supabase returns an error', async () => {
        const fetchError = new Error('Supabase error');

        selectMock.mockReturnValue({
            eq: eqMock.mockReturnValue({
                order: orderMock.mockResolvedValueOnce({
                    data: null,
                    error: fetchError
                })
            })
        });

        // Check getReviewsByUser failed as expected
        await expect(getReviewsByUser(userID))
            .rejects
            .toThrow('Failed to fetch reviews by this user');
    });

    it('throws error if no reviews are found', async () => {
        selectMock.mockReturnValue({
            eq: eqMock.mockReturnValue({
                order: orderMock.mockResolvedValueOnce({
                    data: [],
                    error: null
                })
            })
        });

        // Check getReviewsByUser failed as expected
        await expect(getReviewsByUser(userID))
            .rejects
            .toThrow('No reviews found by this user');
    });
});
