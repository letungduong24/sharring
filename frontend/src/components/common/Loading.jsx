import React from "react";

const Loading = () => {
  return (
    <div className="flex space-x-2 justify-center items-center bg-white h-screen z-100">
      <div className="h-8 w-8 bg-black rounded-full animate-bounce" style={{ animationDelay: "-0.3s" }}></div>
      <div className="h-8 w-8 bg-black rounded-full animate-bounce" style={{ animationDelay: "-0.15s" }}></div>
      <div className="h-8 w-8 bg-black rounded-full animate-bounce"></div>
    </div>
  );
};

export default Loading;
