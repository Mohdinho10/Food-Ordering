import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, Mail, MapPin, Phone, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="bg-[#FAFAFA] text-[#1F1F1F]">
      {/* ==================== HERO ==================== */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 lg:py-20">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#D41B27]">
            Contact Bella Vista
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            We&apos;d Love to{" "}
            <span className="text-[#D41B27]">Hear From You.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#6B6B6B] sm:text-lg">
            Have a question, want to make a reservation, or simply want to say
            hello? Get in touch with our team. We&apos;re always happy to hear
            from you.
          </p>
        </div>
      </section>

      {/* ==================== CONTACT INFO ==================== */}
      <section className="border-y border-[#EEEEEE] bg-[#FAFAFA] py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Phone */}
            <div className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FDEBEC]">
                <Phone className="h-5 w-5 text-[#D41B27]" />
              </div>

              <h2 className="mt-5 text-lg font-bold">Call Us</h2>

              <p className="mt-2 text-sm text-[#6B6B6B]">+255 700 123 456</p>

              <p className="mt-1 text-xs text-[#999999]">
                Available during opening hours
              </p>
            </div>

            {/* Email */}
            <div className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FDEBEC]">
                <Mail className="h-5 w-5 text-[#D41B27]" />
              </div>

              <h2 className="mt-5 text-lg font-bold">Email Us</h2>

              <p className="mt-2 break-all text-sm text-[#6B6B6B]">
                hello@bellavista.com
              </p>

              <p className="mt-1 text-xs text-[#999999]">
                We&apos;ll reply as soon as possible
              </p>
            </div>

            {/* Location */}
            <div className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FDEBEC]">
                <MapPin className="h-5 w-5 text-[#D41B27]" />
              </div>

              <h2 className="mt-5 text-lg font-bold">Visit Us</h2>

              <p className="mt-2 text-sm leading-6 text-[#6B6B6B]">
                Masaki, Dar es Salaam
              </p>

              <p className="mt-1 text-xs text-[#999999]">Tanzania</p>
            </div>

            {/* Opening Hours */}
            <div className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FDEBEC]">
                <Clock3 className="h-5 w-5 text-[#D41B27]" />
              </div>

              <h2 className="mt-5 text-lg font-bold">Opening Hours</h2>

              <p className="mt-2 text-sm text-[#6B6B6B]">Mon – Sun</p>

              <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">
                10:00 AM – 11:00 PM
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CONTACT FORM ==================== */}
      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
          {/* Left */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D41B27]">
              Get In Touch
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Let&apos;s Start a Conversation.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-[#6B6B6B]">
              Whether you have a question about our menu, want to make a
              reservation, or have feedback about your experience, send us a
              message and our team will get back to you.
            </p>

            <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-3xl">
              <Image
                src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&q=85"
                alt="Bella Vista restaurant"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Form */}
          <div className="rounded-3xl bg-[#FAFAFA] p-6 sm:p-8">
            <form className="space-y-5">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-[#1F1F1F]"
                >
                  Your Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-[#E5E5E5] bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:ring-2 focus:ring-[#D41B27]/10"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[#1F1F1F]"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[#E5E5E5] bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:ring-2 focus:ring-[#D41B27]/10"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-[#1F1F1F]"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+255 700 123 456"
                  className="w-full rounded-xl border border-[#E5E5E5] bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:ring-2 focus:ring-[#D41B27]/10"
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-semibold text-[#1F1F1F]"
                >
                  Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="How can we help you?"
                  className="w-full resize-none rounded-xl border border-[#E5E5E5] bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-[#AAAAAA] focus:border-[#D41B27] focus:ring-2 focus:ring-[#D41B27]/10"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#D41B27] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#B91621] active:scale-[0.99]"
              >
                Send Message
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ==================== LOCATION ==================== */}
      <section className="border-y border-[#EEEEEE] bg-[#FAFAFA] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D41B27]">
                Find Us
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Come Visit Us.
              </h2>

              <p className="mt-5 text-base leading-7 text-[#6B6B6B]">
                Looking for a great place to enjoy a delicious meal? Come visit
                Bella Vista and experience good food, warm hospitality, and a
                welcoming atmosphere.
              </p>

              <div className="mt-7 flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#D41B27]" />

                <div>
                  <p className="font-semibold">Bella Vista Restaurant</p>
                  <p className="mt-1 text-sm leading-6 text-[#6B6B6B]">
                    Masaki, Dar es Salaam
                    <br />
                    Tanzania
                  </p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="flex aspect-[16/9] items-center justify-center overflow-hidden rounded-3xl bg-[#EAEAEA]">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                  <MapPin className="h-6 w-6 text-[#D41B27]" />
                </div>

                <p className="mt-4 font-semibold text-[#333333]">
                  Bella Vista Restaurant
                </p>

                <p className="mt-1 text-sm text-[#777777]">
                  Masaki, Dar es Salaam
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Hungry Already?{" "}
            <span className="text-[#D41B27]">We&apos;ve Got You.</span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#6B6B6B] sm:text-base">
            Skip the waiting and order your favorite meal today.
          </p>

          <Link
            href="/menu"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#D41B27] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#B91621]"
          >
            Order Now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
