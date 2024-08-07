// pages/script.js

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ScriptPage() {
  const [content, setContent] = useState({
    characters: [],
    scenes: [],
    sound_effects: [],
    video_transitions: [],
  });
  const [editing, setEditing] = useState({ type: null, index: null });
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    const fetchContent = () => {
      const storedContent = localStorage.getItem("chatGPTContent");
      if (storedContent) {
        try {
          const parsedContent = JSON.parse(storedContent);
          setContent(
            parsedContent.content
              ? JSON.parse(parsedContent.content)
              : parsedContent
          );
          localStorage.removeItem("chatGPTContent");
        } catch (error) {
          console.error("Failed to parse JSON:", error);
        }
      }
    };

    fetchContent();
  }, []);

  const handleEditClick = (type, index) => {
    setEditing({ type, index });
    const item = content[type][index];
    setEditValues({ ...item });
  };

  const handleChange = (field, value) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (editing.type !== null && editing.index !== null) {
      const updatedContent = { ...content };
      updatedContent[editing.type][editing.index] = editValues;
      setContent(updatedContent);
      setEditing({ type: null, index: null });
    }
  };

  const renderCharacters = () => (
    <div className="my-12 pl-8">
      <h2 className="text-3xl font-bold mb-4">Characters</h2>
      <div className="flex flex-wrap gap-8">
        {(content.characters || []).map((character, index) => (
          <div
            key={index}
            className="relative bg-gray-100 bg-opacity-50 p-4 rounded-3xl shadow-md w-80 border-2 min-h-64 max-w-56"
          >
            <button
              className="absolute top-2 right-2 p-1 bg-white rounded-full"
              onClick={() => handleEditClick("characters", index)}
            >
              <img
                src="https://img.icons8.com/?size=24&id=43809&format=png"
                alt="Edit"
                className="w-5 h-5"
              />
            </button>
            {editing.type === "characters" && editing.index === index ? (
              <div>
                <input
                  type="text"
                  value={editValues.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  onBlur={handleSave}
                  className="border p-1 rounded w-full mb-2"
                />
                <textarea
                  value={editValues.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  onBlur={handleSave}
                  className="border p-1 rounded w-full"
                />
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-semibold mb-2">{character.name}</h3>
                <p>{character.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderScenes = () => (
    <div className="my-12 pl-8">
      <h2 className="text-3xl font-bold mb-4">Scenes</h2>
      {(content.scenes || []).map((scene, index) => (
        <div
          key={index}
          className="relative bg-gray-100 bg-opacity-50 border-2 p-4 rounded-3xl shadow-md max-w-screen-xl mb-8"
        >
          <button
            className="absolute top-2 right-2 p-1 bg-white rounded-full"
            onClick={() => handleEditClick("scenes", index)}
          >
            <img
              src="https://img.icons8.com/?size=24&id=43809&format=png"
              alt="Edit"
              className="w-5 h-5"
            />
          </button>
          {editing.type === "scenes" && editing.index === index ? (
            <div>
              <input
                type="text"
                value={editValues.title}
                onChange={(e) => handleChange("title", e.target.value)}
                onBlur={handleSave}
                className="border p-1 rounded w-full mb-2"
              />
              <h4 className="font-semibold">Characters Present</h4>
              <textarea
                value={editValues.description}
                onChange={(e) => handleChange("description", e.target.value)}
                onBlur={handleSave}
                className="border p-1 rounded w-full mb-2"
              />
              <h4 className="font-semibold">Scene Setting</h4>
              <input
                type="text"
                value={editValues.setting}
                onChange={(e) => handleChange("setting", e.target.value)}
                onBlur={handleSave}
                className="border p-1 rounded w-full mb-2"
              />
              <h4 className="font-semibold">Image Prompt</h4>
              <input
                type="text"
                value={editValues.image_prompt}
                onChange={(e) => handleChange("image_prompt", e.target.value)}
                onBlur={handleSave}
                className="border p-1 rounded w-full mb-2"
              />
              <h4 className="font-semibold">Dialogue & Sound Effects</h4>
              <input
                type="text"
                value={editValues.dialogue_prompt}
                onChange={(e) =>
                  handleChange("dialogue_prompt", e.target.value)
                }
                onBlur={handleSave}
                className="border p-1 rounded w-full mb-2"
              />
              <h4 className="font-semibold">Video Transition</h4>
              <input
                type="text"
                value={editValues.video_prompt}
                onChange={(e) => handleChange("video_prompt", e.target.value)}
                onBlur={handleSave}
                className="border p-1 rounded w-full"
              />
            </div>
          ) : (
            <div>
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
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <nav className="w-full flex items-center justify-between">
        <div className="p-4 flex flex-row gap-2">
          <img
            src="https://img.icons8.com/?size=50&id=25603&format=png"
            alt="logo"
            className="w-8 h-8 self-center"
          />
          <a href="/" className="text-3xl font-semibold self-center">
            Media Engine
          </a>
        </div>
        <Link legacyBehavior href="/profile">
          <a>
            <img
              src="https://img.icons8.com/?size=30&id=114064&format=png"
              alt="Profile"
              className="border-2 rounded-full p-1 mr-2"
            />
          </a>
        </Link>
      </nav>
      {renderCharacters()}
      {renderScenes()}
    </div>
  );
}
