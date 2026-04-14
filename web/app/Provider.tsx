"use client";

import { ReactNode, FC, useEffect } from "react";
import { Provider as ReduxProvider, useDispatch } from "react-redux";
import { store } from "@/store";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/themeProvider";
import SessionProvider from "@/lib/accessTokenProvider";
import { QueryProvider } from "@/lib/QueryProvider";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

import { getSocket } from "@/services/socket";
import { initializeSocketListeners } from "@/services/socketListner";

interface AppProviderProps {
  children: ReactNode;
}

const SocketInitializer = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    initializeSocketListeners(dispatch);

    return () => {
      socket.off();
      socket.disconnect();
    };
  }, [dispatch]);

  return <>{children}</>;
};

const AppProvider: FC<AppProviderProps> = ({ children }) => {
  return (
    <ReduxProvider store={store}>
      <SocketInitializer>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster
            position="top-center"
            visibleToasts={3}
            duration={4000}
          ></Toaster>

          <SessionProvider>
            <QueryProvider>{children}</QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </SocketInitializer>
    </ReduxProvider>
  );
};

export default AppProvider;
