import React from 'react';

export default function TailwindTest() {
  return (
    <div className="bg-red-500 text-white p-4 m-4 rounded">
      <h1 className="text-2xl font-bold">Tailwind Test</h1>
      <p className="mt-2">If you see this styled with red background, Tailwind is working!</p>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
        Test Button
      </button>
    </div>
  );
}