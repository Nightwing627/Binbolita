

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'
import { SystemDateTime } from '../config/getSystemTime';
const prisma = new PrismaClient()

export const Create = async (req: Request , res: Response) => {
    const { body } = req;
   const date: any = await SystemDateTime();
   await prisma.soporte_mensaje.create({
        data: {
            name: body.name,
            city: body.city,
            cell: body.cell,
            message: body.message,
            email: body.email,
            estado: 'Pendiente',
            created_at: date
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
   await prisma.soporte_mensaje.findMany({
    orderBy:{
        created_at: 'desc'
       }
   }).then((soporte_mensaje) =>{
       res.json(soporte_mensaje);
   }).catch((err) =>{
       res.status(500).json(err)
   });
}

export const GetById = async (req: Request , res: Response) => {
    const { id } = req.params;
    await prisma.soporte_mensaje.findUnique({
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

    await prisma.soporte_mensaje.update({
        data: {
            name: body.name,
            city: body.city,
            cell: body.cell,
            message: body.message,
            email: body.email,
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
    await prisma.soporte_mensaje.delete({
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

export const Reply = async (req: Request , res: Response) => {
    const { body } = req;
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
        host: "vps-2123522-x.dattaweb.com",
        port: 465,
        secure: true,
        auth: {
            user: 'no-reply@binbolita.com',
            pass: 'lHT@a6jgQD'
        }
    });

    const mailOptions = {
    from:'"SOPORTE BINBOLITA" <no-reply@binbolita.com>',
    to: `${body.email}`,
    subject: 'Respuesta contacto Soporte binbolita',
    html: `${body.message}`
    };

    transporter.sendMail(mailOptions, async function(error: any, info: { response: string; }){
    if (error) {
        res.status(500).json(error);
    } else {
        const mensaje:any = await prisma.soporte_mensaje.findUnique({where: {id: parseInt(body.id)}})
        mensaje.estado = 'Respondido'
        await prisma.soporte_mensaje.update({data: mensaje,where: {id: parseInt(body.id)}})
        res.json({
            message: 'Se ha enviado el mensaje de respuesta correctamente'
        })
    }
    });
}