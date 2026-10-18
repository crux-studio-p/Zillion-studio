import { getCart, getAvailableCoupons } from "@/app/actions/cart";
import { CartClient } from "./CartClient";

export const metadata = {
  title: "Cart & Checkout - Zillion",
  description: "Checkout and purchase premium FiveM scripts.",
};

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const [cart, availableCoupons] = await Promise.all([
    getCart(),
    getAvailableCoupons(),
  ]);

  return (
    <main className="bg-background">
      <CartClient initialCart={cart} availableCoupons={availableCoupons} />
    </main>
  );
}
