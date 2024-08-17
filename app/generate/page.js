"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        "https://media-engine-backend.vercel.app/api/chatgpt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: `Given the story idea, generate the following: Break down the story into distinct scenes, with each scene including: a scene title, a detailed description of the scene setting and main events, a single detailed sentence for generating an image of the scene that includes specifics like characters and their descriptions without any names mentioned, when needed to mention about a character inside the image prompt use their detailed description everytime so that even if i generate the images individually the description would be consistent , setting, mood, and any magical elements, a single detailed sentence for generating voiceover's that include dialogue and background sound effects that includes the characters, their spoken lines, and any relevant background sounds, add filler scenes without any characters to setup the shot, focusing on key elements from the text-to-image prompt. Give the output in a JSON format. In the JSON output. The keys should be accordingly: Under scene there should be title, image_prompt and sound_prompt. So that in code i will call them as: scene.title, scene.image_prompt, scene.sound_prompt Here is the Story Idea: ${inputValue}`,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error making API request:", errorText);
        return;
      }

      const data = await response.json();
      localStorage.setItem("chatGPTContent", JSON.stringify(data));
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
              className="w-full p-2 border-2 border-opacity-40 border-gray-500 rounded-3xl min-h-14 pl-12"
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
