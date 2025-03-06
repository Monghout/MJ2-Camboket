"use client";
import { useEffect, useState } from "react";

interface User {
  _id: string;
  clerkId: string;
  email: string;
  name: string;
  role: string;
  subscriptionStatus: string;
  photo: string;
  // socialMediaLinks: string[];
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/user");
        const data = await res.json();
        if (data.success) setUsers(data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">User List</h2>
      {loading ? (
        <p>Loading...</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul className="mt-4">
          {users.map((user) => (
            <li key={user._id} className="p-4 border rounded mb-4">
              <div className="flex items-center space-x-4">
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <strong>{user.name}</strong> - {user.email}
                </div>
              </div>
              <div className="mt-2">
                <p>
                  <strong>ID:</strong> {user._id}
                </p>
                <p>
                  <strong>Clerk ID:</strong> {user.clerkId}
                </p>
                <p>
                  <strong>Role:</strong> {user.role}
                </p>
                <p>
                  <strong>Subscription Status:</strong>{" "}
                  {user.subscriptionStatus}
                </p>
                <p>
                  <strong>Online Status:</strong>{" "}
                  {user.isOnline ? "Online" : "Offline"}
                </p>
                <p>
                  <strong>Last Seen:</strong> {user.lastSeen}
                </p>
                <p>
                  <strong>Created At:</strong> {user.createdAt}
                </p>
                <p>
                  <strong>Updated At:</strong> {user.updatedAt}
                </p>
                {/* <p>
                  <strong>Social Media Links:</strong>{" "}
                  {user.socialMediaLinks.join(", ") || "None"}
                </p> */}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
