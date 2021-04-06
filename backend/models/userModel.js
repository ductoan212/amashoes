import mongoose from 'mongoose';

const userShema = new mongoose.Schema(
  {
    name: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    isAdmin: { type: String, default: false, require: true },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userShema);
export default User;
