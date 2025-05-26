import React from 'react';
import { motion } from 'framer-motion';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-background">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={ { opacity: 0, y: 20 } }
          animate={ { opacity: 1, y: 0 } }
          transition={ { duration: 0.5 } }
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-primary mb-6">AI Resume</h3>
              <p className="text-gray-600 leading-relaxed">
                Create professional resumes and cover letters tailored to your dream job
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Product</h3>
              <ul className="space-y-4">
                {['Resume Builder', 'Cover Letter Generator', 'Portfolio Builder', 'ATS Optimization'].map((item) => (
                  <motion.li
                    key={ item }
                    whileHover={ { scale: 1.05 } }
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Resources</h3>
              <ul className="space-y-4">
                {['Blog', 'FAQ', 'Pricing', 'API Documentation'].map((item) => (
                  <motion.li
                    key={ item }
                    whileHover={ { scale: 1.05 } }
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Company</h3>
              <ul className="space-y-4">
                {['About', 'Careers', 'Contact', 'Privacy Policy'].map((item) => (
                  <motion.li
                    key={ item }
                    whileHover={ { scale: 1.05 } }
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-12 pt-12 text-center text-gray-600">
            <p className="text-sm">&copy; {new Date().getFullYear()} AI Resume. All rights reserved.</p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

// Export default for backward compatibility
export default Footer;
