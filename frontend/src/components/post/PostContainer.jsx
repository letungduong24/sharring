import React, { useEffect } from 'react'
import PostCard from './PostCard'
import PostSkeleton from './PostSkeleton'
import usePostStore from '../../store/postStore'
import { toast } from 'sonner'
import useInfiniteScroll from '../../lib/useInfiniteScroll'

const PostContainer = ({ userId }) => {
    const { posts, loading, isLoadingMore, fetchPosts, loadMorePosts, hasMore } = usePostStore();
    
    const lastPostElementRef = useInfiniteScroll({
        loading: isLoadingMore,
        hasMore,
        onLoadMore: loadMorePosts
    });

    useEffect(() => {
        const loadPosts = async () => {
            try {
                await fetchPosts(1, userId);
            } catch (error) {
                toast.error('Không thể tải bài viết');
            }
        };

        loadPosts();
    }, [userId, fetchPosts]);

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
                        Chưa có bài viết nào
                    </div>
                )}
            </div>
        </div>
    );
}

export default PostContainer;