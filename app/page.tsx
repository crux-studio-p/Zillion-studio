import Hero from "@/components/hero/Hero";
import { ArcGallery } from "@/components/gallery/ArcGallery";
import { Testimonials } from "@/components/reviews/Testimonials";
import { TopCustomers } from "@/components/community/TopCustomers";
import { Faq } from "@/components/faq/Faq";
import { Footer } from "@/components/footer/Footer";

const SILK = `
  radial-gradient(1200px 600px at 20% 10%, #eaeae5 0%, transparent 60%),
  radial-gradient(900px 500px at 80% 30%, #ebebeb 0%, transparent 60%),
  linear-gradient(120deg, #e2e2dd, #e6e6e1 40%, #dcdcd7 70%, #eaeae5)
`;

export default function Page() {
  return (
    <>
      <div className="fixed inset-0 z-[-1]" style={{ background: SILK }} />
      <Hero />
      <ArcGallery />
      <Testimonials />
      <TopCustomers />
      <Faq />
      <Footer />
    </>
  );
}
