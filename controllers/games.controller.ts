

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const Create = async (req: Request , res: Response) => {
    const { body } = req;
   await prisma.juego.create({
        data: {
            name: body.name,
           banner: body.banner,
           maxNumbers: parseInt(body.maxNumbers),
           maxBetsGlobal: parseInt(body.maxBetsGlobal),
           maxBetsUser: parseInt(body.maxBetsUser),
           multiplicator: parseInt(body.multiplicator),
           premioDiurno: body.premioDiurno != null ? +body.premioDiurno : 0,
           premioNocturno: body.premioNocturno != null ?  +body.premioNocturno : 0,
           maxBetsGame: body.maxBetsGame != null ? parseFloat(body.maxBetsGame): 0.0
        },
    }).then((value) =>{
        res.json({
            message: 'Mensaje a soporte enviado con éxito.'
        })
    }).catch((err) =>{
        res.status(500).json(err);
    })
}

export const GetAll = async (req: Request , res: Response) => {
   await prisma.juego.findMany({
    orderBy:{
        id: 'asc'
       }
   }).then((juego) =>{
       res.json(juego);
   }).catch((err) =>{
       res.status(500).json(err)
   });
}

export const GetById = async (req: Request , res: Response) => {
    const { id } = req.params;
    await prisma.juego.findUnique({
        where: {
            id: parseInt(id)
        }
    }).then((value) =>{
        res.json(value)
    }).catch((err) =>{
        res.status(500).json(err);
    })
}

export const Edit = async (req: Request , res: Response) => {
    const { body } = req;
    const { id } = req.params;

    await prisma.juego.update({
        data: {
            name: body.name,
            banner: body.banner,
            maxNumbers: parseInt(body.maxNumbers),
            maxBetsGlobal: parseInt(body.maxBetsGlobal),
            maxBetsUser: parseInt(body.maxBetsUser),
            multiplicator: parseInt(body.multiplicator),
            premioDiurno: body.premioDiurno != null ? +body.premioDiurno : 0,
            premioNocturno: body.premioNocturno != null ?  +body.premioNocturno : 0,
            active: body.active != null ? body.active : true,
            maxBetsGame: body.maxBetsGame != null ? parseFloat(body.maxBetsGame): 0.0
          },
        where: {
            id: parseInt(id)
        }
    }).then((value) =>{
        res.json({
            message: 'Registro editado con éxito.'
        })
    }).catch((err) =>{
        res.status(500).json(err);
    })
}

export const Delete  = async (req: Request , res: Response) => {
    const { id } = req.params;
    await prisma.juego.delete({
        where: {
            id: parseInt(id)
        }
    }).then((value) =>{
        res.json({
            message: 'Registro eliminado con éxito.'
        })
    }).catch((err) =>{
        res.status(500).json(err);
    })
}