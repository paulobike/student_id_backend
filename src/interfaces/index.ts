import { AdminDocType } from "../models/Admin";
import { StudentDocType } from "../models/Student";


declare global {
  namespace Express {
    interface Request {
      user?: StudentDocType | AdminDocType;
    }
  }
}