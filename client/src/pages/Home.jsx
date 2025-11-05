// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  Users,
  Bot,
  Megaphone,
  Trophy,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  BarChart3,
  Menu,
  X,
} from "lucide-react";

/* -------------------------------------------------
   Animation variants
   ------------------------------------------------- */
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

/* -------------------------------------------------
   Header with Mobile Menu
   ------------------------------------------------- */
const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gray-900">
          Swarm<span className="text-yellow-500">Engage</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/login" className="text-gray-600 hover:text-blue-600 transition">
            Login
          </Link>
          <Link
            to="/register"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105"
          >
            Get Started
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Mobile Menu Overlay + Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />

            {/* Slide-in Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 md:hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div className="text-xl font-bold text-gray-900">
                  Swarm<span className="text-yellow-500">Engage</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6 text-gray-700" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 p-6 space-y-4">
                <Link
                  to="/login"
                  className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-left px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition font-medium text-center"
                >
                  Get Started
                </Link>
              </nav>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 text-center text-sm text-gray-500">
                <p>© {new Date().getFullYear()} SwarmEngage</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

/* -------------------------------------------------
   Hero Section
   ------------------------------------------------- */
const HeroSection = () => (
  <section
    className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900"
    aria-label="SwarmEngage Hero"
  >
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 0.15 }}
      transition={{ duration: 3 }}
      className="absolute -top-20 -left-20 w-96 h-96 bg-yellow-400 rounded-full blur-3xl"
    />
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 0.2 }}
      transition={{ duration: 3, delay: 0.5 }}
      className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"
    />

    <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto pt-20">
      <motion.h1
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white mb-6 leading-tight"
      >
        Amplify Your Voice with <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500">
          AI-Powered Swarms
        </span>
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="text-xl text-gray-200 mb-10 max-w-3xl mx-auto"
      >
        Deploy AI-crafted Reddit posts at scale. Earn rewards. Measure impact.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Link
          to="/register?role=client"
          className="group flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition transform hover:scale-105"
        >
          Start as Client{" "}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
        </Link>
        <Link
          to="/register?role=executor"
          className="group flex items-center justify-center gap-2 bg-yellow-500 text-gray-900 px-8 py-4 rounded-xl font-semibold shadow-lg hover:bg-yellow-600 transition transform hover:scale-105"
        >
          Join as Executor <Sparkles className="w-5 h-5" />
        </Link>
      </motion.div>
    </div>
  </section>
);

/* -------------------------------------------------
   How It Works
   ------------------------------------------------- */
const HowItWorksSection = () => {
  const steps = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Client Creates Campaign",
      desc: "Define goals, budget, and AI prompts.",
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: "AI Swarm Drafts Posts",
      desc: "100+ unique, engaging Reddit posts generated.",
    },
    {
      icon: <Megaphone className="w-8 h-8" />,
      title: "Executors Post Live",
      desc: "Pick, post, and submit proof in seconds.",
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Earn & Scale",
      desc: "Get paid per post. Track engagement.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-12">
          From idea to impact in four simple steps.
        </p>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {steps.map((step, i) => (
            <motion.div
              key={i}
              variants={item}
              className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                {step.icon}
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

/* -------------------------------------------------
   Features
   ------------------------------------------------- */
const FeaturesSection = () => (
  <section className="py-20 bg-gray-50">
    <div className="container mx-auto px-4 sm:px-6">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="space-y-6"
        >
          <h3 className="text-3xl font-bold text-gray-900">
            For <span className="text-blue-600">Clients</span>
          </h3>
          {[
            { icon: <Zap className="w-6 h-6" />, text: "AI-generated posts in seconds" },
            { icon: <BarChart3 className="w-6 h-6" />, text: "Real-time engagement analytics" },
            { icon: <Shield className="w-6 h-6" />, text: "Compliant, brand-safe content" },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-gray-700">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                {f.icon}
              </div>
              <span className="font-medium">{f.text}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ x: 50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="space-y-6"
        >
          <h3 className="text-3xl font-bold text-gray-900">
            For <span className="text-yellow-500">Executors</span>
          </h3>
          {[
            { icon: <Trophy className="w-6 h-6" />, text: "Earn up to $50 from posts and comments" },
            { icon: <Bot className="w-6 h-6" />, text: "No writing, just post" },
            { icon: <Users className="w-6 h-6" />, text: "Join 10,000+ executors" },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-gray-700">
              <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center">
                {f.icon}
              </div>
              <span className="font-medium">{f.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  </section>
);

/* -------------------------------------------------
   CTA Section
   ------------------------------------------------- */
const CtaSection = () => (
  <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
    <div className="container mx-auto px-4 sm:px-6 text-center">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-4xl font-bold mb-4">Ready to Launch?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join thousands already scaling their voice with AI.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register?role=client"
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition"
          >
            Start Free Trial
          </Link>
          <Link
            to="/login"
            className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition"
          >
            Login
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);

/* -------------------------------------------------
   Footer
   ------------------------------------------------- */
const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 py-8">
    <div className="container mx-auto px-4 sm:px-6 text-center">
      <p>© {new Date().getFullYear()} SwarmEngage. All rights reserved.</p>
      <p className="text-sm mt-2">
        <Link to="/privacy" className="hover:text-white">Privacy</Link> •{" "}
        <Link to="/terms" className="hover:text-white">Terms</Link>
      </p>
    </div>
  </footer>
);

/* -------------------------------------------------
   Main Page Component
   ------------------------------------------------- */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}