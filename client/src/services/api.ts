import { apiClient } from './apiClient';

/**
 * API call that returns a promise with retry logic
 * @param id some identifier
 * @returns Promise
 *
 * @see https://tanstack.com/query/v3/docs/react/overview
 */
export async function getPosts(id: string) {
	return await apiClient.get(`/posts/${id}`);
}
