
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'
import { Environments } from '../enviroments';
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

export const Login = async(req: Request , res: Response) => {
    const { body } = req;
    await prisma.customer.findFirst({
        where: {
            email: body.email,
            password: Buffer.from(body.password).toString('base64'),
            active: true
        },
        include:{
            pais: true,
            recarga: true,
            retiro: true
        }
    }).then(customer => {
       if(customer){
        const payload = {
            id:  customer?.id 
           };
           const token = jwt.sign(payload, Environments.secret_key, {
            expiresIn: '31d'
           });
           customer.password = Buffer.from(customer.password, 'base64').toString('utf-8');
        res.json({
            token,
            user: customer
        });
       }else{
           res.json({
               token: null,
               user: null
           })
       }
    }).catch(err => { 
         res.status(500).json(err)
    });
}

export const Register = async (req: Request , res: Response) => {
    const { body } = req;
    const registrosOpen = await prisma.config.findFirst();
    if(!registrosOpen?.register_open){
        res.json({
            exitoso: false,
            message: 'No aceptamos mas registros por el momento.'
        });
    }else{
        await prisma.customer.create({
            data: {
             name: body.name,
             lastname: body.lastname,
             birth_date: body.birth_date,
             phone: body.phone,
             email: body.email,
             password: Buffer.from(body.password).toString('base64'),
             image: body.image,
             address: body.address,
             dni: body.dni,
             celular: body.celular != null ? body.celular: body.phone,
             money: body.money != null ? body.money: 0.0,
             pais: {
                connect: {
                    id: parseInt(body.pais_id)
                }
            }
            },
          }).then(() => {
              res.json({
                  exitoso: true,
                  message: 'Registro exitoso.'
              });
          }).catch((err) => {
              res.status(500).json(err);
          })
    }
}

export const GetAll = async (req: Request , res: Response) => {
    await prisma.customer.findMany({
        include: {
           pais: true
        },
        orderBy:{
            id: 'desc'
           }
    }).then((customer) =>{
        res.json(customer)
    }).catch((err) =>{
        res.status(500).json(err)
    });
 }

 
export const GetById = async (req: Request , res: Response) => {
    const { id } = req.params;
    await prisma.customer.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            pais: true
        }
    }).then((value) =>{
        res.json(value)
    }).catch((err) =>{
        res.status(500).json(err);
    })
}

export const GetHistorialById = async (req: Request , res: Response) => {
    const { id } = req.params;
    await prisma.customer.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            Apuesta: {
                orderBy:{
                    date: 'desc'
                }
            },
            recarga: {
                orderBy: {
                    created_at: 'desc'
                }
            },
            retiro: {
                orderBy: {
                    created_at: 'desc'
                }
            }
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

    const customer = await prisma.customer.findUnique({ where: { id: parseInt(id) }})
    if(customer){
        await prisma.customer.update({
            data: {
                name: body.name,
                lastname: body.lastname,
                birth_date: body.birth_date,
                phone: body.phone,
                email: body.email,
                password: customer.password == body.password ? customer.password : Buffer.from(body.password).toString('base64'),
                image: body.image,
                address: body.address,
                dni: body.dni,
                celular: body.celular != null ? body.celular: body.phone,
                money: body.money != null ? body.money: customer.money,
                active: body.active,
                pais: {
                    connect: {
                        id: parseInt(body.pais_id)
                    }
                }
            },
            where: {
                id: parseInt(id)
            }
        }).then((value) =>{
            res.json({
                message: 'Datos actualizados.'
            })
        }).catch((err) =>{
            res.status(500).json(err);
        })
    }else{
        res.json({
            message: 'No se pudieron editar los datos.'
        })
    }
}

export const Delete  = async (req: Request , res: Response) => {
    const { id } = req.params;
    await prisma.customer.delete({
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

export const GetClientCount  = async (req: Request , res: Response) => {
    await prisma.customer.findMany().then((value) =>{
        res.json({
            clientCount: value.length
        })
    }).catch((err) =>{
        res.status(500).json(err);
    })
}

export const PasswordRecovery = async (req: Request , res: Response) => {
    const { body } = req;
    await prisma.customer.findFirst({
        where: {
            email: body.email
        }
    }).then(async(customer) =>{
        if(customer){
            const newPass = RandomPass(6);
            await prisma.customer.update({
                data:{
                    password: Buffer.from(newPass).toString('base64'),
                },
                where: {
                    id: customer.id,
                }
            }).then(() =>{
                const nodemailer = require('nodemailer');
                const transporter = nodemailer.createTransport({
                    host: "vps-2123522-x.dattaweb.com",
                    port: 465,
                    secure: true,
                    auth: {
                        user: 'no-reply@binbolita.com',
                        pass: 'lHT@a6jgQD' // naturally, replace both with your real credentials or an application-specific password
                    }
                });
            
                const mailOptions = {
                from:'"SOPORTE BINBOLITA" <no-reply@binbolita.com>',
                to: `${body.email}`,
                subject: 'Binbolita - Recuperar Clave',
                html: `<h3>Recuperar Clave!</h3>
                        Hola ${customer.name} ${(customer.lastname != null ? customer.lastname: '') }! has intentado recuperar tu clave. Estas son tus nuevas credenciales,
                        puedes cambiarlas cuando quieras desde la App.
                        <br><br>
                        Email: <b>${body.email}</b>
                        <br>
                        Clave: <b>${newPass}</b>
                        <br><br>
                        Muchas Gracias!`
                };
            
                transporter.sendMail(mailOptions, function(error: any, info: { response: string; }){
                if (error) {
                    console.log(error);
                    res.status(500).json(error.response);
                } else {
                    console.log('Email sent: ' + info.response);
                    res.json({
                        message: 'Por favor revise su correo donde recibira su nueva clave.'
                    })
                }
                });
            })
        }
    }).catch((err) =>{
        res.status(500).json(err);
    })


}

const RandomPass = (length: number) => {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}