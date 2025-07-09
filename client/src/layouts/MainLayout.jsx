import React from 'react';
import Menu from '../components/Menu/Menu';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <>
      <Menu />
      <div className="p-6">
        <Outlet />
      </div>
    </>
  );
}
