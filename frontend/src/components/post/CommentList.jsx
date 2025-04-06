import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { PhotoView } from 'react-photo-view';
import useInfiniteScroll from '../../lib/useInfiniteScroll';
import CommentSkeleton from './CommentSkeleton';

const CommentList = ({ comments, onLoadMore, hasMore, isLoading }) => {
    // Sort comments by createdAt in descending order (newest first)
    const sortedComments = [...comments].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    const lastCommentRef = useInfiniteScroll({
        loading: isLoading,
        hasMore,
        onLoadMore
    });

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
                            className="flex gap-3"
                            ref={index === sortedComments.length - 1 ? lastCommentRef : null}
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
                    {isLoading && comments.length > 0 && (
                        <CommentSkeleton />
                    )}
                </>
            )}
        </div>
    );
};

export default CommentList; 