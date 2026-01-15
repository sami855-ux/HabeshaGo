import { success } from "zod"
import prisma from "../prisma/client.js"

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
        image: true,
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
        accounts: {
          select: {
            id: true,
            provider: true,
            providerAccountId: true,
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
