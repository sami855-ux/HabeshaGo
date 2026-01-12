import { faker } from "@faker-js/faker"
import type { User } from "@/types/user"

export const mockUsers: User[] = Array.from({ length: 50 }, (_, i) => {
  const role = i < 5 ? "ADMIN" : i < 15 ? "DRIVER" : "PASSENGER"
  const isSuspended = i % 10 === 0
  const emailVerified = Math.random() > 0.2
  const phoneVerified = Math.random() > 0.3
  const twoFactorEnabled = role === "ADMIN" || Math.random() > 0.7

  return {
    id: `user_${faker.string.uuid().slice(0, 8)}`,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    image: Math.random() > 0.5 ? faker.image.avatar() : null,
    role,
    emailVerified,
    phoneVerified,
    twoFactorEnabled,
    isSuspended,
    suspendedAt: isSuspended ? faker.date.recent().toISOString() : null,
    suspendedBy: isSuspended
      ? i < 5
        ? "system"
        : faker.person.fullName()
      : null,
    suspensionReason: isSuspended ? faker.lorem.sentence() : null,
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    wallet: {
      id: i + 1,
      balance: faker.number.float({ min: 0, max: 1000, fractionDigits: 2 }),
      currency: "USD",
    },
    bookings: Array.from(
      { length: faker.number.int({ min: 0, max: 5 }) },
      (_, j) => ({
        id: j + 1,
        status: faker.helpers.arrayElement([
          "PENDING",
          "CONFIRMED",
          "CANCELLED",
          "COMPLETED",
        ]),
        createdAt: faker.date.recent().toISOString(),
      })
    ),
    minibusReservations:
      role === "PASSENGER"
        ? Array.from(
            { length: faker.number.int({ min: 0, max: 3 }) },
            (_, j) => ({
              id: j + 1,
              seat: faker.number.int({ min: 1, max: 20 }),
              date: faker.date.future().toISOString(),
              status: faker.helpers.arrayElement([
                "PENDING",
                "CONFIRMED",
                "CANCELLED",
              ]),
            })
          )
        : [],
    parkingReservations:
      role === "DRIVER"
        ? Array.from(
            { length: faker.number.int({ min: 0, max: 2 }) },
            (_, j) => ({
              id: j + 1,
              slotNumber: faker.number.int({ min: 1, max: 50 }),
              startTime: faker.date.recent().toISOString(),
              endTime: faker.date.soon().toISOString(),
            })
          )
        : [],
    sessions: Array.from(
      { length: faker.number.int({ min: 1, max: 3 }) },
      (_, j) => ({
        id: `session_${faker.string.uuid()}`,
        expiresAt: faker.date.future().toISOString(),
        createdAt: faker.date.recent().toISOString(),
      })
    ),
    accounts: [
      {
        id: `account_${faker.string.uuid()}`,
        provider: "credentials",
        providerAccountId: faker.string.uuid(),
      },
    ],
  }
})
