import mongoose, { Schema } from "mongoose";

export interface IUser {
	_id: mongoose.Types.ObjectId;
	user_pid: string;
	email: string;
	password: string;
	first_name: string;
	last_name: string;
	role: "admin" | "user"; // Add role field
	created_at: Date;
	updated_at: Date;
}

const UserSchema: Schema = new Schema(
	{
		user_pid: { type: String, required: true, unique: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		first_name: { type: String, required: true },
		last_name: { type: String, required: true },
		role: { type: String, enum: ["admin", "user"], default: "user" }, // Default to 'user'
		created_at: { type: Date, default: Date.now },
		updated_at: { type: Date, default: Date.now },
	},
	{
		timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
	}
);

export const UserModel = mongoose.model<IUser>("User", UserSchema);
