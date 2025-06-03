import express from "express";

import { getChapterById, getChapters, uploadChaptersByFile } from "../controllers/chapters/chapter_controller";
import { getUserDetails, login, logout, signup } from "../controllers/users/users_controller";
import { isAdmin } from "../middleware/auth.middleware";

export function mapUrls(app: express.Express) {
	const msV1APIRouter = express.Router();

	app.use("/api/v1", msV1APIRouter);

	msV1APIRouter.post("/auth/signup", signup);
	msV1APIRouter.post("/auth/login", login);
	msV1APIRouter.post("/auth/logout", logout);
	msV1APIRouter.get("/users/me", getUserDetails);

	msV1APIRouter.get("/chapters", getChapters); // Get all chapters with filters, pagination, and sorting
	msV1APIRouter.get("/chapters/:id", getChapterById); // Get a specific chapter by ID
	msV1APIRouter.post("/chapters", isAdmin, uploadChaptersByFile); // Upload chapters (admin-only)
}
