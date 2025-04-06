import React, { useState, useRef } from "react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { FaRegComment, FaHeart, FaRegHeart } from "react-icons/fa";
import { PiShareFatBold } from "react-icons/pi";
import { PhotoView } from "react-photo-view";
import usePostStore from '../../store/postStore';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import CommentModal from './CommentModal';

const PostCard = ({ post, isFirst, isLast }) => {
    const { likePost, unlikePost, deletePost } = usePostStore();
    const [isLiked, setIsLiked] = useState(post.likes.includes(post.author._id));
    const [showOptions, setShowOptions] = useState(false);

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
        } catch (error) {
            toast.error('Không thể xóa bài viết');
        }
    };

    const handleOpenCommentModal = () => {
        document.getElementById(`comment_modal_${post._id}`).showModal();
    };

    return (
        <div className={`w-full ${!isLast ? 'border-b border-gray-200' : ''} ${!isFirst ? 'mt-4' : ''}`}>
            <div className="header flex gap-2 justify-between items-start">
                <div className="flex gap-2 items-center">
                    <img 
                        className="w-8 h-8 rounded-full" 
                        src={post.author.profilePicture || '/default-avatar.png'} 
                        alt={post.author.username} 
                    />
                    <div className="flex gap-2 items-center">
                        <p className="font-bold">{post.author.username}</p>
                        <p className="text-gray-400 text-sm">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
                        </p>
                    </div>
                </div>
                <div className="relative">
                    <button 
                        className="cursor-pointer text-lg"
                        onClick={() => setShowOptions(!showOptions)}
                    >
                        <HiOutlineDotsHorizontal />
                    </button>
                    {showOptions && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                            <button
                                onClick={handleDelete}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                                Xóa bài viết
                            </button>
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
                                />
                            </PhotoView>
                        ))}
                    </div>
                )}
            </div>
            <div className={`flex gap-4 ${isLast ? 'mt-4' : 'my-4'}`}>
                <button 
                    className="flex gap-0.5 items-center text-xl cursor-pointer"
                    onClick={handleLike}
                >
                    {isLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                    <span className="text-sm">{post.likes.length}</span>
                </button>
                <button  
                    className="flex gap-0.5 items-center text-xl cursor-pointer"
                    onClick={handleOpenCommentModal}
                >
                    <FaRegComment />
                    <span className="text-sm">{post.comments.length}</span>
                </button>
                <button className="flex gap-0.5 items-center text-xl cursor-pointer">
                    <PiShareFatBold />
                </button>
            </div>
            <CommentModal 
                post={post}
                onClose={() => document.getElementById(`comment_modal_${post._id}`).close()}
            />
        </div>
    );
};

export default PostCard;
