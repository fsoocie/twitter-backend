import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import {UserCtrl} from "./controllers/UserController";
import {registerValidations} from "./validators/register";
import './core/db'
import passport from './core/passport';

const app = express()

app.use(express.json())
app.use(passport.initialize())

app.get('/users', UserCtrl.index)
app.get('/users/me', passport.authenticate('jwt'), UserCtrl.me)
app.get('/users/:_id', UserCtrl.show)
app.get('/auth/verify', UserCtrl.verify)
app.post('/auth/register', registerValidations, UserCtrl.create)
app.post('/auth/login', passport.authenticate('local'), UserCtrl.afterLogin)
/*app.patch('/users', UserCtrl.update)
app.delete('/users', UserCtrl.delete)*/

app.listen(process.env.PORT, () => {
  console.log(`SERVER IS RUNNING AT ${process.env.PORT} port` )
})
