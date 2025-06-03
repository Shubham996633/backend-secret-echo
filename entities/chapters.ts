// entities/chapter.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IChapter extends Document {
	chapter_pid: string;
	class: string; // e.g., "Class 11"
	unit: string; // e.g., "Mechanics 1"
	status: string; // e.g., "Not Started", "Completed"
	isWeakChapter: boolean;
	subject: string;
	chapter: string;
	yearWiseQuestionCount: { [year: string]: number }; // e.g., { "2019": 0, "2020": 2, ... }
	questionSolved: number;
	created_at: Date;
	updated_at: Date;
	deleted_at: Date | null;
}

const ChapterSchema: Schema = new Schema(
	{
		chapter_pid: { type: String, required: true, unique: true },
		class: { type: String, required: true },
		unit: { type: String, required: true },
		status: {
			type: String,
			enum: ["Not Started", "In Progress", "Completed"],
			default: "Not Started",
		},
		isWeakChapter: { type: Boolean, default: false },
		subject: { type: String, required: true },
		chapter: { type: String, required: true },
		yearWiseQuestionCount: { type: Schema.Types.Mixed, default: {} },
		questionSolved: { type: Number, default: 0 },
		created_at: { type: Date, default: Date.now },
		updated_at: { type: Date, default: Date.now },
		deleted_at: { type: Date, default: null },
	},
	{
		timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
	}
);

export const ChapterModel = mongoose.model<IChapter>("Chapter", ChapterSchema);
