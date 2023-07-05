import { StudentDocType } from "../models/Student";

export const formatStudent = (student: StudentDocType) => ({
  id: student._id,
  email: student.email,
  phone: student.phone,
  firstname: student.firstname,
  lastname: student.lastname,
  reg_number: student.reg_number,
  department: student.department,
  faculty: student.faculty,
  gender: student.gender,
  dob: student.dob,
  is_activated: {
    value: student.is_activated.value,
    date: student.is_activated.date || null,
  },
  passport: student.passport || null,
});

export type FormatStudentType = typeof formatStudent;