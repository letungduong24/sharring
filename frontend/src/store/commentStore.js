import { create } from 'zustand';
import api from '../lib/axios';

const useCommentStore = create((set, get) => ({
    // State
    commentsByPost: {}, // { postId: { data: [], page: 1, hasMore: true } }
    loadingStates: {}, // { postId: boolean }
    submitting: false,

    // Initialize comments for a post
    initializeComments: (postId, initialComments = []) => {
        set((state) => ({
            commentsByPost: {
                ...state.commentsByPost,
                [postId]: {
                    data: initialComments,
                    page: 1,
                    hasMore: initialComments.length >= 6
                }
            }
        }));
    },

    // Fetch comments for a post
    fetchComments: async (postId, page = 1) => {
        const currentState = get().commentsByPost[postId];
        
        // Don't fetch if we're already at the end
        if (currentState && !currentState.hasMore && page > 1) return;

        set((state) => ({
            loadingStates: { ...state.loadingStates, [postId]: true }
        }));

        try {
            const response = await api.get(`/posts/comments/${postId}?page=${page}`);
            
            set((state) => ({
                commentsByPost: {
                    ...state.commentsByPost,
                    [postId]: {
                        data: page === 1 
                            ? response.data.comments 
                            : [...(state.commentsByPost[postId]?.data || []), ...response.data.comments],
                        page: response.data.currentPage,
                        hasMore: response.data.hasMore
                    }
                }
            }));
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            set((state) => ({
                loadingStates: { ...state.loadingStates, [postId]: false }
            }));
        }
    },

    // Load more comments
    loadMore: async (postId) => {
        const currentState = get().commentsByPost[postId];
        if (!currentState || !currentState.hasMore) return;

        await get().fetchComments(postId, currentState.page + 1);
    },

    // Add a new comment
    addComment: async (postId, content, image = null) => {
        set({ submitting: true });

        try {
            const formData = new FormData();
            formData.append('content', content);
            if (image) {
                formData.append('image', image);
            }

            const response = await api.post(`/posts/comment/${postId}`, formData);
            const newComment = response.data.comments[0];

            set((state) => ({
                commentsByPost: {
                    ...state.commentsByPost,
                    [postId]: {
                        ...state.commentsByPost[postId],
                        data: [newComment, ...(state.commentsByPost[postId]?.data || [])]
                    }
                }
            }));

            return newComment;
        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        } finally {
            set({ submitting: false });
        }
    },

    // Delete a comment
    deleteComment: async (postId, commentId) => {
        try {
            await api.delete(`/posts/comment/${postId}/${commentId}`);
            
            set((state) => ({
                commentsByPost: {
                    ...state.commentsByPost,
                    [postId]: {
                        ...state.commentsByPost[postId],
                        data: state.commentsByPost[postId].data.filter(
                            comment => comment._id !== commentId
                        )
                    }
                }
            }));
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw error;
        }
    },

    // Clear comments for a specific post
    clearComments: (postId) => {
        set((state) => {
            const newCommentsByPost = { ...state.commentsByPost };
            delete newCommentsByPost[postId];
            return { commentsByPost: newCommentsByPost };
        });
    },

    // Clear all comments (useful for logout)
    clearAllComments: () => {
        set({ commentsByPost: {}, loadingStates: {} });
    },

    // Getters
    getComments: (postId) => get().commentsByPost[postId]?.data || [],
    isLoading: (postId) => get().loadingStates[postId] || false,
    hasMore: (postId) => get().commentsByPost[postId]?.hasMore || false,
    isSubmitting: () => get().submitting
}));

export default useCommentStore; 