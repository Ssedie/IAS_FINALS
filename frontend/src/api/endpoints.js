import { api } from './client';

export const registerRequest = (body) => api.post('/auth/register/', body);
export const loginRequest = (body) => api.post('/auth/login/', body);
export const getMe = () => api.get('/me/');
export const getBillers = () => api.get('/billers/');
export const getTransactions = () => api.get('/transactions/');
export const cashIn = (amount) => api.post('/wallet/cash-in/', { amount });
export const sendMoney = (body) => api.post('/wallet/send/', body);
export const payBill = (body) => api.post('/wallet/pay-bill/', body);