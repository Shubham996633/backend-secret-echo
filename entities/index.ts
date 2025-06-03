// entities/index.ts
import { ChapterModel } from "./chapters";
import { SessionModel } from "./session";
import { UserModel } from "./user";

export const dBEntities = {
	Users: UserModel,
	Sessions: SessionModel,
	Chapters: ChapterModel,
};
