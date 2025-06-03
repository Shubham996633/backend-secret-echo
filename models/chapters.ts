// types/chapters.ts
import Joi from "joi";

export type ChapterDetailsResponse = {
	chapter_id: string;
	subject: string;
	chapter: string;
	class: string;
	unit: string;
	yearWiseQuestionCount: { [year: string]: number };
	questionSolved: number;
	status: string;
	isWeakChapter: boolean;
	created_at: Date;
	updated_at: Date;
};

export type ChapterFilterRequest = {
	class?: string;
	unit?: string;
	status?: string;
	weakChapters?: string; // Will be converted to boolean
	subject?: string;
	page?: string;
	limit?: string;
	sortBy?: string; // e.g., "chapter", "questionSolved"
	order?: "asc" | "desc";
};

export const ChapterFilterRequestSchema = Joi.object<ChapterFilterRequest>({
	class: Joi.string().optional(),
	unit: Joi.string().optional(),
	status: Joi.string().valid("Not Started", "In Progress", "Completed").optional(),
	weakChapters: Joi.string().valid("true", "false").optional(),
	subject: Joi.string().optional(),
	page: Joi.string().default("1"),
	limit: Joi.string().default("10"),
	sortBy: Joi.string().default("chapter"),
	order: Joi.string().valid("asc", "desc").default("asc"),
});

export type ChapterUploadRequest = {
	chapters: {
		subject: string;
		chapter: string;
		class: string;
		unit: string;
		yearWiseQuestionCount: { [year: string]: number };
		questionSolved: number;
		status: string;
		isWeakChapter: boolean;
	}[];
};

// Schema for a single chapter item
export const ChapterItemSchema = Joi.object({
	subject: Joi.string().required(),
	chapter: Joi.string().required(),
	class: Joi.string().required(),
	unit: Joi.string().required(),
	yearWiseQuestionCount: Joi.object().pattern(Joi.string(), Joi.number()).required(),
	questionSolved: Joi.number().required(),
	status: Joi.string().valid("Not Started", "In Progress", "Completed").required(),
	isWeakChapter: Joi.boolean().required(),
});

export const ChapterUploadRequestSchema = Joi.object<ChapterUploadRequest>({
	chapters: Joi.array().items(ChapterItemSchema).required(),
});

export type ChapterUploadResponse = {
	uploadedCount: number;
	failedChapters: { chapter: any; error: string }[];
};
