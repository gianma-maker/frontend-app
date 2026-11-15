export type FieldType = "text" | "number" | "date" | "time" | "select";

export interface Field {
  key: string; // exact column name in your SQL
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export interface ResourceConfig {
  title: string;
  singular: string;
  endpoint: string;
  idKey: string;
  fields: Field[];
}

export const RESOURCES = {
  venues: {
    title: "Venues",
    singular: "Venue",
    endpoint: "/venues",
    idKey: "venue_id",
    fields: [
      { key: "venue_address", label: "Address", type: "text", required: true },
      { key: "location", label: "Location", type: "text", required: true },
      { key: "capacity", label: "Capacity", type: "number" },
    ],
  },
  tournaments: {
    title: "Tournaments",
    singular: "Tournament",
    endpoint: "/tournaments",
    idKey: "tournament_id",
    fields: [
      { key: "tournament_name", label: "Name", type: "text", required: true },
      { key: "tournament_date", label: "Date", type: "date", required: true },
      { key: "tournament_type", label: "Type", type: "text", required: true, placeholder: "e.g. Singles" },
      { key: "status", label: "Status", type: "select", options: ["Upcoming", "Ongoing", "Completed", "Cancelled"] },
      { key: "venue_id", label: "Venue ID", type: "number" },
    ],
  },
  players: {
    title: "Players",
    singular: "Player",
    endpoint: "/players",
    idKey: "player_id",
    fields: [
      { key: "first_name", label: "First Name", type: "text", required: true },
      { key: "last_name", label: "Last Name", type: "text", required: true },
      { key: "gender", label: "Gender", type: "select", required: true, options: ["Male", "Female"] },
      { key: "birth_date", label: "Birth Date", type: "date" },
      { key: "contact_number", label: "Contact Number", type: "text" },
      { key: "ranking_points", label: "Ranking Points", type: "number" },
      { key: "user_id", label: "User ID", type: "number" },
    ],
  },
  registrations: {
    title: "Registrations",
    singular: "Registration",
    endpoint: "/registrations",
    idKey: "registration_id",
    fields: [
      { key: "player_id", label: "Player ID", type: "number", required: true },
      { key: "tournament_id", label: "Tournament ID", type: "number", required: true },
      { key: "category", label: "Category", type: "text", required: true },
      { key: "registration_date", label: "Registration Date", type: "date" },
      { key: "status", label: "Status", type: "select", options: ["Registered", "Confirmed", "Cancelled"] },
    ],
  },
  matches: {
    title: "Matches",
    singular: "Match",
    endpoint: "/matches",
    idKey: "match_id",
    fields: [
      { key: "tournament_id", label: "Tournament ID", type: "number", required: true },
      { key: "player_one_id", label: "Player One ID", type: "number", required: true },
      { key: "player_two_id", label: "Player Two ID", type: "number", required: true },
      { key: "match_date", label: "Match Date", type: "date", required: true },
      { key: "match_time", label: "Match Time", type: "time", required: true },
      { key: "round_name", label: "Round", type: "text", required: true },
      { key: "match_status", label: "Status", type: "select", options: ["Scheduled", "Ongoing", "Completed"] },
      { key: "winner_id", label: "Winner ID", type: "number" },
    ],
  },
  matchScores: {
    title: "Match Scores",
    singular: "Score",
    endpoint: "/match-scores",
    idKey: "score_id",
    fields: [
      { key: "match_id", label: "Match ID", type: "number", required: true },
      { key: "set_number", label: "Set Number", type: "number", required: true },
      { key: "player_one_score", label: "Player One Score", type: "number", required: true },
      { key: "player_two_score", label: "Player Two Score", type: "number", required: true },
    ],
  },
} satisfies Record<string, ResourceConfig>;