const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const checkAuth = require('../middleware/checkAuth');

// Create a new post
router.post('/', checkAuth, async (req, res) => {
    try {
        const { content, media } = req.body;

        // Validate required fields

        const post = new Post({
            author: req.user._id,
            content,
            media: media || []
        });

        await post.save();

        // Populate author details
        const populatedPost = await Post.findById(post._id)
            .populate('author', 'username profilePicture')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'username profilePicture'
                }
            });

        res.status(201).json(populatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all posts
router.get('/', checkAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const userId = req.query.userId;
        const limit = 6;
        const skip = (page - 1) * limit;

        // Build query based on userId
        const query = userId ? { author: userId } : {};

        const [posts, total] = await Promise.all([
            Post.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('author', 'username profilePicture'),
            Post.countDocuments(query)
        ]);

        res.json({
            posts,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            hasMore: skip + posts.length < total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get posts by user
router.get('/user/:username', checkAuth, async (req, res) => {
    try {
        const posts = await Post.find({ 'author.username': req.params.username })
            .sort({ createdAt: -1 })
            .populate('author', 'username profilePicture')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'username profilePicture'
                }
            });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get post by id
router.get('/:postId', checkAuth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)
            .populate('author', 'username profilePicture');

        if (!post) {
            return res.status(404).json({ message: 'Bài viết không tồn tại' });
        }

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Like a post
router.post('/like/:postId', checkAuth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Bài viết không tồn tại' });
        }

        // Check if already liked
        if (post.likes.includes(req.user._id)) {
            return res.status(400).json({ message: 'Đã thích bài viết này' });
        }

        post.likes.push(req.user._id);
        await post.save();

        const updatedPost = await Post.findById(post._id)
            .populate('author', 'username profilePicture')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'username profilePicture'
                }
            });

        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Unlike a post
router.post('/unlike/:postId', checkAuth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Bài viết không tồn tại' });
        }

        // Check if not liked
        if (!post.likes.includes(req.user._id)) {
            return res.status(400).json({ message: 'Chưa thích bài viết này' });
        }

        post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
        await post.save();

        const updatedPost = await Post.findById(post._id)
            .populate('author', 'username profilePicture')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'username profilePicture'
                }
            });

        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add comment to post
router.post('/comment/:postId', checkAuth, async (req, res) => {
    try {
        const { content, image } = req.body;
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Bài viết không tồn tại' });
        }

        const comment = new Comment({
            post: post._id,
            user: req.user._id,
            content,
            image: image || ''
        });

        await comment.save();
        post.comments.push(comment._id);
        await post.save();

        const updatedPost = await Post.findById(post._id)
            .populate('author', 'username profilePicture')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'username profilePicture'
                },
                options: {
                    sort: { createdAt: -1 },
                    limit: 6
                }
            });

        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get comments with pagination
router.get('/comments/:postId', checkAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        const skip = (page - 1) * limit;

        const post = await Post.findById(req.params.postId)
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'username profilePicture'
                },
                options: {
                    sort: { createdAt: -1 },
                    skip,
                    limit
                }
            });

        if (!post) {
            return res.status(404).json({ message: 'Bài viết không tồn tại' });
        }

        const totalComments = await Comment.countDocuments({ post: req.params.postId });
        const hasMore = skip + post.comments.length < totalComments;

        res.json({
            comments: post.comments,
            hasMore,
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a post
router.delete('/:postId', checkAuth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Bài viết không tồn tại' });
        }

        // Check if user is the author
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Không có quyền xóa bài viết này' });
        }

        // Delete all comments associated with the post
        await Comment.deleteMany({ post: post._id });

        // Delete the post
        await Post.findByIdAndDelete(post._id);
        
        res.json({ message: 'Xóa bài viết thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router; 