import { Router } from "express";
import { Create, Delete, Edit, GetAll, GetById, GetAllByDate, GetUserBets, GetUsersBetsByDate } from "../controllers/bets.controller";
import { verifyToken } from "../middleware/jwt";



 const router = Router();

 router.post('/create',verifyToken, Create);
 router.get('/getAll',verifyToken,  GetAll);
 router.get('/getById/:id',verifyToken,  GetById);
 router.get('/getUserBets/:id',verifyToken,  GetUserBets);
 router.get('/getAllByDate/:fecha',verifyToken,  GetAllByDate);
 router.put('/edit/:id',verifyToken,  Edit); 
 router.delete('/delete/:id',verifyToken,  Delete); 
 router.get('/getUsersBetsByDate/:fecha/:game',verifyToken,  GetUsersBetsByDate);

 export default router;
