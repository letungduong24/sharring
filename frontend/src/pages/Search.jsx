import React, { useState } from 'react';
import PostButton from '../components/post/PostButton';
import PostContainer from '../components/post/PostContainer';
import usePostStore from '../store/postStore';

const Search = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const { fetchFeedPosts } = usePostStore();

    const handleSearch = async (e) => {
        if (e.type === 'keydown' && e.key !== 'Enter') return;
        
        if (searchQuery.trim()) {
            await fetchFeedPosts(1, 'search', searchQuery.trim());
        }
    };

    return (
        <div className="text-gray-600 min-h-screen w-full p-2 md:p-5 bg-gray-50 flex flex-col items-center gap-5">
            <div className="text-gray-600 w-full md:w-3/4 lg:w-1/2">
                <label className="input w-full rounded-lg shadow-md focus-within:outline-none focus-within:ring-0">
                    <svg 
                        className="h-[1em] opacity-50 cursor-pointer" 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24"
                        onClick={handleSearch}
                    >
                        <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.3-4.3"></path>
                        </g>
                    </svg>
                    <input 
                        type="search" 
                        className="grow focus:outline-none focus:ring-0" 
                        placeholder="Tìm người dùng hoặc bài viết" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </label>
            </div>
            {searchQuery && <PostContainer type="search" searchQuery={searchQuery} />}
        </div>
    );
};

export default Search;

