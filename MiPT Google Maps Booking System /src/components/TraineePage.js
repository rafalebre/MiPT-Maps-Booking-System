import React, { useState, useEffect } from 'react';
import db from '../firebase';
import MapComponent from './MapComponent';
import { Marker, InfoWindow } from '@react-google-maps/api';

const TraineePage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [searchDistance, setSearchDistance] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [hoveredEventId, setHoveredEventId] = useState(null);

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

  useEffect(() => {
    const fetchEvents = async () => {
      const snapshot = await db.collection('events').get();
      const fetchedEvents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEvents(fetchedEvents);
    };

    fetchEvents();
  }, []);

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

  const handleSearch = () => {
    setSearchPerformed(true);
    let filtered = events.filter((event) => {
      const isInSelectedActivity = selectedActivity === '' || event.activity === selectedActivity;
      const isAvailable = event.status === 'available';

      if (!isInSelectedActivity || !isAvailable) {
        return false;
      }

      if (searchDistance !== '') {
        const distanceInKm = getDistanceInKm(markerPosition, {
          lat: event.lat,
          lng: event.lng,
        });
        return distanceInKm <= parseFloat(searchDistance);
      }

      return true;
    });

    filtered = filtered.map((event) => {
      const distanceInKm = getDistanceInKm(markerPosition, {
        lat: event.lat,
        lng: event.lng,
      });
      return { ...event, distanceInKm: distanceInKm.toFixed(2) };
    });

    setFilteredEvents(filtered);
    setSelectedActivity('');
    setSearchDistance('');
  };

  const handleApply = async (eventId) => {
    // Replace with the trainee's actual ID or details
    const traineeId = 'trainee1';

    // Update the event's status to 'booked'
    await db.collection('events').doc(eventId).update({
      status: 'booked',
      traineeId: traineeId,
    });

    // Remove the booked event from the filteredEvents list
    setFilteredEvents(filteredEvents.filter((event) => event.id !== eventId));

    alert('Booked the event successfully');
  };

  // function to calculate the distance from the users location
  const getDistanceInKm = (pos1, pos2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (pos2.lat - pos1.lat) * (Math.PI / 180);
    const dLng = (pos2.lng - pos1.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(pos1.lat * (Math.PI / 180)) *
      Math.cos(pos2.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  return (
    <div>
      <h1>Trainee Page</h1>
      <div>
        <label htmlFor="activity">Activity:</label>
        <select
          name="activity"
          value={selectedActivity}
          onChange={(e) => setSelectedActivity(e.target.value)}
        >
          <option value="">Select an activity</option>
          {activities.map((activity) => (
            <option key={activity} value={activity}>
              {activity}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="distance">Distance (km):</label>
        <input
          type="number"
          name="distance"
          value={searchDistance}
          onChange={(e) => setSearchDistance(e.target.value)}
          min="1"
        />
      </div>
      <button onClick={handleSearch}>Search</button>

      <MapComponent markerPosition={markerPosition}>
  {filteredEvents.map((event) => (
    <Marker
      key={event.id}
      position={{ lat: event.lat, lng: event.lng }}
      onClick={() => setSelectedEvent(event)}
      onMouseOver={() => setHoveredEventId(event.id)}
      onMouseOut={() => setHoveredEventId(null)}
      icon={{
        url: hoveredEventId === event.id ? 'https://maps.google.com/mapfiles/kml/shapes/info.png' : 'https://maps.google.com/mapfiles/kml/shapes/target.png',
        scaledSize: new window.google.maps.Size(30, 30),
      }}
    />
  ))}
  {selectedEvent && (
    <InfoWindow
      position={{ lat: selectedEvent.lat, lng: selectedEvent.lng }}
      onCloseClick={() => setSelectedEvent(null)}
    >
      <div>
        <h4>{selectedEvent.activity}</h4>
        <p>
          {selectedEvent.date} - {selectedEvent.time}
        </p>
      </div>
    </InfoWindow>
  )}
</MapComponent>

      <ul>
        {filteredEvents.map((event) => (
          <li
            key={event.id}
            onMouseOver={() => setHoveredEventId(event.id)}
            onMouseOut={() => setHoveredEventId(null)}
            style={{ backgroundColor: hoveredEventId === event.id ? 'lightgray' : 'white' }}
          >
            {event.activity} - {event.date} - {event.time} - {event.location} - {event.distanceInKm} km
            <button onClick={() => handleApply(event.id)}>Apply</button>
          </li>
        ))}
      </ul>

      {filteredEvents.length === 0 && searchPerformed && (
        <p>
          Unfortunately, your search did not find any events. How about trying a
          new activity?
        </p>
      )}
    </div>
  );
};

export default TraineePage;