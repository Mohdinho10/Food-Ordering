import Link from "next/link";
import { Utensils } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[#EEEEEE] bg-white py-14 text-[#1F1F1F]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* BRAND */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D41B27]">
                <Utensils className="h-5 w-5 text-white" />
              </div>

              <div>
                <h2 className="font-bold text-[#1F1F1F]">BELLA VISTA</h2>

                <p className="text-[8px] tracking-[0.2em] text-[#999999]">
                  RESTAURANT
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-xs text-sm leading-6 text-[#777777]">
              Delicious food, great service, and memorable moments.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="font-semibold text-[#1F1F1F]">Quick Links</h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-[#777777]">
              <Link href="/" className="transition hover:text-[#D41B27]">
                Home
              </Link>

              <Link href="/menu" className="transition hover:text-[#D41B27]">
                Menu
              </Link>

              <Link href="/about" className="transition hover:text-[#D41B27]">
                About Us
              </Link>

              <Link href="/contact" className="transition hover:text-[#D41B27]">
                Contact
              </Link>
            </div>
          </div>

          {/* CUSTOMER */}
          <div>
            <h3 className="font-semibold text-[#1F1F1F]">Customer</h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-[#777777]">
              <Link
                href="/track-order"
                className="transition hover:text-[#D41B27]"
              >
                Track Order
              </Link>

              <Link href="/cart" className="transition hover:text-[#D41B27]">
                Your Cart
              </Link>

              <Link href="/menu" className="transition hover:text-[#D41B27]">
                Order Food
              </Link>
            </div>
          </div>

          {/* VISIT US */}
          <div>
            <h3 className="font-semibold text-[#1F1F1F]">Visit Us</h3>

            <div className="mt-4 space-y-3 text-sm leading-6 text-[#777777]">
              <p>Dar es Salaam, Tanzania</p>
              <p>+255 700 000 000</p>
              <p>Open daily · 10:00 AM – 10:00 PM</p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-[#EEEEEE] pt-6 text-center text-xs text-[#999999]">
          © {new Date().getFullYear()} Bella Vista Restaurant. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
