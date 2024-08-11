// client/src/components/Tracker.jsx
import React, { useState, useEffect } from 'react';
import Axios from 'axios';

Axios.defaults.withCredentials = true

const Tracker = () => {
  const [chunk, setChunk] = useState(1);
  const [result, setResult] = useState({});

  useEffect(() => {
    // Fetch the current chunk from the backend
    const fetchCurrentChunk = async () => {
      try {
        const response = await Axios.get(`${import.meta.env.VITE_BACKEND_URL}/`);
        setResult(prev => {return({...prev, ...response.data})})
        console.log(response)
      } catch (error) {
        console.error('Error fetching current chunk:', error);
      }
    };

    fetchCurrentChunk();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex flex-col justify-center items-center text-white">
      <h1 className="text-4xl font-bold mb-6">do-it-now</h1>
      
      {/* <button
        onClick={startDay}
        className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg shadow-md text-xl font-semibold mb-4 transition duration-300"
      >
        Start Day
      </button> */}
      
      <div className="mt-4 mb-8 text-2xl">
        {chunk > 0 ? `Current Chunk: ${chunk}` : 'Your day hasn\'t started yet.'}
      </div>
      
      {/* <button
        onClick={endDay}
        className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-lg shadow-md text-xl font-semibold transition duration-300"
      >
        End Day
      </button> */}

      {Object.keys(result).map((key, index) => {
        return (<div key={index}>{`${key} : ${result[key]}`}</div>)
      })}
    </div>
  );
};

export default Tracker;
