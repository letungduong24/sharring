import React, { useState, useEffect } from 'react';
import CommentComposer from './CommentComposer';
import CommentList from './CommentList';
import useCommentStore from '../../store/commentStore';

const CommentModal = ({ post, onClose }) => {
    const { fetchComments, getComments, isLoading, isLoadingMore, hasMore, loadMore, clearComments } = useCommentStore();
    const [comments, setComments] = useState([]);

    useEffect(() => {
        if (post) {
            // Fetch initial comments when modal opens
            fetchComments(post._id);
        }

        // Cleanup function to clear comments when modal closes
        return () => {
            clearComments();
        };
    }, [post?._id]);

    useEffect(() => {
        if (post) {
            // Update comments when they change in the store
            setComments(getComments());
        }
    }, [getComments()]);

    if (!post) return null;

    return (
        <dialog 
            className="modal modal-bottom sm:modal-middle"
            open
        >
            <div className="modal-box max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Bình luận</h3>
                    <button 
                        className="btn btn-sm btn-circle"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto pr-2">
                    <CommentList 
                        comments={comments}
                        onLoadMore={() => loadMore(post._id)}
                        hasMore={hasMore}
                        isLoading={isLoading()}
                        isLoadingMore={isLoadingMore()}
                    />
                </div>
                <div className="mt-4">
                    <CommentComposer postId={post._id} />
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    );
};

export default CommentModal; 