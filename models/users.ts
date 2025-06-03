import Joi from "joi";

export type SignUpRequest = {
	email: string;
	password: string;
	first_name: string;
	role?: "admin" | "user"; // Optional role field
	last_name: string;
};

export const SignUpRequestSchema = Joi.object<SignUpRequest>({
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
	first_name: Joi.string().required(),
	last_name: Joi.string().required(),
	role: Joi.string().valid("admin", "user").optional(), // Optional, defaults to 'user' in schema
});

export type SignUpResponse = {
	user_pid: string;
	email: string;
	role?: "admin" | "user"; // Optional role field
	first_name: string;
	last_name: string;
	token: string;
};

export type LoginRequest = {
	email: string;
	password: string;
};

export const LoginRequestSchema = Joi.object<LoginRequest>({
	email: Joi.string().email().required(),
	password: Joi.string().required(),
});

export type LoginResponse = {
	token: string;
	user_pid: string;
	role?: "admin" | "user"; // Optional role field
	email: string;
	first_name: string;
	last_name: string;
};

export type UserDetailsResponse = {
	user_pid: string;
	email: string;
	first_name: string;
	last_name: string;
	role?: "admin" | "user"; // Optional role field
	created_at: Date;
	updated_at: Date;
};
