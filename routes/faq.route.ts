import { Router } from "express";
import { Create, Delete, Edit, GetAll, GetById,GetAllByGame } from "../controllers/faq.controller";
import { verifyToken } from "../middleware/jwt";



 const router = Router();

 router.post('/create',verifyToken, Create);
 router.get('/getAll',  GetAll);
 router.get('/getById/:id',  GetById);
 router.get('/getAllByGame/:id',  GetAllByGame);
 router.put('/edit/:id',verifyToken,  Edit); 
 router.delete('/delete/:id',verifyToken,  Delete); 

 export default router;
