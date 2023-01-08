

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const Create = async (req: Request , res: Response) => {
    const { body } = req;
   await prisma.system.create({
        data: {
          horario_sistema: body.horario_sistema,
          cierre_diurno: body.cierre_diurno,
          cierre_nocturno: body.cierre_nocturno
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
   await prisma.system.findFirst({
    orderBy:{
        id: 'desc'
       }
   }).then((system) =>{
       res.json(system);
   }).catch((err) =>{
       res.status(500).json(err)
   });
}

export const GetById = async (req: Request , res: Response) => {
    const { id } = req.params;
    await prisma.system.findUnique({
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

    await prisma.system.update({
        data: {
            horario_sistema: body.horario_sistema,
          cierre_diurno: body.cierre_diurno,
          cierre_nocturno: body.cierre_nocturno
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
    await prisma.system.delete({
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

export const Notificaciones = async (req: Request , res: Response) => {
    const cantMensajes = await prisma.soporte_mensaje.count({where: { estado: 'Pendiente'}});
    const cantRetiros = await prisma.retiro.count({where: { status: 'Pendiente'}});
    res.json({
        MsgCount: cantMensajes,
        MsgPayour: cantRetiros
    });
}