import Hero from "@/components/hero/Hero";
import { ArcGallery } from "@/components/gallery/ArcGallery";
import { Testimonials } from "@/components/reviews/Testimonials";
import { TopCustomers } from "@/components/community/TopCustomers";
import { Faq } from "@/components/faq/Faq";
import { Footer } from "@/components/footer/Footer";

export default function Page() {
  return (
    <>
      <Hero />
      <ArcGallery />
      <Testimonials />
      <TopCustomers />
      <Faq />
      <Footer />
    </>
  );
}
