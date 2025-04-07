import { create } from 'zustand';
import api from '../lib/axios';
import { toast } from 'sonner';
import usePostStore from '../store/postStore';

const useAuthStore = create((set) => ({
    user: null,
    loading: true,
    getProfileLoading: true,
    followLoading: false,
    unfollowLoading: false,
    signInLoading: false,
    signUploading: false,
    updateProfileLoading: false,
    profile: null,
    setProfile: (profile) => set({ profile }),
    // Check if user is authenticated
    checkAuth: async () => {
        try {
            const response = await api.get('/auth/user');
            set({ user: response.data, loading: false,});
        } catch (error) {
            set({ user: null, loading: false });
        }
    },

    // Sign in
    signin: async ({ email, password }) => {
        set({signInLoading: true})
        try {
            // Reset posts before signing in
            usePostStore.getState().resetPosts();
            const response = await api.post('/auth/login', {
                email,
                password
            });
            set({ user: response.data.user});
        } catch (error) {
            throw error;
        } finally{
            set({signInLoading: false})
        }
    },

    // Sign up
    signup: async ({ username, email, password }) => {
        set({signUploading: true})
        try {
            const response = await api.post('/auth/signup', {
                username,
                email,
                password
            });
            set({ user: response.data.user});
        } catch (error) {
            throw error;
        } finally{
            set({signUploading: false})
        }
    },

    // Sign out
    signout: async () => {
        try {
            // Reset posts and profile before signing out
            usePostStore.getState().resetPosts();
            set({ profile: null });

            await api.post('/auth/logout');
            set({ user: null, error: null });
        } catch (error) {
            console.error('Logout failed:', error);
        }
    },

    // Update profile
    updateProfile: async ({ username, bio, profilePicture }) => {
        set({ updateProfileLoading: true });
        try {
            const response = await api.put('/auth/update-profile', {
                username,
                bio,
                profilePicture
            });
            set({ profile: response.data.user });
            return response.data;
        } catch (error) {
            throw error;
        } finally {
            set({ updateProfileLoading: false });
        }
    },

    // User profile functions
    getUserProfile: async (username) => {
        set({ getProfileLoading: true });
        try {
            const response = await api.get(`/auth/profile/${username}`);
            // Store the profile with counts and IDs
            const profile = {
                ...response.data,
                followers: response.data.followers || [],
                following: response.data.following || []
            };
            set({ profile });
            return profile;
        } catch (error) {
            throw error;
        } finally {
            set({ getProfileLoading: false });
        }
    },

    followUser: async (userId) => {
        try {
            set({ followLoading: true });
            const response = await api.post(`/auth/follow/${userId}`);
            // Update the profile's followers array with the current user's data
            set((state) => ({
                profile: {
                    ...state.profile,
                    followers: [...state.profile.followers, {
                        _id: state.user._id,
                        username: state.user.username,
                        profilePicture: state.user.profilePicture,
                        bio: state.user.bio
                    }]
                }
            }));
            toast.success('Đã theo dõi người dùng');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không thể theo dõi người dùng');
            throw error;
        } finally {
            set({ followLoading: false });
        }
    },

    unfollowUser: async (userId) => {
        try {
            set({ unfollowLoading: true });
            const response = await api.post(`/auth/unfollow/${userId}`);
            // Update the profile's followers array by removing the current user
            set((state) => ({
                profile: {
                    ...state.profile,
                    followers: state.profile.followers.filter(follower => follower._id !== state.user._id)
                }
            }));
            toast.success('Đã bỏ theo dõi người dùng');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không thể bỏ theo dõi người dùng');
            throw error;
        } finally {
            set({ unfollowLoading: false });
        }
    }
}));

export default useAuthStore; 