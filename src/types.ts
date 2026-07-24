export type GameState =
  | 'HOST_SETUP'        // State 1: Room Scan & Setup
  | 'QUEST_LOADING'      // State 2: Gemini generating quest
  | 'GAMEPLAY'           // State 3: Narrative & Poetic Clue
  | 'VERIFYING'          // State 4: Solution verification in progress
  | 'SUCCESS'            // State 5a: Evidence unlocked success modal
  | 'FAILURE'            // State 5b: Incorrect object failure modal
  | 'QUEST_COMPLETE';    // State 6: All 3 clues solved!

export interface ClueItem {
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
