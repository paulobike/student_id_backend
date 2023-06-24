import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcrypt';

interface StudentType {
  firstname: string;
  email: string;
  phone: string;
  lastname: string;
  password: string;
  reg_number: string;
  department: string;
  department_code: string;
  department_num: string;
  level: number;
  passport: string;
  is_activated: {
    value: boolean;
    date: Date;
  };
}

interface StudentMethodsType {
  comparePassword(password: string): boolean;
}

const studentSchema = new Schema<StudentType>(
  {
    firstname: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    lastname: { type: String, trim: true },
    password: { type: String },
    reg_number: { type: String, lowercase: true },
    department: { type: String, trim: true, lowercase: true },
    department_code: { type: String, trim: true, uppercase: true },
    department_num: { type: String, trim: true },
    level: { type: Number, default: 100 },
    passport: { type: String },
    is_activated: {
      value: { type: Boolean, default: false },
      date: { type: Date }
    }
  },
  { timestamps: true }
);

studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const hash = await bcrypt.hash(this.password.trim(), 10);
  this.password = hash;
  return next();
});

studentSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

export type StudentDocType = Document<unknown, {}, StudentType> & Omit<StudentType & {
  _id: Types.ObjectId;
  createdAt: string;
  updatedAt: string;
}, keyof StudentMethodsType> & StudentMethodsType;

export interface StudentModelType extends mongoose.Model<StudentType, {}, StudentMethodsType> {

}

export default mongoose.model<
  StudentType,
  StudentModelType
>('STUDENT', studentSchema);