"use client";

import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Bus,
  Headset,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Play,
  QrCode,
  RefreshCcw,
  Search,
  Shield,
  UserCheck,
  Video,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const helpTopics = [
  {
    title: "Quick start guide",
    icon: BookOpen,
    description: "Onboarding steps for new riders and payers.",
  },
  {
    title: "Wallet & payments",
    icon: Wallet,
    description: "Top-ups, auto-recharge, limits, and statements.",
  },
  {
    title: "Bus & transport",
    icon: Bus,
    description: "Finding routes, arrivals, and live traffic basics.",
  },
  {
    title: "Ticket booking & QR",
    icon: QrCode,
    description: "Scan flow, offline QR, and validation tips.",
  },
  {
    title: "Refunds & cancellations",
    icon: RefreshCcw,
    description: "Eligibility, timelines, and how to request.",
  },
  {
    title: "Safety & emergencies",
    icon: Shield,
    description: "SOS steps, panic lock, and helpline usage.",
  },
  {
    title: "Account & security",
    icon: UserCheck,
    description: "2FA, sessions, PIN, and device trust checks.",
  },
  {
    title: "Common errors & fixes",
    icon: AlertTriangle,
    description: "Most frequent issues and quick resolutions.",
  },
  {
    title: "Help articles search",
    icon: Search,
    description: "Browse all knowledge-base entries.",
  },
  {
    title: "Video tutorials",
    icon: Play,
    description: "Guided walkthroughs (coming soon).",
    future: true,
  },
];

const contactOptions = [
  { label: "Phone", value: "+251 900 123 123", icon: Phone },
  { label: "Email", value: "support@addispulse.com", icon: Mail },
  {
    label: "WhatsApp / Telegram",
    value: "+251 900 123 123",
    icon: MessageCircle,
  },
];

export default function SupportPanel() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase font-semibold text-muted-foreground">
            Support
          </p>
          <h1 className="text-2xl font-bold">Help Center</h1>
          <p className="text-sm text-muted-foreground">
            Search guides, troubleshoot quickly, or reach our support team.
          </p>
        </div>
        <Badge variant="secondary" className="gap-2">
          <Headset className="size-4" />
          24/7 support
        </Badge>
      </header>

      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-col gap-3">
          <CardTitle className="flex items-center gap-2">
            <Search className="size-5 text-primary" />
            Searchable help articles
          </CardTitle>
          <CardDescription>
            Find answers fast across wallet, transport, and account topics.
          </CardDescription>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search help articles..." className="pl-9" />
            </div>
            <Button className="sm:w-auto">Search</Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {helpTopics.map((topic) => (
          <Card
            key={topic.title}
            className="h-full border bg-card/80 hover:shadow-md transition"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <topic.icon className="size-4 text-primary" />
                  <CardTitle className="text-base">{topic.title}</CardTitle>
                </div>
                {topic.future && <Badge variant="outline">Future</Badge>}
              </div>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              {topic.description}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Headset className="size-5 text-primary" />
              Contact options
            </CardTitle>
            <CardDescription>
              Call, email, or message us anytime.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {contactOptions.map((option) => (
              <div
                key={option.label}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <option.icon className="size-4 text-primary" />
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {option.value}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Copy
                </Button>
              </div>
            ))}
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button className="w-full" variant="secondary">
                <Phone className="size-4 mr-2" />
                Call Support
              </Button>
              <Button className="w-full" variant="outline">
                <MessageCircle className="size-4 mr-2" />
                Chat on WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-5 text-primary" />
              Office location
            </CardTitle>
            <CardDescription>
              Find us on the map for in-person assistance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm font-semibold">Addis Pulse HQ</p>
              <p className="text-sm text-muted-foreground">Bole, Addis Ababa</p>
              <p className="text-xs text-muted-foreground">
                Mon-Fri, 9:00 - 18:00
              </p>
            </div>
            <div className="h-48 rounded-lg border bg-muted flex items-center justify-center text-muted-foreground text-sm">
              Map preview placeholder
            </div>
            <Button variant="outline" className="w-full">
              <MapPin className="size-4 mr-2" />
              Open in Maps
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="size-5 text-primary" />
            Quick start & tutorials
          </CardTitle>
          <CardDescription>
            Step-by-step guides for new users and teams.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="font-medium">Getting started playlist</p>
            <p className="text-sm text-muted-foreground">
              Short videos covering wallet setup, booking, and QR usage. Coming
              soon.
            </p>
          </div>
          <Badge variant="outline" className="w-fit">
            Future feature
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
