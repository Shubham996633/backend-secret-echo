import { RequestHandler } from "express";
import { ReturnError } from "../models/request_response";
import oplog from "../oplog/oplog";
import { SecretEchoContext } from "./context";

export const isAdmin: RequestHandler = async (req, res, next) => {
	const secretEchoCtx = SecretEchoContext.get(req);

	if (!secretEchoCtx.Authorization) {
		return ReturnError(res, ["Unauthorized: No token provided"], 401);
	}

	if (secretEchoCtx.Role !== "admin") {
		oplog.error(`Access denied: User ${secretEchoCtx.UserPID} is not an admin`);
		return ReturnError(res, ["Forbidden: Admin access required"], 403);
	}

	next();
};
