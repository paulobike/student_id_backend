import http from 'http';
import express, { Response, Application, NextFunction } from 'express';
import indexRouter from './routers';
import env from './utils/env';
import { sendErrorResponse } from './utils/sendResponse';
import adminRouter from './routers/admin';
import studentRouter from './routers/student';
import mongoose from 'mongoose';
import path from 'path';

/** PARSE .ENV FILE */
const envResp = env();
const app: Application = express();

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, PATCH');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use('/api', express.static(path.join(__dirname, 'static')));
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

const PORT: number = Number(process.env.PORT) || 5000;
const IP: string = process.env.IP || '127.0.0.1';
const DB_URL = `${process.env.DB_URL}?retryWrites=true&w=majority`;

mongoose.connect(DB_URL).then((con) => {
  console.log("DB connection successful");
});

/** DO ROUTING HERE */
app.use('/api/admin', adminRouter);
app.use('/api/student', studentRouter);
app.use('/api', indexRouter);

/** ERROR HANDILING MIDDLEWARE */
app.use((error: any, _: any, res: Response, __: any): void => {
  sendErrorResponse(res, error.status, error.message, null);
});

const server = http.createServer(app);

server.listen(PORT, IP, (): void => {
  console.log(envResp);
  console.log('App running at port ' + PORT);
});