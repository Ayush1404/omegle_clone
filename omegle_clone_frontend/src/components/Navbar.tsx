import React from 'react';
import './Navbar.css'; // Import the corresponding CSS file for styling

const Navbar: React.FC = () => {
  return (
    <div className="navbar">
      <div className="logo">
        <img src="logo2.png" alt="Omegle Logo" />
      </div>
      <h2 className='title'>Talk to strangers!</h2>
    </div>
  );
}

export default Navbar;
