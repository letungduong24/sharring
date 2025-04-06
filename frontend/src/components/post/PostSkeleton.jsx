import React from 'react';

const PostSkeleton = () => {
    return (
        <div className="w-full border-b border-gray-200 py-4">
            <div className="header flex gap-2 justify-between items-start">
                <div className="flex gap-2 items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="flex gap-2 items-center">
                        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex flex-col gap-2 mt-2">
                <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="w-full aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="w-full aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
            </div>
            <div className="flex gap-4 mt-4">
                <div className="flex gap-0.5 items-center">
                    <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex gap-0.5 items-center">
                    <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex gap-0.5 items-center">
                    <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};

export default PostSkeleton; 