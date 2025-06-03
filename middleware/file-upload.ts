import multer from "multer";
import path from "path";

// Configure storage for multer (store files in memory for simplicity)
const storage = multer.memoryStorage();

// File filter to only allow JSON files
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
	const ext = path.extname(file.originalname).toLowerCase();
	if (ext !== ".json") {
		return cb(new Error("Only JSON files are allowed"));
	}
	cb(null, true);
};

// Configure multer to accept a single JSON file
export const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
}).single("file"); // Expect a file field named 'file'
