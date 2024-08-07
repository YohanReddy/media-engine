"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = `https://media-engine-backend-95txu76jq-yohanreddys-projects.vercel.app/image-generation`; // Updated FastAPI server endpoint
const CALLBACK_URL =
  "https://media-engine-backend-95txu76jq-yohanreddys-projects.vercel.app/webhook"; // Replace with your actual ngrok URL

export default function ScriptPage() {
  const [content, setContent] = useState({
    characters: [],
    scenes: [],
    sound_effects: [],
    video_transitions: [],
  });
  const [editing, setEditing] = useState({ type: null, index: null });
  const [editValues, setEditValues] = useState({});
  const [executionIds, setExecutionIds] = useState({});
  const [imageUrls, setImageUrls] = useState({});
  const [visualsGenerated, setVisualsGenerated] = useState(false); // Track if visuals are generated

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

  const handleGenerateVisuals = async () => {
    for (const [index, character] of content.characters.entries()) {
      const payload = {
        callback: CALLBACK_URL,
        workflow_input: {
          saltprompt: {
            value: character.description,
            value_type: "RAW",
          },
        },
      };

      try {
        const response = await axios.post(API_URL, payload);
        setExecutionIds((prev) => ({
          ...prev,
          [`character-${index}`]: response.data.execution_id,
        }));
      } catch (error) {
        console.error(
          "Failed to send request:",
          error.response ? error.response.data : error.message
        );
      }
    }

    for (const [index, scene] of content.scenes.entries()) {
      const payload = {
        callback: CALLBACK_URL,
        workflow_input: {
          saltprompt: {
            value: scene.image_prompt,
            value_type: "RAW",
          },
        },
      };

      try {
        const response = await axios.post(API_URL, payload);
        setExecutionIds((prev) => ({
          ...prev,
          [`scene-${index}`]: response.data.execution_id,
        }));
      } catch (error) {
        console.error(
          "Failed to send request:",
          error.response ? error.response.data : error.message
        );
      }
    }
    setVisualsGenerated(true); // Mark visuals as generated
  };

  useEffect(() => {
    const fetchWebhookResponse = async () => {
      for (const [key, executionId] of Object.entries(executionIds)) {
        try {
          const response = await axios.get(
            `https://media-engine-backend-95txu76jq-yohanreddys-projects.vercel.app/latest-webhook?execution_id=${executionId}`
          );
          if (
            response.data &&
            response.data.Output &&
            response.data.Output.length > 0
          ) {
            setImageUrls((prev) => ({
              ...prev,
              [key]: response.data.Output[0],
            }));
          }
        } catch (error) {
          console.error("Failed to fetch webhook response:", error.message);
        }
      }
    };

    const interval = setInterval(fetchWebhookResponse, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [executionIds]);

  const renderCharacters = () => (
    <div className="my-12 pl-8">
      <h2 className="text-3xl font-bold mb-4">Characters</h2>
      <div className="flex flex-wrap gap-8">
        {(content.characters || []).map((character, index) => (
          <div
            key={index}
            className="relative p-4 rounded-3xl shadow-md w-80 border-2 min-h-64 max-w-56"
            style={{
              backgroundImage: imageUrls[`character-${index}`]
                ? `url(${imageUrls[`character-${index}`]})`
                : "",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div
              className={`absolute inset-0 ${
                visualsGenerated
                  ? "bg-gradient-to-b from-transparent to-black opacity-50"
                  : "bg-transparent"
              }`}
            ></div>
            <button
              className="absolute top-2 right-2 p-1 bg-white rounded-full z-10"
              onClick={() => handleEditClick("characters", index)}
            >
              <img
                src="https://img.icons8.com/?size=24&id=43809&format=png"
                alt="Edit"
                className="w-5 h-5"
              />
            </button>
            {editing.type === "characters" && editing.index === index ? (
              <div className="relative z-10">
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
              <div
                className={`relative z-10 ${
                  visualsGenerated ? "text-white font-bold" : ""
                }`}
              >
                <h3 className="text-xl mb-2">{character.name}</h3>
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
          className="relative border-2 p-4 rounded-3xl shadow-md max-w-screen-xl mb-8"
          style={{
            backgroundImage: imageUrls[`scene-${index}`]
              ? `url(${imageUrls[`scene-${index}`]})`
              : "",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            className={`absolute inset-0 ${
              visualsGenerated
                ? "bg-gradient-to-r from-transparent to-black opacity-50"
                : "bg-transparent"
            }`}
          ></div>
          <button
            className="absolute top-2 right-2 p-1 bg-white rounded-full z-10"
            onClick={() => handleEditClick("scenes", index)}
          >
            <img
              src="https://img.icons8.com/?size=24&id=43809&format=png"
              alt="Edit"
              className="w-5 h-5"
            />
          </button>
          {editing.type === "scenes" && editing.index === index ? (
            <div className="relative z-10">
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
            <div
              className={`relative z-10 ${
                visualsGenerated ? "text-white font-bold" : ""
              }`}
            >
              <h3 className="text-2xl mb-2">{scene.title}</h3>
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
      <button
        onClick={handleGenerateVisuals}
        className="text-black px-4 py-2 rounded-lg float-end h-fit w-fit bg-white m-8"
      >
        Generate Visuals
      </button>
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
