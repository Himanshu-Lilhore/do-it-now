// client/src/components/Tracker.jsx
import React, { useState, useEffect } from 'react';
import Axios from 'axios';

Axios.defaults.withCredentials = true

export default function Home() {
  const [day, setDay] = useState()
  const [currState, setCurrState] = useState({ state: 'default' })
  const [chunk, setChunk] = useState(1);
  const [result, setResult] = useState({});

  useEffect(() => {
    // fetch current state
    const fetchCurrState = async () => {
      try{
        const response = await Axios.post(`${import.meta.env.VITE_BACKEND_URL}/chunk/create`);
        setResult(prev => { return ({ ...prev, ...response.data }) })
        console.log(response)
      } catch (err) {
        console.error('Error fetching current chunk:', error);
      }
    }

    // create new chunk
    const createChunk = async () => {
      try {
        const response = await Axios.post(`${import.meta.env.VITE_BACKEND_URL}/chunk/create`);
        setResult(prev => { return ({ ...prev, ...response.data }) })
        console.log(response)
      } catch (error) {
        console.error('Error fetching current chunk:', error);
      }
    };

    createChunk();
  }, []);


  const changeState = async () => {
    if (day.state === 'sleep') {
      try {
        const response = await Axios.post(`${import.meta.env.VITE_BACKEND_URL}/day/create`);
        if (response.status === 200) {
          setDay(response.data);
        }
        else {
          console.log("Issue fetching creating new day");
        }
      } catch (error) {
        console.error('Error fetching creating new day:', error);
      }
    } else {

    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex flex-col justify-center items-center text-white">
      <h1 className="text-4xl font-bold mb-6">do-it-now</h1>

      <button
        onClick={changeState}
        className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg shadow-md text-xl font-semibold mb-4 transition duration-300"
      >
        {day.state === 'awake' ? 'Sleep now' : 'Woke up'}
      </button>


      {Object.keys(result).map((key, index) => {
        return (<div key={index}>{`${key} : ${result[key]}`}</div>)
      })}
    </div>
  );
};