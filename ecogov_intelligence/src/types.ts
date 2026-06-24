export interface DocumentMetadata {
  id: string;
  title: string;
  year: number;
  description: string;
  chunksCount: number;
  category: "solid" | "plastic" | "e-waste" | "biomedical" | "civil" | "hazardous" | "national";
}

export interface Chunk {
  id: string;
  docId: string;
  docTitle: string;
  section: string;
  content: string;
  category: string;
}

export interface SourceCitation {
  docTitle: string;
  section: string;
  excerpt: string;
}

export interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  sources?: SourceCitation[];
  feedback?: "up" | "down";
}

export interface GreenTask {
  id: string;
  title: string;
  category: "solid" | "plastic" | "e-waste" | "biomedical" | "general";
  points: number;
  done: boolean;
  dueDate: string;
}

export interface SuggestionChip {
  text: string;
  category: string;
}

export interface StatsOverview {
  totalDocuments: number;
  totalChunks: number;
  queriesAnswered: number;
  userThumbsUp: number;
  userThumbsDown: number;
  completedTasks: number;
  ecologicalSavings: {
    plasticSavedGrams: number;
    eWasteRecycledGrams: number;
    compostProducedGrams: number;
  };
}
