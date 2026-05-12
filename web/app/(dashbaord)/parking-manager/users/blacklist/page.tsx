"use client";

import { useState } from "react";
import { UserX, Mail, AlertCircle, Search, UserPlus } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";

const mockBlacklist = [
  {
    id: "BL-001",
    userId: "USR-045",
    name: "Robert Brown",
    email: "robert.b@example.com",
    reason: "Multiple no-shows",
    addedDate: "2026-04-15",
    addedBy: "Admin",
  },
  {
    id: "BL-002",
    userId: "USR-062",
    name: "Susan Lee",
    email: "susan.lee@example.com",
    reason: "Payment fraud attempt",
    addedDate: "2026-04-10",
    addedBy: "Admin",
  },
  {
    id: "BL-003",
    userId: "USR-078",
    name: "David Wilson",
    email: "d.wilson@example.com",
    reason: "Aggressive behavior",
    addedDate: "2026-04-05",
    addedBy: "System",
  },
];

export default function Blacklist() {
  const [blacklist, setBlacklist] = useState(mockBlacklist);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBlacklist = blacklist.filter(
    (entry) =>
      entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.reason.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Blacklist</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Manage blocked users and restrictions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Blacklisted Users
              </p>
              <h3 className="text-3xl font-bold mt-1">{blacklist.length}</h3>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <UserX className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This Month
              </p>
              <h3 className="text-3xl font-bold mt-1 text-red-600">2</h3>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <AlertCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search blacklist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredBlacklist.map((entry) => (
          <div
            key={entry.id}
            className="bg-white dark:bg-gray-900 rounded-lg border border-red-200 dark:border-red-900/50 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <UserX className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{entry.name}</h3>
                    <span className="text-xs text-gray-500">
                      ({entry.userId})
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {entry.email}
                    </p>
                    <p className="text-sm flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 text-red-600" />
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        {entry.reason}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  Blacklisted
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Added Date
                </p>
                <p className="text-sm font-medium">
                  {new Date(entry.addedDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Added By
                </p>
                <p className="text-sm font-medium">{entry.addedBy}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Remove from Blacklist
              </Button>
              <Button size="sm" variant="outline">
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredBlacklist.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No blacklisted users found.
        </div>
      )}
    </div>
  );
}
