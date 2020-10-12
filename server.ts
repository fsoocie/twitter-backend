import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import {UserCtrl} from "./controllers/UserController";
import {registerValidations} from "./validators/register";

import './core/db'
const app = express()
app.use(express.json())

app.get('/users', UserCtrl.index)
app.post('/users', registerValidations, UserCtrl.create)
app.get('/users/verify', UserCtrl.verify)
/*app.patch('/users', UserCtrl.update)
app.delete('/users', UserCtrl.delete)*/

app.listen(process.env.PORT, () => {
  console.log(`SERVER IS RUNNING AT ${process.env.PORT} port` )
})
