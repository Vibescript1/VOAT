import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Search, MapPin } from "lucide-react";

function HomePage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const navigate = useNavigate();

  const images = [
    "https://cdni.iconscout.com/illustration/premium/thumb/boy-working-on-creative-building-website-front-page-illustration-download-in-svg-png-gif-file-formats--design-web-template-layout-agency-activity-pack-business-illustrations-9890601.png?f=webp",
    "https://cdni.iconscout.com/illustration/premium/thumb/recruitment-process-illustration-9890602.png?f=webp",
    "https://cdni.iconscout.com/illustration/premium/thumb/job-interview-illustration-9890603.png?f=webp",
    "https://cdni.iconscout.com/illustration/premium/thumb/team-collaboration-illustration-9890604.png?f=webp",
    "https://cdni.iconscout.com/illustration/premium/thumb/career-growth-illustration-9890605.png?f=webp"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs/search?q=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(location)}&experience=${encodeURIComponent(experience)}`);
    }
  };

  return (
    <div className="home-page-container flex flex-col items-center min-h-screen bg-gradient-to-b from-[#f5faff] to-blue-50 pt-24 pb-12">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-3xl sm:text-4xl pt-3 md:text-5xl font-bold mb-4">
            This Platform makes it easy to <br />
            <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              find jobs & hire talent
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with top employers or find your dream candidate in minutes
          </p>
        </motion.div>
        
        <motion.div 
          className="bg-white p-6 sm:p-8 shadow-lg rounded-xl mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          whileHover={{ 
            y: -5, 
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
        >
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-4 w-full">
  {/* Job Title Search */}
  <motion.div 
    className="flex-1 w-full min-w-[200px]"
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
        placeholder="Job title or keywords"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ paddingLeft: '2.5rem' }} // Ensures consistent spacing
      />
    </div>
  </motion.div>

  {/* Experience Level */}
  <motion.div 
    className="flex-1 w-full min-w-[200px]"
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <div className="relative">
      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
        placeholder="Experience level"
        value={experience}
        onChange={(e) => setExperience(e.target.value)}
        style={{ paddingLeft: '2.5rem' }}
      />
    </div>
  </motion.div>

  {/* Location */}
  <motion.div 
    className="flex-1 w-full min-w-[200px]"
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
        placeholder="Location or remote"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        style={{ paddingLeft: '2.5rem' }}
      />
    </div>
  </motion.div>

  {/* Search Button */}
  <motion.button
    type="submit"
    className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold px-6 sm:px-8 py-3 rounded-lg transition-all duration-300 whitespace-nowrap shadow-md hover:shadow-lg"
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.95 }}
  >
    Search Jobs
  </motion.button>
</form>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12 mt-12">
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative w-full max-w-[400px] h-[300px] sm:h-[400px] bg-[#f5faff] rounded-xl overflow-hidden">
              <AnimatePresence mode="wait">
                {images.map((src, index) => (
                  <motion.img
                    key={index}
                    src={src}
                    alt={`Career illustration ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-contain p-4"
                    loading="lazy"
                    initial={{ 
                      opacity: 0, 
                      scale: 0.9, 
                      rotateY: -15,
                      filter: 'blur(2px)'
                    }}
                    animate={currentImageIndex === index ? {
                      opacity: 1, 
                      scale: 1, 
                      rotateY: 0,
                      filter: 'blur(0px)'
                    } : {
                      opacity: 0, 
                      scale: 0.9, 
                      rotateY: 15,
                      filter: 'blur(2px)'
                    }}
                    exit={{ 
                      opacity: 0, 
                      scale: 0.9, 
                      rotateY: 15,
                      filter: 'blur(2px)'
                    }}
                    transition={{ 
                      duration: 1, 
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { number: "2k+", label: "Qualified Candidates" },
              { number: "500+", label: "Active Jobs" },
              { number: "100+", label: "Companies" }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg text-center border border-gray-100"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                whileHover={{ 
                  y: -5,
                  scale: 1.03
                }}
              >
                <motion.h2 
                  className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {stat.number}
                </motion.h2>
                <p className="text-sm sm:text-base text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;