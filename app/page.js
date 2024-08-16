"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const words = ["captivating", "beautiful", "amazing"];
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prevIndex) => (prevIndex + 1) % words.length);
        setFade(true);
      }, 250);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center text-black font-sans">
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
        <div>
          <Link
            href="/generate"
            className="bg-black text-white px-4 py-2 rounded-md mr-4"
          >
            Get Started
          </Link>
          <Link
            href="/image"
            className="bg-black text-white px-4 py-2 rounded-md mr-4"
          >
            Generate Image
          </Link>
        </div>
      </nav>

      <div className="w-full bg-white mt-64">
        <h1 className="text-5xl font-semibold mb-4 text-center leading-normal">
          Transform your ideas <br /> into films that are <br />{" "}
          <span className="inline-block px-2 font-normal rounded-md bg-black text-white">
            <span
              className={`transition-opacity duration-500 ${
                fade ? "opacity-100" : "opacity-0"
              }`}
            >
              {words[index]}
            </span>
          </span>
        </h1>
      </div>
    </div>
  );
}
