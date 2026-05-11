"use client";

import { useState } from "react";
import { Users, Mail, Phone, Car, MapPin, Search, UserX } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";

const mockUsers = [
  {
    id: "USR-001",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 234-567-8900",
    vehicles: [{ plate: "ABC-1234", model: "Toyota Camry" }],
    totalSessions: 45,
    totalSpent: 2250.0,
    status: "active",
    joinedDate: "2026-01-15",
  },
  {
    id: "USR-002",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1 234-567-8901",
    vehicles: [{ plate: "XYZ-5678", model: "Honda Accord" }],
    totalSessions: 32,
    totalSpent: 1680.0,
    status: "active",
    joinedDate: "2026-02-20",
  },
  {
    id: "USR-003",
    name: "Mike Johnson",
    email: "mike.j@example.com",
    phone: "+1 234-567-8902",
    vehicles: [{ plate: "DEF-9012", model: "Ford F-150" }],
    totalSessions: 18,
    totalSpent: 890.0,
    status: "active",
    joinedDate: "2026-03-10",
  },
];

export default function AllUsers() {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredUsers = users.filter((user) => {
    if (statusFilter !== "all" && user.status !== statusFilter) return false;
    if (
      searchTerm &&
      !user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">All Users</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Manage all registered users and their vehicles
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Users
              </p>
              <h3 className="text-3xl font-bold mt-1">{users.length}</h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active Users
              </p>
              <h3 className="text-3xl font-bold mt-1 text-green-600">
                {users.filter((u) => u.status === "active").length}
              </h3>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Revenue
              </p>
              <h3 className="text-3xl font-bold mt-1">
                ${users.reduce((sum, u) => sum + u.totalSpent, 0).toFixed(2)}
              </h3>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <MapPin className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{user.name}</h3>
                    <span className="text-xs text-gray-500">({user.id})</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {user.phone}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Car className="h-3 w-3" />
                      {user.vehicles
                        .map((v) => `${v.model} (${v.plate})`)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 capitalize">
                  {user.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Total Sessions
                </p>
                <p className="text-lg font-bold">{user.totalSessions}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Total Spent
                </p>
                <p className="text-lg font-bold text-green-600">
                  ${user.totalSpent.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Member Since
                </p>
                <p className="text-lg font-bold">
                  {new Date(user.joinedDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button size="sm" variant="outline">
                View Details
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
              >
                <UserX className="h-4 w-4 mr-1" />
                Add to Blacklist
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
