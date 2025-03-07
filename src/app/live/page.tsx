// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useUser } from "@clerk/nextjs";
// import ThumbnailUpload from "@/app/component/LiveForm/ThumbnailUpload";
// import ProductUpload from "@/app/component/LiveForm/ProductUpload";
// import StreamCreatedSuccess from "../component/LiveForm/StreamCreatedSuccess";

// export default function SellerDashboard() {
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [currentUser, setCurrentUser] = useState<any>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [fetchError, setFetchError] = useState<string | null>(null);
//   const [streamCreated, setStreamCreated] = useState(false);
//   const [streamDetails, setStreamDetails] = useState<any>(null);
//   const router = useRouter();
//   const { user, isLoaded, isSignedIn } = useUser();

//   const categories = ["Technology", "Home Appliance", "Clothes", "Other"];

//   useEffect(() => {
//     const fetchCurrentUser = async () => {
//       if (!isLoaded) return;
//       if (!isSignedIn || !user) {
//         setFetchError("You must be signed in to access this page");
//         setLoading(false);
//         return;
//       }

//       try {
//         const res = await fetch("/api/user");
//         if (!res.ok)
//           throw new Error(`API responded with status: ${res.status}`);
//         const data = await res.json();
//         const foundUser = data.users.find((u: any) => u.clerkId === user.id);
//         if (foundUser) setCurrentUser(foundUser);
//         else setTimeout(() => window.location.reload(), 2000);
//       } catch (error) {
//         setFetchError(`Failed to load user data: ${error}`);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (isLoaded) fetchCurrentUser();
//   }, [user, isLoaded, isSignedIn]);

//   useEffect(() => {
//     if (currentUser?.role === "buyer") router.push("/");
//   }, [currentUser, router]);

//   const handleSubmit = async (data: {
//     sellerName: string;
//     category: string;
//     streamTitle: string;
//     streamDescription: string;
//     products: { title: string; image: string }[];
//     thumbnailUrl: string | null;
//   }) => {
//     setSubmitting(true);
//     setError(null);

//     const streamData = {
//       sellerId: user?.id,
//       sellerName: data.sellerName,
//       title: data.streamTitle,
//       description: data.streamDescription,
//       category: data.category,
//       products: data.products.map((p) => ({
//         name: p.title,
//         price: 0,
//         image: p.image,
//       })),
//       thumbnail: data.thumbnailUrl,
//     };

//     try {
//       const response = await fetch("/api/live/start", {
//         method: "POST",
//         body: JSON.stringify(streamData),
//         headers: { "Content-Type": "application/json" },
//       });

//       const result = await response.json();
//       if (response.ok) {
//         setStreamCreated(true);
//         setStreamDetails(result.newLiveStream);

//         // Update the user's stream attribute with the new stream's ObjectId
//         const updateResponse = await fetch("/api/user/update-stream", {
//           method: "POST",
//           body: JSON.stringify({
//             clerkId: user?.id,
//             streamId: result.newLiveStream._id, // Pass the stream ObjectId
//           }),
//           headers: { "Content-Type": "application/json" },
//         });

//         const updateResult = await updateResponse.json();
//         if (!updateResponse.ok) {
//           throw new Error(
//             updateResult.error || "Failed to update user stream status"
//           );
//         }

//         // Redirect to the new stream page
//         router.push(`/seller/stream/${result.newLiveStream._id}`);
//       } else {
//         setError(`Error: ${result.error || "Failed to start stream"}`);
//       }
//     } catch (error) {
//       setError(
//         "An error occurred while starting the stream. Please try again."
//       );
//     } finally {
//       setSubmitting(false);
//     }
//   };
//   const resetForm = () => {
//     setStreamCreated(false);
//     setStreamDetails(null);
//     setError(null);
//   };

//   if (loading) return <div>Loading...</div>;
//   if (fetchError) return <div>Error: {fetchError}</div>;
//   if (!currentUser) return <div>User data not found.</div>;
//   if (currentUser.role !== "seller") return <div>Access denied.</div>;

//   return (
//     <div className="p-4 max-w-2xl mx-auto">
//       <h2 className="text-2xl font-bold mb-6">Start a Live Stream</h2>
//       {error && <div className="bg-red-100 p-4 mb-4">{error}</div>}
//       {streamCreated ? (
//         <StreamCreatedSuccess
//           streamDetails={streamDetails}
//           onReset={resetForm}
//         />
//       ) : (
//         <StreamForm
//           categories={categories}
//           onSubmit={handleSubmit}
//           error={error}
//           setError={setError}
//         />
//       )}
//     </div>
//   );
// }

// interface StreamFormProps {
//   categories: string[];
//   onSubmit: (data: {
//     sellerName: string;
//     category: string;
//     streamTitle: string;
//     streamDescription: string;
//     products: { title: string; image: string }[];
//     thumbnailUrl: string | null;
//   }) => void;
//   error: string | null;
//   setError: (error: string | null) => void;
// }

// const StreamForm = ({
//   categories,
//   onSubmit,
//   error,
//   setError,
// }: StreamFormProps) => {
//   const [sellerName, setSellerName] = useState("");
//   const [category, setCategory] = useState("");
//   const [streamTitle, setStreamTitle] = useState("");
//   const [streamDescription, setStreamDescription] = useState("");
//   const [products, setProducts] = useState<{ title: string; image: string }[]>(
//     []
//   );
//   const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

//   const addProduct = () => {
//     setProducts((prev) => [...prev, { title: "", image: "" }]);
//   };

//   const handleSubmit = () => {
//     if (!sellerName || !category || !streamTitle || !streamDescription) {
//       setError("Please fill out all required fields.");
//       return;
//     }

//     onSubmit({
//       sellerName,
//       category,
//       streamTitle,
//       streamDescription,
//       products,
//       thumbnailUrl,
//     });
//   };

//   return (
//     <div className="space-y-4">
//       <div>
//         <label className="block mb-2 font-medium">Your Name:</label>
//         <input
//           type="text"
//           value={sellerName}
//           onChange={(e) => setSellerName(e.target.value)}
//           className="border rounded p-2 w-full"
//           placeholder="Enter your name"
//         />
//       </div>

//       <div>
//         <label className="block mb-2 font-medium">Category:</label>
//         <select
//           className="border rounded p-2 w-full"
//           value={category}
//           onChange={(e) => setCategory(e.target.value)}
//         >
//           <option value="">Select a category</option>
//           {categories.map((cat) => (
//             <option key={cat} value={cat}>
//               {cat}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div>
//         <label className="block mb-2 font-medium">Stream Title:</label>
//         <input
//           type="text"
//           value={streamTitle}
//           onChange={(e) => setStreamTitle(e.target.value)}
//           className="border rounded p-2 w-full"
//           placeholder="Enter an engaging title for your stream"
//         />
//       </div>

//       <div>
//         <label className="block mb-2 font-medium">Stream Description:</label>
//         <textarea
//           value={streamDescription}
//           onChange={(e) => setStreamDescription(e.target.value)}
//           className="border rounded p-2 w-full min-h-[100px]"
//           placeholder="Describe what you'll be showcasing in this stream"
//         />
//       </div>

//       <ThumbnailUpload
//         onUpload={setThumbnailUrl}
//         error={error}
//         setError={setError}
//       />

//       <div className="mb-6">
//         <h3 className="text-lg font-semibold mb-3">Products</h3>
//         {products.length === 0 && (
//           <p className="text-sm text-gray-500 mb-2">
//             Add products to showcase in your stream
//           </p>
//         )}
//         {products.map((product, index) => (
//           <ProductUpload
//             key={index}
//             product={product}
//             index={index}
//             onUpdate={(index, updatedProduct) => {
//               const updatedProducts = [...products];
//               updatedProducts[index] = updatedProduct;
//               setProducts(updatedProducts);
//             }}
//             error={error}
//             setError={setError}
//           />
//         ))}
//         <button
//           onClick={addProduct}
//           className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition-colors duration-200"
//         >
//           Add Product
//         </button>
//       </div>

//       <button
//         onClick={handleSubmit}
//         disabled={
//           !sellerName ||
//           !category ||
//           !streamTitle ||
//           !streamDescription ||
//           products.some((p) => !p.title || !p.image)
//         }
//         className={`w-full py-3 px-4 text-lg font-semibold rounded transition-colors duration-200 ${
//           !sellerName ||
//           !category ||
//           !streamTitle ||
//           !streamDescription ||
//           products.some((p) => !p.title || !p.image)
//             ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//             : "bg-primary text-primary-foreground hover:bg-primary/90"
//         }`}
//       >
//         Create Live Stream
//       </button>
//     </div>
//   );
// };
