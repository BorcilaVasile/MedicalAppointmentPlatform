import React from 'react';

function About() {
  return (
    <section className="container mx-auto px-4 py-12 bg-[var(--background-50)] dark:bg-[var(--background-950)] transition-colors">
      {/* Heading */}
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-[var(--text-800)] dark:text-[var(--text-200)]">
        About Us
      </h1>

      {/* Description */}
      <p className="text-lg md:text-xl text-center mb-10 text-[var(--text-600)] dark:text-[var(--text-400)] max-w-3xl mx-auto">
        We’re more than a platform—we’re a movement to simplify healthcare. Connect with doctors, book appointments, and take control of your health, all in one place.
      </p>

      {/* Captivating History Section */}
      <div className="mb-12">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-6 text-[var(--text-700)] dark:text-[var(--text-300)]">
          Our Story
        </h2>
        <p className="text-[var(--text-600)] dark:text-[var(--text-400)] text-center max-w-2xl mx-auto">
          It all started in a tiny garage in 2015, when our founder, Alex, missed a critical doctor’s appointment for his grandmother because of a broken system—overbooked clinics, endless phone calls, and no clear answers. That frustration sparked a dream: a world where healthcare is as simple as a click. From late-night coding sessions to partnering with visionary doctors, we’ve grown into a platform that’s rewriting the rules of care—one appointment at a time.
        </p>
      </div>

      {/* Interesting Facts / Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="text-center p-4 bg-[var(--background-100)] dark:bg-[var(--background-900)] rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-[var(--text-700)] dark:text-[var(--text-300)] mb-2">
            Our Mission
          </h3>
          <p className="text-[var(--text-500)] dark:text-[var(--text-500)]">
            To bring healthcare into your hands, hassle-free.
          </p>
        </div>
        <div className="text-center p-4 bg-[var(--background-100)] dark:bg-[var(--background-900)] rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-[var(--text-700)] dark:text-[var(--text-300)] mb-2">
            Did You Know?
          </h3>
          <p className="text-[var(--text-500)] dark:text-[var(--text-500)]">
            Our first user booked an appointment in under 60 seconds!
          </p>
        </div>
        <div className="text-center p-4 bg-[var(--background-100)] dark:bg-[var(--background-900)] rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-[var(--text-700)] dark:text-[var(--text-300)] mb-2">
            Our Impact
          </h3>
          <p className="text-[var(--text-500)] dark:text-[var(--text-500)]">
            We’ve saved users over 1 million hours of waiting time.
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <a
          href="/get-started"
          className="inline-block px-6 py-3 bg-[var(--primary-500)] text-[var(--text-50)] dark:bg-[var(--primary-600)] dark:text-[var(--text-950)] font-semibold rounded-lg hover:bg-[var(--primary-600)] dark:hover:bg-[var(--primary-700)] transition-colors"
        >
          Start Your Journey
        </a>
      </div>
    </section>
  );
}

export default About;