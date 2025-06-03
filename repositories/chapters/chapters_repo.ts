// repositories/chapter.repository.ts
import { PublicIDPrefixes } from "../../config/prefixes";
import { IChapter } from "../../entities/chapters";
import { SecretEchoContext } from "../../middleware/context";
import { getErrorMessage } from "../../oplog/error";
import oplog from "../../oplog/oplog";
import { generatePublicID } from "../../utils/ids";

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
		const query: any = {};
		if (filters.class) query.class = filters.class;
		if (filters.unit) query.unit = filters.unit;
		if (filters.status) query.status = filters.status;
		if (filters.isWeakChapter !== undefined) query.isWeakChapter = filters.isWeakChapter;
		if (filters.subject) query.subject = filters.subject;

		const sort: any = {};
		sort[filters.sortBy] = filters.order === "asc" ? 1 : -1;

		const total = await secretEchoCtx.entities.Chapters.countDocuments(query);
		const chapters = await secretEchoCtx.entities.Chapters.find(query)
			.sort(sort)
			.skip((filters.page - 1) * filters.limit)
			.limit(filters.limit);

		return { chapters, total };
	} catch (error) {
		oplog.error(getErrorMessage(error));
		return error as Error;
	}
}

export async function findById(secretEchoCtx: SecretEchoContext, chapterId: string): Promise<IChapter | null | Error> {
	try {
		const chapter = await secretEchoCtx.entities.Chapters.findOne({ chapter_pid: chapterId });
		return chapter;
	} catch (error) {
		oplog.error(getErrorMessage(error));
		return error as Error;
	}
}

export async function findByPid(
	secretEchoCtx: SecretEchoContext,
	chapterPid: string
): Promise<IChapter | null | Error> {
	try {
		const chapter = await secretEchoCtx.entities.Chapters.findOne({ chapter_pid: chapterPid });
		return chapter;
	} catch (error) {
		oplog.error(getErrorMessage(error));
		return error as Error;
	}
}

export async function uploadChapters(
	secretEchoCtx: SecretEchoContext,
	chaptersData: {
		subject: string;
		chapter: string;
		class: string;
		unit: string;
		yearWiseQuestionCount: { [year: string]: number };
		questionSolved: number;
		status: string;
		isWeakChapter: boolean;
	}[]
): Promise<{ uploaded: IChapter[]; failed: { chapter: any; error: string }[] } | Error> {
	try {
		const failed: { chapter: any; error: string }[] = [];
		const toInsert: any[] = [];

		for (const chapterData of chaptersData) {
			try {
				const chapter = new secretEchoCtx.entities.Chapters({
					...chapterData,
					chapter_pid: generatePublicID(PublicIDPrefixes.CHAPTER),
				});
				await chapter.validate();
				toInsert.push(chapter);
			} catch (error) {
				failed.push({ chapter: chapterData, error: getErrorMessage(error) });
			}
		}

		// Explicitly cast the result of insertMany to IChapter[]
		const uploaded = (await secretEchoCtx.entities.Chapters.insertMany(toInsert)) as IChapter[];
		return { uploaded, failed };
	} catch (error) {
		oplog.error(getErrorMessage(error));
		return error as Error;
	}
}
