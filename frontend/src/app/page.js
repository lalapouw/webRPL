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
    <div>
      <button onClick={handleRegisterClick}>
        Register
      </button>
    </div>
  );
}
