import { NextFunction, Request, Response } from "express";
import { SendErrorResponseType, SendSuccessResponseType } from "../utils/sendResponse";
import StatusCodes from "../utils/StatusCodes";
import { BaseController } from "./BaseController";
import jwt from 'jsonwebtoken';
import { AdminModelType } from "../models/Admin";
import { StudentDocType, StudentModelType } from "../models/Student";
import { FormatStudentType } from "../utils/formatStudents";
import { Types } from "mongoose";
import { existsSync, rmSync } from "fs";

export class AdminController extends BaseController {
    Admin: AdminModelType;
    Student: StudentModelType;
    formatStudent: FormatStudentType;

    constructor(
        sendError: SendErrorResponseType,
        sendSuccess: SendSuccessResponseType,
        Admin: AdminModelType,
        Student: StudentModelType,
        formatStudent: FormatStudentType
    ) {
        super(sendError, sendSuccess);
        this.Admin = Admin;
        this.Student = Student;
        this.formatStudent = formatStudent;
    }

    async login(req: Request, res: Response, next: NextFunction) {
        let { login, password } = req.body;
        login = login.trim().toLowerCase();

        if (!login || !password) return this.sendErrorResponse(res, StatusCodes.BAD_REQUEST, "Fields cannot be empty", null);
        try {
            const admin = await this.Admin.findOne({ $or: [{ phone: login }, { email: login }] });
            if (!admin) return this.sendErrorResponse(res, StatusCodes.UNAUTHORIZED, "Invalid credentials", null);

            if (await admin.comparePassword(password) !== true) {
                return this.sendErrorResponse(res, StatusCodes.UNAUTHORIZED, 'Invalid credentials', null);
            }
            const metadata = {
                id: admin._id,
            }
            const token = jwt.sign(metadata, process.env.SECRET as string, { expiresIn: '30d' });

            this.sendSuccessResponse(res, StatusCodes.OK, "Success", { access_token: token });
        } catch (error) {
            console.log(error);
            this.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "An unexpected error occured", null);
        }
    }

    async registerAdmin(req: Request, res: Response, next: NextFunction) {
        const { email, phone, firstname, lastname, password } = req.body;

        if (!email || !password) return this.sendErrorResponse(res, StatusCodes.BAD_REQUEST, "Fields cannot be empty", null);
        try {
            const count = await this.Admin.countDocuments({});

            if (count > 0) return this.sendErrorResponse(res, StatusCodes.NOT_FOUND, "Not found", null);

            const admin = new this.Admin({ email, phone, firstname, lastname, password });
            await admin.save();

            this.sendSuccessResponse(res, StatusCodes.OK, "Operation successful", null);
        } catch (error) {
            console.log(error);
            this.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "An unexpected error occured", null);
        }
    }

    async registerStudent(req: Request, res: Response, next: NextFunction) {
        const { email, phone, firstname, lastname, reg_number, department, gender, faculty, dob } = req.body;

        if (!req.file) return this.sendErrorResponse(res, StatusCodes.BAD_REQUEST, 'No passport photograph was included', null);
        if (!reg_number) {
            if(existsSync(req.file.path)) rmSync(req.file.path);
            return this.sendErrorResponse(res, StatusCodes.BAD_REQUEST, "Reg number cannot be empty", null);
        }
        if (!department) {
            if(existsSync(req.file.path)) rmSync(req.file.path);
            return this.sendErrorResponse(res, StatusCodes.BAD_REQUEST, "Please enter a department", null);
        }
        try {
            const emailCount = await this.Student.countDocuments({ email });
            const phoneCount = await this.Student.countDocuments({ phone });
            const regNumberCount = await this.Student.countDocuments({ reg_number });

            if (emailCount > 0) {
                if(existsSync(req.file.path)) rmSync(req.file.path);
                return this.sendErrorResponse(res, StatusCodes.NOT_FOUND, "A student with the email already exists", null);
            }
            if (phoneCount > 0) {
                if(existsSync(req.file.path)) rmSync(req.file.path);
                return this.sendErrorResponse(res, StatusCodes.NOT_FOUND, "A student with the phone number already exists", null);
            }
            if (regNumberCount > 0) {
                if(existsSync(req.file.path)) rmSync(req.file.path);
                return this.sendErrorResponse(res, StatusCodes.NOT_FOUND, "A student with the reg number already exists", null);
            }
            const passport = '/passports/' + req.file.filename;

            const student = new this.Student({ email, phone, firstname, lastname, reg_number, department, gender, faculty, dob, passport });
            await student.save();

            this.sendSuccessResponse(res, StatusCodes.OK, "Operation successful", { reg_number, department, gender: student.gender });
        } catch (error) {
            console.log(error);
            if(existsSync(req.file.path)) rmSync(req.file.path);
            this.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "An unexpected error occured", null);
        }
    }

    async getStudents(req: Request, res: Response, next: NextFunction) {
        try {
            const students: StudentDocType[] = await this.Student.find({});
            const formattedStudents = students.map(s => ({ ...this.formatStudent(s), create_date: s.createdAt }));
            const response = { students: formattedStudents, count: formattedStudents.length };

            this.sendSuccessResponse(res, StatusCodes.OK, "Operation successful", response);
        } catch (error) {
            console.log(error);
            this.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "An unexpected error occured", null);
        }
    }

    async getStudent(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!Types.ObjectId.isValid(id)) return this.sendErrorResponse(res, StatusCodes.NOT_FOUND, "Student not found", null);
        try {
            const student = await this.Student.findById(id);
            if (!student) return this.sendErrorResponse(res, StatusCodes.NOT_FOUND, "Student not found", null);

            this.sendSuccessResponse(res, StatusCodes.OK, "Operation successful", this.formatStudent(student as StudentDocType));
        } catch (error) {
            console.log(error);
            this.sendErrorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "An unexpected error occured", null);
        }
    }
}