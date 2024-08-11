import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Tracker from './components/Tracker';
import Dashboard from './components/Dashboard';
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Tracker />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
