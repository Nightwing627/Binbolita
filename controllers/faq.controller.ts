

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const Create = async (req: Request , res: Response) => {
    const { body } = req;
   await prisma.faq.create({
        data: {
          text: body.text,
          title: body.title,
          orden: parseInt(body.orden),
          juego: {
              connect:  {
                  id: parseInt(body.juego_id)
              }
          }
        },
    }).then((value) =>{
        res.json({
            message: 'Registro guardado con éxito.'
        })
    }).catch((err) =>{
        res.status(500).json(err);
    })
}

export const GetAll = async (req: Request , res: Response) => {
   await prisma.faq.findMany({
    orderBy:{
        juego_id: 'asc'
       },
       include: {
           juego: {
               select: {name: true}
           }
       }
   }).then((faq) =>{
       res.json(faq);
   }).catch((err) =>{
       res.status(500).json(err)
   });
}

export const GetAllByGame = async (req: Request , res: Response) => {
    const { id } = req.params;
    await prisma.faq.findMany({
     orderBy:{
         orden: 'asc'
        },
        where: {
            juego_id: parseInt(id)
        }
    }).then((faq) =>{
        res.json(faq);
    }).catch((err) =>{
        res.status(500).json(err)
    });
 }

export const GetById = async (req: Request , res: Response) => {
    const { id } = req.params;
    await prisma.faq.findUnique({
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

    await prisma.faq.update({
        data: {
            text: body.text,
            title: body.title,
            orden: parseInt(body.orden),
            juego: {
                connect:  {
                    id: parseInt(body.juego_id)
                }
            }
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
    await prisma.faq.delete({
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