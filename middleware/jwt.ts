import { NextFunction,Request, Response } from "express";
import { Environments } from "../enviroments";
const jwt = require("jsonwebtoken");

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    if (token) {

        jwt.verify(token.split(' ')[1], Environments.secret_key, (err: any, decoded: any) => {      
          if (err) {
          return next();
          } else {
            return next();
          }
        });
    } else {
        return next();
    }
};
