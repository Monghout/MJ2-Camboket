// "use client";

// import useSWR from "swr";
// import { useRouter } from "next/navigation";

// const fetcher = (url: string) => fetch(url).then((res) => res.json());

// export default function LivePage() {
//   const { data, error } = useSWR("/api/live/active", fetcher);
//   const router = useRouter();

//   if (error) return <p>Error loading streams...</p>;
//   if (!data) return <p>Loading...</p>;

//   return (
//     <div>
//       <h1>Live Streams</h1>
//       <div className="grid grid-cols-3 gap-4">
//         {data.streams.map((stream: any) => (
//           <div
//             key={stream._id}
//             className="border p-4"
//             onClick={() => router.push(`/live/${stream._id}`)}
//           >
//             <h2>{stream.title}</h2>
//             <p>{stream.description}</p>
//             <p>Category: {stream.category}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
