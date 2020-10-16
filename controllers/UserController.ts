import express from 'express'
import { validationResult } from 'express-validator/src/validation-result';
import {UserModel, UserModelDocumentInterface, UserModelInterface} from "../models/UserModel";
import jwt from 'jsonwebtoken';
import {generateMD5} from "../utils/generateHash";
import {sendEmail} from "../utils/sendEmail";
import {isValidObjectId} from "mongoose";

class UserController {
   async index(_:any, res: express.Response): Promise<void> {
     try {
       const users = await UserModel.find({}).exec()

       res.json({
         status: 'success',
         data: users
       })
     }
     catch (error) {
        res.status(500).json({
          status: 'error',
          message: JSON.stringify(error)
        })
     }
  }
  async show(req:express.Request, res: express.Response): Promise<void> {

     try {
       const _id = req.params._id
       if (!isValidObjectId(_id)) {
         res.status(400).json({
           status: 'error',
           message: 'Object id is no valid'
         })
         return
       }
       const user = await UserModel.findById(_id).exec()
       if (!user) {
         res.status(404).json({
           status: 'error',
           message: 'Пользователь не найден'
         })
         return
       }
       res.status(200).json({
         status: 'success',
         data: user
       })

     } catch (error) {
       res.status(500).json({
         status: 'error',
         message: error
       })
     }
  }
  async create(req: express.Request, res: express.Response): Promise<void> {
     try {
       const errors = validationResult(req)
       if (!errors.isEmpty()) {
         res.status(400).json({status: 'error', errors: errors.array()})
         return
       }
       const data: UserModelInterface = {
         email: req.body.email,
         fullname: req.body.fullname,
         username: req.body.username,
         password: generateMD5(req.body.password + process.env.SECRET_KEY),
         confirmHash: generateMD5(process.env.SECRET_KEY || Math.random().toString())
       }
       const user = await UserModel.create(data)
       res.status(201).json({status: 'success', data: user})
       sendEmail({
         fromEmail: 'twitter-clone@gmail.com',
         toEmail: data.email,
         subject: 'Подтверждение почты TwitterClone',
         html: `Для того, чтобы подтвердить почту перейдите <a href='http://localhost:${process.env.PORT}/users/verify?hash=${data.confirmHash}'>по ссылке</a>`
       }, (error: (Error | null)) => {
         if (error) {
           res.json({
             status: 'error',
             message: JSON.stringify(error)
           })
         }
       })
     }
     catch (error) {
       res.status(500).json({
         status: 'error',
         message: error
       })
     }
  }
  async verify(req: any, res: express.Response): Promise<void> {
    try {
      const hash = req.query.hash
      if (!hash) {
        res.status(400).send()
        return
      }
      const user = await UserModel.findOne({confirmHash: hash}).exec()
      if (user) {
        user.confirmed = true
        user.save()
        res.json({
          status: 'success'
        })
      } else {
        res.status(404).json({status: 'error', message: 'Пользователь не найдет'})
      }

    }
    catch (error) {
      res.status(500).json({
        status: 'error',
        message: JSON.stringify(error)
      })
    }
  }
  async afterLogin (req: express.Request, res: express.Response): Promise<void> {
    try {
      const user = req.user ? (req.user as UserModelDocumentInterface).toJSON() : undefined
      res.status(200).json({
        status: 'success',
        data: {
          ...user,
          token: jwt.sign({data: req.user}, process.env.SECRET_KEY || 'SECRET_KEY')
        }
      })

    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error
      })
    }
  }
  async me(req: express.Request, res: express.Response): Promise<void> {
    try {
      const user = req.user ? (req.user as UserModelDocumentInterface).toJSON() : undefined
      console.log(user)
      res.status(200).json({
        status: 'success',
        data: user
      })
    }
    catch (error) {
      console.log(error)
      res.status(500).json({
        status: 'error',
        message: error.message
      })
    }
  }
}



export const UserCtrl = new UserController()
