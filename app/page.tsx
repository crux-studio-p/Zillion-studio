import Hero from "@/components/hero/Hero";
import { ArcGallery } from "@/components/gallery/ArcGallery";
import { Testimonials } from "@/components/reviews/Testimonials";
import { TopCustomers } from "@/components/community/TopCustomers";
import { Faq } from "@/components/faq/Faq";
import { Footer } from "@/components/footer/Footer";
import { getCategoriesWithPackages } from "@/lib/tebex";

const SILK = `
  radial-gradient(1200px 600px at 20% 10%, #eaeae5 0%, transparent 60%),
  radial-gradient(900px 500px at 80% 30%, #ebebeb 0%, transparent 60%),
  linear-gradient(120deg, #e2e2dd, #e6e6e1 40%, #dcdcd7 70%, #eaeae5)
`;

export default async function Page() {
  const categories = await getCategoriesWithPackages();
  const allPackages = categories.flatMap((c) => 
    c.packages.map(p => ({
      title: p.name,
      category: c.name,
      image: p.image || "/affiliate-program-bg.png"
    }))
  );

  // Shuffle all packages
  const shuffled = allPackages.sort(() => 0.5 - Math.random());
  
  // Hero takes first 7
  const heroCards = shuffled.slice(0, 7);
  while (heroCards.length < 7) {
    heroCards.push({ title: "Product", category: "Store", image: "/affiliate-program-bg.png" });
  }

  // Gallery takes up to 14
  const galleryCards = shuffled.slice(0, 14);

  return (
    <>
      <div className="fixed inset-0 z-[-1]" style={{ background: SILK }} />
      <Hero cards={heroCards} />
      <ArcGallery products={galleryCards} />
      <Testimonials />
      <TopCustomers />
      <Faq />
      <Footer />
    </>
  );
}
