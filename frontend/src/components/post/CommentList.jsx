import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { PhotoView } from 'react-photo-view';
import CommentSkeleton from './CommentSkeleton';
import useInfiniteScroll from '../../lib/useInfiniteScroll';

const CommentList = ({ comments, onLoadMore, hasMore, isLoading, isLoadingMore }) => {
    const lastCommentRef = useInfiniteScroll({
        loading: isLoadingMore,
        hasMore,
        onLoadMore
    });

    // Sort comments by createdAt in descending order (newest first)
    const sortedComments = [...comments].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );

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
                            className="flex gap-3"
                        >
                            <img 
                                src={comment.user.profilePicture || '/default-avatar.png'} 
                                alt={comment.user.username} 
                                className="w-8 h-8 rounded-full flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="bg-gray-100 rounded-lg p-3">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold truncate">{comment.user.username}</p>
                                        <p className="text-gray-400 text-sm whitespace-nowrap">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}
                                        </p>
                                    </div>
                                    <p className="mt-1 break-words">{comment.content}</p>
                                    {comment.image && (
                                        <div className="mt-2">
                                            <PhotoView src={comment.image}>
                                                <img
                                                    className="cursor-pointer w-32 h-32 object-cover rounded-lg"
                                                    src={comment.image}
                                                    alt="Comment image"
                                                />
                                            </PhotoView>
                                        </div>
                                    )}
                                </div>
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
        </div>
    );
};

export default CommentList; 