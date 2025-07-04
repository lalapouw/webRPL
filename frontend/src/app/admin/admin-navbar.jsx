// "use client";
// import { usePathname } from "next/navigation";

// export default function AdminNavbar() {
//   const pathname = usePathname();

//   const getPageTitle = () => {
//     if (pathname === "/admin") return "Dashboard";
//     if (pathname === "/admin/users") return "User";
//     if (pathname === "/admin/orders") return "Orders";
//     if (pathname === "/admin/manage-products") return "Kelola Produk";
//     return "Admin Panel";
//   };

//   return (
//     <header className="header">
//       <div className="header-left">
//         <i className="fas fa-bars"></i>
//         <h2>{getPageTitle()}</h2>
//       </div>
//       <div className="header-center">
//         <div className="search-bar">
//           <i className="fas fa-search"></i>
//           <input type="text" placeholder="Search..." />
//         </div>
//       </div>
//       <div className="header-right">
//         <div className="user-info">
//           <i className="fas fa-user-circle"></i>
//           <div className="user-name">
//             <span className="name">Lala</span>
//             <span className="role">Admin</span>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }
