"use client"

import { useState, useEffect } from "react"
import { Search, User, Mail, Phone, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface User {
  id: string
  name: string
  email: string
  phone: string
  avatarUrl: string | null
  emailVerified: boolean
}

interface UserSelectorProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (userId: string, userName: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  users: User[]
  isLoading: boolean
}

export function UserSelector({
  isOpen,
  onOpenChange,
  onSelect,
  searchQuery,
  onSearchChange,
  users,
  isLoading,
}: UserSelectorProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select User</DialogTitle>
          <DialogDescription>
            Choose a user to register as a driver. Users must have a verified
            account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="border rounded-lg max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : users.length > 0 ? (
              <div className="divide-y">
                {users.map((user) => (
                  <button
                    key={user.id}
                    className="w-full p-4 hover:bg-muted/50 cursor-pointer transition-colors text-left"
                    onClick={() => {
                      onSelect(user.id, user.name)
                      onOpenChange(false)
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{user.name}</p>
                          {user.emailVerified && (
                            <Badge variant="outline" className="gap-1">
                              <Check className="h-3 w-3" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Phone className="h-3 w-3" />
                          <span>{user.phone}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No users found</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
