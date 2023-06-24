import { StudentDocType } from "../models/Student";

export const formatStudent = (student: StudentDocType) => ({
  id: student._id,
  email: student.email,
  phone: student.phone,
  firstname: student.firstname,
  lastname: student.lastname,
  reg_number: student.reg_number,
  department: student.department,
  level: student.level,
  department_code: student.department_code,
  department_num: student.department_num,
  is_activated: {
    value: student.is_activated.value,
    date: student.is_activated.date || null,
  },
  passport: student.passport || null,
});

export type FormatStudentType = typeof formatStudent;