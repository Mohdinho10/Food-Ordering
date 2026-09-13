import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Sparkles, Users, Utensils } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-[#FAFAFA] text-[#1F1F1F]">
      {/* ==================== HERO ==================== */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:px-10 lg:py-24">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#D41B27]">
              About Bella Vista
            </p>

            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              More Than Just
              <br />
              <span className="text-[#D41B27]">Great Food.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-[#6B6B6B] sm:text-lg">
              At Bella Vista, we believe great food brings people together.
              Every dish we prepare is made with care, quality ingredients, and
              a passion for creating memorable moments.
            </p>

            <Link
              href="/menu"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#D41B27] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#B91621]"
            >
              Explore Our Menu
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=85"
              alt="Bella Vista restaurant interior"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* ==================== OUR STORY ==================== */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D41B27]">
            Our Story
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Made With Passion, Served With Heart
          </h2>

          <p className="mt-6 text-base leading-8 text-[#6B6B6B]">
            Bella Vista was created with a simple idea: serve delicious food in
            a welcoming environment where people can relax, connect, and enjoy
            every moment. From carefully selected ingredients to the final
            plate, we pay attention to the details that make a meal special.
          </p>

          <p className="mt-5 text-base leading-8 text-[#6B6B6B]">
            Whether you&aposre stopping by for a quick meal, enjoying dinner
            with family, or sharing a moment with friends, we&aposre here to
            make your experience something worth remembering.
          </p>
        </div>
      </section>

      {/* ==================== VALUES ==================== */}
      <section className="border-y border-[#EEEEEE] bg-[#FAFAFA] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D41B27]">
              What We Believe
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Our Values
            </h2>

            <p className="mt-4 text-sm leading-6 text-[#6B6B6B]">
              The things that guide everything we do.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* QUALITY */}
            <div className="rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FDEBEC]">
                <Sparkles className="h-5 w-5 text-[#D41B27]" />
              </div>

              <h3 className="mt-5 text-lg font-bold">Quality First</h3>

              <p className="mt-3 text-sm leading-6 text-[#6B6B6B]">
                We care about the ingredients we use and the food we serve.
                Quality is at the heart of every meal.
              </p>
            </div>

            {/* HOSPITALITY */}
            <div className="rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FDEBEC]">
                <Users className="h-5 w-5 text-[#D41B27]" />
              </div>

              <h3 className="mt-5 text-lg font-bold">Warm Hospitality</h3>

              <p className="mt-3 text-sm leading-6 text-[#6B6B6B]">
                Every guest matters. We want everyone who visits Bella Vista to
                feel welcome and appreciated.
              </p>
            </div>

            {/* PASSION */}
            <div className="rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FDEBEC]">
                <Heart className="h-5 w-5 text-[#D41B27]" />
              </div>

              <h3 className="mt-5 text-lg font-bold">Made With Passion</h3>

              <p className="mt-3 text-sm leading-6 text-[#6B6B6B]">
                We put care into what we create because we believe you can taste
                the difference.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== EXPERIENCE ==================== */}
      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&q=85"
              alt="People enjoying food at a restaurant"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FDEBEC]">
              <Utensils className="h-5 w-5 text-[#D41B27]" />
            </div>

            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Come Hungry.
              <br />
              <span className="text-[#D41B27]">Leave Happy.</span>
            </h2>

            <p className="mt-5 text-base leading-7 text-[#6B6B6B]">
              Great meals are about more than what&aposs on the plate.
              They&aposre about the people you&aposre with, the conversations
              you share, and the memories you create.
            </p>

            <p className="mt-4 text-base leading-7 text-[#6B6B6B]">
              That&aposs the experience we want every guest to have at Bella
              Vista.
            </p>

            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#D41B27] transition hover:text-[#B91621]"
            >
              Get In Touch
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      {/* ==================== CTA ==================== */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready for Something{" "}
            <span className="text-[#D41B27]">Delicious?</span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#6B6B6B] sm:text-base">
            Explore our menu and find your next favorite meal.
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
