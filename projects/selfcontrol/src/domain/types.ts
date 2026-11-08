export type Group = "健身" | "体育项目";
export type ProjectKind =
  "words" | "reading" | "listening" | "chapters" | "str" | "custom";
export interface Timestamped {
  id: string;
  created_at: string;
  updated_at: string;
}
export interface StudyProject extends Timestamped {
  name: string;
  kind: ProjectKind;
  fixed: boolean;
  archived: boolean;
}
export interface ExerciseActivity extends Timestamped {
  name: string;
  group: Group;
  archived: boolean;
}
export interface StudyRecord extends Timestamped {
  date: string;
  project_id: string;
  project_name: string;
  duration_minutes: number;
  quantity?: number;
  unit: string;
  content: string;
  chapters: string;
  learned: string;
  unmastered: string;
  next_tasks: string;
}
export interface ExerciseRecord extends Timestamped {
  date: string;
  group: Group;
  activity_id: string;
  activity_name: string;
  content: string;
  duration_minutes: number;
  feeling: string;
  notes: string;
}
export interface AppSetting {
  key: string;
  value: string | number | boolean;
}
export type RecordType = "study" | "exercise";
export type AnyRecord = StudyRecord | ExerciseRecord;
export const tableNames = [
  "studyRecords",
  "exerciseRecords",
  "studyProjects",
  "exerciseActivities",
  "settings",
] as const;
export type TableName = (typeof tableNames)[number];
export interface BackupData {
  studyRecords: StudyRecord[];
  exerciseRecords: ExerciseRecord[];
  studyProjects: StudyProject[];
  exerciseActivities: ExerciseActivity[];
  settings: AppSetting[];
}
export interface Backup {
  format: "study-fitness-backup";
  backup_version: 1;
  database_version: 2;
  exported_at: string;
  data: BackupData;
}
