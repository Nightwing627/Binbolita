
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'
import { Environments } from '../enviroments';
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

export const Login = async(req: Request , res: Response) => {
    const { body } = req;
    await prisma.administrator.findFirst({
        where: {
            email: body.email,
            password: Buffer.from(body.password).toString('base64'),
            active: true
        }
    }).then(administrator => {
       if(administrator != null){
        const payload = {
            adminId:  administrator?.id 
           };
           const token = jwt.sign(payload, Environments.secret_key, {
            expiresIn: '31d'
           });
        administrator.password = Buffer.from(administrator.password, 'base64').toString('utf-8');
        res.json({
            token,
            user: administrator
        });
       }else{
        res.json({
            token: null,
            user: null
        });
       }      
    }).catch(err => { 
         res.status(500).json(err)
    });
}

export const Register = async (req: Request , res: Response) => {
    const { body } = req;
    await prisma.administrator.create({
        data: {
            email: body.email,
            password: Buffer.from(body.password).toString('base64'),
            name: body.name,
            lastname: body.lastname,
            address: body.address,
            birth_date: body.birth_date,
            dni: body.dni,
            image: body.image,
            phone: body.phone,
            profile: {
                connect:{
                    id:  parseInt(body.profileId)
                }
            },
            pais: {
                connect: {
                    id: body.pais_id,
                }
            },
        },
      }).then(() => {
          res.json({
              message: 'Usuario registrado con éxito'
          });
      }).catch((err) => {
          res.status(500).json(err);
      })
}

export const GetAll = async (req: Request , res: Response) => {
    await prisma.administrator.findMany().then((administrator) =>{
        res.json(administrator)
    }).catch((err) =>{
        res.status(500).json(err)
    });
 }
 export const GetAllByProfile = async (req: Request , res: Response) => {
    const { profileId } = req.params;
    await prisma.administrator.findMany({
        where: {
            profileId: parseInt(profileId)
        },
        orderBy:{
            id: 'desc'
           }
    }).then((administrator) =>{
        res.json(administrator)
    }).catch((err) =>{
        res.status(500).json(err)
    });
 }
 
export const GetById = async (req: Request , res: Response) => {
    const { id } = req.params;
    await prisma.administrator.findUnique({
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

    await prisma.administrator.update({
        data: {
            email: body.email,
            password: Buffer.from(body.password).toString('base64'),
            name: body.name,
            lastname: body.lastname,
            address: body.address,
            birth_date: body.birth_date,
            dni: body.dni,
            image: body.image,
            phone: body.phone,
            profileId: parseInt(body.profileId),
            pais_id: body.pais_id,
            active: body.active
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
    await prisma.administrator.delete({
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

export const GetAdminCount  = async (req: Request , res: Response) => {
    await prisma.administrator.findMany({
        where: {
            profileId: 1
        }
    }).then((value) =>{
        res.json({
            adminCount: value.length
        })
    }).catch((err) =>{
        res.status(500).json(err);
    })
}