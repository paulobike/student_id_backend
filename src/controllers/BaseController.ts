import { SendErrorResponseType, SendSuccessResponseType } from "../utils/sendResponse";

export class BaseController {
  sendErrorResponse: SendErrorResponseType;
  sendSuccessResponse: SendSuccessResponseType;
  constructor(sendError: SendErrorResponseType, sendSuccess: SendSuccessResponseType) {
    this.sendErrorResponse = sendError;
    this.sendSuccessResponse = sendSuccess;
  }
}