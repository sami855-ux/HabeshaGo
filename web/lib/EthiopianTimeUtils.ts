// Ethiopian Time Utilities
export interface EthiopianTime {
  hour: number
  minute: number
  period: "ጠዋት" | "ከሰዓት"
  display: string
}

export class EthiopianTimeUtils {
  // Convert Western time to Ethiopian time
  static toEthiopianTime(
    westernHour: number,
    westernMinute: number = 0,
  ): EthiopianTime {
    const ethiopianHour24 = (westernHour - 6 + 24) % 24

    let period: "ጠዋት" | "ከሰዓት"
    let displayHour: number

    if (ethiopianHour24 < 12) {
      period = "ጠዋት"
      displayHour = ethiopianHour24 === 0 ? 12 : ethiopianHour24
    } else {
      period = "ከሰዓት"
      displayHour = ethiopianHour24 - 12 === 0 ? 12 : ethiopianHour24 - 12
    }

    return {
      hour: displayHour,
      minute: westernMinute,
      period,
      display: `${displayHour}:${String(westernMinute).padStart(2, "0")} ${period}`,
    }
  }

  // Convert Ethiopian time to Western time
  static toWesternTime(
    ethiopianHour: number,
    ethiopianMinute: number = 0,
    period: "ጠዋት" | "ከሰዓት",
  ): { hour: number; minute: number } {
    let hour24: number

    if (period === "ጠዋት") {
      // 12 → 0, 1–11 → same
      hour24 = ethiopianHour === 12 ? 0 : ethiopianHour
    } else {
      // 12 → 12, 1–11 → +12
      hour24 = ethiopianHour === 12 ? 12 : ethiopianHour + 12
    }

    // Convert Ethiopian → Western (+6 hours)
    hour24 = (hour24 + 6) % 24

    return {
      hour: hour24,
      minute: ethiopianMinute,
    }
  }

  // Check if within working hours (12:00 ጠዋት → 4:00 ከሰዓት)
  static isValidOperationTime(
    ethiopianHour: number,
    period: "ጠዋት" | "ከሰዓት",
  ): boolean {
    // Morning: allow all 12 → 11
    if (period === "ጠዋት") return true

    // Afternoon: only allow up to 4
    if (period === "ከሰዓት") {
      return ethiopianHour >= 1 && ethiopianHour <= 4
    }

    return false
  }

  static getOperationHoursDisplay(): string {
    return "12:00 ጠዋት - 4:00 ከሰዓት (6:00 AM - 10:00 PM)"
  }

  static formatTime(
    ethiopianHour: number,
    minute: number,
    period: "ጠዋት" | "ከሰዓት",
  ): string {
    return `${ethiopianHour}:${String(minute).padStart(2, "0")} ${period}`
  }
}

// Ethiopian time slots (12:00 to 4:00 ጠዋት)
export const ethiopianTimeSlots = [
  {
    hour: 12,
    period: "ጠዋት" as const,
    label: "12:00 ጠዋት",
    westernTime: "06:00 AM",
  },
  {
    hour: 1,
    period: "ጠዋት" as const,
    label: "1:00 ጠዋት",
    westernTime: "07:00 AM",
  },
  {
    hour: 2,
    period: "ጠዋት" as const,
    label: "2:00 ጠዋት",
    westernTime: "08:00 AM",
  },
  {
    hour: 3,
    period: "ጠዋት" as const,
    label: "3:00 ጠዋት",
    westernTime: "09:00 AM",
  },
  {
    hour: 4,
    period: "ጠዋት" as const,
    label: "4:00 ጠዋት",
    westernTime: "10:00 AM",
  },
]
