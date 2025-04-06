import { create } from 'zustand';
import api from '../lib/axios';

const usePostStore = create((set) => ({
    posts: [],
    loading: true,
    createPostLoading: false,
    likePostLoading: false,
    commentPostLoading: false,
    deletePostLoading: false,
    currentPage: 1,
    hasMore: true,

    // Fetch posts with pagination
    fetchPosts: async (page = 1, userId = null) => {
        try {
            const url = userId 
                ? `/posts?page=${page}&userId=${userId}`
                : `/posts?page=${page}`;
            
            const response = await api.get(url);
            set((state) => ({
                posts: page === 1 ? response.data.posts : [...state.posts, ...response.data.posts],
                currentPage: page,
                hasMore: response.data.hasMore,
                loading: false
            }));
        } catch (error) {
            set({ loading: false });
            throw error;
        }
    },

    // Load more posts
    loadMorePosts: async () => {
        const { currentPage, hasMore, fetchPosts } = usePostStore.getState();
        if (!hasMore) return;  // Don't load more if no more posts
        
        const nextPage = currentPage + 1;  // Calculate next page
        await fetchPosts(nextPage);  // Fetch next page of posts
    },

    // Create a new post
    createPost: async (postData) => {
        set({ createPostLoading: true });
        try {
            const response = await api.post('/posts', postData);
            set((state) => ({
                posts: [response.data, ...state.posts],
            }));
            return response.data;
        } catch (error) {
            throw error;
        } finally {
            set({ createPostLoading: false });
        }
    },

    // Reset posts
    resetPosts: () => {
        set({
            posts: [],
            currentPage: 1,  // Reset to first page
            hasMore: true,
            loading: true
        });
    },

    // Like a post
    likePost: async (postId) => {
        set({ likePostLoading: true });
        try {
            const response = await api.post(`/posts/like/${postId}`);
            set((state) => ({
                posts: state.posts.map((post) =>
                    post._id === postId ? response.data : post
                ),
            }));
            return response.data;
        } catch (error) {
            throw error;
        } finally {
            set({ likePostLoading: false });
        }
    },

    // Unlike a post
    unlikePost: async (postId) => {
        set({ likePostLoading: true });
        try {
            const response = await api.post(`/posts/unlike/${postId}`);
            set((state) => ({
                posts: state.posts.map((post) =>
                    post._id === postId ? response.data : post
                ),
            }));
            return response.data;
        } catch (error) {
            throw error;
        } finally {
            set({ likePostLoading: false });
        }
    },

    // Comment on a post
    commentPost: async ({ postId, content, image }) => {
        set({ commentPostLoading: true });
        try {
            const formData = new FormData();
            formData.append('content', content);
            if (image) {
                formData.append('image', image);
            }

            const response = await api.post(`/posts/comment/${postId}`, formData, {
            });
            set((state) => ({
                posts: state.posts.map((post) =>
                    post._id === postId ? response.data : post
                ),
            }));
            return response.data;
        } catch (error) {
            throw error;
        } finally {
            set({ commentPostLoading: false });
        }
    },

    // Delete a post
    deletePost: async (postId) => {
        set({ deletePostLoading: true });
        try {
            await api.delete(`/posts/${postId}`);
            set((state) => ({
                posts: state.posts.filter((post) => post._id !== postId),
            }));
        } catch (error) {
            throw error;
        } finally {
            set({ deletePostLoading: false });
        }
    },

    // Get posts by user
    getUserPosts: async (username) => {
        try {
            const response = await api.get(`/posts/user/${username}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get post by id
    getPostById: async (postId) => {
        try {
            const response = await api.get(`/posts/${postId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
}));

export default usePostStore; 