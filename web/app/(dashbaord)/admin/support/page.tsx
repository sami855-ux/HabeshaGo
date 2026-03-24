"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Moon, Sun } from "lucide-react";
import { CustomerList } from "@/components/user-dashboard/CustomerList";
import { ChatWindow } from "@/components/user-dashboard/ChatWindow";
import { UserProfile } from "@/components/user-dashboard/UserProfile";
import {
  fetchCustomers,
  fetchMessages,
  sendMessage,
  selectCustomer,
} from "@/store/slices/supportAgentSlice";
import { RootState, AppDispatch } from "@/store";

export default function SupportPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { customers, messages, selectedCustomerId } = useSelector(
    (state: RootState) => state.supportChat,
  );

  const [darkMode, setDarkMode] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCustomerId) dispatch(fetchMessages(selectedCustomerId));
  }, [selectedCustomerId, dispatch]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const currentMessages = selectedCustomerId
    ? messages[selectedCustomerId] || []
    : [];

  const handleSendMessage = (text: string, attachment?: File) => {
    if (!selectedCustomerId) return;
    dispatch(sendMessage({ sessionId: selectedCustomerId, text, attachment }));
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Top Bar */}
      <div className="h-16 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">H</span>
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-white">HabeshaGo Support</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Agent Dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="text-orange-500">
              {customers.filter((c) => c.unread > 0).length}
            </span>{" "}
            active conversations
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-orange-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 flex-shrink-0">
          <CustomerList
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={(id) => dispatch(selectCustomer(id))}
          />
        </div>

        <div className="flex-1 flex">
          {selectedCustomer ? (
            <>
              <div className="flex-1">
                <ChatWindow
                  customerName={selectedCustomer.name}
                  messages={currentMessages}
                  isTyping={false}
                  onSendMessage={handleSendMessage}
                  onShowProfile={() => setShowProfile(!showProfile)}
                />
              </div>
              {showProfile && (
                <UserProfile
                  customer={selectedCustomer}
                  onClose={() => setShowProfile(false)}
                />
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-950">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">💬</span>
                </div>
                <h3 className="text-gray-900 dark:text-white mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose a customer from the list to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
