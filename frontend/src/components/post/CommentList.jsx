import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { PhotoView } from 'react-photo-view';
import CommentSkeleton from './CommentSkeleton';
import useInfiniteScroll from '../../lib/useInfiniteScroll';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from '../../assets/defaultAvt.jpg';
import useAuthStore from '../../store/authStore';
import useCommentStore from '../../store/commentStore';
import { toast } from 'sonner';

const CommentList = ({ comments, onLoadMore, hasMore, isLoading, isLoadingMore, postId }) => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { deleteComment } = useCommentStore();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    const lastCommentRef = useInfiniteScroll({
        loading: isLoadingMore,
        hasMore,
        onLoadMore
    });

    const handleDelete = async (commentId) => {
        try {
            await deleteComment(commentId, postId);
            toast.success('Xóa bình luận thành công');
            setShowDeleteConfirm(null);
        } catch (error) {
            toast.error('Không thể xóa bình luận');
        }
    };

    // Sort comments by createdAt in descending order (newest first)
    const sortedComments = [...comments].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    const handleOpenProfile = (username) => {
        navigate(`/profile/${username}`);
    };

    return (
        <div className="space-y-4">
            {isLoading && comments.length === 0 ? (
                <>
                    <CommentSkeleton />
                    <CommentSkeleton />
                    <CommentSkeleton />
                </>
            ) : (
                <>
                    {sortedComments.map((comment, index) => (
                        <div 
                            key={comment._id} 
                            ref={index === sortedComments.length - 1 ? lastCommentRef : null}
                            className="flex gap-2"
                        >
                            <img 
                                src={comment.user.profilePicture || defaultAvatar} 
                                alt={comment.user.username}
                                className="w-8 h-8 rounded-full cursor-pointer"
                                onClick={() => handleOpenProfile(comment.user.username)}
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span 
                                        className="font-bold cursor-pointer hover:underline"
                                        onClick={() => handleOpenProfile(comment.user.username)}
                                    >
                                        {comment.user.username}
                                    </span>
                                    <span className="text-gray-400 text-sm">
                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}
                                    </span>
                                    {comment.user._id === user._id && (
                                        <button
                                            onClick={() => setShowDeleteConfirm(comment._id)}
                                            className="cursor-pointer ml-auto text-sm text-red-600 hover:text-red-700"
                                        >
                                            Xóa bình luận
                                        </button>
                                    )}
                                </div>
                                <p className="text-gray-600">{comment.content}</p>
                                {comment.image && (
                                    <PhotoView src={comment.image}>
                                        <img 
                                            src={comment.image} 
                                            alt="Comment image" 
                                            className="mt-2 rounded-lg cursor-pointer max-h-40 object-cover"
                                        />
                                    </PhotoView>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoadingMore && (
                        <CommentSkeleton />
                    )}
                </>
            )}
            {comments.length === 0 && !isLoading && (
                <div className="text-center py-4 text-gray-500">
                    Chưa có bình luận nào
                </div>
            )}
            {showDeleteConfirm && (
                <dialog className="modal modal-bottom sm:modal-middle" open>
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">Xác nhận xóa bình luận</h3>
                        <p className="text-gray-600 mb-4">Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác.</p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="cursor-pointer px-4 py-2 rounded-md font-bold text-gray-600 hover:bg-gray-100"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => handleDelete(showDeleteConfirm)}
                                className="cursor-pointer px-4 py-2 rounded-md font-bold bg-red-600 text-white hover:bg-red-700"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={() => setShowDeleteConfirm(null)}>close</button>
                    </form>
                </dialog>
            )}
        </div>
    );
};

export default CommentList; 