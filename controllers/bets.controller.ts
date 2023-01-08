
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'
import { CierreDiurno, CierreNocturno, SystemDateTime } from '../config/getSystemTime';
import { calcularParles, groupAndSum, totalParles, totalParlesDinero } from '../utils/juegos.utils';
const prisma = new PrismaClient()

export const Create = async (req: Request, res: Response) => {
    const { body } = req;
    // reviso el max por numero global del juego apostar
    const game: any = await prisma.juego.findUnique({ where: { id: parseInt(body.juego_id) } })
    if (game) {
        const customer: any = await prisma.customer.findUnique({ where: { id: parseInt(body.customer_id) } });
        const totalApuesta = body.money
        const customerMoney = Number(customer.money)
        if (parseFloat(customerMoney.toString()) <= 0) {
            res.status(405).json({
                message: 'No tiene saldo suficiente para realizar la apuesta, puede recargar saldo haciendo click en el botón "RECARGAR" para abonar saldo a su cuenta.'
            });
        } else if (parseFloat(totalApuesta) > parseFloat(customerMoney.toString())) {
            res.status(405).json({
                message: 'No tiene saldo suficiente para realizar la apuesta, puede recargar saldo haciendo click en el botón "RECARGAR" para abonar saldo a su cuenta.'
            });
        } else {
            const sorteoCerrado = await prisma.sorteo.findMany({ where: { AND: [{ date: body.date, type: body.sorteo }] } });
            if (sorteoCerrado && sorteoCerrado.length > 0) {
                res.status(405).json({
                    message: 'El sorteo se encuentra cerrado, No está permitido más apuestas para este turno en el día de hoy, favor escoja otra fecha de apuesta.'
                })
            } else {
                const hoy: any = await SystemDateTime();
                const fechaApuesta = body.date.split('T')[0];
                const cierreDiruno = await CierreDiurno();
                const cierreNocturno: boolean = await CierreNocturno();
                if(hoy.split('T')[0] === fechaApuesta && body.sorteo == 'Diurno' && cierreDiruno){
                    res.status(405).json({
                        message: 'El sorteo se encuentra cerrado, No está permitido más apuestas para este turno en el día de hoy, favor escoja otra fecha de apuesta.'
                    })
                }else if(hoy.split('T')[0] === fechaApuesta && body.sorteo == 'Nocturno' && cierreNocturno){
                    res.status(405).json({
                        message: 'El sorteo se encuentra cerrado, No está permitido más apuestas para este turno en el día de hoy, favor escoja otra fecha de apuesta.'
                    })
                }else{
                    if(game.id != 5){
                        validarJuegos(game,body,res);
                    }else{
                        validarParle(game,body,res,totalApuesta);
                    }
                }
            }
        }
    } else {
        res.status(500).json({
            message: 'La apuesta es invalida, favor intentarlo nuevamente.'
        });
    }

}

const validarJuegos = async (game: any, body: any, res: any) => {
    const maxGlobal = game.maxBetsGlobal || 0;
    const maxUser = game.maxBetsUser || 0;
    const apuestaUser = JSON.parse(body.numbers);
    // busco todas las apuestas del usuario en la fecha
    const apuestasUserTotal = await prisma.apuesta.findMany({ where: { AND: [{ date: body.date }, { customer_id: parseInt(body.customer_id) }, { sorteo: body.sorteo }, { juego_id: parseInt(body.juego_id)}] } });
    let numerosUser: any = [];
    let resultUser = sumarApuestas(apuestasUserTotal) || [];
    if (resultUser && resultUser.length > 0) {
        for (let total of resultUser) {
            const indexApuesta = apuestaUser.findIndex((n: any) => n.numero == total.numero)
            if (indexApuesta != -1) {
                const totalSuma = (+apuestaUser[indexApuesta].dinero) + (+total.dinero)
                if (totalSuma > maxUser) {
                    numerosUser.push(apuestaUser[indexApuesta].numero)
                }else if(parseInt(body.juego_id) == 6){
                    numerosUser.push(apuestaUser[indexApuesta].numero)
                }
            }
        }
        if (numerosUser.length > 0) {
            let numeroJoin = numerosUser.length > 1 ? numerosUser.join(',') : numerosUser.join('')
            res.status(405).json({
                message: 'Se ha superado el máximo de apuestas para el número ' + numeroJoin + ' en esa fecha, cambie de apuesta para seguir jugando.'
            })
        } else {
            const apuestasGlobal = await prisma.apuesta.findMany({ where: { AND: [{ date: body.date }, { sorteo: body.sorteo }, { juego_id: parseInt(body.juego_id)}] } });
            let resultGlobal: any = sumarApuestas(apuestasGlobal) || [];
            numerosUser = [];
            if (resultGlobal && resultGlobal.length > 0) {
                for (let total of resultGlobal) {
                    const indexApuesta = apuestaUser.findIndex((n: any) => n.numero == total.numero)
                    if (indexApuesta != -1) {
                        const totalSuma = (+apuestaUser[indexApuesta].dinero) + (+total.dinero)
                        if (totalSuma > maxGlobal) {
                            numerosUser.push(apuestaUser[indexApuesta].numero)
                        }
                    }
                }
                if (numerosUser && numerosUser.length > 0) {
                    let numeroJoin = numerosUser.length > 1 ? numerosUser.join(',') : numerosUser.join('')
                    res.status(405).json({
                        message: 'Se ha superado el máximo de apuestas global para el número ' + numeroJoin + ' en esa fecha, cambie de apuesta para seguir jugando.'
                    })
                } else {
                    guardarApuesta(body, res);

                }

            } else {
                guardarApuesta(body, res);
            }
        }
    } else {
        const apuestasGlobal = await prisma.apuesta.findMany({ where: { AND: [{ date: body.date }, { sorteo: body.sorteo }, { juego_id: parseInt(body.juego_id)}] } });
        let resultGlobal: any = sumarApuestas(apuestasGlobal) || [];
        numerosUser = [];
        if (resultGlobal && resultGlobal.length > 0) {
            for (let total of resultGlobal) {
                const indexApuesta = apuestaUser.findIndex((n: any) => n.numero == total.numero)
                if (indexApuesta != -1) {
                    const totalSuma = (+apuestaUser[indexApuesta].dinero) + (+total.dinero)
                    if (totalSuma > maxGlobal) {
                        numerosUser.push(apuestaUser[indexApuesta].numero)
                    }
                }
            }
            if (numerosUser && numerosUser.length > 0) {
                let numeroJoin = numerosUser.length > 1 ? numerosUser.join(',') : numerosUser.join('')
                res.status(405).json({
                    message: 'Se ha superado el máximo de apuestas global para el número ' + numeroJoin + ' en esa fecha, cambie de apuesta para seguir jugando.'
                })
            } else {
                guardarApuesta(body, res);

            }

        } else {
            guardarApuesta(body, res);
        }
    }
}

const validarParle = async (game: any, body: any, res: any, totalApuesta: any) => {
    const maxGlobal = game.maxBetsGlobal || 0;
    const maxParle = parseFloat(game.maxBetsGame.toString()) || 0.0;
    const apuestaUser = JSON.parse(body.numbers);
    const apuestasUserTotal = await prisma.apuesta.findMany({ where: { AND: [{ date: body.date }, { customer_id: parseInt(body.customer_id) }, { sorteo: body.sorteo }, { juego_id: parseInt(body.juego_id) }] } });
    let numerosUser: any = [];
    const apuestasGlobal = await prisma.apuesta.findMany({ where: { AND: [{ date: body.date }, { sorteo: body.sorteo }, { juego_id: parseInt(body.juego_id) }] } });
    let parleIndividual: any = [];
    let parlesGlobal: any = [];
    let parlesUser: any = totalParles(apuestaUser[0].numero, totalApuesta)
    for (let aInd of apuestasUserTotal) {
        const parle = totalParles(JSON.parse(aInd.numbers || '')[0].numero, aInd.money);
        parleIndividual = [...parleIndividual, ...parle]
    }
    parleIndividual = groupAndSum(parleIndividual);
    if (parleIndividual && parleIndividual.length > 0) {
        for(let pUser of parlesUser){
            for (let total of parleIndividual) {
                if (pUser.parle ==  total.parle) {
                    const totalSuma = pUser.dinero + total.dinero
                    if (totalSuma > maxParle) {
                        numerosUser.push(pUser.parle)
                    }
                }else if(pUser.parle ==  (total.parle.split(' ')[1]+' ' + total.parle.split(' ')[0])) {
                    const totalSuma = pUser.dinero + total.dinero
                    if (totalSuma > maxParle) {
                        numerosUser.push(pUser.parle)
                    }
                }
            }
        }
        if (numerosUser && numerosUser.length > 0) {
            let numeroJoin = numerosUser.length > 1 ? numerosUser.join(',') : numerosUser.join('')
            res.status(405).json({
                message: 'Se ha superado el máximo de apuestas para el parle ' + numeroJoin + ', cambie de apuesta para seguir jugando.'
            })
        } else {
            for (let apuesta of apuestasGlobal) {
                const parle = totalParles(JSON.parse(apuesta.numbers || '')[0].numero, apuesta.money);
                parlesGlobal = [...parlesGlobal, ...parle]
            }
            parlesGlobal = groupAndSum(parlesGlobal);
            if (parlesGlobal && parlesGlobal.length > 0) {
                for(let pUser of parlesUser){
                    for (let total of parlesGlobal) {
                        if (pUser.parle ==  total.parle) {
                            const totalSuma = pUser.dinero + total.dinero
                            if (totalSuma > maxGlobal) {
                                numerosUser.push(pUser.parle)
                            }
                        }else if(pUser.parle ==  (total.parle.split(' ')[1]+' ' + total.parle.split(' ')[0])) {
                            const totalSuma = pUser.dinero + total.dinero
                            if (totalSuma > maxGlobal) {
                                numerosUser.push(pUser.parle)
                            }
                        }
                    }
                }
                if (numerosUser && numerosUser.length > 0) {
                    let numeroJoin = numerosUser.length > 1 ? numerosUser.join(',') : numerosUser.join('')
                    res.status(405).json({
                        message: 'Se ha superado el máximo de apuestas global para el número ' + numeroJoin + ' en esa fecha, cambie de apuesta para seguir jugando.'
                    })
                } else {
                    guardarApuesta(body, res);

                }
            } else {
                guardarApuesta(body, res);
            }
        }
    } else if (parleIndividual == 0) {
        const indexApuesta = parlesUser.filter((n: any) => n.dinero > maxParle)
        if (indexApuesta.length > 0) {
            for (let a of indexApuesta) {
                numerosUser.push(a.parle)
            }
        }
        if (numerosUser && numerosUser.length > 0) {
            let numeroJoin = numerosUser.length > 1 ? numerosUser.join(',') : numerosUser.join('')
            res.status(405).json({
                message: 'Se ha superado el máximo de apuestas para el parle ' + numeroJoin + ', cambie de apuesta para seguir jugando.'
            })
        } else {
            for (let apuesta of apuestasGlobal) {
                const parle = totalParles(JSON.parse(apuesta.numbers || '')[0].numero, apuesta.money);
                parlesGlobal = [...parlesGlobal, ...parle]
            }
            parlesGlobal = groupAndSum(parlesGlobal);
            if (parlesGlobal && parlesGlobal.length > 0) {
                for(let pUser of parlesUser){
                    for (let total of parlesGlobal) {
                        if (pUser.parle ==  total.parle) {
                            const totalSuma = pUser.dinero + total.dinero
                            if (totalSuma > maxGlobal) {
                                numerosUser.push(pUser.parle)
                            }
                        }else if(pUser.parle ==  (total.parle.split(' ')[1]+' ' + total.parle.split(' ')[0])) {
                            const totalSuma = pUser.dinero + total.dinero
                            if (totalSuma > maxGlobal) {
                                numerosUser.push(pUser.parle)
                            }
                        }
                    }
                }
                if (numerosUser && numerosUser.length > 0) {
                    let numeroJoin = numerosUser.length > 1 ? numerosUser.join(',') : numerosUser.join('')
                    res.status(405).json({
                        message: 'Se ha superado el máximo de apuestas global para el número ' + numeroJoin + ' en esa fecha, cambie de apuesta para seguir jugando.'
                    })
                } else {
                    guardarApuesta(body, res);

                }
            } else {
                guardarApuesta(body, res);
            }
        }
    } else {
        for (let apuesta of apuestasGlobal) {
            const parle = totalParles(JSON.parse(apuesta.numbers || '')[0].numero, apuesta.money);
            parlesGlobal = [...parlesGlobal, ...parle]
        }
        parlesGlobal = groupAndSum(parlesGlobal);
        if (parlesGlobal && parlesGlobal.length > 0) {
            for(let pUser of parlesUser){
                for (let total of parlesGlobal) {
                    if (pUser.parle ==  total.parle) {
                        const totalSuma = pUser.dinero + total.dinero
                        if (totalSuma > maxGlobal) {
                            numerosUser.push(pUser.parle)
                        }
                    }else if(pUser.parle ==  (total.parle.split(' ')[1]+' ' + total.parle.split(' ')[0])) {
                        const totalSuma = pUser.dinero + total.dinero
                        if (totalSuma > maxGlobal) {
                            numerosUser.push(pUser.parle)
                        }
                    }
                }
            }
            if (numerosUser && numerosUser.length > 0) {
                let numeroJoin = numerosUser.length > 1 ? numerosUser.join(',') : numerosUser.join('')
                res.status(405).json({
                    message: 'Se ha superado el máximo de apuestas global para el número ' + numeroJoin + ' en esa fecha, cambie de apuesta para seguir jugando.'
                })
            } else {
                guardarApuesta(body, res);

            }
        } else {
            guardarApuesta(body, res);
        }
    }
}



const guardarApuesta = async (body: any, res: Response) => {
    const date: any = await SystemDateTime();
    await prisma.apuesta.create({
        data: {
            date: body.date,
            numbers: body.numbers,
            sorteo: body.sorteo,
            money: body.money,
            created_at: date,
            juego: {
                connect: {
                    id: parseInt(body.juego_id)
                }
            },
            customer: {
                connect: {
                    id: parseInt(body.customer_id)
                }
            }
        },
    }).then(async (value) => {
        const usuario = await prisma.customer.findUnique({ where: { id: parseInt(body.customer_id) } });
        let restaMoney: any;
        if (usuario) {
            restaMoney = Number.parseFloat(usuario.money as any) - Number.parseFloat(body.money);
            usuario.money = restaMoney;
            await prisma.customer.update({
                data: usuario,
                where: {
                    id: usuario.id
                }
            }).then(() => {
                res.json({
                    message: 'Su apuesta ha sido ingresada con éxito.'
                })
            }).catch(() => {
                res.status(500).json({
                    message: 'La apuesta es invalida, favor intentarlo nuevamente.'
                });
            })
        }
    }).catch((err) => {
        res.status(500).json(err);
    })

}
const sumarApuestas = (apuestas: any) => {
    const totalApuestas: any = [];
    if (apuestas && apuestas.length > 0) {
        for (let i = 0; i < apuestas.length; i++) {
            // uno todas las apuestas en un objeto para sacar el total mas tarde
            const numeros = JSON.parse(apuestas[i].numbers as string);
            for (let num of numeros) {
                totalApuestas.push({
                    numero: num.numero,
                    dinero: parseFloat(num.dinero)
                })
            }
        }
        // tengo todas las apuestas ahora sumo los totales por cada numero
        var temp: any = {};
        var obj: any = null;
        for (var i = 0; i < totalApuestas.length; i++) {
            obj = totalApuestas[i];
            if (!temp[obj.numero]) {
                temp[obj.numero] = obj;
            } else {
                temp[obj.numero].dinero += obj.dinero;
            }
        }
        var result = [];
        for (var prop in temp) {
            result.push(temp[prop]);
        }
        return result;
    }
}


export const GetAll = async (req: Request, res: Response) => {
    await prisma.apuesta.findMany({
        orderBy: {
            date: 'desc'
        },
        include: {
            customer: true,
            juego: true
        }
    }).then((apuesta) => {
        res.json(apuesta);
    }).catch((err) => {
        res.status(500).json(err)
    });
}

export const GetAllByDate = async (req: Request, res: Response) => {
    const { fecha } = req.params;
    await prisma.apuesta.findMany({
        where: {
            date: fecha
        },
        include: {
            customer: true,
            juego: true
        },
        orderBy: {
            date: 'desc'
        }
    }).then((apuestas) => {
        res.json(apuestas)
    }).catch((err) => {
        res.status(500).json(err)
    });
}

export const GetUsersBetsByDate = async (req: Request, res: Response) => {
    const { fecha, game } = req.params;
    await prisma.apuesta.findMany({
        where: {
            date: fecha,
            juego_id: parseInt(game)
        },
        include: {
            customer: true,
            juego: true
        },
        orderBy: {
            id: 'desc'
        }
    }).then((apuestas) => {
        res.json(apuestas)
    }).catch((err) => {
        res.status(500).json(err)
    });
}



export const GetById = async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.apuesta.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            customer: true,
            juego: true
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

    await prisma.apuesta.update({
        data: {
            date: body.date,
            numbers: body.numbers,
            sorteo: body.sorteo,
            money: body.money,
            totalWon: body.totalWon,
            estado: body.estado,
            juego: {
                connect: {
                    id: parseInt(body.juego_id)
                }
            },
            customer: {
                connect: {
                    id: parseInt(body.customer_id)
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
    await prisma.apuesta.delete({
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
export const GetUserBets = async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.apuesta.findMany({
        where: {
            customer_id: parseInt(id)
        },
        include: {
            juego: true
        },
        orderBy: {
            created_at: 'desc'
        },
        distinct: ['id']
    }).then((value) => {
        res.json(value)
    }).catch((err) => {
        res.status(500).json(err);
    })
}

