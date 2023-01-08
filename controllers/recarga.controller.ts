

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'
import { SystemDateTime } from '../config/getSystemTime';
const prisma = new PrismaClient()

export const Create = async (req: Request , res: Response) => {
    const { body } = req;
    const date: any = await SystemDateTime();
   await prisma.recarga.create({
        data: {
          money: body.money,
          number: body.number,
          status: 'Pendiente',
          created_at: date,
          customer:{
              connect: {
                  id: parseInt(body.customer_id)
              }
          }
        },
    }).then((value) =>{
        res.json({
            message: 'Creado con éxito.'
        })
    }).catch((err) =>{
        res.status(500).json(err);
    })
}

export const GetByCustomerId = async (req: Request , res: Response) => {
    const { id } = req.params;
    await prisma.recarga.findMany({
        where: {
            customer_id: parseInt(id)
        },
        orderBy: {
            created_at: 'desc'
        }
    }).then((value) =>{
        res.json(value)
    }).catch((err) =>{
        res.status(500).json(err);
    })
}


export const GetAll = async (req: Request , res: Response) => {
   await prisma.recarga.findMany({
       include:{
           customer: true
       },
       orderBy:{
        created_at: 'desc'
       }
   }).then((recargas) =>{
       res.json(recargas)
   }).catch((err) =>{
       res.status(500).json(err)
   });
}

export const GetById = async (req: Request , res: Response) => {
    const { id } = req.params;
    await prisma.recarga.findUnique({
        where: {
            id: parseInt(id)
        },
        include:{
            customer: true
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
    if(body.status == 'Aceptado'){
        await prisma.customer.findUnique({
            where: {
                id: parseInt(body.customer_id)
            }
        }).then(async(customer) =>{
            if(customer){
                await prisma.customer.update({
                    data: {
                        name: customer.name,
                        lastname: customer.lastname,
                        birth_date: customer.birth_date,
                        phone: customer.phone,
                        email: customer.email,
                        image: customer.image,
                        address: customer.address,
                        dni: customer.dni,
                        celular: customer.celular,
                        money: body.customerMoney
                    },
                    where: {
                        id:parseInt(body.customer_id)
                    }
                }).then((value) =>{
                    console.log(value);
                }).catch((err) =>{
                    console.log(err);
                })
            }
        }).catch((err) =>{
            console.log(err)
        })
    }
    await prisma.recarga.update({
        data: {
          money: body.money,
          number: body.number,
          status: body.status,
          customer:{
              connect: {
                  id: parseInt(body.customer_id)
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
    await prisma.recarga.delete({
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