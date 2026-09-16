import Header from "../components/Header";
import Footer from "../components/Footer";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#1F1F1F]">
      <Header />

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}
