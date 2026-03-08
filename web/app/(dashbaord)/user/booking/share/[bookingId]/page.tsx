"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  Bus,
  ArrowLeft,
  Share2,
  Phone,
  Check,
  Search,
  User,
  Users,
  Send,
  X,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  CreditCard,
  Shield,
  QrCode,
  Smartphone,
  Mail,
  Copy,
  Loader2,
  Plus,
  Trash2,
  MessageCircle,
  ChevronRight,
  Crown,
  Sparkles,
  Award,
  Ticket,
  Star,
  Globe,
  MoreHorizontal,
  Download,
  Printer,
  Heart,
  Bookmark,
  Bell,
  Settings,
  HelpCircle,
  AlertCircle,
  Info,
  Wallet,
  Gift,
  Zap,
  TrendingUp,
  Target,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Fingerprint,
  ScanFace,
  ScanLine,
  ScanQrCode,
  Waves,
  Mountain,
  TreePine,
  Flower,
  Leaf,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  Umbrella,
  Wind,
  Thermometer,
  Droplets,
  Sunrise,
  Sunset,
  Compass,
  Navigation,
  Filter,
  SortAsc,
  Target as TargetIcon,
  FolderKanban as FolderKanbanIcon,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

// Types
interface User {
  id: string
  name: string
  phone: string
  avatar?: string
  email?: string
  recent?: boolean
  favorite?: boolean
  status?: "online" | "offline" | "away"
  lastSeen?: string
  groups?: string[]
  tags?: string[]
}

interface Booking {
  id: string
  bookingCode: string
  busId: number
  scheduleId: number
  passengerCount: number
  totalPrice: number
  status: string
  createdAt: string
}

interface Group {
  id: string
  name: string
  memberCount: number
  avatar?: string
}

interface ShareTicketPageProps {
  booking?: Booking
  onClose?: () => void
}

// Mock data
const mockContacts: User[] = [
  {
    id: "1",
    name: "Sarah Williams",
    phone: "+251 911 234 567",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    email: "sarah.w@example.com",
    recent: true,
    favorite: true,
    status: "online",
    lastSeen: "now",
    tags: ["family", "frequent"],
  },
  {
    id: "2",
    name: "Michael Chen",
    phone: "+251 922 345 678",
    avatar: "https://i.pravatar.cc/150?u=michael",
    email: "m.chen@example.com",
    recent: true,
    status: "offline",
    lastSeen: "2h ago",
    tags: ["work"],
  },
  {
    id: "3",
    name: "Abebe Kebede",
    phone: "+251 933 456 789",
    avatar: "https://i.pravatar.cc/150?u=abebe",
    recent: true,
    status: "away",
    lastSeen: "30m ago",
    tags: ["family"],
  },
  {
    id: "4",
    name: "Tigist Haile",
    phone: "+251 944 567 890",
    avatar: "https://i.pravatar.cc/150?u=tigist",
    email: "tigist.h@example.com",
    favorite: true,
    status: "online",
    lastSeen: "now",
    tags: ["work", "frequent"],
  },
  {
    id: "5",
    name: "John Smith",
    phone: "+251 955 678 901",
    avatar: "https://i.pravatar.cc/150?u=john",
    status: "offline",
    lastSeen: "1d ago",
    tags: ["friend"],
  },
  {
    id: "6",
    name: "Meron Alemu",
    phone: "+251 966 789 012",
    avatar: "https://i.pravatar.cc/150?u=meron",
    favorite: true,
    status: "online",
    lastSeen: "now",
    tags: ["family", "favorite"],
  },
  {
    id: "7",
    name: "Dawit Tekle",
    phone: "+251 977 890 123",
    avatar: "https://i.pravatar.cc/150?u=dawit",
    status: "away",
    lastSeen: "15m ago",
    tags: ["work"],
  },
  {
    id: "8",
    name: "Helen Tadesse",
    phone: "+251 988 901 234",
    avatar: "https://i.pravatar.cc/150?u=helen",
    status: "offline",
    lastSeen: "3h ago",
    tags: ["friend"],
  },
]

const mockGroups: Group[] = [
  {
    id: "g1",
    name: "Family",
    memberCount: 8,
    avatar: "https://i.pravatar.cc/150?u=family",
  },
  {
    id: "g2",
    name: "Work Colleagues",
    memberCount: 15,
    avatar: "https://i.pravatar.cc/150?u=work",
  },
  {
    id: "g3",
    name: "Travel Buddies",
    memberCount: 6,
    avatar: "https://i.pravatar.cc/150?u=travel",
  },
]

const mockBooking: Booking = {
  id: "BKG-123456",
  bookingCode: "HAB123456",
  busId: 101,
  scheduleId: 202,
  passengerCount: 2,
  totalPrice: 1200,
  status: "confirmed",
  createdAt: new Date().toISOString(),
}

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
}

const slideIn = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
}

const slideInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
}

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}

export default function ShareTicketPage({
  booking = mockBooking,
  onClose,
}: ShareTicketPageProps) {
  const router = useRouter()
  const params = useParams()
  const bookingId = params?.id || booking.id

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [contacts, setContacts] = useState<User[]>(mockContacts)
  const [groups] = useState<Group[]>(mockGroups)
  const [isLoading, setIsLoading] = useState(false)
  const [shareMethod, setShareMethod] = useState<
    "sms" | "whatsapp" | "telegram" | "email"
  >("whatsapp")
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [sharedWith, setSharedWith] = useState<User[]>([])
  const [activeTab, setActiveTab] = useState<"contacts" | "groups" | "recent">(
    "contacts",
  )
  const [message, setMessage] = useState("")
  const [scheduleLater, setScheduleLater] = useState(false)
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined)
  const [priority, setPriority] = useState<"normal" | "high" | "urgent">(
    "normal",
  )
  const [showAddContact, setShowAddContact] = useState(false)
  const [newContact, setNewContact] = useState({ name: "", phone: "" })

  // Filter contacts based on search
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Get recent contacts
  const recentContacts = contacts.filter((c) => c.recent).slice(0, 5)

  // Get favorite contacts
  const favoriteContacts = contacts.filter((c) => c.favorite)

  // Get online contacts
  const onlineContacts = contacts.filter((c) => c.status === "online")

  const handleSelectUser = (user: User) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user])

      // Show quick toast
      toast.success(`${user.name} added`, {
        description: "Recipient added to list",
        duration: 2000,
      })
    }
    setSearchQuery("")
  }

  const handleSelectGroup = (group: Group) => {
    toast.success(`Group "${group.name}" selected`, {
      description: `${group.memberCount} members will receive the ticket`,
    })
    // In a real app, you'd fetch group members
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId))
    toast.info("Recipient removed")
  }

  const handleShare = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one recipient")
      return
    }

    setIsLoading(true)

    // Simulate sharing process
    setTimeout(() => {
      setIsLoading(false)
      setSharedWith(selectedUsers)
      setShowSuccessDialog(true)

      // Update recent contacts
      const updatedContacts = contacts.map((contact) => {
        if (selectedUsers.find((u) => u.id === contact.id)) {
          return { ...contact, recent: true }
        }
        return contact
      })
      setContacts(updatedContacts)

      toast.success(
        `Ticket shared with ${selectedUsers.length} recipient${selectedUsers.length > 1 ? "s" : ""}`,
      )
    }, 2000)
  }

  const handleSendAgain = (user: User) => {
    toast.success(`Ticket resent to ${user.name}`)
  }

  const handleCopyLink = () => {
    const link = `${window.location.origin}/ticket/${booking.bookingCode}`
    navigator.clipboard.writeText(link)
    toast.success("Share link copied to clipboard")
  }

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast.error("Please fill in all fields")
      return
    }

    const contact: User = {
      id: `new-${Date.now()}`,
      name: newContact.name,
      phone: newContact.phone,
      recent: true,
      status: "offline",
    }

    setContacts([contact, ...contacts])
    setShowAddContact(false)
    setNewContact({ name: "", phone: "" })
    toast.success("Contact added successfully")
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  const getShareMethodIcon = () => {
    switch (shareMethod) {
      case "whatsapp":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.077 4.928C17.191 3.041 14.683 2 12.006 2 6.798 2 2.528 6.242 2.517 11.435c-.004 1.662.433 3.287 1.262 4.725L2.25 21.75l5.693-1.494c1.384.752 2.943 1.148 4.541 1.15h.004c5.187 0 9.458-4.244 9.469-9.438.005-2.522-.976-4.896-2.88-6.79z" />
          </svg>
        )
      case "telegram":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.74-.42 1.03-.7 1.06-.59.05-1.04-.39-1.61-.77-1.07-.73-1.67-1.19-2.71-1.92-1.2-.85-.42-1.32.26-2.09.18-.2 3.29-3.01 3.35-3.27.01-.03.01-.11-.04-.15-.05-.04-.13-.02-.19-.01-.08.01-1.44.92-4.05 2.68-.38.26-.73.39-1.04.38-.34-.01-1-.19-1.49-.35-.6-.19-1.07-.3-1.03-.64.02-.18.27-.36.74-.55 2.84-1.23 4.73-2.04 5.68-2.43 2.71-1.09 3.27-1.28 3.64-1.28.08 0 .26.02.38.12.1.08.14.19.15.29.01.1.02.21-.01.31z" />
          </svg>
        )
      case "email":
        return <Mail className="w-5 h-5" />
      default:
        return <MessageCircle className="w-5 h-5" />
    }
  }

  const getShareMethodColor = () => {
    switch (shareMethod) {
      case "whatsapp":
        return "bg-gradient-to-r from-[#25D366] to-[#20BA5C] hover:from-[#20BA5C] hover:to-[#1AA14C]"
      case "telegram":
        return "bg-gradient-to-r from-[#0088cc] to-[#0077b5] hover:from-[#0077b5] hover:to-[#0066a0]"
      case "email":
        return "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
      default:
        return "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950">
        {/* Premium Header with Glass Effect */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm"
        >
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(0,0,0,0.05)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onClose?.() || router.back()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>

                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.05 }}
                    className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20"
                  >
                    <Share2 className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
                      Share Ticket
                    </h1>
                    <p className="text-sm text-gray-500">
                      Send ticket to friends & family
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center relative"
                    >
                      <Bell className="w-4 h-4" />
                      <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full" />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent>Notifications</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center"
                      onClick={handleCopyLink}
                    >
                      <Copy className="w-4 h-4" />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent>Copy share link</TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleCopyLink}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy link
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="w-4 h-4 mr-2" />
                      Download ticket
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Printer className="w-4 h-4 mr-2" />
                      Print ticket
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <QrCode className="w-4 h-4 mr-2" />
                      Show QR code
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Ticket Preview (3 columns) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-4"
            >
              <div className="sticky top-28 space-y-6">
                {/* Premium Ticket Card */}
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="border-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute inset-0 opacity-10">
                      <svg
                        width="60"
                        height="60"
                        viewBox="0 0 60 60"
                        className="w-full h-full"
                      >
                        <g fill="none" fillRule="evenodd">
                          <g fill="#ffffff" fillOpacity="0.05">
                            <path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z" />
                          </g>
                        </g>
                      </svg>
                    </div>

                    {/* Animated Glow */}
                    <motion.div
                      className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl"
                      animate={floatingAnimation}
                    />

                    <div className="relative p-8">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{ rotate: 10 }}
                            className="bg-white/10 p-3 rounded-xl"
                          >
                            <Ticket className="w-5 h-5" />
                          </motion.div>
                          <div>
                            <p className="text-sm text-white/60">
                              Premium Ticket
                            </p>
                            <p className="text-xs text-white/40">
                              Digital · Instant delivery
                            </p>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Sparkles className="w-5 h-5 text-yellow-400" />
                        </motion.div>
                      </div>

                      {/* Booking Code */}
                      <div className="mb-6">
                        <p className="text-xs text-white/40 mb-1">
                          Booking Code
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl font-mono font-bold tracking-wider bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
                            {booking.bookingCode}
                          </span>
                          <Badge className="bg-green-500/20 text-green-400 border-0 backdrop-blur-sm">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        </div>
                      </div>

                      {/* Route Info */}
                      <div className="bg-white/5 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-2" />
                            <p className="font-medium">Addis Ababa</p>
                            <p className="text-xs text-white/40">08:00 AM</p>
                          </div>
                          <div className="flex-1 mx-4">
                            <div className="relative">
                              <div className="h-0.5 bg-white/10 rounded-full" />
                              <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "60%" }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                              />
                              <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-orange-500/20 px-2 py-0.5 rounded-full">
                                <span className="text-[10px] text-orange-300">
                                  5h
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mb-2" />
                            <p className="font-medium">Hawassa</p>
                            <p className="text-xs text-white/40">01:00 PM</p>
                          </div>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-white/5 rounded-lg p-3">
                          <Calendar className="w-4 h-4 text-orange-400 mb-1" />
                          <p className="text-xs text-white/40">Date</p>
                          <p className="text-sm font-medium">
                            {new Date().toLocaleDateString()}
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <Users className="w-4 h-4 text-orange-400 mb-1" />
                          <p className="text-xs text-white/40">Passengers</p>
                          <p className="text-sm font-medium">
                            {booking.passengerCount}
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <Wallet className="w-4 h-4 text-orange-400 mb-1" />
                          <p className="text-xs text-white/40">Total</p>
                          <p className="text-sm font-bold text-orange-400">
                            ETB {booking.totalPrice}
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <Shield className="w-4 h-4 text-orange-400 mb-1" />
                          <p className="text-xs text-white/40">Status</p>
                          <p className="text-sm font-medium text-green-400">
                            Confirmed
                          </p>
                        </div>
                      </div>

                      {/* QR Code */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex justify-center"
                      >
                        <div className="relative">
                          <div className="absolute inset-0 bg-orange-500/20 rounded-2xl blur-xl" />
                          <div className="relative bg-white p-3 rounded-xl">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${booking.bookingCode}`}
                              alt="QR Code"
                              className="w-24 h-24"
                            />
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gradient-to-r from-white/5 to-transparent px-8 py-4 border-t border-white/10">
                      <div className="flex items-center justify-between text-xs text-white/40">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-3 h-3" />
                          <span>Mobile ticket</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <QrCode className="w-3 h-3" />
                          <span>Scan at gate</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Share Method Selector */}
                <Card className="border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
                  <div className="p-5">
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <Send className="w-4 h-4 text-orange-500" />
                      Share via
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        {
                          id: "whatsapp",
                          label: "WhatsApp",
                          color: "from-[#25D366] to-[#20BA5C]",
                        },
                        {
                          id: "telegram",
                          label: "Telegram",
                          color: "from-[#0088cc] to-[#0077b5]",
                        },
                        {
                          id: "email",
                          label: "Email",
                          color: "from-blue-500 to-blue-600",
                        },
                        {
                          id: "sms",
                          label: "SMS",
                          color: "from-green-500 to-green-600",
                        },
                      ].map((method) => (
                        <Tooltip key={method.id}>
                          <TooltipTrigger asChild>
                            <motion.button
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setShareMethod(method.id as any)}
                              className={cn(
                                "flex-col h-auto py-3 gap-1 rounded-xl transition-all",
                                shareMethod === method.id
                                  ? `bg-gradient-to-r ${method.color} text-white shadow-lg`
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700",
                              )}
                            >
                              {method.id === "whatsapp" && (
                                <svg
                                  className="w-4 h-4"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M19.077 4.928C17.191 3.041 14.683 2 12.006 2 6.798 2 2.528 6.242 2.517 11.435c-.004 1.662.433 3.287 1.262 4.725L2.25 21.75l5.693-1.494c1.384.752 2.943 1.148 4.541 1.15h.004c5.187 0 9.458-4.244 9.469-9.438.005-2.522-.976-4.896-2.88-6.79z" />
                                </svg>
                              )}
                              {method.id === "telegram" && (
                                <svg
                                  className="w-4 h-4"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.74-.42 1.03-.7 1.06-.59.05-1.04-.39-1.61-.77-1.07-.73-1.67-1.19-2.71-1.92-1.2-.85-.42-1.32.26-2.09.18-.2 3.29-3.01 3.35-3.27.01-.03.01-.11-.04-.15-.05-.04-.13-.02-.19-.01-.08.01-1.44.92-4.05 2.68-.38.26-.73.39-1.04.38-.34-.01-1-.19-1.49-.35-.6-.19-1.07-.3-1.03-.64.02-.18.27-.36.74-.55 2.84-1.23 4.73-2.04 5.68-2.43 2.71-1.09 3.27-1.28 3.64-1.28.08 0 .26.02.38.12.1.08.14.19.15.29.01.1.02.21-.01.31z" />
                                </svg>
                              )}
                              {method.id === "email" && (
                                <Mail className="w-4 h-4" />
                              )}
                              {method.id === "sms" && (
                                <MessageCircle className="w-4 h-4" />
                              )}
                              <span className="text-[10px]">
                                {method.label}
                              </span>
                            </motion.button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Share via {method.label}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Quick Stats */}
                <Card className="border border-gray-200 dark:border-gray-800 shadow-lg p-5">
                  <h3 className="text-sm font-semibold mb-4">Quick Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-orange-500">24</p>
                      <p className="text-xs text-gray-500">Shares today</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-500">89%</p>
                      <p className="text-xs text-gray-500">Open rate</p>
                    </div>
                  </div>
                  <Progress value={89} className="mt-3 h-1" />
                </Card>
              </div>
            </motion.div>

            {/* Right Column - Contact Selection (9 columns) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-8 space-y-6"
            >
              {/* Selected Recipients Card */}
              <Card className="border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h2 className="text-white font-semibold">
                          Selected Recipients
                        </h2>
                        <p className="text-white/80 text-xs">
                          Choose who to share with
                        </p>
                      </div>
                    </div>
                    {selectedUsers.length > 0 && (
                      <Badge className="bg-white/20 text-white border-0 px-3 py-1">
                        {selectedUsers.length} selected
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {selectedUsers.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-20 h-20 bg-orange-50 dark:bg-orange-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-orange-400" />
                      </div>
                      <h3 className="font-semibold mb-2">
                        No recipients selected
                      </h3>
                      <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                        Search and select contacts below to share your ticket
                      </p>
                      <motion.div
                        animate={{ y: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <ChevronRight className="w-5 h-5 text-orange-400 mx-auto rotate-90" />
                      </motion.div>
                    </motion.div>
                  ) : (
                    <div className="space-y-3">
                      <AnimatePresence>
                        {selectedUsers.map((user) => (
                          <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-xl border border-orange-200 dark:border-orange-800 group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <Avatar className="w-12 h-12 border-2 border-orange-500">
                                  <AvatarImage src={user.avatar} />
                                  <AvatarFallback className="bg-orange-100 text-orange-600">
                                    {user.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div
                                  className={cn(
                                    "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white",
                                    getStatusColor(user.status),
                                  )}
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold">{user.name}</p>
                                  {user.favorite && (
                                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                  )}
                                  {user.status === "online" && (
                                    <Badge className="bg-green-500 text-white text-[10px] h-5">
                                      Online
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">
                                  {user.phone}
                                </p>
                                {user.email && (
                                  <p className="text-xs text-gray-400">
                                    {user.email}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                    onClick={() => handleRemoveUser(user.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Remove</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Message</TooltipContent>
                              </Tooltip>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </Card>

              {/* Search Bar */}
              <div className="relative">
                <motion.div whileHover={{ scale: 1.01 }} className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, phone, or email..."
                    className="pl-11 pr-24 h-14 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                  <div className="absolute right-16 top-1/2 -translate-y-1/2 flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Filter className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Filter</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <SortAsc className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Sort</TooltipContent>
                    </Tooltip>
                  </div>
                </motion.div>
              </div>

              {/* Add New Contact Quick Action */}
              {searchQuery && filteredContacts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-2 border-dashed border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50/50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20">
                    <div className="p-6 text-center">
                      <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-6 h-6 text-orange-500" />
                      </div>
                      <h3 className="font-semibold mb-2">Contact not found</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        {searchQuery} is not in your contacts
                      </p>
                      <Button
                        className="bg-orange-500 hover:bg-orange-600"
                        onClick={() => {
                          setNewContact({ name: searchQuery, phone: "" })
                          setShowAddContact(true)
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Contact
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Tabs */}
              <Tabs
                defaultValue="contacts"
                className="w-full"
                onValueChange={(v) => setActiveTab(v as any)}
              >
                <TabsList className="grid w-full grid-cols-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <TabsTrigger
                    value="contacts"
                    className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
                  >
                    All Contacts
                  </TabsTrigger>
                  <TabsTrigger
                    value="recent"
                    className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
                  >
                    Recent
                  </TabsTrigger>
                  <TabsTrigger
                    value="favorites"
                    className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
                  >
                    Favorites
                  </TabsTrigger>
                  <TabsTrigger
                    value="groups"
                    className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
                  >
                    Groups
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="contacts" className="mt-6">
                  <Card className="border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
                    <div className="divide-y divide-gray-200 dark:divide-gray-800">
                      {/* Online Section */}
                      {onlineContacts.length > 0 && !searchQuery && (
                        <div className="p-4 bg-green-50/50 dark:bg-green-950/20">
                          <h4 className="text-xs font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            Online Now ({onlineContacts.length})
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {onlineContacts.map((contact) => (
                              <motion.button
                                key={contact.id}
                                whileHover={{ scale: 1.02, x: 2 }}
                                onClick={() => handleSelectUser(contact)}
                                disabled={selectedUsers.some(
                                  (u) => u.id === contact.id,
                                )}
                                className={cn(
                                  "flex items-center justify-between p-3 rounded-lg transition-all text-left",
                                  selectedUsers.some((u) => u.id === contact.id)
                                    ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                                    : "hover:bg-white dark:hover:bg-gray-800",
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <Avatar className="w-10 h-10">
                                      <AvatarImage src={contact.avatar} />
                                      <AvatarFallback>
                                        {contact.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">
                                      {contact.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {contact.phone}
                                    </p>
                                  </div>
                                </div>
                                {selectedUsers.some(
                                  (u) => u.id === contact.id,
                                ) ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Plus className="w-4 h-4 text-gray-400" />
                                )}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* All Contacts */}
                      <div className="p-4">
                        <h4 className="text-xs font-semibold text-gray-500 mb-3">
                          {searchQuery ? "Search Results" : "All Contacts"} (
                          {filteredContacts.length})
                        </h4>
                        <div className="space-y-1">
                          {filteredContacts.map((contact) => (
                            <motion.button
                              key={contact.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              whileHover={{ scale: 1.01, x: 2 }}
                              onClick={() => handleSelectUser(contact)}
                              disabled={selectedUsers.some(
                                (u) => u.id === contact.id,
                              )}
                              className={cn(
                                "w-full p-3 flex items-center justify-between rounded-lg transition-all text-left",
                                selectedUsers.some((u) => u.id === contact.id)
                                  ? "opacity-50 cursor-not-allowed bg-orange-50 dark:bg-orange-950/20"
                                  : "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <Avatar className="w-10 h-10">
                                    <AvatarImage src={contact.avatar} />
                                    <AvatarFallback>
                                      {contact.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div
                                    className={cn(
                                      "absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white",
                                      getStatusColor(contact.status),
                                    )}
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm">
                                      {contact.name}
                                    </p>
                                    {contact.favorite && (
                                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                    )}
                                    {contact.tags?.map((tag) => (
                                      <Badge
                                        key={tag}
                                        variant="outline"
                                        className="text-[8px] px-1 py-0"
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    {contact.phone}
                                  </p>
                                  {contact.email && (
                                    <p className="text-[10px] text-gray-400">
                                      {contact.email}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {contact.status === "online" && (
                                  <span className="text-[10px] text-green-500">
                                    ● Online
                                  </span>
                                )}
                                {contact.status === "away" && (
                                  <span className="text-[10px] text-yellow-500">
                                    ● Away
                                  </span>
                                )}
                                {contact.lastSeen &&
                                  contact.status !== "online" && (
                                    <span className="text-[10px] text-gray-400">
                                      {contact.lastSeen}
                                    </span>
                                  )}
                                {selectedUsers.some(
                                  (u) => u.id === contact.id,
                                ) ? (
                                  <Badge className="bg-green-500 text-white text-xs">
                                    Selected
                                  </Badge>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="rounded-full w-8 h-8 p-0"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="recent" className="mt-6">
                  <Card className="border border-gray-200 dark:border-gray-800 shadow-lg p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {recentContacts.map((contact) => (
                        <motion.button
                          key={contact.id}
                          whileHover={{ y: -2 }}
                          onClick={() => handleSelectUser(contact)}
                          className="p-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all text-left"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={contact.avatar} />
                              <AvatarFallback>
                                {contact.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{contact.name}</p>
                              <p className="text-xs text-gray-500">
                                {contact.phone}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {contact.lastSeen || "Recent"}
                            </Badge>
                            {selectedUsers.some((u) => u.id === contact.id) ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="rounded-full"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="favorites" className="mt-6">
                  <Card className="border border-gray-200 dark:border-gray-800 shadow-lg p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {favoriteContacts.map((contact) => (
                        <motion.button
                          key={contact.id}
                          whileHover={{ y: -2 }}
                          onClick={() => handleSelectUser(contact)}
                          className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl border border-amber-200 dark:border-amber-800 hover:shadow-lg transition-all text-left"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar className="w-12 h-12 border-2 border-amber-500">
                              <AvatarImage src={contact.avatar} />
                              <AvatarFallback>
                                {contact.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-1">
                                <p className="font-medium">{contact.name}</p>
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              </div>
                              <p className="text-xs text-gray-500">
                                {contact.phone}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge className="bg-amber-500 text-white border-0 text-xs">
                              Favorite
                            </Badge>
                            {selectedUsers.some((u) => u.id === contact.id) ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="rounded-full"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="groups" className="mt-6">
                  <Card className="border border-gray-200 dark:border-gray-800 shadow-lg p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {groups.map((group) => (
                        <motion.button
                          key={group.id}
                          whileHover={{ y: -2 }}
                          onClick={() => handleSelectGroup(group)}
                          className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all text-left"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={group.avatar} />
                              <AvatarFallback>
                                {group.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{group.name}</p>
                              <p className="text-xs text-gray-500">
                                {group.memberCount} members
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                          >
                            <Users className="w-3 h-3 mr-2" />
                            Share with Group
                          </Button>
                        </motion.button>
                      ))}
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Message Input */}
              <Card className="border border-gray-200 dark:border-gray-800 shadow-lg p-4">
                <Label
                  htmlFor="message"
                  className="text-sm font-medium mb-2 block"
                >
                  Add a message (optional)
                </Label>
                <Textarea
                  id="message"
                  placeholder="Write a personal message to accompany the ticket..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="schedule"
                        checked={scheduleLater}
                        onCheckedChange={setScheduleLater}
                      />
                      <Label htmlFor="schedule" className="text-sm">
                        Schedule for later
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Priority:</Label>
                      <Badge
                        variant={
                          priority === "urgent"
                            ? "destructive"
                            : priority === "high"
                              ? "default"
                              : "secondary"
                        }
                        className="cursor-pointer"
                        onClick={() => {
                          if (priority === "normal") setPriority("high")
                          else if (priority === "high") setPriority("urgent")
                          else setPriority("normal")
                        }}
                      >
                        {priority}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {message.length}/500
                  </span>
                </div>
              </Card>

              {/* Share Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="sticky bottom-6 pt-4"
              >
                <Button
                  size="lg"
                  className={cn(
                    "w-full h-16 text-base gap-3 shadow-xl transition-all duration-300",
                    getShareMethodColor(),
                    selectedUsers.length === 0 &&
                      "opacity-50 cursor-not-allowed",
                  )}
                  disabled={selectedUsers.length === 0 || isLoading}
                  onClick={handleShare}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sharing...
                    </>
                  ) : (
                    <>
                      {getShareMethodIcon()}
                      <span className="font-semibold">
                        Share with {selectedUsers.length} recipient
                        {selectedUsers.length !== 1 ? "s" : ""}
                      </span>
                      <Send className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                {/* Progress indicator for urgent shares */}
                {priority === "urgent" && selectedUsers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-3 py-1 rounded-full shadow-lg"
                  >
                    🚨 Urgent priority - Will notify immediately
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Add Contact Dialog */}
        <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Add New Contact
              </DialogTitle>
              <DialogDescription>
                Add a new contact to your list
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={newContact.name}
                  onChange={(e) =>
                    setNewContact({ ...newContact, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="Enter phone number"
                  value={newContact.phone}
                  onChange={(e) =>
                    setNewContact({ ...newContact, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddContact(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                onClick={handleAddContact}
              >
                Add Contact
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                🎉 Ticket Shared!
              </DialogTitle>
              <DialogDescription className="text-center">
                Your ticket has been successfully shared
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-8 mb-6 text-center"
              >
                <CheckCircle className="w-16 h-16 text-white mx-auto mb-4" />
                <p className="text-white font-bold text-2xl mb-2">Success!</p>
                <p className="text-white/80">
                  Shared with {sharedWith.length} recipient
                  {sharedWith.length > 1 ? "s" : ""}
                </p>
              </motion.div>

              <div className="space-y-3 max-h-[200px] overflow-y-auto">
                <AnimatePresence>
                  {sharedWith.map((user) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500 text-white">
                          <Check className="w-3 h-3 mr-1" />
                          Sent
                        </Badge>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendAgain(user)}
                              className="text-orange-500"
                            >
                              <Send className="w-3 h-3 mr-1" />
                              Again
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Send again</TooltipContent>
                        </Tooltip>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowSuccessDialog(false)
                    setSelectedUsers([])
                    setMessage("")
                  }}
                >
                  Share More
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600"
                  onClick={() => {
                    setShowSuccessDialog(false)
                    onClose?.() || router.back()
                  }}
                >
                  Done
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
