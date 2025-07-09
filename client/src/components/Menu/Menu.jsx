// src/components/Menu/Menu.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import './Menu.scss';

const Menu = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="menu-cover" style={{background: '#f3f4f6', boxShadow: 'none', height: 56}}></div>
      <nav className="menu-bar menu-bar-flat">
        <div className="menu-logo">PickleMate</div>
        <div className="menu-hamburger" onClick={() => setOpen(!open)}>
          <FiMenu size={26} color="#222" />
        </div>
        <div className={`menu-links${open ? ' open' : ''}`}>
          <NavLink to="/" className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'} end onClick={() => setOpen(false)}>
            Trang chủ
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'} onClick={() => setOpen(false)}>
            Giới thiệu
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'} onClick={() => setOpen(false)}>
            Liên hệ
          </NavLink>
        </div>
      </nav>
    </>
  );
};

export default Menu;
