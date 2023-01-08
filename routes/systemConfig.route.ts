import { Router } from "express";
import { Create, Delete, Edit, GetAll, GetById, Notificaciones } from "../controllers/systemConfig.controller";
import { verifyToken } from "../middleware/jwt";



 const router = Router();

 router.post('/create',verifyToken, Create);
 router.get('/getAll',  GetAll);
 router.get('/getById/:id',  GetById);
 router.put('/edit/:id',verifyToken,  Edit); 
 router.delete('/delete/:id',verifyToken,  Delete); 
 router.get('/notificaciones',verifyToken,  Notificaciones);

 export default router;
