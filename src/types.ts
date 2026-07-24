export type GameState =
  | "SCAN_ROOM"
  | "LOADING_QUEST"
  | "PLAYING_CLUE"
  | "VERIFYING_PHOTO"
  | "GAME_OVER";

export interface ClueItem {
  clue_id: number;
  target_object_name: string;
  poetic_clue: string;
  storyline_continuation: string;
}

export interface QuestData {
  opening_narrative: string;
  clues: ClueItem[];
}

export interface VerificationResult {
  is_correct: boolean;
  detected_item: string;
  feedback_message: string;
}

export interface SolvedInventoryItem {
  stage: number;
  target_object_name: string;
  poetic_clue: string;
  storyline_continuation: string;
  verified_image?: string;
  timestamp: string;
}

export interface SampleRoom {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  sampleClues?: ClueItem[];
  sampleOpening?: string;
}
