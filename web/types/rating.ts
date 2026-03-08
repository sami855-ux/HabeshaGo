export interface Rating {
  id: number;

  userId: string;
  stationId?: number | null;

  score: number; // 1–5
  comment?: string | null;

  createdAt: string;
  updatedAt: string;
}