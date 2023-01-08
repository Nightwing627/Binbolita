
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();
const moment = require('moment-timezone');
export const SystemDateTime = async () =>{
 return new Promise(async (resolve,reject) =>{
    await prisma.system.findFirst().then((horario) =>{
        const horaServer = moment().tz('America/Argentina/Buenos_Aires').add(horario?.horario_sistema,'hours').format('YYYY-MM-DDTHH:mm:ss') + '.000Z';
        resolve(horaServer as any);
    }).catch(() =>{
        const horaServer = moment().tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DDTHH:mm:ss') + '.000Z';
        resolve(horaServer as any);
    });
 })
}

export const CierreDiurno = async () =>{
    return new Promise<boolean>(async (resolve,reject) =>{
       await prisma.system.findFirst().then(async (horario) =>{
           let cierre = await calcularCierre(horario?.cierre_diurno,horario?.horario_sistema)
           resolve(cierre);
       }).catch(() =>{
           resolve(false);
       });
    })
}
export const CierreNocturno = async () =>{
    return new Promise<boolean>(async (resolve,reject) =>{
        await prisma.system.findFirst().then(async (horario) =>{
            let cierre = await calcularCierre(horario?.cierre_nocturno,horario?.horario_sistema)
            resolve(cierre);
        }).catch(() =>{
            resolve(false);
        });
    })
}

export const calcularCierre = (cierre: any, horario_sistem_bets: any) => {
   return new Promise<boolean>((resolve, reject) =>{
    const hora_sistema = moment.tz('America/Argentina/Buenos_Aires').add(horario_sistem_bets, 'hours').format('HH:mm:ss').toString();
    const hora_cierre = cierre + ':00';
    var start = moment('2018-05-16 ' + hora_sistema);
    var end = moment('2018-05-16 ' + hora_cierre);
    let diff = end.diff(start);
    let f = moment.utc(diff).format("HH:mm:ss");
    if (f < hora_cierre) {
      resolve(false);
    } else {
      resolve(true)
    }
   })
}