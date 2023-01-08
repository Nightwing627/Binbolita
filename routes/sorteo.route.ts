import { Router } from "express";
import { Create, Edit, GetAll, GetById, Delete, GetAllByDate, GetYesterday, GetByDate } from "../controllers/sorteo.controller";
import { verifyToken } from "../middleware/jwt";



 const router = Router();


 router.post('/create',verifyToken,  Create);
 router.get('/getAll',  GetAll);
 router.get('/getById/:id',  GetById);
 router.put('/edit/:id',verifyToken,  Edit);
 router.get('/getYesterday',  GetYesterday);
 router.delete('/delete/:id',verifyToken,  Delete); 
 router.get('/getByDate/:fecha',  GetByDate);
 router.get('/getAllByDate/:fecha',  GetAllByDate);

 export default router;
