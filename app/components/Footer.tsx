import Link from "next/link";
import { Utensils } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1F1F1F] py-14 text-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* BRAND */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D41B27]">
                <Utensils className="h-5 w-5 text-white" />
              </div>

              <div>
                <h2 className="font-bold">BELLA VISTA</h2>

                <p className="text-[8px] tracking-[0.2em] text-white/50">
                  RESTAURANT
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-xs text-sm leading-6 text-white/60">
              Delicious food, great service, and memorable moments.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="font-semibold">Quick Links</h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-white/60">
              <Link href="/" className="transition hover:text-white">
                Home
              </Link>

              <Link href="/menu" className="transition hover:text-white">
                Menu
              </Link>

              <Link href="/about" className="transition hover:text-white">
                About Us
              </Link>

              <Link href="/contact" className="transition hover:text-white">
                Contact
              </Link>
            </div>
          </div>

          {/* CUSTOMER */}
          <div>
            <h3 className="font-semibold">Customer</h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-white/60">
              <Link href="/track-order" className="transition hover:text-white">
                Track Order
              </Link>

              <Link href="/cart" className="transition hover:text-white">
                Your Cart
              </Link>

              <Link href="/menu" className="transition hover:text-white">
                Order Food
              </Link>
            </div>
          </div>

          {/* VISIT US */}
          <div>
            <h3 className="font-semibold">Visit Us</h3>

            <div className="mt-4 space-y-3 text-sm leading-6 text-white/60">
              <p>Dar es Salaam, Tanzania</p>
              <p>+255 700 000 000</p>
              <p>Open daily · 10:00 AM – 10:00 PM</p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} Bella Vista Restaurant. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
