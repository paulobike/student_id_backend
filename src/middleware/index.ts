import StatusCodes from "../utils/StatusCodes";
import { NextFunction, Request, Response } from "express";
import { sendErrorResponse } from "../utils/sendResponse";
import jwt from 'jsonwebtoken';
import Student, { StudentDocType } from "../models/Student";
import Admin, { AdminDocType } from "../models/Admin";
import multer, { FileFilterCallback } from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../static/passports'),
  filename: (req, file, cb) => {
    let filename = (req.user as StudentDocType).reg_number + '_' + Date.now() + '.' + file.mimetype.split('/')[1];
    cb(null, filename);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const validMimetype = [
    'image/jpeg',
    'image/jpg',
    'image/png',
  ]

  if (file && validMimetype.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.log("[FileHandler::fileFilter invalid file type:]", file.mimetype);
    const error: any = new Error(`Invalid image uploaded.`);
    error.status = 400;
    cb(error, false);
  }
}

export const isStudentLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = getPayload(req);
    const student = await Student.findById(payload.id);
    if (!student) return sendErrorResponse(res, StatusCodes.FORBIDDEN, 'You need to be logged in');
    req.user = student as StudentDocType;
    next();
  } catch (err) {
    console.log(err);
    return sendErrorResponse(res, StatusCodes.FORBIDDEN, 'You need to be logged in');
  }
}

export const isStudentActivated = async (req: Request, res: Response, next: NextFunction) => {
  // if(!req.user || !(req.user as StudentDocType).is_activated?.value) {
  //   return sendErrorResponse(res, StatusCodes.UNAUTHORIZED, 'Please change your password to activate your account');
  // }
  next();
}

export const isAdminLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = getPayload(req);
    const admin = await Admin.findById(payload.id);
    if (!admin) return sendErrorResponse(res, StatusCodes.FORBIDDEN, 'You need to be logged in');
    req.user = admin as AdminDocType;
    next();
  } catch (err) {
    console.log(err);
    return sendErrorResponse(res, StatusCodes.FORBIDDEN, 'You need to be logged in');
  }
}

export const uploadFile = multer({ storage, fileFilter });

function getPayload(req: Request): { id: string } {
  const authItem = req.get("authorization");
  if (!authItem) throw new Error('You need to be logged in');
  const token = authItem.split(' ')[1];
  if (!token) throw new Error('You need to be logged in');
  const payload: any = jwt.verify(token, process.env.SECRET as string, { ignoreExpiration: true });
  return payload;
}