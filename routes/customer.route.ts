import { Router } from "express";
import {Edit, GetAll, GetById, Login, Register, Delete, GetClientCount, PasswordRecovery, GetHistorialById} from "../controllers/customer.controller";
import { verifyToken } from "../middleware/jwt";



 const router = Router();


 router.post('/login', Login);
 router.post('/register', Register);
 router.get('/getAll',verifyToken,  GetAll);
 router.get('/getById/:id',verifyToken,  GetById);
 router.get('/getHistorialById/:id',verifyToken,  GetHistorialById);
 router.put('/edit/:id',verifyToken,  Edit);
 router.delete('/delete/:id',verifyToken,  Delete); 
 router.get('/getClientCount',  GetClientCount);
 router.post('/passwordRecovery',PasswordRecovery);

 export default router;