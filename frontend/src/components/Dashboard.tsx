// client/src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/schedule');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching schedule data:', error);
      }
    };
    fetchData();
  }, []);

  if (!Array.isArray(data)) {
    return <div className="text-center text-red-500">Error: Expected an array of schedules.</div>;
  }

  const ratings = data.map(schedule => schedule.chunks.map(chunk => chunk.rating));
  const dates = data.map(schedule => new Date(schedule.date).toLocaleDateString());

  const chartData = {
    labels: dates,
    datasets: [
      {
        label: 'Chunk Ratings',
        data: ratings.flat(),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Performance Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <Bar data={chartData} />
      </div>
    </div>
  );
};

export default Dashboard;
