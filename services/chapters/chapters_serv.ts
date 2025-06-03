// services/chapter.service.ts
import { IChapter } from "../../entities/chapters";
import { SecretEchoContext } from "../../middleware/context";
import { ChapterUploadRequest } from "../../models/chapters";
import { getErrorMessage } from "../../oplog/error";
import oplog from "../../oplog/oplog";

export async function getAllChapters(
	secretEchoCtx: SecretEchoContext,
	filters: {
		class?: string;
		unit?: string;
		status?: string;
		isWeakChapter?: boolean;
		subject?: string;
		page: number;
		limit: number;
		sortBy: string;
		order: "asc" | "desc";
	}
): Promise<{ chapters: IChapter[]; total: number } | Error> {
	try {
		const result = await secretEchoCtx.dbProviders.Chapter.getAllChapters(secretEchoCtx, filters);
		if (result instanceof Error) {
			oplog.error(`Error fetching chapters: ${getErrorMessage(result)}`);
			return result;
		}

		oplog.info(`Fetched ${result.chapters.length} chapters with filters: ${JSON.stringify(filters)}`);
		return result;
	} catch (error) {
		oplog.error(`Error in getAllChapters: ${getErrorMessage(error)}`);
		return error as Error;
	}
}

export async function getChapterById(secretEchoCtx: SecretEchoContext, chapterId: string): Promise<IChapter | Error> {
	try {
		const chapter = await secretEchoCtx.dbProviders.Chapter.findById(secretEchoCtx, chapterId);
		if (chapter instanceof Error) {
			oplog.error(`Error fetching chapter by ID ${chapterId}: ${getErrorMessage(chapter)}`);
			return chapter;
		}

		if (!chapter) {
			oplog.error(`Chapter not found for ID: ${chapterId}`);
			return new Error("Chapter not found");
		}

		oplog.info(`Fetched chapter with ID: ${chapterId}`);
		return chapter;
	} catch (error) {
		oplog.error(`Error in getChapterById: ${getErrorMessage(error)}`);
		return error as Error;
	}
}

export async function uploadChapters(
	secretEchoCtx: SecretEchoContext,
	chaptersData: ChapterUploadRequest["chapters"]
): Promise<{ uploadedCount: number; failedChapters: { chapter: any; error: string }[] } | Error> {
	try {
		const result = await secretEchoCtx.dbProviders.Chapter.uploadChapters(secretEchoCtx, chaptersData);
		if (result instanceof Error) {
			oplog.error(`Error uploading chapters: ${getErrorMessage(result)}`);
			return result;
		}

		const { uploaded, failed } = result;
		oplog.info(`Uploaded ${uploaded.length} chapters, failed: ${failed.length}`);

		return {
			uploadedCount: uploaded.length,
			failedChapters: failed,
		};
	} catch (error) {
		oplog.error(`Error in uploadChapters: ${getErrorMessage(error)}`);
		return error as Error;
	}
}
