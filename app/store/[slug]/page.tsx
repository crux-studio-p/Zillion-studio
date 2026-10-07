import { getCategoriesWithPackages } from "@/lib/tebex";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/store/ProductDetailClient";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  const match = slug.match(/-(\d+)$/);
  const idStr = match ? match[1] : slug;
  const id = parseInt(idStr, 10);
  
  const categories = await getCategoriesWithPackages();
  const pkg = categories
    .flatMap((c) => c.packages.map(p => ({ ...p, categoryName: c.name })))
    .find((p) => p.id === id);

  if (!pkg) {
    notFound();
  }

  return <ProductDetailClient pkg={pkg} />;
}
