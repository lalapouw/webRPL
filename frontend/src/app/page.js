// "use client"

// import { useEffect } from "react";

// export default function Home() {
//   useEffect(() => {
//     const fetchData = async () => {
//       const res = await fetch("/api/products");
//       const data = await res.json();
//       console.log(data);
//     };

//     fetchData();
//   }, []);

//   return (
//     <div>
//       <button>
//         register
//       </button>

//     </div>
//   );
// }

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Navbar from "@/components/Navbar/Navbar";
import Hero from "@/components/Hero/Hero";
import Product from "@/components/Product/Product";
import Footer from "@/components/Footer/Footer";
import Brand from "@/components/Brand/Brand";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/products");
      const data = await res.json();
      console.log(data);
    };

    fetchData();
  }, []);

  const handleRegisterClick = () => {
    router.push("/register"); // arahkan ke halaman register
  };

  return (
    <>
    <Navbar />
    <Hero />
    <Brand />
    <Product />
    <div>

    </div>
    <Footer />
    </>
  );
}
