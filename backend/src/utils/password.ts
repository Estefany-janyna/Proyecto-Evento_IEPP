import bcrypt from 'bcryptjs';export const hashPassword=(v:string)=>bcrypt.hash(v,12);export const verifyPassword=(v:string,h:string)=>bcrypt.compare(v,h);
