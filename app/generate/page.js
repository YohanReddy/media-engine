"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/chatgpt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `Given the story idea, generate the following: a list of characters, each with a brief description of their appearance and role in the story; break down the story into distinct scenes, with each scene including: a scene title, a list of characters present in the scene, a detailed description of the scene setting and main events, a single detailed sentence for generating an image of the scene that includes specifics like characters, setting, mood, and any magical elements, a single detailed sentence for generating dialogue and background sound effects that includes the characters' names, their spoken lines, and any relevant background sounds, and a single detailed sentence for generating a video of the scene that describes how the scene should visually transition or animate, focusing on key elements from the text-to-image prompt. Give the output in a JSON format. Here is the Story Idea: ${inputValue}`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error making API request:", errorText);
        return;
      }

      const data = await response.json();
      // Store content in local storage
      localStorage.setItem("chatGPTContent", JSON.stringify(data));
      // Navigate to script page
      router.push("/generate/script");
    } catch (error) {
      console.error("Error making API request:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans">
      <nav className="w-full h-fit">
        <div className="p-4 flex flex-row gap-2">
          <img
            src="https://img.icons8.com/?size=50&id=25603&format=png"
            alt="logo"
            className="w-8 h-8 self-center"
          />
          <a href="#" className="text-3xl font-semibold self-center">
            Media Engine
          </a>
        </div>
      </nav>

      <div className="flex flex-col items-center mt-64">
        <h1 className="text-2xl font-semibold mb-6">
          Bring your ideas into reality
        </h1>
        <form onSubmit={handleSubmit} className="w-full max-w-2xl">
          <div className="relative flex flex-row gap-2">
            <input
              type="text"
              placeholder="Enter your story"
              className="w-full p-2 border border-gray-300 rounded-3xl min-h-14 pl-12"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <img
              src="https://cdn-icons-png.flaticon.com/128/8105/8105904.png"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6"
              alt="Search Icon"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
