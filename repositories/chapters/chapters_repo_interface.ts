import { findById, findByPid, getAllChapters, uploadChapters } from "./chapters_repo";

export const ChapterRepository = {
	getAllChapters,
	uploadChapters,
	findById,
	findByPid,
};
