import React, { useEffect } from 'react'
import PostSkeleton from './PostSkeleton'
import usePostStore from '../../store/postStore'
import { toast } from 'sonner'
import useInfiniteScroll from '../../lib/useInfiniteScroll'
import PostCard from './PostCard'

const PostContainer = ({ userId, type, searchQuery }) => {
    const { 
        getCurrentPosts,
        fetchFeedPosts, 
        fetchProfilePosts, 
        loadMorePosts, 
        resetFeedPosts,
        resetProfilePosts
    } = usePostStore();
    
    const { posts, loading, isLoadingMore, hasMore } = getCurrentPosts(userId);
    
    const lastPostElementRef = useInfiniteScroll({
        loading: isLoadingMore,
        hasMore,
        onLoadMore: () => loadMorePosts(type, userId, searchQuery)
    });

    useEffect(() => {
        const loadPosts = async () => {
            try {
                if (userId) {
                    resetProfilePosts();
                    await fetchProfilePosts(1, userId);
                } else {
                    resetFeedPosts();
                    await fetchFeedPosts(1, type, searchQuery);
                }
            } catch (error) {
                toast.error('Không thể tải bài viết');
            }
        };

        loadPosts();
    }, [userId, type, searchQuery, fetchFeedPosts, fetchProfilePosts, resetFeedPosts, resetProfilePosts]);

    return (
        <div className="text-gray-600 w-full md:w-3/4 lg:w-1/2 h-fit bg-white md:rounded-xl border border-gray-200 shadow-md">
            <div className="w-full p-5">
                {loading && posts.length === 0 ? (
                    <>
                        <PostSkeleton />
                        <PostSkeleton />
                        <PostSkeleton />
                    </>
                ) : (
                    <>
                        {posts.map((post, index) => (
                            <div
                                key={post._id}
                                ref={index === posts.length - 1 ? lastPostElementRef : null}
                            >
                                <PostCard 
                                    post={post}
                                    isFirst={index === 0}
                                    isLast={index === posts.length - 1}
                                    isFeed={!userId}
                                />
                            </div>
                        ))}
                        {isLoadingMore && (
                            <PostSkeleton />
                        )}
                    </>
                )}
                {posts.length === 0 && !loading && (
                    <div className="text-center py-4 text-gray-500">
                        {type === 'search' 
                            ? 'Không tìm thấy bài viết nào phù hợp'
                            : searchQuery 
                                ? 'Không tìm thấy bài viết nào'
                                : 'Chưa có bài viết nào'
                        }
                    </div>
                )}
            </div>
        </div>
    );
}

export default PostContainer;