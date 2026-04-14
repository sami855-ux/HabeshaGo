import { X, MapPin, Car, User, Calendar, Phone, Mail } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  accountType: string;
  vehicleInfo?: string;
  station?: string;
  avatar: string;
  email: string;
  phone: string;
  joinDate: string;
  totalTrips?: number;
  online: boolean;
}

interface UserProfileProps {
  customer: Customer;
  onClose: () => void;
}

export function UserProfile({ customer, onClose }: UserProfileProps) {
  return (
    <div className="w-80 bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h3 className="text-gray-900 dark:text-white">Customer Details</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-900 rounded transition-colors"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Profile Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Avatar and Name */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl">
              {customer.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            {customer.online && (
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-4 border-white dark:border-gray-950 rounded-full" />
            )}
          </div>
          <h3 className="text-gray-900 dark:text-white mb-1">
            {customer.name}
          </h3>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 rounded-full text-sm">
            <User className="w-3.5 h-3.5" />
            {customer.accountType}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-4">
          {/* Contact Information */}
          <div>
            <h4 className="text-gray-900 dark:text-white mb-3">
              Contact Information
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-orange-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  {customer.email}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-orange-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  {customer.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <h4 className="text-gray-900 dark:text-white mb-3">
              Account Details
            </h4>
            <div className="space-y-3">
              {customer.vehicleInfo && (
                <div className="flex items-center gap-3 text-sm">
                  <Car className="w-4 h-4 text-orange-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {customer.vehicleInfo}
                  </span>
                </div>
              )}
              {customer.station && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {customer.station}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  Joined {customer.joinDate}
                </span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {customer.totalTrips !== undefined && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <h4 className="text-gray-900 dark:text-white mb-3">Statistics</h4>
              <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3">
                <div className="text-2xl text-orange-600 dark:text-orange-400 mb-1">
                  {customer.totalTrips}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Trips
                </div>
              </div>
            </div>
          )}

          {/* Session History */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <h4 className="text-gray-900 dark:text-white mb-3">
              Recent Sessions
            </h4>
            <div className="space-y-2">
              <div className="text-sm p-2 bg-gray-50 dark:bg-gray-900 rounded">
                <div className="text-gray-900 dark:text-white mb-1">
                  Payment Issue
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-xs">
                  Mar 12, 2026 - 15 mins
                </div>
              </div>
              <div className="text-sm p-2 bg-gray-50 dark:bg-gray-900 rounded">
                <div className="text-gray-900 dark:text-white mb-1">
                  Vehicle Registration
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-xs">
                  Mar 10, 2026 - 8 mins
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
