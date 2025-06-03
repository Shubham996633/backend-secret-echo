// controllers/chapter.controller.ts
import { RequestHandler } from "express";
import Joi from "joi/lib";
import { SecretEchoContext } from "../../middleware/context";
import { upload } from "../../middleware/file-upload"; // Import the multer middleware
import {
	ChapterDetailsResponse,
	ChapterFilterRequest,
	ChapterFilterRequestSchema,
	ChapterItemSchema,
	ChapterUploadRequest,
	ChapterUploadRequestSchema,
} from "../../models/chapters";
import { ReturnError, ReturnSuccess } from "../../models/request_response";
import { getErrorMessage } from "../../oplog/error";
import oplog from "../../oplog/oplog";
import { ChapterService } from "../../services/chapters/chapters_serv_interface";
import redis from "../../utils/redis";
import { validateDataUsingJOI } from "../../utils/validator";
export const getChapters: RequestHandler = async (req, res) => {
	const data = validateDataUsingJOI<ChapterFilterRequest>(req.query, ChapterFilterRequestSchema);
	if (data instanceof Error) {
		return ReturnError(res, [data.message], 400);
	}

	const secretEchoCtx = SecretEchoContext.get(req);
	const cacheKey = `chapters:${JSON.stringify(data)}`;
	const cachedData = await redis.get(cacheKey);

	if (cachedData) {
		const parsedData = JSON.parse(cachedData);
		return ReturnSuccess(res, parsedData);
	}
	const result = await ChapterService.getAllChapters(secretEchoCtx, {
		class: data.class,
		unit: data.unit,
		status: data.status,
		isWeakChapter: data.weakChapters === "true",
		subject: data.subject,
		page: parseInt(data.page!),
		limit: parseInt(data.limit!),
		sortBy: data.sortBy!,
		order: data.order!,
	});

	if (result instanceof Error) {
		oplog.error(`Error fetching chapters: ${getErrorMessage(result)}`);
		return ReturnError(res, [result.message], 500);
	}

	const { chapters, total } = result;
	const responseData = {
		total,
		chapters: chapters.map(
			(chapter): ChapterDetailsResponse => ({
				chapter_id: chapter.chapter_pid,
				subject: chapter.subject,
				chapter: chapter.chapter,
				class: chapter.class,
				unit: chapter.unit,
				yearWiseQuestionCount: chapter.yearWiseQuestionCount,
				questionSolved: chapter.questionSolved,
				status: chapter.status,
				isWeakChapter: chapter.isWeakChapter,
				created_at: chapter.created_at,
				updated_at: chapter.updated_at,
			})
		),
	};
	await redis.setEx(cacheKey, 3600, JSON.stringify(responseData));
	return ReturnSuccess(res, responseData);
};

export const getChapterById: RequestHandler = async (req, res) => {
	const chapterId = req.params.id;
	const secretEchoCtx = SecretEchoContext.get(req);

	const cacheKey = `chapters:${JSON.stringify(chapterId)}`;
	const cachedData = await redis.get(cacheKey);

	if (cachedData) {
		const parsedData = JSON.parse(cachedData);
		return ReturnSuccess(res, parsedData);
	}

	const result = await ChapterService.getChapterById(secretEchoCtx, chapterId);
	if (result instanceof Error) {
		oplog.error(`Error fetching chapter by ID ${chapterId}: ${getErrorMessage(result)}`);
		return ReturnError(res, [result.message], 404);
	}

	const responseData: ChapterDetailsResponse = {
		chapter_id: result.chapter_pid,
		subject: result.subject,
		chapter: result.chapter,
		class: result.class,
		unit: result.unit,
		yearWiseQuestionCount: result.yearWiseQuestionCount,
		questionSolved: result.questionSolved,
		status: result.status,
		isWeakChapter: result.isWeakChapter,
		created_at: result.created_at,
		updated_at: result.updated_at,
	};
	await redis.setEx(cacheKey, 3600, JSON.stringify(responseData));

	return ReturnSuccess(res, responseData);
};

export const uploadChaptersByFile: RequestHandler = async (req, res) => {
	// Apply multer middleware to handle the file upload
	upload(req, res, async (err) => {
		if (err) {
			oplog.error(`File upload error: ${getErrorMessage(err)}`);
			return ReturnError(res, [err.message], 400);
		}

		if (!req.file) {
			return ReturnError(res, ["No file uploaded"], 400);
		}

		let chaptersData: ChapterUploadRequest["chapters"];
		try {
			// Parse the JSON file content from the buffer
			const fileContent = req.file.buffer.toString("utf-8");
			const parsedData = JSON.parse(fileContent);

			// Check if parsedData is an array (e.g., [{...}, {...}])
			if (Array.isArray(parsedData)) {
				// Validate the array against ChapterItemSchema
				const { error, value } = Joi.array().items(ChapterItemSchema).validate(parsedData, { abortEarly: false });
				if (error) {
					oplog.error(`Validation error for chapter array: ${getErrorMessage(error)}`);
					return ReturnError(res, [error.message], 400);
				}
				chaptersData = value;
			}
			// Check if parsedData is an object with a "chapters" key (e.g., { "chapters": [...] })
			else if (parsedData.chapters && Array.isArray(parsedData.chapters)) {
				// Validate against ChapterUploadRequestSchema
				const { error, value } = ChapterUploadRequestSchema.validate(parsedData, { abortEarly: false });
				if (error) {
					oplog.error(`Validation error for chapters object: ${getErrorMessage(error)}`);
					return ReturnError(res, [error.message], 400);
				}
				chaptersData = value.chapters;
			}
			// Invalid structure
			else {
				return ReturnError(res, ['Invalid JSON structure: Expected an array or an object with a "chapters" key'], 400);
			}
		} catch (error) {
			oplog.error(`Error parsing JSON file: ${getErrorMessage(error)}`);
			return ReturnError(res, ["Invalid JSON file"], 400);
		}

		const secretEchoCtx = SecretEchoContext.get(req);
		const result = await ChapterService.uploadChapters(secretEchoCtx, chaptersData);

		if (result instanceof Error) {
			oplog.error(`Error uploading chapters: ${getErrorMessage(result)}`);
			return ReturnError(res, [result.message], 500);
		}

		const cacheKey = `chapters:${JSON.stringify(result)}`;
		const cachedData = await redis.get(cacheKey);

		if (cachedData) {
			const parsedData = JSON.parse(cachedData);
			return ReturnSuccess(res, parsedData);
		}

		const { uploadedCount, failedChapters } = result;
		if (uploadedCount > 0) {
			await redis.del("chapters:*"); // Invalidate cache
		} else {
			await redis.setEx(cacheKey, 3600, JSON.stringify(result));
		}
		return ReturnSuccess(res, { uploadedCount, failedChapters }, 201);
	});
};
