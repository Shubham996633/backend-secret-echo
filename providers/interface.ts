import { ChapterService } from "../services/chapters/chapters_serv_interface";
import { TokensService } from "../services/tokens/tokens_serv_interface";
import { UserService } from "../services/users/users_serv_interface";

export const providersInterface = {
	tokens: TokensService,
	users: UserService,
	chapters: ChapterService,
};
