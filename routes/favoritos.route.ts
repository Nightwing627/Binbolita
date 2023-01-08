import { Router } from "express";
import { Create, Delete, Edit, GetAll, GetById,GetByCustomerId, GetByCustomerAndGame } from "../controllers/favoritos.controller";
import { verifyToken } from "../middleware/jwt";



 const router = Router();

 router.post('/create',verifyToken, Create);
 router.get('/getAll',verifyToken,  GetAll);
 router.get('/getById/:id',verifyToken,  GetById);
 router.get('/getByCustomerId/:id',verifyToken,  GetByCustomerId);
 router.put('/edit/:id',verifyToken,  Edit); 
 router.delete('/delete/:id',verifyToken,  Delete); 
 router.get('/getByCustomerAndGame/:customer/:game',verifyToken,  GetByCustomerAndGame);

 
 export default router;
