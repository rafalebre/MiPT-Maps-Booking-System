import React from 'react';
import './App.css';
import CoachPage from './components/CoachPage';
import TraineePage from './components/TraineePage';


function App() {
  return (
    <div className="App">
      <div className='CoachPage'><CoachPage /></div>
      <div className='TraineePage'><TraineePage /></div>
      
    </div>
  );
}

export default App;