const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const checkAuth = require('../middleware/checkAuth');
const User = require('../models/User');

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
        const type = req.query.type;
        const page = parseInt(req.query.page) || 1;
        const userId = req.query.userId;
        const searchQuery = req.query.search;
        const limit = 6;
        const skip = (page - 1) * limit;

        // Build query based on type and userId
        let query = {};
        if (userId) {
            query = { author: userId };
        } else {
            if (type === 'following') {
                query = { 
                    author: { 
                        $in: req.user.following,
                        $ne: req.user._id // Exclude current user's posts
                    } 
                };
            } else if (type === 'explore') {
                query = { 
                    author: { 
                        $nin: [...req.user.following, req.user._id] // Exclude current user's posts
                    } 
                };
            } else if (type === 'search' && searchQuery) {
                // Create a single regex pattern for the entire search query
                const searchPattern = new RegExp(searchQuery, 'i');
                
                // First find users that match the search query
                const matchingUsers = await User.find(
                    { username: searchPattern },
                    '_id'
                );
                const matchingUserIds = matchingUsers.map(user => user._id);
                
                query = {
                    $or: [
                        { content: searchPattern },
                        { author: { $in: matchingUserIds } }
                    ]
                };
            }
        }

        const [posts, total] = await Promise.all([
            Post.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'author',
                    select: 'username profilePicture',
                    transform: (doc) => {
                        return {
                            ...doc.toObject(),
                            isFollowing: req.user.following.includes(doc._id)
                        };
                    }
                }),
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

// Get post by id
router.get('/:postId', checkAuth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)
            .populate('author', 'username profilePicture')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'username profilePicture'
                }
            });

        if (!post) {
            return res.status(404).json({ message: 'Bài viết không tồn tại' });
        }

        res.json(post);
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

// Update a post
router.put('/:postId', checkAuth, async (req, res) => {
    try {
        const { content, media } = req.body;
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ message: 'Bài viết không tồn tại' });
        }

        // Check if user is the author
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Không có quyền chỉnh sửa bài viết này' });
        }

        // Update post
        post.content = content;
        post.media = media;
        await post.save();

        // Populate author and comments
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

// Delete a comment
router.delete('/:postId/comment/:commentId', checkAuth, async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        
        // Find the comment
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Bình luận không tồn tại' });
        }

        // Check if user is the author
        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Không có quyền xóa bình luận này' });
        }

        // Find and update the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Bài viết không tồn tại' });
        }

        // Remove comment from post's comments array
        post.comments = post.comments.filter(id => id.toString() !== commentId);
        await post.save();

        // Delete the comment
        await Comment.findByIdAndDelete(commentId);

        // Get updated post with populated data
        const updatedPost = await Post.findById(postId)
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

module.exports = router; 