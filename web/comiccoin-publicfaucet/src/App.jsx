import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4">
        <div>
          <div className="text-xl font-medium text-black">
            Tailwind CSS is working!
          </div>
          <p className="text-gray-500">
            You have successfully integrated Tailwind with Vite and React.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
