import { getCart } from "@/app/actions/cart";
import { CartClient } from "./CartClient";

export const metadata = {
  title: "Cart - Zillion",
  description: "Checkout and purchase premium FiveM scripts.",
};

export default async function CartPage() {
  const cart = await getCart();

  return (
    <main className="bg-background">
      <CartClient initialCart={cart} />
    </main>
  );
}
