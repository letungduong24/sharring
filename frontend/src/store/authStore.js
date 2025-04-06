import { create } from 'zustand';
import api from '../lib/axios';
import { toast } from 'sonner';

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
            set({ profile: response.data });
            return response.data;
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
            toast.success('Đã theo dõi người dùng');
            set({profile: {...profile, followers: [...profile.followers, userId]}})
        } catch (error) {
            throw error;
        } finally {
            set({ followLoading: false });
        }
    },

    unfollowUser: async (userId) => {
        try {
            set({ unfollowLoading: true });
            const response = await api.post(`/auth/unfollow/${userId}`);
            toast.success('Đã bỏ theo dõi người dùng');
            set({profile: {...profile, followers: profile.followers.filter(id => id !== userId)}})
        } catch (error) {
            throw error;
        } finally {
            set({ unfollowLoading: false });
        }
    }
}));

export default useAuthStore; 