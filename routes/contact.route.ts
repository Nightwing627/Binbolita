import { Router } from "express";
import { Create, Delete, Edit, GetAll, GetById, Reply } from "../controllers/contact.controller";
import { verifyToken } from "../middleware/jwt";



 const router = Router();

 router.post('/create', Create);
 router.post('/reply',verifyToken, Reply);
 router.get('/getAll',verifyToken,  GetAll);
 router.get('/getById/:id',verifyToken,  GetById);
 router.put('/edit/:id',verifyToken,  Edit); 
 router.delete('/delete/:id',verifyToken,  Delete); 

 export default router;
