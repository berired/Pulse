import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  MessageCircle,
  Zap,
  Calendar,
  FileText,
  Users,
  Bell,
  Upload,
  Stethoscope,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  HeartPulse,
} from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: BookOpen,
      title: 'Knowledge Exchange',
      description:
        'Save and organize your notes and study materials, find what you need quickly, and share resources with classmates.',
      color: '#0D9488',
    },
    {
      icon: MessageCircle,
      title: 'Messaging & Communication',
      description:
        'Message your classmates directly, chat in groups, and get notified when someone reaches out to you.',
      color: '#0891B2',
    },
    {
      icon: Zap,
      title: 'Breakroom Social Feed',
      description:
        'Share ideas and questions, react to posts, comment on discussions, and stay connected with your cohort.',
      color: '#7C3AED',
    },
    {
      icon: Calendar,
      title: 'Clinical Scheduling',
      description:
        'View your clinical rotations, schedule your assignments, and never miss an important shift or rotation.',
      color: '#EA580C',
    },
    {
      icon: FileText,
      title: 'Care Planning',
      description:
        'Create patient care plans, use ready-made templates, and keep all your patient information in one place.',
      color: '#EC4899',
    },
    {
      icon: Users,
      title: 'Social Features',
      description:
        'Connect with nursing students, follow classmates, and see what others are working on and learning about.',
      color: '#10B981',
    },
    {
      icon: Bell,
      title: 'Get Notifications',
      description:
        'Get alerts about messages, group invites, and important updates so you never miss anything important.',
      color: '#3B82F6',
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <HeartPulse size={32} color="#0D9488" strokeWidth={2.5} />
            <span>Pulse</span>
          </div>
          <div className="nav-buttons">
            <button
              className="nav-btn signin-btn"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="hero-badge">
              <TrendingUp size={16} />
              <span>Designed for Modern Nursing Education</span>
            </div>
            <h1 className="hero-title">
              Your Clinical Workspace
              <br />
              <span className="gradient-text">Reimagined</span>
            </h1>
            <p className="hero-subtitle">
              Pulse is the unified platform for nursing students to collaborate,
              learn, and grow together. Combine communication, knowledge sharing,
              scheduling, and clinical planning all in one place.
            </p>
            <div className="hero-buttons">
              <motion.button
                className="btn btn-primary"
                onClick={() => navigate('/auth')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Up Now
                <ArrowRight size={18} />
              </motion.button>
            </div>

          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="hero-gradient-ball hero-ball-1"></div>
            <div className="hero-gradient-ball hero-ball-2"></div>
            <div className="hero-visual-content">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <HeartPulse size={300} color="#0D9488" strokeWidth={1.5} />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="features-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="features-container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Powerful Features Built for You</h2>
            <p>Everything you need to succeed in your nursing education</p>
          </motion.div>

          <motion.div
            className="features-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  className="feature-card"
                  variants={itemVariants}
                  whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                >
                  <div
                    className="feature-icon"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <Icon size={28} color={feature.color} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* Key Benefits Section */}
      <motion.section
        className="benefits-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="benefits-container">
          <motion.div
            className="benefits-header"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Why Choose Pulse?</h2>
          </motion.div>

          <div className="benefits-grid">
            {[
              {
                title: 'Designed by Healthcare Professionals',
                description:
                  'Built with input from nursing educators and students to ensure every feature meets real-world needs.',
              },
              {
                title: 'Real-time Collaboration',
                description:
                  'Work together seamlessly with instant updates, presence awareness, and live notifications.',
              },
              {
                title: 'Secure & Private',
                description:
                  'Your data is encrypted and stored securely with privacy as a core principle.',
              },
              {
                title: 'Intuitive Design',
                description:
                  'Clean, modern interface designed for busy nursing students to get started in seconds.',
              },
              {
                title: 'All-in-One Platform',
                description:
                  'No more juggling multiple apps. Everything you need is in one unified workspace.',
              },
              {
                title: 'Community-Driven',
                description:
                  'Connect with peers, share knowledge, and build lasting professional relationships.',
              },
            ].map((benefit, idx) => (
              <motion.div
                key={idx}
                className="benefit-item"
                initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1, type: 'spring' }}
                viewport={{ once: true }}
              >
                <CheckCircle size={24} className="benefit-check" />
                <div>
                  <h4>{benefit.title}</h4>
                  <p>{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="cta-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="cta-container">
          <motion.div
            className="cta-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
            viewport={{ once: true }}
          >
            <h2>Ready to Transform Your Nursing Education?</h2>
            <p>
              Join nursing students using Pulse to collaborate, learn, and grow
              together.
            </p>
            <div className="cta-buttons">
              <motion.button
                className="btn btn-primary btn-large"
                onClick={() => navigate('/auth')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Up Now
                <ArrowRight size={20} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <HeartPulse size={24} color="#0D9488" strokeWidth={2.5} />
                <span>Pulse</span>
              </div>
              <p>Clinical workspace for nursing students</p>
            </div>
            <div className="footer-section">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#benefits">Benefits</a>
            </div>
            <div className="footer-section">
              <h4>Resources</h4>
              <a href="#docs">Documentation</a>
              <a href="#support">Support</a>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Pulse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
