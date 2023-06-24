import { Router, RouterOptions } from 'express';
import { sendErrorResponse, sendSuccessResponse } from '../utils/sendResponse';
import Student from '../models/Student';
import { formatStudent } from '../utils/formatStudents';
import { isStudentActivated, isStudentLoggedIn, uploadFile } from '../middleware';
import { StudentController } from '../controllers/StudentController';

const routerOptions: RouterOptions = {
  mergeParams: true,
  strict: false,
  caseSensitive: true,
}

const studentRouter: Router = Router(routerOptions);
const studentController = new StudentController(
  sendErrorResponse,
  sendSuccessResponse,
  Student,
  formatStudent
);

/** DO NESTED ROUTING HERE */
studentRouter.post('/login', studentController.login.bind(studentController));

studentRouter.post('/activate', isStudentLoggedIn, studentController.activate.bind(studentController));

studentRouter.get('/profile', isStudentLoggedIn, isStudentActivated, studentController.getProfile.bind(studentController));

studentRouter.post('/profile/passport', isStudentLoggedIn, isStudentActivated, uploadFile.single('passport'), studentController.uploadPassport.bind(studentController));

export default studentRouter;