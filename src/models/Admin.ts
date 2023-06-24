import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcrypt';

interface AdminType {
  firstname: string;
  email: string;
  phone: string;
  lastname: string;
  password: string;
}

interface AdminMethodsType {
  comparePassword(password: string): boolean;
}

const adminSchema = new Schema<AdminType>(
  {
    firstname: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    lastname: { type: String, trim: true },
    password: { type: String },
  },
  { timestamps: true }
);

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const hash = await bcrypt.hash(this.password.trim(), 10);
  this.password = hash;
  return next();
});

adminSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

export type AdminDocType = Document<unknown, {}, AdminType> & Omit<AdminType & {
  _id: Types.ObjectId;
  createdAt: string;
  updatedAt: string;
}, keyof AdminMethodsType> & AdminMethodsType;

export interface AdminModelType extends mongoose.Model<AdminType, {}, AdminMethodsType> {

}

export default mongoose.model<
  AdminType,
  AdminModelType
>('ADMIN', adminSchema);