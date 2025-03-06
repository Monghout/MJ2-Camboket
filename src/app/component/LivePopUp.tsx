// import { useState, useEffect } from "react";
// import SellerDashboard from "../live/page";

// export default function SellerDashboardPopup() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [userRole, setUserRole] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   // Assuming the session is managed via cookies or localStorage
//   const session = JSON.parse(localStorage.getItem("session") || "{}"); // Example of getting session data

//   useEffect(() => {
//     // Fetch user role from MongoDB when component mounts
//     const fetchUserRole = async () => {
//       if (!session?.user?.email) return;

//       try {
//         setIsLoading(true);
//         const response = await fetch(
//           `/api/user/role?email=${encodeURIComponent(session.user.email)}`
//         );
//         const data = await response.json();

//         if (response.ok) {
//           setUserRole(data.role); // Assuming the role is returned in `data.role`
//         } else {
//           console.error("Failed to fetch user role:", data.error);
//         }
//       } catch (error) {
//         console.error("Error fetching user role:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchUserRole();
//   }, [session]);

//   // Only allow sellers to open the popup
//   const handleButtonClick = () => {
//     if (userRole === "seller") {
//       setIsOpen(true);
//     }
//   };

//   // Close the popup
//   const handleClose = () => {
//     setIsOpen(false);
//   };

//   // Don't render anything if still loading or user is not logged in
//   if (isLoading || !session?.user?.email) {
//     return null;
//   }

//   return (
//     <>
//       {/* Button to open popup - only visible to sellers */}
//       {userRole === "seller" && (
//         <button
//           onClick={handleButtonClick}
//           className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
//         >
//           Go Live Dashboard
//         </button>
//       )}

//       {/* Popup overlay */}
//       {isOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           {/* Popup container */}
//           <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//             {/* Header with close button */}
//             <div className="flex justify-between items-center border-b p-4">
//               <h2 className="text-xl font-bold">Seller Dashboard</h2>
//               <button
//                 onClick={handleClose}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <span className="text-2xl">&times;</span>
//               </button>
//             </div>

//             {/* Dashboard content */}
//             <div className="p-6">
//               {session?.user?.id ? (
//                 <SellerDashboard sellerId={session.user.id} />
//               ) : (
//                 <p>Unable to load seller information</p>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
