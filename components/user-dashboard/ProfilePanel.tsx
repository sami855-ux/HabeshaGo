"use client";

import { useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  Trash2,
  Smartphone,
  LogOut,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const devices = [
  { id: 1, name: "iPhone 14 Pro", lastSeen: "2 mins ago" },
  { id: 2, name: "MacBook Air", lastSeen: "Yesterday" },
  { id: 3, name: "Chrome on Windows", lastSeen: "Last week" },
];

export default function ProfilePanel() {
  const fileRef = useRef<HTMLInputElement>(null);

  const [avatar, setAvatar] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [name, setName] = useState("Biki Joker");
  const [phone, setPhone] = useState("");
  const [emailVerified, setEmailVerified] = useState(true);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const createdAt = "2024-03-12";
  const updatedAt = "2026-01-10";

  const handleImageChange = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  return (
    <div className="space-y-6">
      {/* PROFILE IMAGE */}
      <Card className="border-0 shadow-md">
        <CardContent className="flex flex-col items-center gap-4 py-6">
          <div className="relative">
            <div className="size-28 rounded-full overflow-hidden border bg-muted flex items-center justify-center">
              {preview || avatar ? (
                <img
                  src={preview || avatar!}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="size-12 text-muted-foreground" />
              )}
            </div>

            <Button
              size="icon"
              variant="outline"
              className="absolute bottom-0 right-0 rounded-full"
              onClick={() => fileRef.current?.click()}
            >
              <Camera className="size-4" />
            </Button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) =>
                e.target.files && handleImageChange(e.target.files[0])
              }
            />
          </div>

          <div className="flex gap-2">
            <Button size="sm" disabled={!preview}>
              Save Image
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setPreview(null);
                setAvatar(null);
              }}
            >
              Remove
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* PERSONAL INFORMATION */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Manage your identity & contact details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* NAME */}
          <div className="space-y-1">
            <Label>Name</Label>
            <div className="flex gap-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
              <Button size="sm">Save</Button>
            </div>
          </div>

          {/* EMAIL */}
          <div className="space-y-1">
            <Label>Email</Label>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                <span>user@email.com</span>
              </div>
              {emailVerified ? (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="size-4 text-green-600" />
                  Verified
                </Badge>
              ) : (
                <Button size="sm">Verify Email</Button>
              )}
            </div>
          </div>

          {/* PHONE */}
          <div className="space-y-1">
            <Label>Phone Number</Label>
            <div className="flex gap-2">
              <Input
                placeholder="+251 9xx xxx xxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Button size="sm">Save</Button>
            </div>

            <div className="flex items-center justify-between mt-2">
              {phoneVerified ? (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="size-4 text-green-600" />
                  Verified
                </Badge>
              ) : (
                <Button size="sm" onClick={() => setOtpSent(true)}>
                  Verify Phone
                </Button>
              )}
            </div>

            {otpSent && (
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <Button size="sm" onClick={() => setPhoneVerified(true)}>
                  Confirm
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* LOGIN HISTORY */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Login History</CardTitle>
          <CardDescription>Recent devices & sessions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {devices.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="size-4 text-primary" />
                <span>{d.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {d.lastSeen}
              </span>
            </div>
          ))}
          <Button variant="destructive" size="sm">
            <LogOut className="size-4 mr-1" />
            Logout from all other devices
          </Button>
        </CardContent>
      </Card>

      {/* ACCOUNT INFO */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Account created: {createdAt}</p>
          <p>Last updated: {updatedAt}</p>

          <Separator className="my-3" />

          <Button
            variant="destructive"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="size-4 mr-2" />
            Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* DELETE CONFIRMATION */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 flex gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            <p className="text-sm">
              All data, wallet balance, and sessions will be removed.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
