const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const checkAuth = require('../middleware/checkAuth');

const setCookieOptions = {
    httpOnly: true,
    secure: false, 
    sameSite: 'None', 
    maxAge: 7 * 24 * 60 * 60 * 1000, 
    path: '/'
};

// Signup
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Người dùng đã tồn tại' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set cookie
        res.cookie('token', token, setCookieOptions);

        res.status(201).json({
            message: 'User created successfully',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                followers: user.followers,
                following: user.following,
                profilePicture: user.profilePicture,
                bio: user.bio,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Thông tin đăng nhập không hợp lệ' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Thông tin đăng nhập không hợp lệ' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set cookie
        res.cookie('token', token, setCookieOptions);

        res.json({
            message: 'Đăng nhập thành công',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                followers: user.followers,
                following: user.following,
                profilePicture: user.profilePicture,
                bio: user.bio,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get current user
router.get('/user', checkAuth, async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        ...setCookieOptions,
        maxAge: 0
    });
    res.json({ message: 'Đăng xuất thành công' });
});

// Get user profile
router.get('/profile/:username', checkAuth, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .select('-password')
            .populate('followers', '_id')
            .populate('following', '_id');
        
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        res.json({
            ...user.toObject(),
            followersCount: user.followers.length,
            followingCount: user.following.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Follow user
router.post('/follow/:userId', checkAuth, async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.userId);
        if (!userToFollow) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        // Check if already following
        if (req.user.following.includes(req.params.userId)) {
            return res.status(400).json({ message: 'Đã theo dõi người dùng này' });
        }

        // Add to following list
        req.user.following.push(req.params.userId);
        await req.user.save();

        // Add to followers list
        userToFollow.followers.push(req.user._id);
        await userToFollow.save();

        res.json({ 
            message: 'Theo dõi thành công',
            username: userToFollow.username
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Unfollow user
router.post('/unfollow/:userId', checkAuth, async (req, res) => {
    try {
        const userToUnfollow = await User.findById(req.params.userId);
        if (!userToUnfollow) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        // Check if not following
        if (!req.user.following.includes(req.params.userId)) {
            return res.status(400).json({ message: 'Chưa theo dõi người dùng này' });
        }

        // Remove from following list
        req.user.following = req.user.following.filter(id => id.toString() !== req.params.userId);
        await req.user.save();

        // Remove from followers list
        userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== req.user._id.toString());
        await userToUnfollow.save();

        res.json({ 
            message: 'Bỏ theo dõi thành công',
            username: userToUnfollow.username
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update user profile
router.put('/update-profile', checkAuth, async (req, res) => {
    try {
        const { username, bio, profilePicture } = req.body;

        // Check if username is already taken by another user
        if (username && username !== req.user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ message: 'Tên người dùng đã tồn tại' });
            }
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    ...(username && { username }),
                    ...(bio !== undefined && { bio }),
                    ...(profilePicture && { profilePicture })
                }
            },
            { new: true }
        ).select('-password');

        res.json({
            message: 'Cập nhật thông tin thành công',
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router; 