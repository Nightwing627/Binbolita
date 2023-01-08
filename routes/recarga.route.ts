import { Router } from "express";
import { Create, Edit, GetAll, GetById, Delete, GetByCustomerId } from "../controllers/recarga.controller";
import { verifyToken } from "../middleware/jwt";




 const router = Router();


 router.post('/create',verifyToken,  Create);
 router.get('/getAll',verifyToken,  GetAll);
 router.get('/getById/:id',verifyToken,  GetById);
 router.put('/edit/:id',verifyToken,  Edit);
 router.delete('/delete/:id',verifyToken,  Delete); 
 router.get('/getByCustomerId/:id',verifyToken,  GetByCustomerId);

 export default router;
