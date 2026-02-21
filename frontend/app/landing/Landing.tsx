"use client"

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import Features from "./components/Features";
import Journey from "./components/Journey";
import Contest from "./components/Contest";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";

export default function Landing() {
  return (
    <div className="bg-background text-foreground">
      <Navbar />
      <main className="pt-20">
        <Hero />
        <Stats />
        <Features />
        <Journey />
        <Contest />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
