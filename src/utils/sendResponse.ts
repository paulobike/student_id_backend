import { Response } from "express";

export const sendErrorResponse = (res: Response, code: number, message?: string, data?: any): void => {
  console.log(message);
  res.status(code).json({
    status: 'error',
    message: message || 'An error occured',
    data: data || null
  })
};

export const sendSuccessResponse = (res: Response, code: number, message?: string, data?: any): void => {
  res.status(code).json({
    status: 'success',
    message: message || 'Operation successful',
    data: data || null
  })
};

export type SendErrorResponseType = typeof sendErrorResponse;
export type SendSuccessResponseType = typeof sendSuccessResponse;