"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ShoppingBag,
  Utensils,
  Menu as MenuIcon,
  X,
  ArrowRight,
} from "lucide-react";

import { useCartStore } from "../store/cartStore";

type CartAnimationDetail = {
  image: string;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
};

type FlyingImage = {
  id: number;
  image: string;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  targetX: number;
  targetY: number;
};

export default function Header() {
  const pathname = usePathname();

  const items = useCartStore((state) => state.items);

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [flyingImage, setFlyingImage] = useState<FlyingImage | null>(null);
  const [cartAnimating, setCartAnimating] = useState(false);

  const desktopCartRef = useRef<HTMLAnchorElement>(null);
  const mobileCartRef = useRef<HTMLAnchorElement>(null);

  /*
   * Lock page scrolling while the mobile menu is open.
   */
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  /*
   * Listen for food added from the menu.
   *
   * The menu sends the clicked button position.
   * We then animate the food image toward the visible cart.
   */
  useEffect(() => {
    let animationTimeout: number | undefined;
    let imageTimeout: number | undefined;

    const handleCartAnimation = (event: Event) => {
      const customEvent = event as CustomEvent<CartAnimationDetail>;

      const detail = customEvent.detail;

      const desktopCart = desktopCartRef.current;
      const mobileCart = mobileCartRef.current;

      const visibleCart =
        desktopCart && desktopCart.getBoundingClientRect().width > 0
          ? desktopCart
          : mobileCart && mobileCart.getBoundingClientRect().width > 0
            ? mobileCart
            : null;

      if (!visibleCart) {
        return;
      }

      const cartRect = visibleCart.getBoundingClientRect();

      const targetX = cartRect.left + cartRect.width / 2 - 18;

      const targetY = cartRect.top + cartRect.height / 2 - 18;

      setFlyingImage({
        id: Date.now(),
        image: detail.image,
        startX: detail.startX,
        startY: detail.startY,
        startWidth: detail.startWidth,
        startHeight: detail.startHeight,
        targetX,
        targetY,
      });

      setCartAnimating(true);

      window.clearTimeout(animationTimeout);
      window.clearTimeout(imageTimeout);

      animationTimeout = window.setTimeout(() => {
        setCartAnimating(false);
      }, 450);

      imageTimeout = window.setTimeout(() => {
        setFlyingImage(null);
      }, 650);
    };

    window.addEventListener("cart:add-animation", handleCartAnimation);

    return () => {
      window.removeEventListener("cart:add-animation", handleCartAnimation);

      window.clearTimeout(animationTimeout);
      window.clearTimeout(imageTimeout);
    };
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* ==================== FLYING CART IMAGE ==================== */}

      {flyingImage && (
        <div
          key={flyingImage.id}
          className="pointer-events-none fixed z-100 overflow-hidden rounded-xl shadow-[0_8px_25px_rgba(0,0,0,0.22)]"
          style={{
            left: flyingImage.startX,
            top: flyingImage.startY,
            width: flyingImage.startWidth,
            height: flyingImage.startHeight,
            animation:
              "flyToCart 550ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
            ["--cart-x" as string]: `${
              flyingImage.targetX - flyingImage.startX
            }px`,
            ["--cart-y" as string]: `${
              flyingImage.targetY - flyingImage.startY
            }px`,
          }}
        >
          <Image
            src={flyingImage.image}
            alt=""
            fill
            sizes="48px"
            className="object-contain bg-white p-1"
          />
        </div>
      )}

      <style jsx global>{`
        @keyframes flyToCart {
          0% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }

          35% {
            opacity: 1;
            transform: translate3d(
                calc(var(--cart-x) * 0.35),
                calc(var(--cart-y) * 0.15 - 35px),
                0
              )
              scale(0.9);
          }

          70% {
            opacity: 0.9;
            transform: translate3d(
                calc(var(--cart-x) * 0.7),
                calc(var(--cart-y) * 0.7),
                0
              )
              scale(0.55);
          }

          100% {
            opacity: 0;
            transform: translate3d(var(--cart-x), var(--cart-y), 0) scale(0.15);
          }
        }

        .category-scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* ==================== NAVBAR ==================== */}

      <header className="sticky top-0 z-50 border-b border-[#EEEEEE] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          {/* LOGO */}

          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={closeMobileMenu}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D41B27]">
              <Utensils className="h-5 w-5 text-white" />
            </div>

            <div>
              <h1 className="text-lg font-bold leading-none tracking-tight">
                BELLA VISTA
              </h1>

              <p className="mt-1 text-[9px] font-medium tracking-[0.25em] text-[#6B6B6B]">
                RESTAURANT
              </p>
            </div>
          </Link>

          {/* ==================== DESKTOP NAVIGATION ==================== */}

          <nav className="hidden items-center gap-8 lg:flex">
            <Link
              href="/"
              className={`text-sm font-medium transition ${
                isActive("/")
                  ? "text-[#D41B27]"
                  : "text-[#1F1F1F] hover:text-[#D41B27]"
              }`}
            >
              Home
            </Link>

            <Link
              href="/menu"
              className={`text-sm font-medium transition ${
                isActive("/menu")
                  ? "text-[#D41B27]"
                  : "text-[#1F1F1F] hover:text-[#D41B27]"
              }`}
            >
              Menu
            </Link>

            <Link
              href="/about"
              className={`text-sm font-medium transition ${
                isActive("/about")
                  ? "text-[#D41B27]"
                  : "text-[#1F1F1F] hover:text-[#D41B27]"
              }`}
            >
              About Us
            </Link>

            <Link
              href="/contact"
              className={`text-sm font-medium transition ${
                isActive("/contact")
                  ? "text-[#D41B27]"
                  : "text-[#1F1F1F] hover:text-[#D41B27]"
              }`}
            >
              Contact
            </Link>

            <Link
              href="/track-order"
              className={`text-sm font-medium transition ${
                isActive("/track-order")
                  ? "text-[#D41B27]"
                  : "text-[#1F1F1F] hover:text-[#D41B27]"
              }`}
            >
              Track Order
            </Link>
          </nav>

          {/* ==================== DESKTOP RIGHT SIDE ==================== */}

          <div className="hidden items-center lg:flex">
            <Link
              ref={desktopCartRef}
              href="/cart"
              className={`relative flex h-11 w-11 items-center justify-center rounded-full border border-[#EEEEEE] transition-all duration-200 hover:border-[#D41B27] hover:bg-[#FDEBEC] ${
                cartAnimating ? "scale-110 border-[#D41B27] bg-[#FDEBEC]" : ""
              }`}
              aria-label={`Shopping cart with ${cartItemCount} items`}
            >
              <ShoppingBag
                className={`h-5 w-5 transition-transform duration-200 ${
                  cartAnimating ? "scale-110" : ""
                }`}
              />

              <span
                className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#D41B27] text-[10px] font-bold text-white transition-transform duration-200 ${
                  cartAnimating ? "scale-125" : ""
                }`}
              >
                {cartItemCount}
              </span>
            </Link>
          </div>

          {/* ==================== MOBILE RIGHT SIDE ==================== */}

          <div className="flex items-center gap-2 lg:hidden">
            {/* CART */}

            <Link
              ref={mobileCartRef}
              href="/cart"
              className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 hover:bg-[#FDEBEC] ${
                cartAnimating ? "scale-110 bg-[#FDEBEC]" : ""
              }`}
              aria-label={`Shopping cart with ${cartItemCount} items`}
            >
              <ShoppingBag
                className={`h-5 w-5 transition-transform duration-200 ${
                  cartAnimating ? "scale-110" : ""
                }`}
              />

              <span
                className={`absolute right-0.5 top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#D41B27] text-[9px] font-bold text-white transition-transform duration-200 ${
                  cartAnimating ? "scale-125" : ""
                }`}
              >
                {cartItemCount}
              </span>
            </Link>

            {/* HAMBURGER */}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D41B27] text-white transition hover:bg-[#B91621]"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ==================== MOBILE MENU OVERLAY ==================== */}

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-60 bg-black/50 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* ==================== MOBILE SIDEBAR ==================== */}

      <aside
        className={`fixed right-0 top-0 z-70 flex h-full w-[min(88vw,360px)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* SIDEBAR HEADER */}

        <div className="flex items-center justify-between border-b border-[#EEEEEE] px-6 py-5">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D41B27]">
              <Utensils className="h-4 w-4 text-white" />
            </div>

            <div>
              <h2 className="text-sm font-bold leading-none">BELLA VISTA</h2>

              <p className="mt-1 text-[8px] tracking-[0.2em] text-[#6B6B6B]">
                RESTAURANT
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Close navigation menu"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FDEBEC] text-[#D41B27] transition hover:bg-[#D41B27] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* SIDEBAR NAVIGATION */}

        <nav className="flex flex-1 flex-col px-5 py-7">
          <p className="mb-4 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B6B6B]">
            Navigation
          </p>

          <Link
            href="/"
            onClick={closeMobileMenu}
            className={`flex items-center rounded-xl px-4 py-3.5 text-sm font-medium transition ${
              isActive("/")
                ? "bg-[#FDEBEC] font-semibold text-[#D41B27]"
                : "hover:bg-[#FDEBEC] hover:text-[#D41B27]"
            }`}
          >
            Home
          </Link>

          <Link
            href="/menu"
            onClick={closeMobileMenu}
            className={`flex items-center rounded-xl px-4 py-3.5 text-sm font-medium transition ${
              isActive("/menu")
                ? "bg-[#FDEBEC] font-semibold text-[#D41B27]"
                : "hover:bg-[#FDEBEC] hover:text-[#D41B27]"
            }`}
          >
            Menu
          </Link>

          <Link
            href="/about"
            onClick={closeMobileMenu}
            className={`flex items-center rounded-xl px-4 py-3.5 text-sm font-medium transition ${
              isActive("/about")
                ? "bg-[#FDEBEC] font-semibold text-[#D41B27]"
                : "hover:bg-[#FDEBEC] hover:text-[#D41B27]"
            }`}
          >
            About Us
          </Link>

          <Link
            href="/contact"
            onClick={closeMobileMenu}
            className={`flex items-center rounded-xl px-4 py-3.5 text-sm font-medium transition ${
              isActive("/contact")
                ? "bg-[#FDEBEC] font-semibold text-[#D41B27]"
                : "hover:bg-[#FDEBEC] hover:text-[#D41B27]"
            }`}
          >
            Contact
          </Link>

          <Link
            href="/track-order"
            onClick={closeMobileMenu}
            className={`flex items-center rounded-xl px-4 py-3.5 text-sm font-medium transition ${
              isActive("/track-order")
                ? "bg-[#FDEBEC] font-semibold text-[#D41B27]"
                : "hover:bg-[#FDEBEC] hover:text-[#D41B27]"
            }`}
          >
            Track Order
          </Link>

          <div className="mt-auto">
            <div className="mb-5 rounded-2xl bg-[#FAFAFA] p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FDEBEC]">
                <ShoppingBag className="h-5 w-5 text-[#D41B27]" />
              </div>

              <h3 className="font-semibold">Hungry?</h3>

              <p className="mt-1 text-sm leading-6 text-[#6B6B6B]">
                Browse our menu and order your favorite food.
              </p>
            </div>

            <Link
              href="/menu"
              onClick={closeMobileMenu}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#D41B27] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#B91621]"
            >
              Order Food
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
}
