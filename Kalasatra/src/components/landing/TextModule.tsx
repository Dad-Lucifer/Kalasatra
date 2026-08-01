import React from 'react';
import { motion } from 'framer-motion';

const TextModule: React.FC = () => {
  return (
    <section className="bg-black text-white py-16 sm:py-20 md:py-28 px-6 sm:px-10 md:px-16 lg:px-24 border-t border-zinc-900">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left Side: Bold Quote */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-6"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.08] uppercase">
            <span className="block text-yellow-300">YOUR</span>
            <span className="block text-zinc-500 font-bold">SATISFACTION</span>
            <span className="block text-yellow-300">IS OUR</span>
            <span className="block text-yellow-300">MOTIVATION.</span>
          </h2>

          <p className="mt-4 sm:mt-8 text-xs sm:text-sm font-semibold tracking-widest text-zinc-400 uppercase">
            — RACHANA PALAV, FOUNDER
          </p>
        </motion.div>

        {/* Right Side: Brand Story Details */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="lg:col-span-6 space-y-6 text-zinc-300 text-base text-justify md:text-lg   leading-relaxed pt-2"
        >
          <p>
            <strong className="font-bold text-yellow-300">Kalastra Clothing</strong> embarked on its journey on October 1, 2020. The idea was born from a deep passion for fashion and a desire to create a brand that seamlessly blends style with quality.
          </p>

          <p>
            The name Kalastra combines <span className="italic text-yellow-300 font-bold">“Kala”</span> (Art) and <span className="italic text-yellow-300 font-semibold">“Vastra”</span> (Clothing), symbolizing wearable art crafted with creativity and purpose.
          </p>

          <p>
            Inspired by her mother's dedication to stitching at home, Kalastra aims to create trendsetting pieces that empower individuals to embrace their personal, unapologetic style.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default TextModule;
