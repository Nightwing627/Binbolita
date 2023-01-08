

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'
import { SystemDateTime } from '../config/getSystemTime';
const prisma = new PrismaClient()

export const Create = async (req: Request , res: Response) => {
    const { body } = req;
    const date: any = await SystemDateTime();
   await prisma.retiro.create({
        data: {
          money: parseFloat(body.money),
          number: body.number,
          status: 'Pendiente',
          created_at: date,
          customer:{
              connect: {
                  id: parseInt(body.customer_id)
              }
          },
          message: body.message
        },
    }).then(async (value) =>{
        await prisma.customer.findUnique({
            where: {
                id:parseInt(body.customer_id)
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
                    res.json({
                        message: 'Creado con éxito.'
                    })
                }).catch((err) =>{
                    console.log(err);
                })
            }
        }).catch((err) =>{
            console.log(err)
        })
    }).catch((err) =>{
        res.status(500).json(err);
    })
}

export const GetAll = async (req: Request , res: Response) => {
   await prisma.retiro.findMany({
       include: {
           customer: true
       },
       orderBy:{
        created_at: 'desc'
       }
   }).then((retiros) =>{
       res.json(retiros)
   }).catch((err) =>{
       res.status(500).json(err)
   });
}

export const GetById = async (req: Request , res: Response) => {
    const { id } = req.params;
    await prisma.retiro.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            customer: true
        }
    }).then((value) =>{
        res.json(value)
    }).catch((err) =>{
        res.status(500).json(err);
    })
}
export const GetByCustomerId = async (req: Request , res: Response) => {
    const { id } = req.params;
    await prisma.retiro.findMany({
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

export const Edit = async (req: Request , res: Response) => {
    const { body } = req;
    const { id } = req.params;
    let customerData: any = await prisma.customer.findUnique({where: {id:parseInt(body.customer_id)}});
    await prisma.retiro.update({
        data: {
          money: body.money,
          number: body.number,
          status: body.status,
          customer:{
              connect: {
                  id: parseInt(body.customer_id)
              }
          },
          message: body.message
        },
        where: {
            id: parseInt(id)
        }
    }).then(async (value) =>{
        res.json({
            message: 'Registro editado con éxito.'
        })
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
    
        let subject = '';
        let html = '';
        if(body.status == 'Pagado'){
            subject = 'Binbolita - Retiro éxitoso';
            html = `Hola ${customerData.name} ${(customerData.lastname != null ? customerData.lastname: '') }
            <br>
            <br>
            Hemos abonado tu retiro de ($${body.money}) con exito.
            <br>
            Gracias por usar binbolita!.
            `
        }
        if(body.status == 'Cancelado'){
            customerData.money = body.customerMoney;
            await prisma.customer.update({ data: customerData, where:{ id: parseInt(customerData.id)}})
            subject = 'Binbolita - Retiro Rechazado';
            html = `Hola ${customerData.name} ${(customerData.lastname != null ? customerData.lastname: '') }
            <br>
            <br>
            ${body.message != null ? body.message : ''}
            <br><br>
            Gracias por usar binbolita!.
            `
        }
        const mailOptions = {
        from:'"SOPORTE BINBOLITA" <no-reply@binbolita.com>',
        to: `${customerData.email}`,
        subject,
        html
        };
    
        transporter.sendMail(mailOptions, function(error: any, info: { response: string; }){
        if (error) {
            console.log(error);
           
        } else {
            console.log('Email sent: ' + info.response);
        }
        });
    }).catch((err) =>{
        res.status(500).json(err);
    })
}
export const Delete  = async (req: Request , res: Response) => {
    const { id } = req.params;
    await prisma.retiro.delete({
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
