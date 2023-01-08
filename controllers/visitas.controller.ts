

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'
import { SystemDateTime } from '../config/getSystemTime';
const prisma = new PrismaClient()

export const Create = async (req: Request , res: Response) => {
    const { body } = req;
    const date: any = await SystemDateTime();
   await prisma.visitas.create({
        data: {
         ip: body.ip,
         fecha: date.split('T')[0]
        },
    }).then((value) =>{
        res.json({
            message: 'Registro Creado con éxito.'
        })
    }).catch((err) =>{
        res.status(500).json(err);
    })
}

export const GetAll = async (req: Request , res: Response) => {
   await prisma.visitas.findFirst({
    orderBy:{
        id: 'desc'
       }
   }).then((visitas) =>{
       res.json(visitas);
   }).catch((err) =>{
       res.status(500).json(err)
   });
}

export const GetTotalVisitas = async (req: Request , res: Response) => {
    await prisma.visitas.findMany().then((visitas) =>{
        res.json(visitas);
    }).catch((err) =>{
        res.status(500).json(err)
    });
 }
 

export const GetById = async (req: Request , res: Response) => {
    const { id } = req.params;
    await prisma.visitas.findUnique({
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

    await prisma.visitas.update({
        data: {
            ip: body.ip,
            fecha: body.fecha
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
    await prisma.visitas.delete({
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