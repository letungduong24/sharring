import React, { useState } from "react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { FaRegComment, FaHeart, FaRegHeart } from "react-icons/fa";
import { PiShareFatBold } from "react-icons/pi";
import { PhotoView } from "react-photo-view";
import usePostStore from '../../store/postStore';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import CommentModal from './CommentModal';
import defaultAvatar from '../../assets/defaultAvt.jpg';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import EditPostModal from './EditPostModal';

const PostCard = ({ post, isFirst, isLast, isFeed }) => {
    const {user} = useAuthStore();
    const { likePost, unlikePost, deletePost, likePostLoading } = usePostStore();
    const [isLiked, setIsLiked] = useState(post.likes.includes(user._id));
    const [showOptions, setShowOptions] = useState(false);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const navigate = useNavigate();
    const handleLike = async () => {
        try {
            if (isLiked) {
                await unlikePost(post._id);
            } else {
                await likePost(post._id);
            }
            setIsLiked(!isLiked);
        } catch (error) {
            toast.error('Không thể thực hiện thao tác');
        }
    };

    const handleDelete = async () => {
        try {
            await deletePost(post._id);
            toast.success('Xóa bài viết thành công');
            setShowDeleteConfirm(false);
        } catch (error) {
            toast.error('Không thể xóa bài viết');
        }
    };

    return (
        <>
            <div className={`w-full ${!isLast ? 'border-b border-gray-200' : ''} ${!isFirst ? 'mt-4' : ''}`}>
                <div className="header flex gap-2 justify-between items-start">
                    <div className="flex gap-2 items-center">
                        <img 
                            className="w-8 h-8 rounded-full cursor-pointer" 
                            src={post.author.profilePicture || defaultAvatar} 
                            alt={post.author.username} 
                            onClick={() => navigate(`/profile/${post.author.username}`)}
                        />
                        <div className="flex gap-2 items-center">
                            <p className="font-bold cursor-pointer" onClick={() => navigate(`/profile/${post.author.username}`)}>{post.author.username}</p>
                            {isFeed && post.author.isFollowing && (
                                <span className="text-xs text-gray-500">Đang theo dõi</span>
                            )}
                            <p className="text-gray-400 text-sm">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        {post.author._id === user._id && (
                            <button 
                                className="cursor-pointer text-lg"
                                onClick={() => setShowOptions(!showOptions)}
                            >
                                <HiOutlineDotsHorizontal />
                            </button>
                        )}
                        {showOptions && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                {post.author._id === user._id && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setShowEditModal(true);
                                                setShowOptions(false);
                                            }}
                                            className="cursor-pointer block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Chỉnh sửa bài viết
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowDeleteConfirm(true);
                                                setShowOptions(false);
                                            }}
                                            className="cursor-pointer block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                            Xóa bài viết
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                    <p className="font-semibold">{post.content}</p>
                    {post.media.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                            {post.media.map((image, index) => (
                                <PhotoView key={index} src={image}>
                                    <img
                                        className="cursor-pointer w-full object-cover rounded-lg"
                                        src={image}
                                        alt={`Post image ${index + 1}`}
                                        loading="lazy"
                                    />
                                </PhotoView>
                            ))}
                        </div>
                    )}
                </div>
                <div className={`flex gap-4 ${isLast ? 'mt-4' : 'my-4'}`}>
                    <button 
                        className="flex gap-0.5 items-center text-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleLike}
                        disabled={likePostLoading}
                    >
                        {isLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                        <span className="text-sm">{post.likes.length}</span>
                    </button>
                    <button  
                        className="flex gap-0.5 items-center text-xl cursor-pointer"
                        onClick={() => setShowCommentModal(true)}
                    >
                        <FaRegComment />
                        <span className="text-sm">{post.comments.length}</span>
                    </button>
                    <button className="flex gap-0.5 items-center text-xl cursor-pointer">
                        <PiShareFatBold onClick={() => {
                            const postUrl = `${window.location.origin}/post/${post._id}`;
                            navigator.clipboard.writeText(postUrl);
                            toast.success('Đã sao chép link bài viết');
                        }}/>
                    </button>
                </div>
            </div>
            {showCommentModal && (
                <CommentModal 
                    post={post}
                    onClose={() => setShowCommentModal(false)}
                />
            )}
            {showEditModal && (
                <EditPostModal
                    post={post}
                    onClose={() => setShowEditModal(false)}
                />
            )}
            {showDeleteConfirm && (
                <dialog className="modal modal-bottom sm:modal-middle" open>
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">Xác nhận xóa bài viết</h3>
                        <p className="text-gray-600 mb-4">Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.</p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="cursor-pointer px-4 py-2 rounded-md font-bold text-gray-600 hover:bg-gray-100"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDelete}
                                className="cursor-pointer px-4 py-2 rounded-md font-bold bg-red-600 text-white hover:bg-red-700"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={() => setShowDeleteConfirm(false)}>close</button>
                    </form>
                </dialog>
            )}
        </>
    );
};

export default PostCard;
