import React from 'react';

const PostSkeleton = () => {
    return (
        <div className="w-full  animate-pulse pt-4">
            <div className="header flex gap-2 justify-between items-start">
                <div className="flex gap-2 items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                    <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                    </div>
                </div>
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
            </div>
            <div className="">
                <div className="space-y-2 py-4">
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                    <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="aspect-square bg-gray-200 rounded-lg"></div>
                    <div className="aspect-square bg-gray-200 rounded-lg"></div>
                </div>
                <div className="mt-4 flex gap-4">
                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                </div>
            </div>
        </div>
    );
};

export default PostSkeleton; 