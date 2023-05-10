import React, { useState, useEffect, useCallback } from 'react';
import db from '../firebase';
import MapComponent from './MapComponent';
import { StandaloneSearchBox } from '@react-google-maps/api';

const CoachPage = () => {
  const [showMap, setShowMap] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [searchBox, setSearchBox] = useState(null);
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    activity: '',
    location: '',
    date: '',
    time: '',
    lat: '',
    lng: '',
    status: 'available',
    traineeId: null,
  });

  const activities = [
    'Soccer',
    'Basketball',
    'Tennis',
    'Swimming',
    'Yoga',
    'Gymnastics',
    'Martial Arts',
    'Running',
    'Cycling',
    'CrossFit',
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      activity: '',
      location: '',
      date: '',
      time: '',
      lat: '',
      lng: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await db.collection('events').add(form);
    alert('Event created successfully');
    fetchEvents();
    resetForm();
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setMarkerPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    const eventsSnapshot = await db.collection('events').get();
    const eventsData = eventsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setEvents(eventsData);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onMapClick = (e) => {
    setMarkerPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    setForm({ ...form, lat: e.latLng.lat(), lng: e.latLng.lng() });
  };

  const onSearchBoxLoad = (ref) => {
    setSearchBox(ref);
  };

  const onPlacesChanged = () => {
    if (searchBox) {
      const place = searchBox.getPlaces()[0];
      if (place) {
        setMarkerPosition({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
        setForm({
          ...form,
          location: `${place.name}, ${place.formatted_address}`,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    }
  };


  const deleteEvent = async (eventId) => {
    await db.collection('events').doc(eventId).delete();
    fetchEvents();
  };

  const upcomingEvents = events.filter((event) => event.status === 'booked');
  const availableEvents = events.filter((event) => event.status !== 'booked');


  return (
    <div>
      <h1>Coach Page</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="activity">Activity:</label>
        <select
          name="activity"
          value={form.activity}
          onChange={handleChange}
          required
        >
          <option value="">Select an activity</option>
          {activities.map((activity) => (
            <option key={activity} value={activity}>
              {activity}
            </option>
          ))}
        </select>
        <br />
        <label htmlFor="date">Date:</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />
        <br />
        <label htmlFor="time">Time:</label>
        <input
          type="time"
          name="time"
          value={form.time}
          onChange={handleChange}
          required
        />
        <br />
        <br />
        <label htmlFor="location">Location:</label>
        <p>
          {form.location
            ? form.location
            : 'Select a place in the map below'}
        </p>
        <br />
        <button type="submit">Create event</button>
      </form>

      <button onClick={() => setShowMap(!showMap)}>
        {showMap ? 'Hide Map' : 'Show Map'}
      </button>

      {showMap && (
        <div style={{ height: '400px' }}>
          <StandaloneSearchBox
            onLoad={onSearchBoxLoad}
            onPlacesChanged={onPlacesChanged}
          >
            <input
              type="text"
              placeholder="Search for a place"
              style={{ width: '100%', height: '40px', paddingLeft: '10px' }}
            />
          </StandaloneSearchBox>
          <MapComponent
            onMapClick={onMapClick}
            markerPosition={markerPosition}
          />
        </div>
      )}

      <h2>Your Available Events</h2>
      <ul>
        {availableEvents.map((event) => (
          <li key={event.id}>
            {event.activity} - {event.date} - {event.time} - {event.location}{' '}
            <button onClick={() => deleteEvent(event.id)}>Cancel</button>
          </li>
        ))}
      </ul>

      <h2>Your Upcoming Events</h2>
      <ul>
        {upcomingEvents.map((event) => (
          <li key={event.id}>
            {event.activity} - {event.date} - {event.time} - {event.location}
            <br />
            <button>
              Class booked by {event.traineeId ? event.traineeId : "(trainee ID)"}
            </button>
          </li>
        ))}
      </ul>

    </div>
  );
};

export default CoachPage;