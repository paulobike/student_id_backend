import express, { Router, RouterOptions } from 'express';
import { sendErrorResponse, sendSuccessResponse } from '../utils/sendResponse';
import { AdminController } from '../controllers/AdminController';
import Admin from '../models/Admin';
import Student from '../models/Student';
import { formatStudent } from '../utils/formatStudents';
import { isAdminLoggedIn } from '../middleware';

const routerOptions: RouterOptions = {
  mergeParams: true,
  strict: false,
  caseSensitive: true,
}

const adminRouter: Router = Router(routerOptions);
const adminController = new AdminController(
  sendErrorResponse,
  sendSuccessResponse,
  Admin,
  Student,
  formatStudent
);

/** DO NESTED ROUTING HERE */
adminRouter.post('/login', adminController.login.bind(adminController));

adminRouter.post('/', adminController.registerAdmin.bind(adminController));

adminRouter.post('/student', isAdminLoggedIn, adminController.registerStudent.bind(adminController));

adminRouter.get('/student', isAdminLoggedIn, adminController.getStudents.bind(adminController));

adminRouter.get('/student/:id', isAdminLoggedIn, adminController.getStudent.bind(adminController));

export default adminRouter;