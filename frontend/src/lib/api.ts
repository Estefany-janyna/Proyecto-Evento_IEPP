import axios from 'axios';import { env } from '../config/env';
export const api=axios.create({baseURL:env.apiUrl,timeout:15000,headers:{Accept:'application/json','Content-Type':'application/json'}});
api.interceptors.request.use(c=>{const t=localStorage.getItem('token');if(t)c.headers.Authorization=`Bearer ${t}`;return c;});
