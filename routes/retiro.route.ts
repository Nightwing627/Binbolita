import { Router } from "express";
import { Create, Edit, GetAll, GetById, Delete,GetByCustomerId } from "../controllers/retiro.controller";
import { verifyToken } from "../middleware/jwt";




 const router = Router();


 router.post('/create',verifyToken,  Create);
 router.get('/getAll',verifyToken,  GetAll);
 router.get('/getById/:id',verifyToken,  GetById);
 router.get('/getByCustomerId/:id',verifyToken,  GetByCustomerId);
 router.put('/edit/:id',verifyToken,  Edit);
 router.delete('/delete/:id',verifyToken,  Delete); 

 export default router;
