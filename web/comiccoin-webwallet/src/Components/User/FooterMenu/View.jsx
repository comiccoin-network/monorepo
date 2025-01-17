// src/Components/User/FooterMenu/View.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Twitter,
  Instagram,
  Github,
  Mail,
  Heart,
  Shield,
  HelpCircle,
  FileText,
  Book,
  Users
} from 'lucide-react';

const FooterMenu = () => {
  const currentYear = new Date().getFullYear();
  return (
      <footer className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© {currentYear} ComicCoin Network. All rights reserved.</p>
        </div>
      </footer>
  );
};

export default FooterMenu;
