import Dexie, { type Table } from "dexie";
import type {
  StudyRecord,
  ExerciseRecord,
  StudyProject,
  ExerciseActivity,
  AppSetting,
} from "../domain/types";
export const schemaV1 = {
  studyRecords: "id, date, project_id",
  exerciseRecords: "id, date, activity_id",
  studyProjects: "id, name",
  exerciseActivities: "id, name",
  settings: "key",
};
export class AppDatabase extends Dexie {
  studyRecords!: Table<StudyRecord, string>;
  exerciseRecords!: Table<ExerciseRecord, string>;
  studyProjects!: Table<StudyProject, string>;
  exerciseActivities!: Table<ExerciseActivity, string>;
  settings!: Table<AppSetting, string>;
  constructor(name = "study-fitness-local") {
    super(name);
    this.version(1).stores(schemaV1);
    this.version(2).stores({
      ...schemaV1,
      studyRecords: "id, date, project_id, [date+project_id]",
      exerciseRecords: "id, date, activity_id, [date+activity_id], group",
    });
  }
}
export const db = new AppDatabase();
