import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./App.css"

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  // Check if user is already logged in by checking token
  useEffect(() => {
    axios.get('http://localhost:8000/protected', { withCredentials: true })
      .then(response => {
        setLoggedIn(true);
        setUsername(response.data.user.username);
      })
      .catch(error => {
        setLoggedIn(false);
        console.error('User is not authenticated', error);
      });
  }, []);

  // Login function
  const handleLogin = (username, password) => {
    axios.post('http://localhost:8000/login', { username, password }, { withCredentials: true })
      .then(response => {
        setLoggedIn(true);
        setUsername(username);
      })
      .catch(error => {
        alert('Login failed!');
        console.error(error);
      });
  };

  // Logout function
  const handleLogout = () => {
    axios.post('http://localhost:8000/logout', {}, { withCredentials: true })
      .then(() => {
        setLoggedIn(false);
        setUsername('');
      })
      .catch(error => console.error('Error logging out', error));
  };

  return (
    <div className="App">
      {loggedIn ? (
        <div>
          <h1>Welcome, {username}</h1>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <h1>Please log in</h1>
          <button onClick={() => handleLogin('harry', 'pass@123')}>Login</button>
        </div>
      )}
    </div>
  );
}

export default App;