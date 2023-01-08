 import { Router } from "express";
import {Edit, GetAll, GetById, Login, Register, Delete, GetAllByProfile, GetAdminCount} from "../controllers/administrator.controller";
import { verifyToken } from "../middleware/jwt";



 const router = Router();


 router.post('/login', Login);
 router.post('/register', Register);
 router.get('/getAll',verifyToken,  GetAll);
 router.get('/getById/:id',verifyToken,  GetById);
 router.get('/getAllByProfile/:profileId',verifyToken, GetAllByProfile);
 router.put('/edit/:id',verifyToken, Edit);
 router.delete('/delete/:id',verifyToken,  Delete); 
 router.get('/getAdminCount',GetAdminCount);

 export default router;