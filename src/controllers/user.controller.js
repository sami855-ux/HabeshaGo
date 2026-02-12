import prisma from "../prisma/client.js"
import {
  getUsersByPhoneService,
  sendOtpService,
  updateProfileService,
  verifyOtpService,
} from "../services/user.service.js"

/**
 * Controller: Get all users
 * Returns users with lightweight relations and frontend-ready fields
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avaterUrl: true,
        role: true,
        emailVerified: true,
        phoneVerified: true,
        twoFactorEnabled: true,
        isSuspended: true,
        suspendedAt: true,
        suspendedBy: true,
        suspensionReason: true,
        createdAt: true,
        updatedAt: true,
        wallet: {
          select: {
            id: true,
            balance: true,
            currency: true,
          },
        },
        bookings: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
        minibusReservations: {
          select: {
            id: true,
            seat: true,
            date: true,
            status: true,
          },
        },
        parkingReservations: {
          select: {
            id: true,
            slotNumber: true,
            startTime: true,
            endTime: true,
          },
        },
        sessions: {
          select: {
            id: true,
            expiresAt: true,
            createdAt: true,
          },
        },
      },
    })

    const formattedUsers = users.map((user) => {
      let tableStatus = "active"
      if (user.isSuspended) tableStatus = "suspended"
      else if (!user.emailVerified && !user.phoneVerified)
        tableStatus = "inactive"

      return {
        ...user,
        suspendedAt: user.suspendedAt?.toISOString() ?? null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        wallet: user.wallet ?? null,
        bookings: user.bookings.map((b) => ({
          ...b,
          createdAt: b.createdAt.toISOString(),
        })),
        minibusReservations: user.minibusReservations.map((m) => ({
          ...m,
          date: m.date.toISOString(),
        })),
        parkingReservations: user.parkingReservations.map((p) => ({
          ...p,
          startTime: p.startTime.toISOString(),
          endTime: p.endTime.toISOString(),
        })),
        sessions: user.sessions.map((s) => ({
          ...s,
          expiresAt: s.expiresAt.toISOString(),
          createdAt: s.createdAt.toISOString(),
        })),
        tableStatus,
      }
    })

    res.status(200).json({ users: formattedUsers, success: true })
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ message: "Internal server error", success: false })
  }
}

export const deleteUser = async (req, res) => {
  const { id } = req.params

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user || user.isDeleted) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    // Soft delete user
    await prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    })

    // // Optional: soft delete related bookings and wallet
    // await prisma.booking.updateMany({
    //   where: { userId: id },
    //   data: { isDeleted: true, deletedAt: new Date() },
    // })

    // await prisma.wallet.updateMany({
    //   where: { userId: id },
    //   data: { isDeleted: true, deletedAt: new Date() },
    // })

    return res.status(200).json({
      success: true,
      message: "User deleted (soft) successfully",
    })
  } catch (error) {
    console.error("Soft delete user error:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    })
  }
}

export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id

    const data = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      bio: req.body.bio,
      location: req.body.location,
    }

    const user = await updateProfileService(userId, data, req.file)

    res.json({
      message: "Profile updated successfully",
      user,
    })
  } catch (error) {
    console.error("Profile update error:", error)
    res.status(400).json({ message: error.message })
  }
}

/**
 * Send OTP for email or phone verification
 * body: { channel: "email" | "phone", type?: "verification" | "resend" }
 */
export const sendOtp = async (req, res) => {
  try {
    const user = req.user
    const { channel = "email", type = "verification" } = req.body

    if (!["email", "phone"].includes(channel)) {
      return res.status(400).json({ message: "Invalid channel" })
    }

    await sendOtpService(user, type)

    return res.json({ message: "OTP sent successfully" })
  } catch (error) {
    console.error("Send OTP error:", error)
    return res.status(500).json({ message: "Failed to send OTP" })
  }
}

/**
 * Verify OTP for email or phone verification
 * body: { code: string, channel: "email" | "phone" }
 */
export const verifyOtp = async (req, res) => {
  try {
    const user = req.user
    const { code, channel = "email" } = req.body

    if (!code) {
      return res.status(400).json({ message: "OTP code is required" })
    }

    const result = await verifyOtpService(user, code, channel)

    return res.json({
      message: "OTP verified successfully",
      verified: true,
      data: result,
    })
  } catch (error) {
    console.error("Verify OTP error:", error)
    return res.status(400).json({ message: error.message })
  }
}

export const getUsersByPhone = async (req, res) => {
  try {
    const { phone } = req.query

    const users = await getUsersByPhoneService(phone)

    console.log(users)
    return res.status(200).json({
      success: true,
      users,
    })
  } catch (error) {
    console.error("Get users by phone error:", error)

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    })
  }
}
