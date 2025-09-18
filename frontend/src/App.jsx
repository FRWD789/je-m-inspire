import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { EventList } from './pages/EventList';
import { EventForm } from './pages/EventForm';

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Événements</Link>
        <Link to="/create">Créer événement</Link>
      </nav>
      <Routes>
        <Route path="/" element={<EventList />} />
        <Route path="/create" element={<EventForm />} />
      </Routes>
    </Router>
  );
}

export default App;
