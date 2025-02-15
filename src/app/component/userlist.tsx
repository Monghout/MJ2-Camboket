"use client";
import { useEffect, useState } from "react";

interface User {
  clerkId: string;
  email: string;
  name: string;
  role: string;
  subscriptionStatus: string;
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
            <li key={user.clerkId} className="p-2 border rounded mb-2">
              <strong>{user.name}</strong> - {user.email} ({user.role})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
