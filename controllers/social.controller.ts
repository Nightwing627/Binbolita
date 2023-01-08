

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const Create = async (req: Request , res: Response) => {
    const { body } = req;
   await prisma.config.create({
        data: {
           facebook_show: body.facebook_show,
           facebook_text: body.facebook_text,
           instagram_show: body.instagram_show,
           instagram_text: body.instagram_text,
           pinterest_show: body.pinterest_show,
           pinterest_text: body.pinterest_text,
           skype_show: body.skype_show,
           skype_text: body.skype_text,
           twitter_show: body.twitter_show,
           twitter_text: body.twitter_text,
           whatsapp_msg: body.whatsapp_msg,
           telegram_show: body.telegram_show,
           telegram_text: body.telegram_text,
           whatsapp_number: body.whatsapp_number.toString(),
           whatsapp_faq_number: body.whatsapp_faq_number.toString(),
           whatsapp_faq_text: body.whatsapp_faq_text,
           text_responsabilidad: body.text_responsabilidad,
           text_terminos_condiciones: body.text_terminos_condiciones,
           whatsapp_footer: body.whatsapp_footer.toString(),
           whatsapp_footer_text: body.whatsapp_footer_text.toString()
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
   await prisma.config.findFirst().then((config) =>{
       res.json(config);
   }).catch((err) =>{
       res.status(500).json(err)
   });
}

export const GetById = async (req: Request , res: Response) => {
    const { id } = req.params;
    await prisma.config.findUnique({
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

    await prisma.config.update({
        data: {
            facebook_show: body.facebook_show,
            facebook_text: body.facebook_text,
            instagram_show: body.instagram_show,
            instagram_text: body.instagram_text,
            pinterest_show: body.pinterest_show,
            pinterest_text: body.pinterest_text,
            skype_show: body.skype_show,
            skype_text: body.skype_text,
            twitter_show: body.twitter_show,
            twitter_text: body.twitter_text,
            whatsapp_msg: body.whatsapp_msg,
            telegram_show: body.telegram_show,
            telegram_text: body.telegram_text,
            whatsapp_number: body.whatsapp_number.toString(),
            whatsapp_faq_number: body.whatsapp_faq_number.toString(),
            whatsapp_faq_text: body.whatsapp_faq_text,
            text_responsabilidad: body.text_responsabilidad,
            text_terminos_condiciones: body.text_terminos_condiciones,
            register_open: body.register_open,
            whatsapp_footer: body.whatsapp_footer.toString(),
            whatsapp_footer_text: body.whatsapp_footer_text
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
    await prisma.config.delete({
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