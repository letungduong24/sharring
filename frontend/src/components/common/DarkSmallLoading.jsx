import React from "react";

const DarkSmallLoading = () => {
  return (
    <div className="flex space-x-2 justify-center items-center">
      <div className="h-8 w-8 bg-black rounded-full animate-bounce" style={{ animationDelay: "-0.3s" }}></div>
      <div className="h-8 w-8 bg-black rounded-full animate-bounce" style={{ animationDelay: "-0.15s" }}></div>
      <div className="h-8 w-8 bg-black rounded-full animate-bounce"></div>
    </div>
  );
};

export default DarkSmallLoading;
