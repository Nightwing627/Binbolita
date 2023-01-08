

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'
import { SystemDateTime } from '../config/getSystemTime';
const prisma = new PrismaClient()

export const Create = async (req: Request , res: Response) => {
    const { body } = req;
    const date: any = await SystemDateTime();
   await prisma.favoritos.create({
        data: {
            nombre: body.nombre,
            numbers: body.numbers,
            created_at: date,
           juego: {
               connect:{
                   id:  parseInt(body.juego_id),
               }
           },
            sorteo: body.sorteo,
            date: body.date,
            customer:{
                connect: {
                    id: parseInt(body.customer_id)
                }
            }
        },
    }).then((value) =>{
        res.json({
            message: 'Apuesta guardada en favoritos.'
        })
    }).catch((err) =>{
        res.status(500).json(err);
    })
}

export const GetAll = async (req: Request , res: Response) => {
   await prisma.favoritos.findMany({
    orderBy:{
        id: 'desc'
       }
   }).then((favoritos) =>{
       res.json(favoritos);
   }).catch((err) =>{
       res.status(500).json(err)
   });
}

export const GetById = async (req: Request , res: Response) => {
    const { id } = req.params;
    await prisma.favoritos.findUnique({
        where: {
            id: parseInt(id)
        }
    }).then((value) =>{
        res.json(value)
    }).catch((err) =>{
        res.status(500).json(err);
    })
}
export const GetByCustomerId = async (req: Request , res: Response) => {
    const { id } = req.params;
    await prisma.favoritos.findMany({
        where: {
            customer_id: parseInt(id)
        },
        orderBy: {
            id: 'desc'
        },
        include:{
            juego: true
        }
    }).then((value) =>{
        res.json(value)
    }).catch((err) =>{
        res.status(500).json(err);
    })
}
export const GetByCustomerAndGame = async (req: Request , res: Response) => {
    const { customer,game } = req.params;
    await prisma.favoritos.findMany({
        where: {
            customer_id: parseInt(customer),
            juego_id: parseInt(game)
        },
        orderBy: {
            id: 'desc'
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

    await prisma.favoritos.update({
        data: {
            nombre: body.nombre,
            numbers: body.numbers,
            juego_id: parseInt(body.juego_id),
            sorteo: body.sorteo,
            date: body.date,
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
    await prisma.favoritos.delete({
        where: {
            id: parseInt(id)
        }
    }).then((value) =>{
        res.json({
            message: 'Se ha eliminado esta apuesta de tus favoritos.'
        })
    }).catch((err) =>{
        res.status(500).json(err);
    })
}