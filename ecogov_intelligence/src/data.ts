import { SuggestionChip, GreenTask, DocumentMetadata } from "./types";

export const SUGGESTED_CHIPS: SuggestionChip[] = [
  { text: "How should plastic waste be managed?", category: "plastic" },
  { text: "What is waste segregation?", category: "solid" },
  { text: "How to manage biomedical waste?", category: "biomedical" },
  { text: "What is the thickness limit for plastic carries?", category: "plastic" },
  { text: "Who manages e-waste dropoff?", category: "e-waste" },
  { text: "SBM 2.0 Objectives", category: "national" },
  { text: "Where to dump concrete debris?", category: "civil" },
  { text: "Is battery fluid hazardous waste?", category: "hazardous" }
];

export const INITIAL_GREEN_TASKS: GreenTask[] = [
  {
    id: "task_1",
    title: "Dispose of dry cells & old adapters at an e-waste collection spot",
    category: "e-waste",
    points: 15,
    done: true,
    dueDate: "Completed"
  },
  {
    id: "task_2",
    title: "Implement dual-bin (Green/Blue) separation in kitchen counter",
    category: "solid",
    points: 20,
    done: false,
    dueDate: "Today"
  },
  {
    id: "task_3",
    title: "Swap clinical mask with safe washed cotton mask at local commute",
    category: "biomedical",
    points: 10,
    done: false,
    dueDate: "Tomorrow"
  },
  {
    id: "task_4",
    title: "Collect recyclable polythenes and deliver to registered recycler",
    category: "plastic",
    points: 25,
    done: false,
    dueDate: "This Friday"
  }
];

export const DOCUMENTS_LIST: DocumentMetadata[] = [
  {
    id: "doc_1",
    title: "Solid Waste Management Rules, 2016",
    year: 2016,
    description: "National standards mandating 3-way household segregation (wet, dry, and sanitary waste) at source.",
    chunksCount: 420,
    category: "solid"
  },
  {
    id: "doc_2",
    title: "Plastic Waste Management Rules, 2016",
    year: 2016,
    description: "Regulates manufacture and recycling standards of carry bags ($120\\mu m$), and establishes Extended Producer Responsibility.",
    chunksCount: 220,
    category: "plastic"
  },
  {
    id: "doc_3",
    title: "E-Waste (Management) Rules, 2022",
    year: 2022,
    description: "Governs disposal pipelines of consumer appliances, lithium cells, circuits, restricting uncertified informal smelting.",
    chunksCount: 160,
    category: "e-waste"
  },
  {
    id: "doc_4",
    title: "Bio-Medical Waste Management Rules, 2016",
    year: 2016,
    description: "Hospital classification with strictly enforced color-coded bins (Yellow, Red, Blue, White puncture-proof container).",
    chunksCount: 180,
    category: "biomedical"
  },
  {
    id: "doc_5",
    title: "Construction & Demolition Waste Rules, 2016",
    year: 2016,
    description: "In-situ debris collection regulations and mandatory commercial waste logs submitted to municipal inspectors.",
    chunksCount: 110,
    category: "civil"
  },
  {
    id: "doc_6",
    title: "Hazardous Wastes Management Rules, 2016",
    year: 2016,
    description: "Storage and collection of heavy toxins, vehicle battery fluids, toxic paints, and processing at localized chemical centers.",
    chunksCount: 95,
    category: "hazardous"
  },
  {
    id: "doc_7",
    title: "Swachh Bharat Mission (Urban) 2.0 Guidelines",
    year: 2021,
    description: "National scheme for Garbage-Free Cities, zero plastic pollution, legacy dumpsites bioremediation, and green composting.",
    chunksCount: 60,
    category: "national"
  }
];
