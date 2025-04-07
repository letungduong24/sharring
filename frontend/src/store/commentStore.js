import { create } from 'zustand';
import api from '../lib/axios';
import usePostStore from './postStore';

const useCommentStore = create((set, get) => ({
    // State
    comments: [],
    page: 1,
    hasMore: true,
    loading: false,
    loadingMore: false,
    submitting: false,

    // Fetch comments for a post
    fetchComments: async (postId, page = 1) => {
        // Don't fetch if we're already at the end
        if (!get().hasMore && page > 1) return;

        set({ loading: page === 1, loadingMore: page > 1 });

        try {
            const response = await api.get(`/posts/comments/${postId}?page=${page}`);
            
            set({
                comments: page === 1 
                    ? response.data.comments 
                    : [...get().comments, ...response.data.comments],
                page: page,
                hasMore: response.data.hasMore,
                loading: false,
                loadingMore: false
            });
        } catch (error) {
            console.error('Error fetching comments:', error);
            set({ loading: false, loadingMore: false });
        }
    },

    // Load more comments
    loadMore: async (postId) => {
        if (!get().hasMore) return;
        await get().fetchComments(postId, get().page + 1);
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
                comments: [...state.comments, newComment]
            }));

            // Update post's comment count in post store
            const { feedPosts, profilePosts, currentPost, updatePostCommentCount } = usePostStore.getState();
            
            // Update currentPost if it matches
            if (currentPost?._id === postId) {
                usePostStore.setState({ 
                    currentPost: {
                        ...currentPost,
                        comments: [...currentPost.comments, newComment]
                    }
                });
            }
            
            // Update feed posts if the post exists there
            if (feedPosts?.some(post => post._id === postId)) {
                usePostStore.setState({
                    feedPosts: feedPosts.map(p => 
                        p._id === postId 
                            ? { ...p, comments: [...p.comments, newComment] }
                            : p
                    )
                });
            }

            // Update profile posts if the post exists there
            if (profilePosts?.some(post => post._id === postId)) {
                usePostStore.setState({
                    profilePosts: profilePosts.map(p => 
                        p._id === postId 
                            ? { ...p, comments: [...p.comments, newComment] }
                            : p
                    )
                });
            }

            return newComment;
        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        } finally {
            set({ submitting: false });
        }
    },

    // Delete a comment
    deleteComment: async (commentId, postId) => {
        try {
            const response = await api.delete(`/posts/${postId}/comment/${commentId}`);
            set((state) => ({
                comments: state.comments.filter((comment) => comment._id !== commentId),
            }));
            
            // Update post's comment count in post store
            const { posts, currentPost } = usePostStore.getState();
            
            // Update currentPost if it matches
            if (currentPost?._id === postId) {
                usePostStore.setState({ 
                    currentPost: response.data
                });
            }
            
            // Update posts array if the post exists there
            if (posts.some(post => post._id === postId)) {
                usePostStore.setState({
                    posts: posts.map(p => 
                        p._id === postId 
                            ? response.data
                            : p
                    )
                });
            }
        } catch (error) {
            throw error;
        }
    },

    // Clear comments
    clearComments: () => {
        set({
            comments: [],
            page: 1,
            hasMore: true,
            loading: false,
            loadingMore: false
        });
    },

    // Getters
    getComments: () => get().comments,
    isLoading: () => get().loading,
    isLoadingMore: () => get().loadingMore,
    hasMore: () => get().hasMore,
    isSubmitting: () => get().submitting
}));

export default useCommentStore; 