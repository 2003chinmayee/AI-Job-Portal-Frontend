import { motion } from "framer-motion";

function HeroSection() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">

      <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-black to-purple-900"></div>

      <div className="absolute w-96 h-96 bg-indigo-500 rounded-full blur-[180px] opacity-30 top-10 left-10"></div>

      <div className="absolute w-96 h-96 bg-purple-500 rounded-full blur-[180px] opacity-30 bottom-10 right-10"></div>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 text-center px-6"
      >
        <h1 className="text-7xl font-extrabold text-white mb-6">
          AI Career Copilot
        </h1>

        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
          Upload your resume. Let AI score it, match jobs,
          identify missing skills and guide your career journey.
        </p>

        <div className="flex gap-6 justify-center">
          <button className="px-8 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:scale-105 transition">
            Analyze Resume
          </button>

          <button className="px-8 py-4 rounded-2xl border border-white text-white hover:bg-white hover:text-black transition">
            Explore Jobs
          </button>
        </div>
      </motion.div>

    </div>
  );
}

export default HeroSection;