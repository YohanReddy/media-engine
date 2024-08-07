"use client";

import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = `http://localhost:8000/image-generation`; // Updated FastAPI server endpoint
const CALLBACK_URL =
  "https://1653-2405-201-c40b-9152-65a0-70a1-9e09-2aef.ngrok-free.app/webhook"; // Replace with your actual ngrok URL

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [executionId, setExecutionId] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous responses
    setImageUrl(null);
    setExecutionId(null);

    const payload = {
      callback: CALLBACK_URL,
      workflow_input: {
        saltprompt: {
          value: prompt,
          value_type: "RAW",
        },
      },
    };

    try {
      const response = await axios.post(API_URL, payload);
      setExecutionId(response.data.execution_id);
    } catch (error) {
      console.error(
        "Failed to send request:",
        error.response ? error.response.data : error.message
      );
    }
  };

  useEffect(() => {
    if (executionId) {
      const interval = setInterval(async () => {
        try {
          const response = await axios.get(
            `http://localhost:8000/latest-webhook?execution_id=${executionId}`
          );
          if (
            response.data &&
            response.data.Output &&
            response.data.Output.length > 0
          ) {
            setImageUrl(response.data.Output[0]);
            clearInterval(interval);
          }
        } catch (error) {
          console.error("Failed to fetch webhook response:", error.message);
        }
      }, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [executionId]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center text-black">
      <nav className="w-full h-fit">
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
      </nav>
      <div className="w-full max-w-md p-8 bg-white rounded-lg pt-40">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-gray-700"
            >
              Enter your prompt:
            </label>
            <input
              id="prompt"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Drop your imagination here..."
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-1/2 py-2 px-4 bg-black text-white font-semibold rounded-md shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Send Request
          </button>
        </form>
        {executionId && (
          <div className="mt-4">
            <h2 className="text-sm font-semibold">
              Execution ID: {executionId}
            </h2>
          </div>
        )}
        {imageUrl && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold">Image Output</h2>
            <img
              src={imageUrl}
              alt="Output"
              className="w-full h-auto border border-gray-300 rounded-md mt-2"
            />
          </div>
        )}
      </div>
    </div>
  );
}
