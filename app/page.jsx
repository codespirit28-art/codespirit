import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pt-24 md:pt-32">
        <Hero />
      </main>
      <Footer />
    </>
  );
}