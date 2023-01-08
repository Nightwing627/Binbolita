

import { json, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const ReporteMensual = async (req: Request , res: Response) => {
    const { desde,hasta } = req.params;
    let fecha:any;
    if(desde == hasta) {
        fecha = desde + 'T00:00:00.000Z'
    }else{
        fecha =  {
            gte: desde,
            lt: hasta
       }
    }
   await prisma.apuesta.findMany({
    where: {
            date: fecha
    },
    include:{
        customer: true,
        juego: true
    },
    orderBy:[
        {
            date: 'asc'
        },
        {
            juego_id: 'asc'
        }
    ]
   }).then((apuestas) =>{
       res.json(apuestas)
   }).catch((err) =>{
       res.status(500).json(err)
   });
}

export const ReporteMensualGrafico = async (req: Request , res: Response) => {
    const { desde,hasta } = req.params;
   await prisma.apuesta.groupBy({
       by:['date','juego_id','money'],
    where: {
            date: {
                gte: desde,
                lt: hasta
           }
    },
    orderBy:{
        date: 'asc'
    }
   }).then((apuestas) =>{
       res.json(apuestas)
   }).catch((err) =>{
       res.status(500).json(err)
   });
}

export const ReporteMensualRecargas = async (req: Request , res: Response) => {
    let { desde,hasta } = req.params;
    desde = desde + 'T00:00:00.000Z';
    hasta = hasta + 'T23:59:59.000Z';

    await prisma.recarga.findMany({
        where: {
                created_at: {
                    gte: new Date(desde),
                    lt: new Date(hasta)
               },AND:[
                   {
                       status: 'Aceptado'
                   }
               ]
        },
        include:{
            customer: true,
        },
        orderBy:{
            created_at: 'desc'
        }
       }).then((apuestas) =>{
           res.json(apuestas)
       }).catch((err) =>{
           res.status(500).json(err)
       });
}


export const ReporteMensualPagoGrafico = async (req: Request , res: Response) => {
    const { desde,hasta } = req.params;
   await prisma.apuesta.groupBy({
       by:['date','juego_id','customer_id','totalWon'],
    where: {
            date: {
                gte: desde,
                lt: hasta
           }
    },
    orderBy:{
        date: 'asc'
    }
   }).then((apuestas) =>{
       res.json(apuestas)
   }).catch((err) =>{
       res.status(500).json(err)
   });
}