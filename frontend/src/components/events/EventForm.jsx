import React, { useState } from 'react';
import { useEvents } from '../hooks/useEvents';

export const EventForm = () => {
  const { addEvent } = useEvents();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [maxPlaces, setMaxPlaces] = useState('');
  const [availablePlaces, setAvailablePlaces] = useState('');
  const [level, setLevel] = useState('');
  const [priority, setPriority] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const eventData = {
      name,
      description,
      start_date: startDate,
      end_date: endDate,
      base_price: parseFloat(basePrice),
      capacity: parseInt(capacity),
      max_places: parseInt(maxPlaces),
      available_places: parseInt(availablePlaces),
      level,
      priority: parseInt(priority)
    };

    await addEvent(eventData);
    
    // Réinitialiser le formulaire
    setName('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setBasePrice('');
    setCapacity('');
    setMaxPlaces('');
    setAvailablePlaces('');
    setLevel('');
    setPriority('');
  };

  return (
    <div>
      <h1>Créer un nouvel événement</h1>
      
      <form onSubmit={handleSubmit}>
        <table border="1" cellPadding="5" cellSpacing="0">
          <tbody>
            <tr>
              <td><label htmlFor="name">Nom de l'événement:</label></td>
              <td>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  size="50"
                />
              </td>
            </tr>
            
            <tr>
              <td><label htmlFor="description">Description:</label></td>
              <td>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  cols="50"
                  required
                />
              </td>
            </tr>
            
            <tr>
              <td><label htmlFor="startDate">Date de début:</label></td>
              <td>
                <input
                  type="datetime-local"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </td>
            </tr>
            
            <tr>
              <td><label htmlFor="endDate">Date de fin:</label></td>
              <td>
                <input
                  type="datetime-local"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </td>
            </tr>
            
            <tr>
              <td><label htmlFor="basePrice">Prix de base (€):</label></td>
              <td>
                <input
                  type="number"
                  id="basePrice"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  step="0.01"
                  min="0"
                  required
                />
              </td>
            </tr>
            
            <tr>
              <td><label htmlFor="capacity">Capacité totale:</label></td>
              <td>
                <input
                  type="number"
                  id="capacity"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  min="1"
                  required
                />
              </td>
            </tr>
            
            <tr>
              <td><label htmlFor="maxPlaces">Places maximum:</label></td>
              <td>
                <input
                  type="number"
                  id="maxPlaces"
                  value={maxPlaces}
                  onChange={(e) => setMaxPlaces(e.target.value)}
                  min="1"
                  required
                />
              </td>
            </tr>
            
            <tr>
              <td><label htmlFor="availablePlaces">Places disponibles:</label></td>
              <td>
                <input
                  type="number"
                  id="availablePlaces"
                  value={availablePlaces}
                  onChange={(e) => setAvailablePlaces(e.target.value)}
                  min="0"
                  required
                />
              </td>
            </tr>
            
            <tr>
              <td><label htmlFor="level">Niveau:</label></td>
              <td>
                <select 
                  id="level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  required
                >
                  <option value="">Sélectionner un niveau</option>
                  <option value="débutant">Débutant</option>
                  <option value="intermédiaire">Intermédiaire</option>
                  <option value="avancé">Avancé</option>
                  <option value="expert">Expert</option>
                </select>
              </td>
            </tr>
            
            <tr>
              <td><label htmlFor="priority">Priorité (1-10):</label></td>
              <td>
                <input
                  type="number"
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  min="1"
                  max="10"
                  required
                />
              </td>
            </tr>
            
            <tr>
              <td colspan="2">
                <button type="submit">Créer l'événement</button>
                <button type="button" onClick={() => {
                  setName('');
                  setDescription('');
                  setStartDate('');
                  setEndDate('');
                  setBasePrice('');
                  setCapacity('');
                  setMaxPlaces('');
                  setAvailablePlaces('');
                  setLevel('');
                  setPriority('');
                }}>
                  Réinitialiser
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
};