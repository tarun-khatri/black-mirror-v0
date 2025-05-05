import { Request, Response } from 'express';

declare module 'express' {
    export interface Request {
        user?: any;
    }
    export interface Response {
        locals: any;
    }
} 