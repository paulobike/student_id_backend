import { NextFunction, Request, Response } from "express";
import { SendErrorResponseType, SendSuccessResponseType } from "../utils/sendResponse";
import StatusCodes from "../utils/StatusCodes";
import { BaseController } from "./BaseController";
import jwt from 'jsonwebtoken';
import { StudentDocType, StudentModelType } from "../models/Student";
import { FormatStudentType } from "../utils/formatStudents";
import { existsSync, rmSync } from "fs";
import path from "path";

export class StudentController extends BaseController {
    Student: StudentModelType;
    formatStudent: FormatStudentType;

    constructor(
        sendError: SendErrorResponseType,
        sendSuccess: SendSuccessResponseType,
        Student: StudentModelType,
        formatStudent: FormatStudentType
    ) {
        super(sendError, sendSuccess);
        this.Student = Student;
        this.formatStudent = formatStudent;
    }

    async login(req: Request, res: Response, next: NextFunction) {
        let { reg_number, password } = req.body;

        if (!reg_number || !password) return this.sendErrorResponse(res, StatusCodes.BAD_REQUEST, "Fields cannot be empty", null);
        reg_number = reg_number.trim().toLowerCase();

        try {
            const student = await this.Student.findOne({ reg_number });
            let additionalMsg = '';
            if (!student) return this.sendErrorResponse(res, StatusCodes.UNAUTHORIZED, "Invalid credentials", null);

            if (student.is_activated.value && await student.comparePassword(password) !== true) {
                return this.sendErrorResponse(res, StatusCodes.UNAUTHORIZED, 'Invalid credentials', null);
            }
            if (!student.is_activated.value) {
                if(password.toLowerCase() != student.lastname.toLowerCase()) {
                    return this.sendErrorResponse(res, StatusCodes.UNAUTHORIZED, 'Invalid credentials', null);
                }
                additionalMsg = ' , please proceed to change your password';
            }
            const metadata = {
                id: student._id,
            }
            const token = jwt.sign(metadata, process.env.SECRET as string, { expiresIn: '30d' });

            this.sendSuccessResponse(res, StatusCodes.OK, "Operation successful" + additionalMsg, { access_token: token });
        } catch (error) {
            this.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "An unexpected error occured", null);
        }
    }

    async activate(req: Request, res: Response, next: NextFunction) {
        const { password } = req.body;
        const student = req.user as StudentDocType;

        if (!password) return this.sendErrorResponse(res, StatusCodes.BAD_REQUEST, "Fields cannot be empty", null);
        try {
            student.password = password;
            student.is_activated = { value: true, date: new Date() };
            await student.save();

            this.sendSuccessResponse(res, StatusCodes.OK, "Operation successful", null);
        } catch (error) {
            this.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "An unexpected error occured", null);
        }
    }

    async getProfile(req: Request, res: Response, next: NextFunction) {
        const student = req.user as StudentDocType;
        if (!student) return this.sendErrorResponse(res, StatusCodes.NOT_FOUND, "Student not found", null);

        this.sendSuccessResponse(res, StatusCodes.OK, "Operation successful", this.formatStudent(student as StudentDocType));
    }

    async uploadPassport(req: Request, res: Response, next: NextFunction) {
        const student = req.user as StudentDocType;
        if (!req.file) return this.sendErrorResponse(res, StatusCodes.BAD_REQUEST, 'No image was specified', null);
        console.log(req.host)
        try {
            const oldPassport = student.passport? path.join(__dirname, '../static', student.passport): null;
            if(oldPassport && existsSync(oldPassport)) rmSync(oldPassport);
            const passport = '/passports/' + req.file.filename;
            student.passport = passport;
            await student.save();

            return this.sendSuccessResponse(res, StatusCodes.OK, `Profile photo successfully!`, { passport });
        } catch (err) {
            console.log(err);
            rmSync(req.file.path);
            this.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Something went wrong', null);
        }
    }
}