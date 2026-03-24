import { Search, Circle } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  accountType: string;
  vehicleInfo?: string;
  station?: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

interface CustomerListProps {
  customers: Customer[];
  selectedCustomerId: string | null;
  onSelectCustomer: (id: string) => void;
}

export function CustomerList({
  customers,
  selectedCustomerId,
  onSelectCustomer,
}: CustomerListProps) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-gray-900 dark:text-white mb-4">
          Active Conversations
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="flex-1 overflow-y-auto">
        {customers.map((customer) => (
          <button
            key={customer.id}
            onClick={() => onSelectCustomer(customer.id)}
            className={`w-full p-4 border-b border-gray-100 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left ${
              selectedCustomerId === customer.id
                ? "bg-orange-50 dark:bg-orange-950/20 border-l-4 border-l-orange-500"
                : ""
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white">
                  {customer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                {customer.online && (
                  <Circle className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 fill-green-500 text-green-500 border-2 border-white dark:border-gray-950 rounded-full" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-gray-900 dark:text-white truncate">
                    {customer.name}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {customer.timestamp}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {customer.accountType}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 truncate">
                  {customer.lastMessage}
                </p>
              </div>

              {/* Unread Badge */}
              {customer.unread > 0 && (
                <div className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-1">
                  {customer.unread}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
