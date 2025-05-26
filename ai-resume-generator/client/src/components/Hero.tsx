import React from 'react';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-indigo-50 py-20 md:py-32 w-screen relative left-1/2 right-1/2 -mx-[50vw]">
      <div className="w-screen">
        <div className="w-full px-4">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-4xl mx-auto text-center w-full">
              <motion.div
                initial={ { opacity: 0, y: 20 } }
                animate={ { opacity: 1, y: 0 } }
                transition={ { duration: 0.6 } }
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                  Create Your Perfect Resume in Minutes
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                  AI-powered resume builder that helps you create professional, ATS-friendly resumes tailored to your dream job
                </p>
              
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    whileHover={ { scale: 1.03 } }
                    whileTap={ { scale: 0.98 } }
                    className="px-8 py-4 bg-blue-600 text-white font-medium rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={ () => window.location.href = '/resume-builder' }
                  >
                    Start Building - It's Free
                  </motion.button>
                
                  <motion.button
                    whileHover={ { scale: 1.03 } }
                    whileTap={ { scale: 0.98 } }
                    className="px-8 py-4 bg-white text-gray-800 font-medium rounded-lg text-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                    onClick={ () => window.location.href = '/pricing' }
                  >
                    View Pricing
                  </motion.button>
                </div>
              </motion.div>

              <div className="mt-20 md:mt-28">
                <motion.div
                  initial={ { opacity: 0, y: 20 } }
                  animate={ { opacity: 1, y: 0 } }
                  transition={ { duration: 0.6, delay: 0.2 } }
                  className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 lg:gap-8 max-w-5xl mx-auto"
                >
                  {[
                    { number: '100K+', label: 'Resumes Created', color: 'text-blue-600' },
                    { number: '95%', label: 'Interview Success', color: 'text-green-600' },
                    { number: '24/7', label: 'Customer Support', color: 'text-purple-600' }
                  ].map((stat, index) => (
                    <div key={ index } className="p-6 bg-white bg-opacity-50 backdrop-blur-sm rounded-xl border border-white border-opacity-50">
                      <h3 className={ `text-4xl font-bold ${stat.color} mb-2` }>{stat.number}</h3>
                      <p className="text-gray-600">{stat.label}</p>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-1/2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>
    </section>
  );
};

export default Hero;
