import { Router } from "express";
import { Create, Delete, Edit, GetAll, GetById, GetTotalVisitas } from "../controllers/visitas.controller";
import { verifyToken } from "../middleware/jwt";



 const router = Router();

 router.post('/create',  Create);
 router.get('/getAll',  GetAll);
 router.get('/getTotalVisitas',  GetTotalVisitas);
 router.get('/getById/:id',  GetById);
 router.put('/edit/:id',verifyToken, Edit); 
 router.delete('/delete/:id',verifyToken,  Delete); 

 export default router;
