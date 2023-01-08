import { Router } from "express";
import {ReporteMensual, ReporteMensualGrafico, ReporteMensualPagoGrafico, ReporteMensualRecargas} from "../controllers/reportes.controller";
import { verifyToken } from "../middleware/jwt";



 const router = Router();


 router.get('/reporteMensual/:desde/:hasta',verifyToken,  ReporteMensual);
 router.get('/reporteMensualRecargas/:desde/:hasta',verifyToken,  ReporteMensualRecargas);
 router.get('/reporteMensualGrafico/:desde/:hasta',verifyToken,  ReporteMensualGrafico);
 router.get('/reporteMensualPagoGrafico/:desde/:hasta',verifyToken,  ReporteMensualPagoGrafico);

 export default router;