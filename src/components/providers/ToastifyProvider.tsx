// src/components/providers/ToastifyProvider.tsx
'use client';

import React, { ReactNode } from 'react';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ToastifyProviderProps {
  children: ReactNode;
}

const ToastifyProvider: React.FC<ToastifyProviderProps> = ({ children }) => {
  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={2800}
        hideProgressBar
        newestOnTop
        closeOnClick
        draggable
        pauseOnHover
        pauseOnFocusLoss={false}
        theme="colored"
        transition={Slide}
        limit={3}
        // outer container
        className="yosola-toast-container"
        // individual toast
        toastClassName="yosola-toast"
      />
    </>
  );
};

export default ToastifyProvider;
