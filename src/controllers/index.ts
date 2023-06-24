import { NextFunction, Request, Response } from "express";
import { SendErrorResponseType, SendSuccessResponseType } from "../utils/sendResponse";
import StatusCodes from "../utils/StatusCodes";
import { BaseController } from "./BaseController";

export class IndexController extends BaseController {
    constructor(sendError: SendErrorResponseType, sendSuccess: SendSuccessResponseType) {
        super(sendError, sendSuccess);
    }

    helloWorld(req: Request, res: Response, next: NextFunction) {
        this.sendSuccessResponse(res, StatusCodes.OK, "Success", "Hello World!!");
    }

    notFound(req: Request, res: Response, next: NextFunction) {
        this.sendErrorResponse(res, StatusCodes.NOT_FOUND, "Not found", null);
    }
}