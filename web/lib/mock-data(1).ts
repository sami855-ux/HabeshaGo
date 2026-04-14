import {
  ChargingStation,
  StationStatus,
  ChargingPointStatus,
  ConnectorType,
  ChargingSpeed,
  DocumentType,
  SessionStatus,
} from "@/types/ev"

export const mockStations: ChargingStation[] = [
  {
    id: 1,
    name: "Bole International Airport EV Hub",
    address: "Bole International Airport",
    city: "Addis Ababa",
    lat: 8.9779,
    lng: 38.7993,
    status: "ACTIVE",
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    chargingPoints: [
      {
        id: 101,
        stationId: 1,
        connectorType: "CCS",
        powerKw: 150,
        status: "AVAILABLE",
        averageSessionDuration: 45,
        slotNumber: "A1",
        chargingSpeed: "FAST",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 102,
        stationId: 1,
        connectorType: "TYPE2",
        powerKw: 22,
        status: "OCCUPIED",
        averageSessionDuration: 120,
        slotNumber: "A2",
        chargingSpeed: "SLOW",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 103,
        stationId: 1,
        connectorType: "CHADEMO",
        powerKw: 50,
        status: "AVAILABLE",
        averageSessionDuration: 60,
        slotNumber: "B1",
        chargingSpeed: "FAST",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],

    tariffs: [
      {
        id: 1001,
        stationId: 1,
        pricePerKwh: "0.25",
        pricePerMinute: null,
        idleFeePerMinute: "0.10",
        currency: "USD",
        validFrom: new Date().toISOString(),
        validTo: null,
        createdAt: new Date().toISOString(),
      },
    ],

    sessions: [],

    ratings: [
      {
        id: 1,
        stationId: 1,
        userId: "user1",
        score: 5,
        comment: "Great location, fast charging",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],

    documents: [
      {
        id: 10001,
        stationId: 1,
        type: "LICENSE",
        url: "/docs/license.pdf",
        verified: true,
        uploadedAt: new Date().toISOString(),
      },
      {
        id: 10002,
        stationId: 1,
        type: "INSURANCE",
        url: "/docs/insurance.pdf",
        verified: true,
        uploadedAt: new Date().toISOString(),
      },
    ],

    images: [
      {
        id: 100001,
        stationId: 1,
        url: "https://images.unsplash.com/photo-1671785120538-c24cbe823ccc?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        caption: "Main charging area",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 100002,
        stationId: 1,
        url: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800",
        caption: "Waiting lounge",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 2,
    name: "Edna Mall Charging Station",
    address: "Edna Mall, Bole",
    city: "Addis Ababa",
    lat: 9.0086,
    lng: 38.7875,
    status: "ACTIVE",
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    chargingPoints: [
      {
        id: 201,
        stationId: 2,
        connectorType: "CCS",
        powerKw: 350,
        status: "AVAILABLE",
        averageSessionDuration: 30,
        slotNumber: "1",
        chargingSpeed: "SUPER_FAST",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 202,
        stationId: 2,
        connectorType: "CCS",
        powerKw: 350,
        status: "AVAILABLE",
        averageSessionDuration: 30,
        slotNumber: "2",
        chargingSpeed: "SUPER_FAST",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],

    tariffs: [
      {
        id: 2001,
        stationId: 2,
        pricePerKwh: "0.35",
        pricePerMinute: null,
        idleFeePerMinute: "0.15",
        currency: "USD",
        validFrom: new Date().toISOString(),
        validTo: null,
        createdAt: new Date().toISOString(),
      },
    ],

    sessions: [],

    ratings: [
      {
        id: 2,
        stationId: 2,
        userId: "user2",
        score: 4,
        comment: "Very fast charging",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],

    documents: [
      {
        id: 20001,
        stationId: 2,
        type: "LICENSE",
        url: "/docs/license2.pdf",
        verified: true,
        uploadedAt: new Date().toISOString(),
      },
    ],

    images: [
      {
        id: 200001,
        stationId: 2,
        url: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800",
        caption: "Super fast chargers",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 100002,
        stationId: 1,
        url: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800",
        caption: "Waiting lounge",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 3,
    name: "Mexico Square Station",
    address: "Mexico Square",
    city: "Addis Ababa",
    lat: 9.0108,
    lng: 38.7617,
    status: "MAINTENANCE",
    isVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    chargingPoints: [
      {
        id: 301,
        stationId: 3,
        connectorType: "TYPE2",
        powerKw: 22,
        status: "FAULTED",
        averageSessionDuration: null,
        slotNumber: "1",
        chargingSpeed: "SLOW",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],

    tariffs: [
      {
        id: 3001,
        stationId: 3,
        pricePerKwh: "0.20",
        pricePerMinute: null,
        idleFeePerMinute: null,
        currency: "USD",
        validFrom: new Date().toISOString(),
        validTo: null,
        createdAt: new Date().toISOString(),
      },
    ],

    sessions: [],

    ratings: [],

    documents: [],

    images: [],
  },
]
