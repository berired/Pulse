import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  const formVariants = {
    hidden: (direction) => ({
      opacity: 0,
      x: direction > 0 ? 100 : -100,
      y: 0,
    }),
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.5,
      },
    },
    exit: (direction) => ({
      opacity: 0,
      x: direction > 0 ? -100 : 100,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: 0.3,
      },
    }),
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Pulse</h1>
            <p>Clinical workspace for nursing students</p>
          </div>

          <div className="auth-tabs">
            <button
              className={`tab ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`tab ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          <div className="auth-content">
            <AnimatePresence mode="wait" custom={isLogin ? -1 : 1}>
              <motion.div
                key={isLogin ? 'login' : 'signup'}
                custom={isLogin ? -1 : 1}
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {isLogin ? (
                  <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
                ) : (
                  <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
