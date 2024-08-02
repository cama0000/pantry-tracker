import React, { useState } from 'react';

const Navbar = () => {

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-2xl font-bold">
          <a href="/">PantryPal</a>
        </div>
        {/* come back to this when you have free trial */}
        <img src="pantry-tracker/images/pantry.png" alt="pantry" />
        <div className="lg:hidden">
          <button className="text-white">
            &#9776; {/* Hamburger icon */}
          </button>
        </div>
        <ul className={`lg:flex lg:items-center lg:space-x-6 lg:block`}>
          <li>
            
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
