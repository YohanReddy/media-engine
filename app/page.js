"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center text-black font-sans">
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
      <div className="w-full bg-white space-x-4">
        <h1 className="text-4xl font-bold mb-4 text-center">
          Transform your ideas <br /> into films that are <br /> captivating
        </h1>
        <div className="flex flex-row items-center justify-center gap-8">
          <div className="flex flex-wrap gap-4">
            <div className="bg-white-100 p-4 rounded-lg shadow-md w-80">
              <h3 className="text-xl font-semibold mb-2">Image Generation</h3>
              <p className="mb-6">Generate images from text</p>
              <Link
                href="/image"
                className="bg-black text-white px-4 py-2 rounded-lg"
              >
                Go
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white-100 p-4 rounded-lg shadow-md w-80">
              <h3 className="text-xl font-semibold mb-2">Generate Stories</h3>
              <p className="mb-6">Generate stories from text</p>
              <Link
                href="/generate"
                className="bg-black text-white px-4 py-2 rounded-lg"
              >
                Go
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
