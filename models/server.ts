const fs = require('fs');
const http = require('http');
const https = require('https');
const privateKey  = fs.readFileSync('cert/binbolita.com.key', 'utf8');
const certificate = fs.readFileSync('cert/binbolita.com.crt', 'utf8');
const credentials = {key: privateKey, cert: certificate};
import express, {Application} from 'express';
import AdministratorRoute from '../routes/administrator.route';
import ProfileRoute from '../routes/profile.route';
import CustomerRoute from '../routes/customer.route';
import PaisRoute from '../routes/pais.route';
import SocialRoute from '../routes/social.route';
import ContactRoute from '../routes/contact.route';
import SorteoRoute from '../routes/sorteo.route';
import RecargaRoute from '../routes/recarga.route';
import RetiroRoute from '../routes/retiro.route';
import SystemRoute from '../routes/systemConfig.route';
import GamesRoute from '../routes/games.route';
import BetsRoute from '../routes/bets.route';
import FaqRoute from '../routes/faq.route';
import FavoritesRoute from '../routes/favoritos.route';
import ReportsRoute from '../routes/reportes.route';
import CharadaRoute from '../routes/charada.route';
import VisitasRoute from '../routes/visitas.route';

import morgan from 'morgan';
import cors from 'cors';
import { Environments } from '../enviroments';

class Server {

    private app: Application;
    private port: string;
    private apiPaths = {
        administrator: '/api/administrator',
        profile: '/api/perfiles',
        customer: '/api/customer',
        pais: '/api/pais',
        social: '/api/social',
        contact: '/api/contact',
        sorteo: '/api/sorteo',
        recarga: '/api/recarga',
        retiro: '/api/retiro',
        sistema: '/api/sistema',
        apuesta: '/api/apuesta',
        juegos: '/api/juegos',
        faq: '/api/faq',
        favoritos: '/api/favoritos',
        reportes: '/api/reportes',
        charada: '/api/charada',
        visitas: '/api/visitas',
    };
    constructor(){
        this.app = express();
        this.port = Environments.port;
        this.middlewares();
        this.routes();
    }

    middlewares(){
        // CORS
        this.app.use(cors());
        this.app.use(morgan('combined'))
        // Body Parser
        this.app.use(express.json({limit: '50mb'}));
    }

    routes(){
        this.app.use(this.apiPaths.administrator, AdministratorRoute);
        this.app.use(this.apiPaths.profile, ProfileRoute);
        this.app.use(this.apiPaths.customer, CustomerRoute);
        this.app.use(this.apiPaths.pais, PaisRoute);
        this.app.use(this.apiPaths.social, SocialRoute);
        this.app.use(this.apiPaths.contact, ContactRoute);
        this.app.use(this.apiPaths.sorteo,SorteoRoute);
        this.app.use(this.apiPaths.recarga, RecargaRoute);
        this.app.use(this.apiPaths.retiro,RetiroRoute);
        this.app.use(this.apiPaths.sistema,SystemRoute);
        this.app.use(this.apiPaths.juegos,GamesRoute);
        this.app.use(this.apiPaths.apuesta,BetsRoute);
        this.app.use(this.apiPaths.faq,FaqRoute);
        this.app.use(this.apiPaths.favoritos,FavoritesRoute);
        this.app.use(this.apiPaths.reportes,ReportsRoute);
        this.app.use(this.apiPaths.charada,CharadaRoute);
        this.app.use(this.apiPaths.visitas,VisitasRoute);
    }

    listen(){
        const httpServer = http.createServer(this.app);
        const httpsServer = https.createServer(credentials, this.app);

        httpServer.listen(8000, () =>{
            console.log('Servidor corriendo en: ' + 8000);
        });
        httpsServer.listen(8443, () =>{
            console.log('Servidor https corriendo en: ' + 8443);
        });
    }
}

export default  Server;