export interface WishData {
  name: string;
  age: number;
  message: string;
  senderName: string | null;
}

export type GameState =
  | "loading"
  | "waitingForClaps"
  | "blowingOut"
  | "waitingForEnvelope"
  | "envelopeOpen"
  | "resetting";

export interface PalmSample {
  t: number;
  distance: number;
  handsVisible: number;
}