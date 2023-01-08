

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'
import { SystemDateTime } from '../config/getSystemTime';
import moment from 'moment';
import { calcularParles, totalParlesDinero } from '../utils/juegos.utils';
const prisma = new PrismaClient()

export const Create = async (req: Request, res: Response) => {
    const { body } = req;
    await prisma.sorteo.findFirst({
        where: {
            AND: [
                { status: 'Activo' }, {
                    date: body.date,
                    type: body.type
                }]
        },
    }).then(async (item) => {
        if (item) {
            await prisma.sorteo.update({
                data: {
                    status: 'Reemplazado',
                },
                where: {
                    id: item.id
                }
            }).then(async (value) => {
                const numerosFull = item.number;
                const numA1 = numerosFull[1] + '' +numerosFull[2];
                const numA2 = numerosFull[3] + '' +numerosFull[4]
                const numA3= numerosFull[5] + '' +numerosFull[6];
                let numerosAGanadores:any = [];
                numerosAGanadores.push(numA1);
                numerosAGanadores.push(numA2);
                numerosAGanadores.push(numA3);
                const ganadores: any = await Ganadores(numerosAGanadores, item.date, item.type,numerosFull)
                if (ganadores.length > 0) {
                    for (let i = 0; i < ganadores.length; i++) {
                        const apuestaGanadora = await prisma.apuesta.findUnique({ where: { id: ganadores[i] } })
                        if (apuestaGanadora) {
                            apuestaGanadora.totalWon = null;
                            apuestaGanadora.estado = "No Ganado";
                            try {
                                await prisma.apuesta.update({ data: apuestaGanadora, where: { id: ganadores[i] } });
                            } catch (err) {
                            }
                        }
                    }
                }
                const date: any = await SystemDateTime();
                await prisma.sorteo.create({
                    data: {
                        number: body.number,
                        status: 'Activo',
                        type: body.type,
                        date: body.date,
                        created_at: date,
                        administrator: {
                            connect: {
                                id: parseInt(body.administratorId)
                            }
                        }
                    },
                }).then(async (value) => {
                    try {
                        const numerosFull = body.number;
                        const num1 = numerosFull[1] + '' +numerosFull[2];
                        const num2 = numerosFull[3] + '' +numerosFull[4]
                        const num3= numerosFull[5] + '' +numerosFull[6];
                        let numerosGanadores:any = [];
                        numerosGanadores.push(num1);
                        numerosGanadores.push(num2);
                        numerosGanadores.push(num3);
                        const ganadores: any = await Ganadores(numerosGanadores, body.date, body.type,numerosFull)
                        if (ganadores.length > 0) {
                            for (let i = 0; i < ganadores.length; i++) {
                                const apuestaGanadora = await prisma.apuesta.findUnique({ where: { id: ganadores[i] } })
                                let ganadoresBinbolita = 0;
                                for (let x = 0; x < ganadores.length; x++) {
                                    const apuestaGanadora = await prisma.apuesta.findUnique({ where: { id: ganadores[x] } })
                                    if(apuestaGanadora?.juego_id == 6){
                                        ganadoresBinbolita += 1;
                                    }
                                }
                                if (apuestaGanadora) {
                                    const multiplicador = await prisma.juego.findUnique({ where: { id: apuestaGanadora.juego_id || 1 } })
                                    if(apuestaGanadora.juego_id == 1){
                                    const indexGanador = JSON.parse(apuestaGanadora.numbers || '').findIndex((n: any) => n.numero == numerosGanadores[0])
                                    const ganado = (parseFloat(JSON.parse(apuestaGanadora.numbers || '')[indexGanador].dinero || '0')) * (multiplicador?.multiplicator || 0)
                                    const apuestasResumen = JSON.parse(apuestaGanadora.numbers || '');
                                    apuestasResumen[indexGanador]['ganado'] = ganado;
                                    apuestaGanadora.totalWon = ganado.toString();
                                    apuestaGanadora.estado = "Pendiente Pago";
                                    apuestaGanadora.resultado = JSON.stringify(apuestasResumen);
                                    }else if(apuestaGanadora.juego_id == 2){
                                        let ganado = 0;
                                        const apuestasResumen = JSON.parse(apuestaGanadora.numbers || '');
                                        for(let i = 0; i < numerosGanadores.length; i++){
                                            const indexGanador = JSON.parse(apuestaGanadora.numbers || '').findIndex((n: any) => n.numero == numerosGanadores[i])
                                            if(indexGanador != -1){
                                                ganado += (parseFloat(JSON.parse(apuestaGanadora.numbers || '')[indexGanador].dinero || 0)) * (multiplicador?.multiplicator || 0)
                                                if(apuestasResumen[indexGanador]['ganado']){
                                                    apuestasResumen[indexGanador]['ganado'] = ganado.toFixed(2);
                                                }else{
                                                    apuestasResumen[indexGanador]['ganado'] = (parseFloat(JSON.parse(apuestaGanadora.numbers || '')[indexGanador].dinero || 0)) * (multiplicador?.multiplicator || 0);
                                                }
                                            }
                                        }
                                        apuestaGanadora.resultado = JSON.stringify(apuestasResumen);
                                        apuestaGanadora.totalWon = ganado.toFixed(2).toString();
                                        apuestaGanadora.estado = "Pendiente Pago";
                                    }else if(apuestaGanadora.juego_id == 3){
                                        let ganado = 0;
                                        const indexGanador = JSON.parse(apuestaGanadora.numbers || '').findIndex((n: any) => n.numero == numerosFull.substr(0,3))
                                        const apuestasResumen = JSON.parse(apuestaGanadora.numbers || '');
                                        if(indexGanador != -1){
                                            ganado += (parseFloat(JSON.parse(apuestaGanadora.numbers || '')[indexGanador].dinero || 0)) * (multiplicador?.multiplicator || 0)
                                            apuestasResumen[indexGanador]['ganado'] = ganado.toFixed(2);
                                            apuestaGanadora.resultado = JSON.stringify(apuestasResumen);
                                        }
                                        apuestaGanadora.totalWon = ganado.toFixed(2).toString();
                                        apuestaGanadora.estado = "Pendiente Pago";
                                    }else if(apuestaGanadora.juego_id == 4){
                                        let ganado = 0;
                                        const apuestasResumen = JSON.parse(apuestaGanadora.numbers || '');
                                        const combi1 = numerosFull[0] + '' + numerosFull[1]+ '' + numerosFull[2];
                                        const combi2 = numerosFull[0] + '' + numerosFull[3]+ '' + numerosFull[4];
                                        const combi3 = numerosFull[0] + '' + numerosFull[5]+ '' + numerosFull[6];
                                        let numerosGanadores4 = [combi1,combi2,combi3]
                                        for(let i = 0; i < numerosGanadores4.length; i++){
                                            const indexGanador = JSON.parse(apuestaGanadora.numbers || '').findIndex((n: any) => n.numero == numerosGanadores4[i])
                                            if(indexGanador != -1){
                                                ganado += (parseFloat(JSON.parse(apuestaGanadora.numbers || '')[indexGanador].dinero || 0)) * (multiplicador?.multiplicator || 0)
                                                if(apuestasResumen[indexGanador]['ganado']){
                                                    apuestasResumen[indexGanador]['ganado'] = ganado.toFixed(2);
                                                }else{
                                                    apuestasResumen[indexGanador]['ganado'] = (parseFloat(JSON.parse(apuestaGanadora.numbers || '')[indexGanador].dinero || 0)) * (multiplicador?.multiplicator || 0);
                                                }
                                            }
                                        }
                                        apuestaGanadora.resultado = JSON.stringify(apuestasResumen);
                                        apuestaGanadora.totalWon = ganado.toFixed(2).toString();
                                        apuestaGanadora.estado = "Pendiente Pago";
                                    }else if(apuestaGanadora.juego_id == 5){
                                        let ganado = 0;
                                        const pagados:any = [];
                                        const apuestasResumen = JSON.parse(apuestaGanadora.numbers || '');
                                        const pApostados = totalParlesDinero(apuestasResumen[0].numero,apuestasResumen[0].dinero);
                                        const parle1 = numerosFull[1] + '' + numerosFull[2] +' '+ numerosFull[3] + '' + numerosFull[4];
                                        const parle2 = numerosFull[1] + '' + numerosFull[2]  +' '+ numerosFull[5] + '' + numerosFull[6];
                                        const parle3 = numerosFull[3] + '' + numerosFull[4] +' '+ numerosFull[5] + '' + numerosFull[6];
                                       let numerosGanadores5 = [parle1, parle2, parle3];
                                        for(let a = 0; a < pApostados.parles.length; a++){
                                            for(let i = 0; i < numerosGanadores5.length; i++){
                                               if(pApostados.parles[a] == numerosGanadores5[i]){
                                                   pagados.push(pApostados.parles[a]);
                                               }else if(pApostados.parles[a] == numerosGanadores5[i].split(' ')[1] + ' ' +  numerosGanadores5[i].split(' ')[0]){
                                                    pagados.push(pApostados.parles[a]);
                                               }
                                            }
                                        }
                                       
                                        for(let p of pagados){
                                            ganado += pApostados.dinero *  (multiplicador?.multiplicator || 0);
                                            if(apuestasResumen[0]['ganado']){
                                                apuestasResumen[0]['ganado'] = ganado.toFixed(2);
                                            }else{
                                                apuestasResumen[0]['ganado'] = pApostados.dinero *  (multiplicador?.multiplicator || 0);
                                            }
                                        }
                                        apuestaGanadora.resultado = JSON.stringify(apuestasResumen);
                                        apuestaGanadora.totalWon = ganado.toFixed(2).toString();
                                        apuestaGanadora.estado = "Pendiente Pago";
                                    }else if(apuestaGanadora.juego_id == 6){
                                        const premio = apuestaGanadora.sorteo == 'DIURNO' ? multiplicador?.premioDiurno : multiplicador?.premioNocturno;
                                        const indexGanador = JSON.parse(apuestaGanadora.numbers || '').findIndex((n: any) => n.numero == numerosFull.substr(1,6))
                                        const ganado = ((parseFloat(JSON.parse(apuestaGanadora.numbers || '')[indexGanador].dinero || '0')) * (premio || 0)) / ganadoresBinbolita;
                                        const apuestasResumen = JSON.parse(apuestaGanadora.numbers || '');
                                        apuestasResumen[indexGanador]['ganado'] = ganado.toFixed(2);
                                        apuestaGanadora.totalWon = ganado.toFixed(2).toString();
                                        apuestaGanadora.estado = "Pendiente Pago";
                                        apuestaGanadora.resultado = JSON.stringify(apuestasResumen);
                                    }
                                    try {
                                        await prisma.apuesta.update({ data: apuestaGanadora, where: { id: ganadores[i] } });
                                    } catch (err) {
                                        res.json({
                                            message: 'Creado con éxito.'
                                        })
                                    }
                                }
                            }
                        }
                        res.json({
                            message: 'Creado con éxito.'
                        })
                    } catch (err) {
                        res.json({
                            message: 'Creado con éxito.'
                        })
                    }
                }).catch((err) => {
                    console.log(err)

                    res.status(500).json(err);
                })
            }).catch(async (err) => {
                const date: any = await SystemDateTime();
                await prisma.sorteo.create({
                    data: {
                        number: body.number,
                        status: 'Activo',
                        type: body.type,
                        date: body.date,
                        created_at: date,
                        administrator: {
                            connect: {
                                id: parseInt(body.administratorId)
                            }
                        }
                    },
                }).then(async (value) => {
                    try {
                        const numerosFull = body.number;
                        const num1 = numerosFull[1] + '' +numerosFull[2];
                        const num2 = numerosFull[3] + '' +numerosFull[4]
                        const num3= numerosFull[5] + '' +numerosFull[6];
                        let numerosGanadores:any = [];
                        numerosGanadores.push(num1);
                        numerosGanadores.push(num2);
                        numerosGanadores.push(num3);
                        const ganadores: any = await Ganadores(numerosGanadores, body.date, body.type,numerosFull)
                        if (ganadores.length > 0) {
                            for (let i = 0; i < ganadores.length; i++) {
                                const apuestaGanadora = await prisma.apuesta.findUnique({ where: { id: ganadores[i] } })
                                let ganadoresBinbolita = 0;
                                for (let x = 0; x < ganadores.length; x++) {
                                    const apuestaGanadora = await prisma.apuesta.findUnique({ where: { id: ganadores[x] } })
                                    if(apuestaGanadora?.juego_id == 6){
                                        ganadoresBinbolita += 1;
                                    }
                                }
                                if (apuestaGanadora) {
                                    const multiplicador = await prisma.juego.findUnique({ where: { id: apuestaGanadora.juego_id || 1 } })
                                    if(apuestaGanadora.juego_id == 1){
                                    const indexGanador = JSON.parse(apuestaGanadora.numbers || '').findIndex((n: any) => n.numero == numerosGanadores[0])
                                    const ganado = (parseFloat(JSON.parse(apuestaGanadora.numbers || '')[indexGanador].dinero || '0')) * (multiplicador?.multiplicator || 0)
                                    const apuestasResumen = JSON.parse(apuestaGanadora.numbers || '');
                                    apuestasResumen[indexGanador]['ganado'] = ganado;
                                    apuestaGanadora.totalWon = ganado.toString();
                                    apuestaGanadora.estado = "Pendiente Pago";
                                    apuestaGanadora.resultado = JSON.stringify(apuestasResumen);
                                    }else if(apuestaGanadora.juego_id == 2){
                                        let ganado = 0;
                                        const apuestasResumen = JSON.parse(apuestaGanadora.numbers || '');
                                        for(let i = 0; i < numerosGanadores.length; i++){
                                            const indexGanador = JSON.parse(apuestaGanadora.numbers || '').findIndex((n: any) => n.numero == numerosGanadores[i])
                                            if(indexGanador != -1){
                                                ganado += (parseFloat(JSON.parse(apuestaGanadora.numbers || '')[indexGanador].dinero || 0)) * (multiplicador?.multiplicator || 0)
                                                if(apuestasResumen[indexGanador]['ganado']){
                                                    apuestasResumen[indexGanador]['ganado'] = ganado.toFixed(2);
                                                }else{
                                                    apuestasResumen[indexGanador]['ganado'] = (parseFloat(JSON.parse(apuestaGanadora.numbers || '')[indexGanador].dinero || 0)) * (multiplicador?.multiplicator || 0);
                                                }
                                            }
                                        }
                                        apuestaGanadora.resultado = JSON.stringify(apuestasResumen);
                                        apuestaGanadora.totalWon = ganado.toFixed(2).toString();
                                        apuestaGanadora.estado = "Pendiente Pago";
                                    }else if(apuestaGanadora.juego_id == 3){
                                        let ganado = 0;
                                        const indexGanador = JSON.parse(apuestaGanadora.numbers || '').findIndex((n: any) => n.numero == numerosFull.substr(0,3))
                                        const apuestasResumen = JSON.parse(apuestaGanadora.numbers || '');
                                        if(indexGanador != -1){
                                            ganado += (parseFloat(JSON.parse(apuestaGanadora.numbers || '')[indexGanador].dinero || 0)) * (multiplicador?.multiplicator || 0)
                                            apuestasResumen[indexGanador]['ganado'] = ganado.toFixed(2);
                                            apuestaGanadora.resultado = JSON.stringify(apuestasResumen);
                                        }
                                        apuestaGanadora.totalWon = ganado.toFixed(2).toString();
                                        apuestaGanadora.estado = "Pendiente Pago";
                                    }else if(apuestaGanadora.juego_id == 4){
                                        let ganado = 0;
                                        const apuestasResumen = JSON.parse(apuestaGanadora.numbers || '');
                                        const combi1 = numerosFull[0] + '' + numerosFull[1]+ '' + numerosFull[2];
                                        const combi2 = numerosFull[0] + '' + numerosFull[3]+ '' + numerosFull[4];
                                        const combi3 = numerosFull[0] + '' + numerosFull[5]+ '' + numerosFull[6];
                                        let numerosGanadores4 = [combi1,combi2,combi3]
                                        for(let i = 0; i < numerosGanadores4.length; i++){
                                            const indexGanador = JSON.parse(apuestaGanadora.numbers || '').findIndex((n: any) => n.numero == numerosGanadores4[i])
                                            if(indexGanador != -1){
                                                ganado += (parseFloat(JSON.parse(apuestaGanadora.numbers || '')[indexGanador].dinero || 0)) * (multiplicador?.multiplicator || 0)
                                                if(apuestasResumen[indexGanador]['ganado']){
                                                    apuestasResumen[indexGanador]['ganado'] = ganado.toFixed(2);
                                                }else{
                                                    apuestasResumen[indexGanador]['ganado'] = (parseFloat(JSON.parse(apuestaGanadora.numbers || '')[indexGanador].dinero || 0)) * (multiplicador?.multiplicator || 0);
                                                }
                                            }
                                        }
                                        apuestaGanadora.resultado = JSON.stringify(apuestasResumen);
                                        apuestaGanadora.totalWon = ganado.toFixed(2).toString();
                                        apuestaGanadora.estado = "Pendiente Pago";
                                    }else if(apuestaGanadora.juego_id == 5){
                                        let ganado = 0;
                                        const pagados:any = [];
                                        const apuestasResumen = JSON.parse(apuestaGanadora.numbers || '');
                                        const pApostados = totalParlesDinero(apuestasResumen[0].numero,apuestasResumen[0].dinero);
                                        const parle1 = numerosFull[1] + '' + numerosFull[2] +' '+ numerosFull[3] + '' + numerosFull[4];
                                        const parle2 = numerosFull[1] + '' + numerosFull[2]  +' '+ numerosFull[5] + '' + numerosFull[6];
                                        const parle3 = numerosFull[3] + '' + numerosFull[4] +' '+ numerosFull[5] + '' + numerosFull[6];
                                       let numerosGanadores5 = [parle1, parle2, parle3];
                                        for(let a = 0; a < pApostados.parles.length; a++){
                                            for(let i = 0; i < numerosGanadores5.length; i++){
                                               if(pApostados.parles[a] == numerosGanadores5[i]){
                                                   pagados.push(pApostados.parles[a]);
                                               }else if(pApostados.parles[a] == numerosGanadores5[i].split(' ')[1] + ' ' +  numerosGanadores5[i].split(' ')[0]){
                                                    pagados.push(pApostados.parles[a]);
                                               }
                                            }
                                        }
                                       
                                        for(let p of pagados){
                                            ganado += pApostados.dinero *  (multiplicador?.multiplicator || 0);
                                            if(apuestasResumen[0]['ganado']){
                                                apuestasResumen[0]['ganado'] = ganado.toFixed(2);
                                            }else{
                                                apuestasResumen[0]['ganado'] = pApostados.dinero *  (multiplicador?.multiplicator || 0);
                                            }
                                        }
                                        apuestaGanadora.resultado = JSON.stringify(apuestasResumen);
                                        apuestaGanadora.totalWon = ganado.toFixed(2).toString();
                                        apuestaGanadora.estado = "Pendiente Pago";
                                    }else if(apuestaGanadora.juego_id == 6){
                                        const premio = apuestaGanadora.sorteo == 'DIURNO' ? multiplicador?.premioDiurno : multiplicador?.premioNocturno;
                                        const indexGanador = JSON.parse(apuestaGanadora.numbers || '').findIndex((n: any) => n.numero == numerosFull.substr(1,6))
                                        const ganado = ((parseFloat(JSON.parse(apuestaGanadora.numbers || '')[indexGanador].dinero || '0')) * (premio || 0)) / ganadoresBinbolita;
                                        const apuestasResumen = JSON.parse(apuestaGanadora.numbers || '');
                                        apuestasResumen[indexGanador]['ganado'] = ganado.toFixed(2);
                                        apuestaGanadora.totalWon = ganado.toFixed(2).toString();
                                        apuestaGanadora.estado = "Pendiente Pago";
                                        apuestaGanadora.resultado = JSON.stringify(apuestasResumen);
                                    }
                                    try {
                                        await prisma.apuesta.update({ data: apuestaGanadora, where: { id: ganadores[i] } });
                                    } catch (err) {
                                        res.json({
                                            message: 'Creado con éxito.'
                                        })
                                    }
                                }
                            }
                        }
                        res.json({
                            message: 'Creado con éxito.'
                        })
                    } catch (err) {
                        res.json({
                            message: 'Creado con éxito.'
                        })
                    }
                }).catch((err) => {
                    console.log(err)

                    res.status(500).json(err);
                })
            })
        } else {
            const date: any = await SystemDateTime();
            await prisma.sorteo.create({
                data: {
                    number: body.number,
                    status: 'Activo',
                    type: body.type,
                    date: body.date,
                    created_at: date,
                    administrator: {
                        connect: {
                            id: parseInt(body.administratorId)
                        }
                    }
                },
            }).then(async (item) => {
                try {
                       const numerosFull = body.number;
                        const num1 = numerosFull[1] + '' +numerosFull[2];
                        const num2 = numerosFull[3] + '' +numerosFull[4]
                        const num3= numerosFull[5] + '' +numerosFull[6];
                        let numerosGanadores:any = [];
                        numerosGanadores.push(num1);
                        numerosGanadores.push(num2);
                        numerosGanadores.push(num3);
                        const ganadores: any = await Ganadores(numerosGanadores, body.date, body.type,numerosFull)
                        if (ganadores.length > 0) {
                            for (let i = 0; i < ganadores.length; i++) {
                                const apuestaGanadora = await prisma.apuesta.findUnique({ where: { id: ganadores[i] } })
                                let ganadoresBinbolita = 0;
                                for (let x = 0; x < ganadores.length; x++) {
                                    const apuestaGanadora = await prisma.apuesta.findUnique({ where: { id: ganadores[x] } })
                                    if(apuestaGanadora?.juego_id == 6){
                                        ganadoresBinbolita += 1;
                                    }
                                }
                                if (apuestaGanadora) {
                                    const multiplicador = await prisma.juego.findUnique({ where: { id: apuestaGanadora.juego_id || 1 } })
                                    if(apuestaGanadora.juego_id == 1){
                                    const indexGanador = JSON.parse(apuestaGanadora.numbers || '').findIndex((n: any) => n.numero == numerosGanadores[0])
                                    const ganado = (parseFloat(JSON.parse(apuestaGanadora.numbers || '')[indexGanador].dinero || '0')) * (multiplicador?.multiplicator || 0)
                                    const apuestasResumen = JSON.parse(apuestaGanadora.numbers || '');
                                    apuestasResumen[indexGanador]['ganado'] = ganado;
                                    apuestaGanadora.totalWon = ganado.toString();
                                    apuestaGanadora.estado = "Pendiente Pago";
                                    apuestaGanadora.resultado = JSON.stringify(apuestasResumen);
                                    }else if(apuestaGanadora.juego_id == 2){
                                        let ganado = 0;
                                        const apuestasResumen = JSON.parse(apuestaGanadora.numbers || '');
                                        for(let i = 0; i < numerosGanadores.length; i++){
                                            const indexGanador = JSON.parse(apuestaGanadora.numbers || '').findIndex((n: any) => n.numero == numerosGanadores[i])
                                            if(indexGanador != -1){
                                                ganado += (parseFloat(JSON.parse(apuestaGanadora.numbers || '')[indexGanador].dinero || 0)) * (multiplicador?.multiplicator || 0)
                                                if(apuestasResumen[indexGanador]['ganado']){
                                                    apuestasResumen[indexGanador]['ganado'] = ganado.toFixed(2);
                                                }else{
                                                    apuestasResumen[indexGanador]['ganado'] = (parseFloat(JSON.parse(apuestaGanadora.numbers || '')[indexGanador].dinero || 0)) * (multiplicador?.multiplicator || 0);
                                                }
                                            }
                                        }
                                        apuestaGanadora.resultado = JSON.stringify(apuestasResumen);
                                        apuestaGanadora.totalWon = ganado.toFixed(2).toString();
                                        apuestaGanadora.estado = "Pendiente Pago";
                                    }else if(apuestaGanadora.juego_id == 3){
                                        let ganado = 0;
                                        const indexGanador = JSON.parse(apuestaGanadora.numbers || '').findIndex((n: any) => n.numero == numerosFull.substr(0,3))
                                        const apuestasResumen = JSON.parse(apuestaGanadora.numbers || '');
                                        if(indexGanador != -1){
                                            ganado += (parseFloat(JSON.parse(apuestaGanadora.numbers || '')[indexGanador].dinero || 0)) * (multiplicador?.multiplicator || 0)
                                            apuestasResumen[indexGanador]['ganado'] = ganado.toFixed(2);
                                            apuestaGanadora.resultado = JSON.stringify(apuestasResumen);
                                        }
                                        apuestaGanadora.totalWon = ganado.toFixed(2).toString();
                                        apuestaGanadora.estado = "Pendiente Pago";
                                    }else if(apuestaGanadora.juego_id == 4){
                                        let ganado = 0;
                                        const apuestasResumen = JSON.parse(apuestaGanadora.numbers || '');
                                        const combi1 = numerosFull[0] + '' + numerosFull[1]+ '' + numerosFull[2];
                                        const combi2 = numerosFull[0] + '' + numerosFull[3]+ '' + numerosFull[4];
                                        const combi3 = numerosFull[0] + '' + numerosFull[5]+ '' + numerosFull[6];
                                        let numerosGanadores4 = [combi1,combi2,combi3]
                                        for(let i = 0; i < numerosGanadores4.length; i++){
                                            const indexGanador = JSON.parse(apuestaGanadora.numbers || '').findIndex((n: any) => n.numero == numerosGanadores4[i])
                                            if(indexGanador != -1){
                                                ganado += (parseFloat(JSON.parse(apuestaGanadora.numbers || '')[indexGanador].dinero || 0)) * (multiplicador?.multiplicator || 0)
                                                if(apuestasResumen[indexGanador]['ganado']){
                                                    apuestasResumen[indexGanador]['ganado'] = ganado.toFixed(2);
                                                }else{
                                                    apuestasResumen[indexGanador]['ganado'] = (parseFloat(JSON.parse(apuestaGanadora.numbers || '')[indexGanador].dinero || 0)) * (multiplicador?.multiplicator || 0);
                                                }
                                            }
                                        }
                                        apuestaGanadora.resultado = JSON.stringify(apuestasResumen);
                                        apuestaGanadora.totalWon = ganado.toFixed(2).toString();
                                        apuestaGanadora.estado = "Pendiente Pago";
                                    }else if(apuestaGanadora.juego_id == 5){
                                        let ganado = 0;
                                        const pagados:any = [];
                                        const apuestasResumen = JSON.parse(apuestaGanadora.numbers || '');
                                        const pApostados = totalParlesDinero(apuestasResumen[0].numero,apuestasResumen[0].dinero);
                                        const parle1 = numerosFull[1] + '' + numerosFull[2] +' '+ numerosFull[3] + '' + numerosFull[4];
                                        const parle2 = numerosFull[1] + '' + numerosFull[2]  +' '+ numerosFull[5] + '' + numerosFull[6];
                                        const parle3 = numerosFull[3] + '' + numerosFull[4] +' '+ numerosFull[5] + '' + numerosFull[6];
                                       let numerosGanadores5 = [parle1, parle2, parle3];
                                        for(let a = 0; a < pApostados.parles.length; a++){
                                            for(let i = 0; i < numerosGanadores5.length; i++){
                                               if(pApostados.parles[a] == numerosGanadores5[i]){
                                                   pagados.push(pApostados.parles[a]);
                                               }else if(pApostados.parles[a] == numerosGanadores5[i].split(' ')[1] + ' ' +  numerosGanadores5[i].split(' ')[0]){
                                                    pagados.push(pApostados.parles[a]);
                                               }
                                            }
                                        }
                                       
                                        for(let p of pagados){
                                            ganado += pApostados.dinero *  (multiplicador?.multiplicator || 0);
                                            if(apuestasResumen[0]['ganado']){
                                                apuestasResumen[0]['ganado'] = ganado.toFixed(2);
                                            }else{
                                                apuestasResumen[0]['ganado'] = pApostados.dinero *  (multiplicador?.multiplicator || 0);
                                            }
                                        }
                                        apuestaGanadora.resultado = JSON.stringify(apuestasResumen);
                                        apuestaGanadora.totalWon = ganado.toFixed(2).toString();
                                        apuestaGanadora.estado = "Pendiente Pago";
                                    }else if(apuestaGanadora.juego_id == 6){
                                        const premio = apuestaGanadora.sorteo == 'DIURNO' ? multiplicador?.premioDiurno : multiplicador?.premioNocturno;
                                        const indexGanador = JSON.parse(apuestaGanadora.numbers || '').findIndex((n: any) => n.numero == numerosFull.substr(1,6))
                                        const ganado = ((parseFloat(JSON.parse(apuestaGanadora.numbers || '')[indexGanador].dinero || '0')) * (premio || 0)) / ganadoresBinbolita;
                                        const apuestasResumen = JSON.parse(apuestaGanadora.numbers || '');
                                        apuestasResumen[indexGanador]['ganado'] = ganado.toFixed(2);
                                        apuestaGanadora.totalWon = ganado.toFixed(2).toString();
                                        apuestaGanadora.estado = "Pendiente Pago";
                                        apuestaGanadora.resultado = JSON.stringify(apuestasResumen);
                                    }
                                    try {
                                        await prisma.apuesta.update({ data: apuestaGanadora, where: { id: ganadores[i] } });
                                    } catch (err) {
                                        res.json({
                                            message: 'Creado con éxito.'
                                        })
                                    }
                                }
                            }
                        }
                        res.json({
                            message: 'Creado con éxito.'
                        })
                } catch (err) {
                    res.json({
                        message: 'Creado con éxito.'
                    })
                }
            }).catch((err) => {
                res.status(500).json(err);
            })
        }
    }).catch((err) => {
        console.log(err)

        res.status(500).json(err)
    })
}

const Ganadores = (numeros: any, fecha: any, tipo: any, numerosFull: any) => {
    return new Promise(async (resolve, reject) => {
        const ganadores: any = [];
        const bets = await prisma.apuesta.findMany(
            {
                where: {
                    AND: [
                        {
                            date: fecha,
                            sorteo: tipo
                        }
                    ]
                }
            })
        if (bets && bets.length > 0) {
            for (let i = 0; i < bets.length; i++) {
                const nApostados = JSON.parse(bets[i].numbers as any);
                if(bets[i].juego_id == 1){
                    let nGandor = numerosFull[1] + '' +numerosFull[2];
                    for (let n of nApostados) {
                        if (n.numero == nGandor) {
                            if(ganadores.length > 0){
                                const index = ganadores.findIndex((g: any) => g == bets[i].id );
                                if(index == -1){
                                    ganadores.push(bets[i].id);
                                }
                            }else{
                                ganadores.push(bets[i].id);
                            }
                        }
                     }
                }else if(bets[i].juego_id == 2){
                    const num1 = numerosFull[1] + '' +numerosFull[2];
                    const num2 = numerosFull[3] + '' +numerosFull[4]
                    const num3= numerosFull[5] + '' +numerosFull[6];
                    let nGandor =  [num1, num2, num3];
                    for (let n of nApostados) {
                        for(let nu of nGandor){
                            if (n.numero == nu) {
                                if(ganadores.length > 0){
                                    const index = ganadores.findIndex((g: any) => g == bets[i].id );
                                    if(index == -1){
                                        ganadores.push(bets[i].id);
                                    }
                                }else{
                                    ganadores.push(bets[i].id);
                                }
                            }
                        }
                    }
                }else if(bets[i].juego_id == 3){
                    for (let n of nApostados) {
                        const centena = numerosFull[0] + '' +numerosFull[1] + '' +numerosFull[2];
                        if (n.numero == centena) {
                            if(ganadores.length > 0){
                                const index = ganadores.findIndex((g: any) => g == bets[i].id );
                                if(index == -1){
                                    ganadores.push(bets[i].id);
                                }
                            }else{
                                ganadores.push(bets[i].id);
                            }
                        }
                     }
                }else if(bets[i].juego_id == 4){
                    const combi1 = numerosFull[0] + '' + numerosFull[1]+ '' + numerosFull[2];
                    const combi2 = numerosFull[0] + '' + numerosFull[3]+ '' + numerosFull[4];
                    const combi3 = numerosFull[0] + '' + numerosFull[5]+ '' + numerosFull[6];
                    numeros = [combi1,combi2,combi3]
                    for (let n of nApostados) {
                        for(let nu of numeros){
                            if (n.numero == nu) {
                                if(ganadores.length > 0){
                                    const index = ganadores.findIndex((g: any) => g == bets[i].id );
                                    if(index == -1){
                                        ganadores.push(bets[i].id);
                                    }
                                }else{
                                    ganadores.push(bets[i].id);
                                }
                            }
                        }
                     }
                }else if(bets[i].juego_id == 5){
                    const parle1 = numerosFull[1] + '' + numerosFull[2] +' '+ numerosFull[3] + '' + numerosFull[4];
                    const parle2 = numerosFull[1] + '' + numerosFull[2]  +' '+ numerosFull[5] + '' + numerosFull[6];
                    const parle3 = numerosFull[3] + '' + numerosFull[4] +' '+ numerosFull[5] + '' + numerosFull[6];
                    let nGandor = [parle1, parle2, parle3];
                    const pApostados = calcularParles(nApostados[0].numero);
                    for (let n of pApostados) {
                        for(let nu of nGandor){
                            if (n == nu) {
                                if(ganadores.length > 0){
                                    const index = ganadores.findIndex((g: any) => g == bets[i].id );
                                    if(index == -1){
                                        ganadores.push(bets[i].id);
                                    }
                                }else{
                                    ganadores.push(bets[i].id);
                                }
                            }else if (n == (nu.split(' ')[1] + ' ' + nu.split(' ')[0])) {
                                if(ganadores.length > 0){
                                    const index = ganadores.findIndex((g: any) => g == bets[i].id );
                                    if(index == -1){
                                        ganadores.push(bets[i].id);
                                    }
                                }else{
                                    ganadores.push(bets[i].id);
                                }
                            }
                        }
                    }
                }else if(bets[i].juego_id == 6){
                    let nGandor = numerosFull[1] + '' + numerosFull[2]+ '' + numerosFull[3] + '' +numerosFull[4] + '' + numerosFull[5]+ '' + numerosFull[6];
                    for (let n of nApostados) {
                        if (n.numero == nGandor) {
                            if(ganadores.length > 0){
                                const index = ganadores.findIndex((g: any) => g == bets[i].id );
                                if(index == -1){
                                    ganadores.push(bets[i].id);
                                }
                            }else{
                                ganadores.push(bets[i].id);
                            }
                        }
                     }
                }
            }
            resolve(ganadores);
        } else {
            resolve(ganadores);

        }
    })

}


export const GetAll = async (req: Request, res: Response) => {
    await prisma.sorteo.findMany({
        orderBy: [{
            date: 'desc',
        }, {
            status: 'asc'
        }]
    }).then((sorteos) => {
        res.json(sorteos)
    }).catch((err) => {
        res.status(500).json(err)
    });
}

export const GetAllByDate = async (req: Request, res: Response) => {
    const { fecha } = req.params;
    await prisma.sorteo.findMany({
        where: {
            AND: {
                date: new Date(fecha.split('T')[0]),
                status: 'Activo'
            }
        }
    }).then((sorteos) => {
        res.json(sorteos)
    }).catch((err) => {
        res.status(500).json(err)
    });
}

export const GetYesterday = async (req: Request, res: Response) => {
    let hoy = moment().format('YYYY-MM-DD').toString() + 'T00:00:00.000Z';
    await prisma.sorteo.findMany({
        where: {
            AND: {
                date: new Date(hoy.split('T')[0]),
                status: 'Activo'
            }
        }
    }).then((sorteos) => {
        res.json(sorteos)
    }).catch((err) => {
        res.status(500).json(err)
    });
}




export const GetById = async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.sorteo.findUnique({
        where: {
            id: parseInt(id)
        }
    }).then((value) => {
        res.json(value)
    }).catch((err) => {
        res.status(500).json(err);
    })
}

export const Edit = async (req: Request, res: Response) => {
    const { body } = req;
    const { id } = req.params;

    await prisma.sorteo.update({
        data: {
            number: body.number,
            status: body.status,
            type: body.type,
            date: body.date,
            administrator: {
                connect: {
                    id: parseInt(body.administratorId)
                }
            }
        },
        where: {
            id: parseInt(id)
        }
    }).then((value) => {
        res.json({
            message: 'Registro editado con éxito.'
        })
    }).catch((err) => {
        res.status(500).json(err);
    })
}
export const Delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.sorteo.delete({
        where: {
            id: parseInt(id)
        }
    }).then((value) => {
        res.json({
            message: 'Registro eliminado con éxito.'
        })
    }).catch((err) => {
        res.status(500).json(err);
    })
}
export const GetByDate = async (req: Request, res: Response) => {
    const { fecha } = req.params;
    await prisma.sorteo.findMany({
        where: {
            AND: {
                date: new Date(fecha.split('T')[0]),
                status: 'Activo'
            }
        }
    }).then((sorteos) => {
        res.json(sorteos)
    }).catch((err) => {
        res.status(500).json(err)
    });
}