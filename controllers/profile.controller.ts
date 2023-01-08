

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()


export const Create = async (req: Request , res: Response) => {
    const { body } = req;
   await prisma.profile.create({
        data: {
          description: body.description
        },
    }).then((value) =>{
        res.json({
            message: 'Creado con éxito.'
        })
    }).catch((err) =>{
        res.status(500).json(err);
    })
}

export const GetAll = async (req: Request , res: Response) => {
   await prisma.profile.findMany().then((profiles) =>{
       res.json(profiles)
   }).catch((err) =>{
       res.status(500).json(err)
   });
}

export const GetById = async (req: Request , res: Response) => {
    const { id } = req.params;
    await prisma.profile.findUnique({
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

    await prisma.profile.update({
        data: {
            description: body.description
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
    await prisma.profile.delete({
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