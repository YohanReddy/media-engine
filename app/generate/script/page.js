"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { supabase } from "@/app/lib/supabaseClient";

const IMAGE_URL = `https://media-engine-backend.vercel.app/image-generation`;
const VIDEO_URL = `https://media-engine-backend.vercel.app/video-generation`;
const CALLBACK_URL = "https://media-engine-backend.vercel.app/webhook";

export default function ScriptPage() {
  const [content, setContent] = useState({
    scenes: [],
    sound_effects: [],
    video_transitions: [],
  });
  const [executionIds, setExecutionIds] = useState({});
  const [imageUrls, setImageUrls] = useState({});
  const [videoUrls, setVideoUrls] = useState({});
  const [visualsGenerated, setVisualsGenerated] = useState(false);
  const [videosGenerated, setVideosGenerated] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleGenerateVisuals = async () => {
    setLoading(true);
    const newExecutionIds = {};
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
        const response = await axios.post(IMAGE_URL, payload);
        newExecutionIds[`scene-${index}`] = response.data.execution_id;
      } catch (error) {
        console.error(
          "Failed to send request:",
          error.response ? error.response.data : error.message
        );
      }
    }
    setExecutionIds(newExecutionIds);
    setVisualsGenerated(true);
  };

  const handleGenerateVideos = async () => {
    setLoading(true);
    const newVideoExecutionIds = {};
    for (const [index, imageUrl] of Object.entries(imageUrls)) {
      const payload = {
        callback: CALLBACK_URL,
        workflow_input: {
          salturl: {
            value: imageUrl,
            value_type: "RAW",
          },
        },
      };

      try {
        const response = await axios.post(VIDEO_URL, payload);
        newVideoExecutionIds[`scene-${index}`] = response.data.execution_id;
      } catch (error) {
        console.error(
          "Failed to send request:",
          error.response ? error.response.data : error.message
        );
      }
    }
    setExecutionIds((prev) => ({ ...prev, ...newVideoExecutionIds }));
    setVideosGenerated(true);
  };

  useEffect(() => {
    const fetchWebhookResponse = async () => {
      for (const [key, executionId] of Object.entries(executionIds)) {
        try {
          const response = await axios.get(
            `https://media-engine-backend.vercel.app/latest-webhook?execution_id=${executionId}`
          );
          console.log("Webhook response:", response.data); // Debugging log
          if (
            response.data &&
            response.data.Output &&
            response.data.Output.length > 0
          ) {
            const outputUrl = response.data.Output[0];
            if (key.startsWith("scene-")) {
              setImageUrls((prev) => ({
                ...prev,
                [key]: outputUrl,
              }));
              // Save image URL to Supabase
              await supabase.from("images").upsert({ id: key, url: outputUrl });
            } else {
              setVideoUrls((prev) => ({
                ...prev,
                [key]: outputUrl,
              }));
              // Save video URL to Supabase
              await supabase.from("videos").upsert({ id: key, url: outputUrl });
            }
            // Remove the executionId from the state to stop polling
            setExecutionIds((prev) => {
              const { [key]: _, ...remaining } = prev;
              return remaining;
            });
          }
        } catch (error) {
          console.error("Failed to fetch webhook response:", error.message);
        }
      }

      // Check if all images and videos are loaded
      const allImagesLoaded =
        Object.keys(executionIds).filter((key) => key.startsWith("scene-"))
          .length === Object.keys(imageUrls).length;
      const allVideosLoaded =
        Object.keys(executionIds).filter((key) => !key.startsWith("scene-"))
          .length === Object.keys(videoUrls).length;

      if (allImagesLoaded && allVideosLoaded) {
        setLoading(false);
      }
    };

    const interval = setInterval(fetchWebhookResponse, 5000);
    return () => clearInterval(interval);
  }, [executionIds, imageUrls, videoUrls]);

  const renderScenes = () => (
    <div className="my-12 pl-8">
      <h2 className="text-3xl font-bold mb-4">Scenes</h2>
      <div className="flex flex-wrap">
        {(content.scenes || []).map((scene, index) => (
          <div
            key={index}
            className="relative border-2 p-4 rounded-3xl shadow-md mb-8"
            style={{
              width: "calc(50% - 16px)", // Adjust width to fit two in a row with margin
              height: "440px",
              backgroundImage: imageUrls[`scene-${index}`]
                ? `url(${imageUrls[`scene-${index}`]})`
                : "",
              backgroundSize: "cover",
              backgroundPosition: "center",
              marginRight: index % 2 === 0 ? "16px" : "0px", // Add right margin to the first scene in each row
            }}
          >
            {loading && !imageUrls[`scene-${index}`] && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div role="status">
                  <svg
                    aria-hidden="true"
                    className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            )}
            {!loading && imageUrls[`scene-${index}`] && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black opacity-50"></div>
            )}
            <div
              className={`relative z-10 ${
                visualsGenerated && imageUrls[`scene-${index}`]
                  ? "text-white font-bold"
                  : ""
              }`}
            >
              <h3 className="text-2xl mb-8">{scene.title}</h3>
              <div className="space-y-8">
                <div>
                  <h4 className="font-semibold">Image Prompt</h4>
                  <p>{scene.image_prompt || "Not specified"}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Dialogue & Sound Effects</h4>
                  <p>{scene.sound_prompt || "Not specified"}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={handleGenerateVisuals}
        className="text-black px-4 py-2 rounded-lg float-end h-fit w-fit bg-white m-8"
        disabled={visualsGenerated}
      >
        Generate Visuals
      </button>
      <button
        onClick={handleGenerateVideos}
        className="text-black px-4 py-2 rounded-lg float-end h-fit w-fit bg-white m-8"
        disabled={!visualsGenerated || videosGenerated}
      >
        Generate Videos
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
      {renderScenes()}
    </div>
  );
}
