import { Rating } from "./rating"

export interface StationImage {
  id: number;
  url: string;
  caption?: string | null;
  stationId: number;

  createdAt: string;
  updatedAt: string;
}

export type DocumentType =
  | "INSURANCE"
  | "OWNERSHIP"
  | "LICENSE"
  | "PERMIT"
  | "TAX_CERTIFICATE"
  | "OTHER";

export interface StationDocument {
  id: number;
  stationId: number;

  type: DocumentType;
  url: string;
  verified: boolean;

  uploadedAt: string;
}

// Charging Points

export type ChargingPointStatus =
  | "AVAILABLE"
  | "OCCUPIED"
  | "FAULTED"
  | "OFFLINE";

export type ChargingSpeed = "SLOW" | "FAST" | "SUPER_FAST";

export type ConnectorType =
  | "CCS"
  | "TYPE2"
  | "CHADEMO";

export interface ChargingPoint {
  id: number;

  stationId: number;
  connectorType: ConnectorType;
  powerKw: number;

  status: ChargingPointStatus;
  averageSessionDuration?: number | null;

  slotNumber?: string | null;

  maxVoltage?: number | null;
  maxCurrent?: number | null;

  chargingSpeed: ChargingSpeed;

  createdAt: string;
  updatedAt: string;
}

// Tariff
export interface Tariff {
  id: number;
  stationId: number;

  pricePerKwh: string;
  pricePerMinute?: string | null;
  idleFeePerMinute?: string | null;

  currency: string;

  validFrom: string;
  validTo?: string | null;

  createdAt: string;
}

//ChargingSession
export type SessionStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED";

export interface ChargingSession {
  id: number;

  vehicleId: number;
  stationId: number;
  chargingPointId: number;

  startTime: string;
  endTime?: string | null;

  meterStart?: string | null;
  meterEnd?: string | null;

  energyConsumedKwh?: string | null;
  durationMinutes?: number | null;

  energyCost?: string | null;
  timeCost?: string | null;
  idleFee?: string | null;
  totalCost?: string | null;

  status: SessionStatus;

  userId: string;

  createdAt: string;
  updatedAt: string;
}

//Ev station 
export type StationStatus =
  | "ACTIVE"
  | "MAINTENANCE"
  | "INACTIVE";

export interface ChargingStation {
  id: number;
  name: string;

  address?: string | null;
  city?: string | null;

  lat: number;
  lng: number;

  status: StationStatus;
  isVerified: boolean;

  chargingPoints: ChargingPoint[];
  tariffs: Tariff[];
  sessions: ChargingSession[];
  ratings: Rating[];
  documents: StationDocument[];
  images: StationImage[];

  createdAt: string;
  updatedAt: string;
}