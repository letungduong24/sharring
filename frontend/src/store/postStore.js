import { create } from 'zustand';
import api from '../lib/axios';

const usePostStore = create((set) => ({
    // Feed posts state
    feedPosts: [],
    feedLoading: true,
    feedLoadingMore: false,
    feedCurrentPage: {
        following: 1,
        explore: 1,
        search: 1
    },
    feedHasMore: {
        following: true,
        explore: true,
        search: true
    },
    feedType: null,
    searchQuery: '',

    // Profile posts state
    profilePosts: [],
    profileLoading: true,
    profileLoadingMore: false,
    profileCurrentPage: 1,
    profileHasMore: true,
    profileUserId: null,

    // Other states
    currentPost: null,
    createPostLoading: false,
    likePostLoading: false,
    commentPostLoading: false,
    deletePostLoading: false,
    isLoadingPost: false,

    // Fetch feed posts with pagination
    fetchFeedPosts: async (page = 1, type = null, searchQuery = '') => {
        set({ 
            feedLoading: page === 1, 
            feedLoadingMore: page > 1,
            feedType: type,
            searchQuery: searchQuery
        });
        try {
            let url = `/posts?page=${page}`;
            if (type) {
                url += `&type=${type}`;
            }
            if (searchQuery) {
                url += `&search=${searchQuery}`;
            }
            
            const response = await api.get(url);
            const { posts: newPosts, hasMore } = response.data;
            
            set((state) => ({
                feedPosts: page === 1 || state.searchQuery !== searchQuery ? newPosts : [...state.feedPosts, ...newPosts],
                feedCurrentPage: {
                    ...state.feedCurrentPage,
                    [type]: page
                },
                feedHasMore: {
                    ...state.feedHasMore,
                    [type]: hasMore
                },
                feedLoading: false,
                feedLoadingMore: false
            }));
        } catch (error) {
            set({ feedLoading: false, feedLoadingMore: false });
            throw error;
        }
    },

    // Fetch profile posts with pagination
    fetchProfilePosts: async (page = 1, userId) => {
        set({ 
            profileLoading: page === 1, 
            profileLoadingMore: page > 1,
            profileUserId: userId
        });
        try {
            const response = await api.get(`/posts?page=${page}&userId=${userId}`);
            const { posts: newPosts, hasMore } = response.data;
            
            set((state) => ({
                profilePosts: page === 1 ? newPosts : [...state.profilePosts, ...newPosts],
                profileCurrentPage: page,
                profileHasMore: hasMore,
                profileLoading: false,
                profileLoadingMore: false
            }));
        } catch (error) {
            set({ profileLoading: false, profileLoadingMore: false });
            throw error;
        }
    },

    // Load more posts
    loadMorePosts: async (type = null, userId = null, searchQuery = '') => {
        const { 
            feedCurrentPage, 
            feedHasMore, 
            feedType,
            profileCurrentPage,
            profileHasMore,
            profileUserId,
            fetchFeedPosts, 
            fetchProfilePosts 
        } = usePostStore.getState();

        if (userId) {
            if (!profileHasMore) return;
            await fetchProfilePosts(profileCurrentPage + 1, profileUserId);
        } else {
            if (!feedHasMore[type]) return;
            await fetchFeedPosts(feedCurrentPage[type] + 1, type, searchQuery);
        }
    },

    // Reset feed posts
    resetFeedPosts: () => {
        set((state) => ({
            feedPosts: [],
            feedCurrentPage: {
                ...state.feedCurrentPage,
                [state.feedType]: 1
            },
            feedHasMore: {
                ...state.feedHasMore,
                [state.feedType]: true
            },
            feedLoading: true,
            feedLoadingMore: false
        }));
    },

    // Reset profile posts
    resetProfilePosts: () => {
        set({
            profilePosts: [],
            profileCurrentPage: 1,
            profileHasMore: true,
            profileLoading: true,
            profileLoadingMore: false
        });
    },

    // Get current posts based on context
    getCurrentPosts: (userId) => {
        const state = usePostStore.getState();
        if (userId) {
            return {
                posts: state.profilePosts,
                loading: state.profileLoading,
                isLoadingMore: state.profileLoadingMore,
                hasMore: state.profileHasMore
            };
        } else {
            return {
                posts: state.feedPosts,
                loading: state.feedLoading,
                isLoadingMore: state.feedLoadingMore,
                hasMore: state.feedHasMore[state.feedType]
            };
        }
    },

    getPostById: async (postId) => {
        set({ isLoadingPost: true });
        try {
            const response = await api.get(`/posts/${postId}`);
            set({ currentPost: response.data, isLoadingPost: false });
            return response.data;
        } catch (error) {
            set({ isLoadingPost: false, currentPost: null });
            throw error;
        }
    },

    // Create a new post
    createPost: async (postData, isFromProfile = false) => {
        set({ createPostLoading: true });
        try {
            const response = await api.post('/posts', postData);
            if (isFromProfile) {
                set((state) => ({
                    profilePosts: state.profileUserId === response.data.author._id 
                        ? [response.data, ...state.profilePosts]
                        : state.profilePosts
                }));
            }
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
            currentPage: 1,
            hasMore: true,
            loading: true,
            isLoadingMore: false
        });
    },

    // Like a post
    likePost: async (postId) => {
        set({ likePostLoading: true });
        try {
            const response = await api.post(`/posts/like/${postId}`);
            set((state) => ({
                feedPosts: state.feedPosts.map((post) =>
                    post._id === postId ? response.data : post
                ),
                profilePosts: state.profilePosts.map((post) =>
                    post._id === postId ? response.data : post
                ),
                currentPost: state.currentPost?._id === postId ? response.data : state.currentPost
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
                feedPosts: state.feedPosts.map((post) =>
                    post._id === postId ? response.data : post
                ),
                profilePosts: state.profilePosts.map((post) =>
                    post._id === postId ? response.data : post
                ),
                currentPost: state.currentPost?._id === postId ? response.data : state.currentPost
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

            const response = await api.post(`/posts/comment/${postId}`, formData);
            set((state) => ({
                feedPosts: state.feedPosts.map((post) =>
                    post._id === postId ? response.data : post
                ),
                profilePosts: state.profilePosts.map((post) =>
                    post._id === postId ? response.data : post
                ),
                currentPost: state.currentPost?._id === postId ? response.data : state.currentPost
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
                feedPosts: state.feedPosts.filter((post) => post._id !== postId),
                profilePosts: state.profilePosts.filter((post) => post._id !== postId)
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

    // Update post's comment count
    updatePostCommentCount: (postId, count) => {
        set((state) => ({
            feedPosts: state.feedPosts.map((post) =>
                post._id === postId ? { ...post, comments: post.comments.filter(c => c !== null) } : post
            ),
            profilePosts: state.profilePosts.map((post) =>
                post._id === postId ? { ...post, comments: post.comments.filter(c => c !== null) } : post
            ),
            currentPost: state.currentPost?._id === postId 
                ? { ...state.currentPost, comments: state.currentPost.comments.filter(c => c !== null) }
                : state.currentPost
        }));
    },

    // Update a post
    updatePost: async (postId, postData) => {
        try {
            const response = await api.put(`/posts/${postId}`, postData);
            set((state) => ({
                feedPosts: state.feedPosts.map((post) =>
                    post._id === postId ? response.data : post
                ),
                profilePosts: state.profilePosts.map((post) =>
                    post._id === postId ? response.data : post
                ),
                currentPost: state.currentPost?._id === postId ? response.data : state.currentPost
            }));
            return response.data;
        } catch (error) {
            throw error;
        }
    },
}));

export default usePostStore;