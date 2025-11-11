import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="GraduationCap" size={24} color="white" />
              </div>
              <span className="text-2xl font-heading font-bold text-white">
                EduFund
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Empowering students to achieve their educational dreams through community support.
            </p>
            <div className="flex space-x-4">
              <button className="text-gray-400 hover:text-primary transition-colors">
                <Icon name="Facebook" size={20} />
              </button>
              <button className="text-gray-400 hover:text-primary transition-colors">
                <Icon name="Twitter" size={20} />
              </button>
              <button className="text-gray-400 hover:text-primary transition-colors">
                <Icon name="Instagram" size={20} />
              </button>
              <button className="text-gray-400 hover:text-primary transition-colors">
                <Icon name="Linkedin" size={20} />
              </button>
            </div>
          </div>

          {/* For Students */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Students</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate('/how-it-works')}
                  className="text-sm hover:text-primary transition-colors"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm hover:text-primary transition-colors"
                >
                  Start a Campaign
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/success-stories')}
                  className="text-sm hover:text-primary transition-colors"
                >
                  Success Stories
                </button>
              </li>
              <li>
                <button className="text-sm hover:text-primary transition-colors">
                  Resources
                </button>
              </li>
            </ul>
          </div>

          {/* For Donors */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Donors</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate('/discover')}
                  className="text-sm hover:text-primary transition-colors"
                >
                  Discover Campaigns
                </button>
              </li>
              <li>
                <button className="text-sm hover:text-primary transition-colors">
                  How Donations Work
                </button>
              </li>
              <li>
                <button className="text-sm hover:text-primary transition-colors">
                  Impact Stories
                </button>
              </li>
              <li>
                <button className="text-sm hover:text-primary transition-colors">
                  Tax Benefits
                </button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate('/about')}
                  className="text-sm hover:text-primary transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/contact')}
                  className="text-sm hover:text-primary transition-colors"
                >
                  Contact
                </button>
              </li>
              <li>
                <button className="text-sm hover:text-primary transition-colors">
                  Help Center
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/privacy')}
                  className="text-sm hover:text-primary transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/terms')}
                  className="text-sm hover:text-primary transition-colors"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400 mb-4 md:mb-0">
            © {currentYear} EduFund. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <button className="text-sm text-gray-400 hover:text-primary transition-colors">
              Privacy
            </button>
            <button className="text-sm text-gray-400 hover:text-primary transition-colors">
              Terms
            </button>
            <button className="text-sm text-gray-400 hover:text-primary transition-colors">
              Cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
