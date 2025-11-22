// Core types for Sigilo

export type Role = "Journalist" | "Public official" | "Citizen";

export type ReportStatus = "Pending" | "Stored" | "Verified";

export interface Report {
  id: string;
  role: Role;
  description: string;
  status: ReportStatus;
  cid?: string; // Filecoin CID
  createdAt: string; // ISO string
  location?: string;
  methods?: string[]; // e.g. ["vLayer zkTLS", "Filecoin", "EVVM anchor"]
  riskTags?: string[];
}

// Node types for integration
export type NodeRole = "receiver" | "relay" | "witness";

export interface SignalPayload {
  id: string;
  cid: string;
  createdAt: string;
  role: Role;
  regionHint?: string;
  status: ReportStatus;
  methods: string[];
  riskTags?: string[];
  previewHash?: string;
  version: number;
}
