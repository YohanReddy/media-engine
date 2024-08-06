"use client";

import { useEffect, useState } from "react";

export default function ScriptPage() {
  const [content, setContent] = useState({
    characters: [],
    scenes: [],
    sound_effects: [],
    video_transitions: [],
  });

  useEffect(() => {
    const fetchContent = () => {
      const storedContent = localStorage.getItem("chatGPTContent");
      console.log("Stored content:", storedContent); // Check if content is being retrieved

      if (storedContent) {
        // Clean the content to remove extra characters and "content" wrapper
        const cleanedContent = storedContent
          .replace(/^```json\n|\n```$/g, "") // Remove code block delimiters
          .replace(/^"content":\s*/, "") // Remove the "content" wrapper
          .trim();

        console.log("Cleaned content:", cleanedContent); // Check the cleaned content

        try {
          // Parse the cleaned content as JSON
          const intermediateContent = JSON.parse(cleanedContent);
          console.log("Intermediate parsed content:", intermediateContent); // Check the intermediate parsed data

          // If the intermediate content still has a "content" key, parse it again
          const finalContent = intermediateContent.content
            ? JSON.parse(intermediateContent.content)
            : intermediateContent;

          console.log("Final parsed content:", finalContent); // Check the final parsed data
          setContent(finalContent);
          localStorage.removeItem("chatGPTContent");
        } catch (error) {
          console.error("Failed to parse JSON:", error);
        }
      }
    };

    fetchContent();
  }, []);

  const renderCharacters = () => (
    <div className="my-8">
      <h2 className="text-3xl font-bold mb-4">Characters</h2>
      <div className="flex flex-wrap gap-4">
        {(content.characters || []).map((character, index) => (
          <div
            key={index}
            className="bg-gray-100 p-4 rounded-lg shadow-md w-80"
          >
            <h3 className="text-xl font-semibold mb-2">{character.name}</h3>
            <p>{character.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderScenes = () => (
    <div className="my-8">
      <h2 className="text-3xl font-bold mb-4">Scenes</h2>
      {(content.scenes || []).map((scene, index) => (
        <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-md mb-6">
          <h3 className="text-2xl font-semibold mb-2">{scene.title}</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">Characters Present</h4>
              <ul className="list-disc pl-5">
                {(scene.characters || []).map((char, idx) => (
                  <li key={idx}>{char}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Scene Setting</h4>
              <p>{scene.setting || "Not specified"}</p>
            </div>
            <div>
              <h4 className="font-semibold">Image Prompt</h4>
              <p>{scene.image_prompt || "Not specified"}</p>
            </div>
            <div>
              <h4 className="font-semibold">Dialogue & Sound Effects</h4>
              <p>{scene.dialogue_prompt || "Not specified"}</p>
            </div>
            <div>
              <h4 className="font-semibold">Video Transition</h4>
              <p>{scene.video_prompt || "Not specified"}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black p-8 font-sans">
      <h1 className="text-4xl font-bold mb-6">Script Details</h1>
      {renderCharacters()}
      {renderScenes()}
    </div>
  );
}
