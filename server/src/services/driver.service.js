import prisma from "../prisma/client.js"
import { successResponse, errorResponse } from "../utils/apiResponse.js"

// CREATE DRIVER

export const createDriverService = async (data) => {
  try {
    const requiredFields = [
      "userId",
      "licenseNo",
      "driverLicenseUrl",
      "idType",
      "idFrontUrl",
      "idBackUrl",
    ]

    for (const field of requiredFields) {
      if (!data[field]) {
        return errorResponse(`Field "${field}" is required`, 400)
      }
    }

    const validIdTypes = ["PASSPORT", "NATIONAL_ID", "KEBELE_ID"]
    if (!validIdTypes.includes(data.idType)) {
      return errorResponse(
        `Invalid idType. Must be one of: ${validIdTypes.join(", ")}`,
        400,
      )
    }

    const existingDriver = await prisma.driver.findUnique({
      where: { userId: data.userId },
    })

    if (existingDriver) {
      return errorResponse("A driver already exists for this user", 409)
    }

    const driver = await prisma.driver.create({
      data: {
        userId: data.userId,
        licenseNo: data.licenseNo,
        experience: data.experience ?? 0,
        driverLicenseUrl: data.driverLicenseUrl,
        idType: data.idType,
        idFrontUrl: data.idFrontUrl,
        idBackUrl: data.idBackUrl,
      },
    })

    return successResponse("Driver created successfully", driver, 201)
  } catch (error) {
    console.error("Create driver error:", error)

    if (error.code === "P2002") {
      return errorResponse("Duplicate driver entry", 409)
    }

    return errorResponse("Failed to create driver", 500)
  }
}

// GET ALL DRIVERS
export const getAllDriversService = async () => {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        user: true,
        // vehicle: true,
        // assignedBus: true,
        // assignedMinibus: true,
      },
    })

    return successResponse("Drivers retrieved successfully", drivers, 200)
  } catch (error) {
    console.error("Get all drivers error:", error)
    return errorResponse("Failed to fetch drivers", 500)
  }
}

export const getFormattedDriversService = async (query) => {
  try {
    const search = query?.search || ""

    const drivers = await prisma.driver.findMany({
      where: {
        status: "ACTIVE",
        user: {
          isDeleted: false,
          isSuspended: false,

          // search filter
          ...(search && {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                phone: {
                  contains: search,
                },
              },
            ],
          }),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avaterUrl: true,
            emailVerified: true,
            location: true,
          },
        },
      },
    })

    const formattedDrivers = drivers.map((driver) => ({
      id: driver.user.id,
      name: driver.user.name,
      email: driver.user.email,
      phone: driver.user.phone,
      avatarUrl: driver.user.avaterUrl || null,
      emailVerified: driver.user.emailVerified,
      location: driver.user.location,
    }))

    return successResponse(
      "Drivers retrieved successfully",
      formattedDrivers,
      200,
    )
  } catch (error) {
    console.error("Get all drivers error:", error)
    return errorResponse("Failed to fetch drivers", 500)
  }
}

// GET DRIVER BY ID
export const getDriverByIdService = async (driverId) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: {
        user: true, // driver user info
        assignments: {
          // driver assignments
          include: {
            vehicle: true, // vehicle details in assignment
          },
        },
        buses: true, // buses assigned to driver
        minibuses: true, // minibuses assigned to driver
      },
    })

    if (!driver) {
      return errorResponse("Driver not found", 404)
    }

    return successResponse("Driver retrieved successfully", driver, 200)
  } catch (error) {
    console.error("Get driver by id error:", error)
    return errorResponse("Failed to fetch driver", 500)
  }
}

// UPDATE DRIVER
export const updateDriverService = async (driverId, data) => {
  try {
    const driver = await prisma.driver.update({
      where: { id: driverId },
      data,
    })

    return successResponse("Driver updated successfully", driver, 200)
  } catch (error) {
    console.error("Update driver error:", error)
    return errorResponse("Failed to update driver", 500)
  }
}

// VERIFY / REJECT DOCUMENTS
export const verifyDriverDocumentsService = async (
  driverId,
  adminId,
  licenseStatus,
  idStatus,
  rejectionReason,
) => {
  try {
    const existingDriver = await prisma.driver.findUnique({
      where: { id: driverId },
    })

    if (!existingDriver) {
      return errorResponse("Driver not found", 404)
    }

    const driver = await prisma.driver.update({
      where: { id: driverId },
      data: {
        licenseStatus: licenseStatus ?? existingDriver.licenseStatus,
        idStatus: idStatus ?? existingDriver.idStatus,
        verifiedById: adminId,
        verifiedAt: new Date(),
        rejectionReason: rejectionReason ?? null,
      },
    })

    return successResponse(
      "Driver documents verified successfully",
      driver,
      200,
    )
  } catch (error) {
    console.error("Verify driver documents error:", error)
    return errorResponse("Failed to verify documents", 500)
  }
}

// ASSIGN VEHICLE
export const assignVehicleToDriverService = async (driverId, vehicleId) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
    })

    if (!driver) {
      return errorResponse("Driver not found", 404)
    }

    if (driver.licenseStatus !== "VERIFIED" || driver.idStatus !== "VERIFIED") {
      return errorResponse("Driver documents are not verified", 403)
    }

    const updatedDriver = await prisma.driver.update({
      where: { id: driverId },
      data: { vehicleId },
    })

    return successResponse(
      "Vehicle assigned to driver successfully",
      updatedDriver,
      200,
    )
  } catch (error) {
    console.error("Assign vehicle error:", error)
    return errorResponse("Failed to assign vehicle", 500)
  }
}

// TOGGLE DUTY STATUS
export const toggleDriverDutyService = async (userId) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: { userId },
    })

    if (!driver) {
      return errorResponse("Driver not found", 404)
    }

    const updatedDriver = await prisma.driver.update({
      where: { id: driver.id },
      data: {
        isOnDuty: !driver.isOnDuty,
        lastActiveAt: new Date(),
      },
    })

    return successResponse("Driver duty status updated", updatedDriver, 200)
  } catch (error) {
    console.error("Toggle duty error:", error)
    return errorResponse("Failed to update duty status", 500)
  }
}

// BLOCK / UNBLOCK DRIVER
export const blockDriverService = async (driverId, block) => {
  try {
    const updatedDriver = await prisma.driver.update({
      where: { id: driverId },
      data: {
        status: block ? "INACTIVE" : "ACTIVE",
        isOnDuty: false,
      },
    })

    return successResponse(
      block ? "Driver blocked successfully" : "Driver unblocked successfully",
      updatedDriver,
      200,
    )
  } catch (error) {
    console.error("Block driver error:", error)
    return errorResponse("Failed to update driver status", 500)
  }
}

// START TRIP
export const startTripService = async (driverUserId, { busId, scheduleId }) => {
  try {
    // 1. Verify driver exists and is active
    const driver = await prisma.driver.findUnique({
      where: { userId: driverUserId },
    })

    if (!driver) return errorResponse("Driver profile not found", 404)

    if (driver.status !== "ACTIVE")
      return errorResponse(
        `Driver is not active. Current status: ${driver.status}`,
        403,
      )

    if (driver.isOnDuty)
      return errorResponse(
        "You are already on duty. End your current trip first",
        409,
      )

    // 2. Verify bus is assigned to this driver and is ACTIVE
    const bus = await prisma.bus.findFirst({
      where: {
        id: busId,
        driverId: driver.id,
        status: "ACTIVE",
        isActive: true,
      },
      include: {
        route: true,
        schedules: {
          where: { id: scheduleId, isActive: true },
          take: 1,
        },
      },
    })

    if (!bus)
      return errorResponse(
        "Bus not found, not assigned to you, or not in an active state",
        404,
      )

    // 3. Verify schedule exists for this bus
    const schedule = bus.schedules[0]
    if (!schedule)
      return errorResponse("Schedule not found or inactive for this bus", 404)

    // 4. Verify at least one CONFIRMED booking exists for this bus today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const confirmedBooking = await prisma.booking.findFirst({
      where: {
        busId,
        scheduleId,
        status: "CONFIRMED",
        // date: { gte: todayStart, lte: todayEnd },
      },
    })

    if (!confirmedBooking)
      return errorResponse(
        `No confirmed bookings found for schedule ${schedule.startTime} - ${schedule.endTime} today`,
        400,
      )

    // 5. Mark driver on-duty + set bus departure time with schedule info
    const [, updatedBus] = await prisma.$transaction([
      prisma.driver.update({
        where: { id: driver.id },
        data: {
          isOnDuty: true,
          lastActiveAt: new Date(),
        },
      }),
      prisma.bus.update({
        where: { id: busId },
        data: {
          departureTime: new Date(),
          delayMinutes: 0,
          currentStop: bus.route?.origin ?? null,
          nextDestination: bus.route?.destination ?? null,
        },
        include: { route: true },
      }),
    ])

    const data = {
      busId: updatedBus.id,
      busNumber: updatedBus.busNumber,
      driverId: driver.id,
      status: updatedBus.status,
      departureTime: updatedBus.departureTime,
      currentStop: updatedBus.currentStop,
      nextDestination: bus.route?.destination ?? null,
      schedule: {
        id: schedule.id,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        direction: schedule.direction,
      },
      route: updatedBus.route
        ? {
            id: updatedBus.route.id,
            name: updatedBus.route.name,
            origin: updatedBus.route.origin,
            destination: updatedBus.route.destination,
          }
        : null,
    }

    return successResponse("Trip started successfully", data, 200)
  } catch (error) {
    console.error("Start trip service error:", error)
    return errorResponse("Failed to start trip", 500)
  }
}

// END TRIP

export const endTripService = async (driverUserId, busId) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: { userId: driverUserId },
      include: {
        user: { select: { name: true, email: true, phone: true } },
      },
    })
    if (!driver) return errorResponse("Driver profile not found", 404)
    if (!driver.isOnDuty)
      return errorResponse("No active trip found for this driver", 400)

    const bus = await prisma.bus.findFirst({
      where: { id: busId, driverId: driver.id },
      include: {
        route: {
          include: {
            midPoints: { orderBy: { order: "asc" } },
          },
        },
        vehicle: true,
        schedules: { where: { isActive: true } },
      },
    })
    if (!bus) return errorResponse("Bus not assigned to this driver", 404)

    // Calculate passengers and revenue before marking COMPLETED
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const todayBookings = await prisma.booking.findMany({
      where: {
        busId,
        status: "CONFIRMED",
        date: { gte: todayStart },
      },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        tickets: {
          select: {
            id: true,
            seatNumber: true,
            boardingStop: true,
            alightingStop: true,
            checkedIn: true,
            checkedInAt: true,
          },
        },
        payment: {
          select: {
            method: true,
            gateway: true,
            amount: true,
            status: true,
          },
        },
      },
    })

    const totalPassengers = todayBookings.reduce(
      (sum, b) => sum + b.tickets.length,
      0,
    )
    const totalRevenue = todayBookings.reduce(
      (sum, b) => sum + Number(b.amountPaid ?? 0),
      0,
    )
    const totalDiscount = todayBookings.reduce(
      (sum, b) => sum + Number(b.discount ?? 0),
      0,
    )
    const totalPointsUsed = todayBookings.reduce(
      (sum, b) => sum + (b.pointsUsed ?? 0),
      0,
    )
    const checkedInCount = todayBookings.reduce(
      (sum, b) => sum + b.tickets.filter((t) => t.checkedIn).length,
      0,
    )

    // Payment method breakdown
    const paymentBreakdown = todayBookings.reduce((acc, b) => {
      const method = b.payment?.method ?? "UNKNOWN"
      if (!acc[method]) acc[method] = { count: 0, amount: 0 }
      acc[method].count += 1
      acc[method].amount += Number(b.amountPaid ?? 0)
      return acc
    }, {})

    // Boarding stop breakdown
    const boardingBreakdown = todayBookings.reduce((acc, b) => {
      b.tickets.forEach((t) => {
        const stop = t.boardingStop ?? "Unknown"
        acc[stop] = (acc[stop] ?? 0) + 1
      })
      return acc
    }, {})

    await prisma.$transaction([
      prisma.driver.update({
        where: { id: driver.id },
        data: {
          isOnDuty: false,
          lastActiveAt: new Date(),
          totalTrips: { increment: 1 },
        },
      }),
      prisma.booking.updateMany({
        where: { busId, status: "CONFIRMED" },
        data: { status: "COMPLETED" },
      }),
    ])

    const data = {
      driver: {
        id: driver.id,
        name: driver.user.name,
        email: driver.user.email,
        phone: driver.user.phone,
        licenseNo: driver.licenseNo,
        totalTrips: driver.totalTrips + 1,
        rating: driver.rating,
      },

      bus: {
        id: bus.id,
        busNumber: bus.busNumber,
        capacity: bus.capacity,
        status: bus.status,
        departureTime: bus.departureTime,
        vehicle: bus.vehicle
          ? {
              plateNumber: bus.vehicle.plateNumber,
              model: bus.vehicle.model,
              manufacturer: bus.vehicle.manufacturer,
              year: bus.vehicle.year,
              type: bus.vehicle.type,
            }
          : null,
      },

      route: bus.route
        ? {
            id: bus.route.id,
            name: bus.route.name,
            origin: bus.route.origin,
            destination: bus.route.destination,
            distanceKm: bus.route.distanceKm,
            estimatedTimeMin: bus.route.estimatedTimeMin,
            midPoints: bus.route.midPoints.map((mp) => ({
              name: mp.name,
              order: mp.order,
            })),
          }
        : null,

      // ── Trip Summary ──────────────────────────────────────────
      tripSummary: {
        totalBookings: todayBookings.length,
        totalPassengers,
        checkedIn: checkedInCount,
        noShow: totalPassengers - checkedInCount,
        occupancyRate: `${Math.round((totalPassengers / bus.capacity) * 100)}%`,
        totalRevenue,
        totalDiscount,
        netRevenue: totalRevenue - totalDiscount,
        totalPointsUsed,
        currency: "ETB",
        paymentBreakdown,
        boardingBreakdown,
      },

      // ── Passengers ────────────────────────────────────────────
      passengers: todayBookings.map((b) => ({
        bookingId: b.id,
        bookingCode: b.bookingCode,
        passengerName: b.user.name,
        passengerPhone: b.user.phone,
        seats: b.tickets.length,
        amountPaid: b.amountPaid,
        discount: b.discount,
        paymentMethod: b.payment?.method,
        tickets: b.tickets.map((t) => ({
          id: t.id,
          seatNumber: t.seatNumber,
          boardingStop: t.boardingStop,
          alightingStop: t.alightingStop,
          checkedIn: t.checkedIn,
          checkedInAt: t.checkedInAt,
        })),
      })),
    }

    return successResponse("Trip ended successfully", data, 200)
  } catch (error) {
    console.error("End trip service error:", error)
    return errorResponse("Failed to end trip", 500)
  }
}

// UPDATE LOCATION

export const updateLocationService = async (
  driverUserId,
  busId,
  { latitude, longitude, speed, heading, accuracy },
) => {
  try {
    // Lightweight check — only fetch what we need
    const driver = await prisma.driver.findUnique({
      where: { userId: driverUserId },
      select: { id: true, isOnDuty: true },
    })

    if (!driver) return errorResponse("Driver not found", 404)

    if (!driver.isOnDuty)
      return errorResponse(
        "Cannot update location — driver is not on duty",
        403,
      )

    const bus = await prisma.bus.findFirst({
      where: { id: busId, driverId: driver.id },
      select: { id: true, vehicleId: true },
    })

    if (!bus) return errorResponse("Bus not found or not assigned to you", 404)

    const timestamp = new Date()

    // Write BusPosition + VehicleLocation (if linked) in one transaction
    const writes = [
      prisma.busPosition.create({
        data: { busId, latitude, longitude, timestamp },
      }),
    ]

    if (bus.vehicleId) {
      writes.push(
        prisma.vehicleLocation.create({
          data: {
            vehicleId: bus.vehicleId,
            lat: latitude,
            lng: longitude,
            speed: speed ?? null,
            heading: heading ?? null,
            accuracy: accuracy ?? null,
            recordedAt: timestamp,
          },
        }),
      )
    }

    await prisma.$transaction(writes)

    return successResponse(
      "Location updated",
      { busId, latitude, longitude, timestamp },
      200,
    )
  } catch (error) {
    console.error("Update location service error:", error)
    return errorResponse("Failed to update location", 500)
  }
}

// GET CURRENT TRIP
export const getCurrentTripService = async (driverUserId) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: { userId: driverUserId },
      select: { id: true, isOnDuty: true },
    })

    if (!driver) return errorResponse("Driver not found", 404)

    if (!driver.isOnDuty) return errorResponse("No active trip", 404)

    const bus = await prisma.bus.findFirst({
      where: { driverId: driver.id, isActive: true },
      include: { route: true },
    })

    if (!bus) return errorResponse("No active bus found", 404)

    // Get the latest position
    const latestPosition = await prisma.busPosition.findFirst({
      where: { busId: bus.id },
      orderBy: { timestamp: "desc" },
    })

    const data = {
      busId: bus.id,
      busNumber: bus.busNumber,
      status: bus.status,
      departureTime: bus.departureTime,
      currentStop: bus.currentStop,
      nextDestination: bus.nextDestination,
      latestPosition: latestPosition
        ? {
            latitude: latestPosition.latitude,
            longitude: latestPosition.longitude,
            timestamp: latestPosition.timestamp,
          }
        : null,
      route: bus.route
        ? {
            id: bus.route.id,
            name: bus.route.name,
            origin: bus.route.origin,
            destination: bus.route.destination,
          }
        : null,
    }

    return successResponse("Active trip retrieved successfully", data, 200)
  } catch (error) {
    console.error("Get current trip service error:", error)
    return errorResponse("Failed to fetch current trip", 500)
  }
}

export const checkInPassengerService = async (driverUserId, { qrCode }) => {
  try {
    // 1. Verify driver is on duty
    const driver = await prisma.driver.findUnique({
      where: { userId: driverUserId },
      select: { id: true, isOnDuty: true },
    })

    if (!driver) return errorResponse("Driver not found", 404)
    if (!driver.isOnDuty) return errorResponse("Driver is not on duty", 403)

    // 2. Find the bus assigned to this driver
    const bus = await prisma.bus.findFirst({
      where: { driverId: driver.id, isActive: true },
      select: { id: true, busNumber: true },
    })

    if (!bus) return errorResponse("No active bus found for this driver", 404)

    // 3. Parse the QR payload
    let parsed
    try {
      parsed = JSON.parse(qrCode)
    } catch {
      return errorResponse("Invalid QR code format", 400)
    }

    const { ticketId, userId: passengerId, bookingId, busId } = parsed

    if (!ticketId || !passengerId || !bookingId || !busId)
      return errorResponse("QR code is missing required fields", 400)

    // 4. Pre-validate bus matches before hitting DB
    if (busId !== bus.id)
      return errorResponse("This ticket is not valid for your bus", 403)

    // 5. Find ticket directly by ID
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        booking: {
          select: {
            id: true,
            busId: true,
            status: true,
            date: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            avaterUrl: true,
          },
        },
      },
    })

    if (!ticket) return errorResponse("Ticket not found", 404)

    // 6. Validations
    if (ticket.userId !== passengerId)
      return errorResponse("QR code does not match ticket owner", 403)

    if (ticket.booking.busId !== bus.id)
      return errorResponse("This ticket is not valid for your bus", 403)

    if (ticket.cancelledAt)
      return errorResponse("This ticket has been cancelled", 400)

    if (ticket.checkedIn)
      return errorResponse(
        `Passenger already checked in at ${ticket.checkedInAt}`,
        400,
      )

    if (ticket.validUntil && new Date() > new Date(ticket.validUntil))
      return errorResponse("This ticket has expired", 400)

    if (ticket.booking.status !== "CONFIRMED")
      return errorResponse(
        `Booking is not confirmed. Status: ${ticket.booking.status}`,
        400,
      )

    // 7. Mark as checked in
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        checkedIn: true,
        checkedInAt: new Date(),
      },
    })

    // 8. Count passengers now aboard
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const passengersAboard = await prisma.ticket.count({
      where: {
        checkedIn: true,
        cancelledAt: null,
        booking: {
          busId: bus.id,
          date: { gte: todayStart },
        },
      },
    })

    return successResponse(
      "Passenger checked in successfully",
      {
        ticketId: updatedTicket.id,
        seatNumber: updatedTicket.seatNumber,
        boardingStop: updatedTicket.boardingStop,
        alightingStop: updatedTicket.alightingStop,
        checkedIn: updatedTicket.checkedIn,
        checkedInAt: updatedTicket.checkedInAt,
        passenger: {
          id: ticket.user.id,
          name: ticket.user.name,
          phone: ticket.user.phone,
          avatar: ticket.user.avaterUrl,
        },
        bus: {
          id: bus.id,
          busNumber: bus.busNumber,
          passengersAboard,
        },
      },
      200,
    )
  } catch (error) {
    console.error("Check-in service error:", error)
    return errorResponse("Failed to check in passenger", 500)
  }
}

export const getDriverTripHistoryService = async (driverUserId) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: { userId: driverUserId },
      select: {
        id: true,
        totalTrips: true,
        rating: true,
        user: { select: { name: true, phone: true } },
      },
    })

    if (!driver) return errorResponse("Driver not found", 404)

    // Get all COMPLETED bookings for this driver's buses
    const completedBookings = await prisma.booking.findMany({
      where: {
        bus: { driverId: driver.id },
        status: "COMPLETED",
      },
      include: {
        bus: {
          select: {
            id: true,
            busNumber: true,
            route: {
              select: {
                name: true,
                origin: true,
                destination: true,
                distanceKm: true,
                estimatedTimeMin: true,
              },
            },
          },
        },
        schedule: {
          select: {
            startTime: true,
            endTime: true,
            direction: true,
          },
        },
        tickets: {
          select: {
            id: true,
            checkedIn: true,
            checkedInAt: true,
            boardingStop: true,
            alightingStop: true,
          },
        },
        payment: {
          select: {
            method: true,
            amount: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Build per-trip summaries
    const trips = completedBookings.map((booking) => {
      const totalPassengers = booking.tickets.length
      const checkedIn = booking.tickets.filter((t) => t.checkedIn).length
      const noShow = totalPassengers - checkedIn
      const revenue = Number(booking.amountPaid ?? 0)
      const distanceKm = booking.bus.route?.distanceKm ?? 0
      const estimatedTimeMin = booking.bus.route?.estimatedTimeMin ?? 0

      return {
        bookingId: booking.id,
        bookingCode: booking.bookingCode,
        date: booking.date,
        completedAt: booking.updatedAt,

        bus: {
          id: booking.bus.id,
          busNumber: booking.bus.busNumber,
        },

        route: booking.bus.route
          ? {
              name: booking.bus.route.name,
              origin: booking.bus.route.origin,
              destination: booking.bus.route.destination,
              distanceKm,
              estimatedTimeMin,
              estimatedTimeHours: parseFloat(
                (estimatedTimeMin / 60).toFixed(2),
              ),
            }
          : null,

        schedule: booking.schedule
          ? {
              startTime: booking.schedule.startTime,
              endTime: booking.schedule.endTime,
              direction: booking.schedule.direction,
            }
          : null,

        passengers: {
          total: totalPassengers,
          checkedIn,
          noShow,
        },

        revenue: {
          amount: revenue,
          currency: booking.currency ?? "ETB",
          paymentMethod: booking.payment?.method ?? null,
          discount: Number(booking.discount ?? 0),
          totalBeforeDiscount: Number(booking.totalAmount ?? 0),
        },
      }
    })

    // Aggregate totals across all trips
    const totalRevenue = trips.reduce((sum, t) => sum + t.revenue.amount, 0)
    const totalDistanceKm = trips.reduce(
      (sum, t) => sum + (t.route?.distanceKm ?? 0),
      0,
    )
    const totalMinutes = trips.reduce(
      (sum, t) => sum + (t.route?.estimatedTimeMin ?? 0),
      0,
    )
    const totalPassengers = trips.reduce(
      (sum, t) => sum + t.passengers.total,
      0,
    )
    const totalCheckedIn = trips.reduce(
      (sum, t) => sum + t.passengers.checkedIn,
      0,
    )

    // Payment method breakdown across all trips
    const paymentBreakdown = trips.reduce((acc, t) => {
      const method = t.revenue.paymentMethod ?? "UNKNOWN"
      if (!acc[method]) acc[method] = { trips: 0, amount: 0 }
      acc[method].trips += 1
      acc[method].amount += t.revenue.amount
      return acc
    }, {})

    const data = {
      driver: {
        id: driver.id,
        name: driver.user.name,
        phone: driver.user.phone,
        rating: driver.rating,
      },

      summary: {
        totalTrips: trips.length,
        totalPassengers,
        totalCheckedIn,
        totalRevenue,
        totalDistanceKm: parseFloat(totalDistanceKm.toFixed(2)),
        totalHours: parseFloat((totalMinutes / 60).toFixed(2)),
        totalMinutes,
        currency: "ETB",
        paymentBreakdown,
      },

      trips,
    }

    return successResponse("Trip history retrieved successfully", data, 200)
  } catch (error) {
    console.error("Get driver trip history service error:", error)
    return errorResponse("Failed to fetch trip history", 500)
  }
}

export const getDriverBusWithSchedulesService = async (driverUserId) => {
  try {
    // 1. Verify driver exists and is active
    const driver = await prisma.driver.findUnique({
      where: { userId: driverUserId },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    })

    if (!driver) return errorResponse("Driver profile not found", 404)

    if (driver.status !== "ACTIVE")
      return errorResponse(
        `Driver is not active. Current status: ${driver.status}`,
        403,
      )

    // 2. Get driver's assigned bus with all details
    const bus = await prisma.bus.findFirst({
      where: {
        driverId: driver.id,
        status: "ACTIVE",
        isActive: true,
      },
      include: {
        route: {
          include: {
            midPoints: {
              orderBy: { order: "asc" },
            },
          },
        },
        schedules: {
          where: { isActive: true },
          orderBy: { startTime: "asc" },
        },
        seats: true,
      },
    })

    if (!bus) {
      return errorResponse("No active bus assigned to this driver", 404)
    }

    // 3. Get today's statistics
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const [todayBookings, totalPassengers] = await Promise.all([
      prisma.booking.aggregate({
        where: {
          busId: bus.id,
          date: { gte: todayStart, lte: todayEnd },
          status: "CONFIRMED",
        },
        _count: true,
        _sum: {
          amountPaid: true,
        },
      }),
      prisma.ticket.aggregate({
        where: {
          booking: {
            busId: bus.id,
            date: { gte: todayStart, lte: todayEnd },
          },
        },
        _count: true,
      }),
    ])

    // 4. Get current trip status if driver is on duty
    let currentTrip = null
    if (driver.isOnDuty) {
      currentTrip = {
        isOnDuty: true,
        startedAt: bus.departureTime,
        currentStop: bus.currentStop,
        nextDestination: bus.nextDestination,
        delayMinutes: bus.delayMinutes,
      }
    }

    // 5. Format the response data
    const data = {
      driver: {
        id: driver.id,
        name: driver.user.name,
        phone: driver.user.phone,
        email: driver.user.email,
        status: driver.status,
        isOnDuty: driver.isOnDuty,
        rating: driver.rating,
        totalTrips: driver.totalTrips,
      },
      bus: {
        id: bus.id,
        busNumber: bus.busNumber,
        capacity: bus.capacity,
        status: bus.status,
        isActive: bus.isActive,
        departureTime: bus.departureTime,
        currentStop: bus.currentStop,
        nextDestination: bus.nextDestination,
        delayMinutes: bus.delayMinutes,
        lastServiceDate: bus.lastServiceDate,
        nextServiceDate: bus.nextServiceDate,
        averageRating: bus.averageRating,
        totalRatings: bus.totalRatings,
        seats: bus.seats.map((seat) => ({
          id: seat.id,
          category: seat.category,
          isReserved: seat.isReserved,
        })),
      },
      route: bus.route
        ? {
            id: bus.route.id,
            name: bus.route.name,
            origin: bus.route.origin,
            destination: bus.route.destination,
            distanceKm: bus.route.distanceKm,
            estimatedTimeMin: bus.route.estimatedTimeMin,
            price: bus.route.price,
            currency: bus.route.currency,
            isActive: bus.route.isActive,
            midPoints: bus.route.midPoints.map((point) => ({
              id: point.id,
              name: point.name,
              lat: point.lat,
              lng: point.lng,
              order: point.order,
            })),
          }
        : null,
      schedules: bus.schedules.map((schedule) => ({
        id: schedule.id,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        direction: schedule.direction,
        isActive: schedule.isActive,
      })),
      todayStats: {
        totalBookings: todayBookings._count,
        totalRevenue: todayBookings._sum.amountPaid || 0,
        totalPassengers: totalPassengers._count,
        currency: "ETB",
      },
      currentTrip,
    }

    return successResponse(
      "Driver bus and schedules retrieved successfully",
      data,
      200,
    )
  } catch (error) {
    console.error("Get driver bus with schedules service error:", error)
    return errorResponse("Failed to retrieve driver bus and schedules", 500)
  }
}
