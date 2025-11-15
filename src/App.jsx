import React from "react";
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Routes from "./Routes";

function App() {
  return (
    <>
      <Routes />
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Slide}
        limit={3}
        style={{
          zIndex: 99999,
          top: '1rem',
          right: '1rem',
        }}
        toastStyle={{
          borderRadius: '0.75rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          fontSize: '0.95rem',
          padding: '1rem 1.25rem',
        }}
        progressStyle={{
          background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
        }}
      />
    </>
  );
}

export default App;
