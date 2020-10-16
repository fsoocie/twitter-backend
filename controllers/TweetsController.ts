import express from 'express'
import { validationResult } from 'express-validator/src/validation-result';
import { UserModelDocumentInterface, UserModelInterface} from "../models/UserModel";
import {isValidObjectId} from "mongoose";
import {TweetModel} from "../models/TweetModel";

class TweetsController {
   async index(_:any, res: express.Response): Promise<void> {
     try {
       const tweets = await TweetModel.find({}).exec()

       res.status(200).json({
         status: 'success',
         data: tweets
       })
     }
     catch (error) {
        res.status(500).json({
          status: 'error',
          message: error
        })
     }
  }
  async show(req:express.Request, res: express.Response): Promise<void> {

     try {
       const _id = req.params._id
       if (!isValidObjectId(_id)) {
         res.status(400).json({
           status: 'error',
           message: 'Object id is not valid'
         })
         return
       }
       const tweet = await TweetModel.findById(_id).exec()
       if (!tweet) {
         res.status(404).json({
           status: 'error',
           message: 'Твит не найден'
         })
         return
       }
       res.status(200).json({
         status: 'success',
         data: tweet
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
       const user = req.user as UserModelInterface

       if (user._id) {
         const errors = validationResult(req)
         if (!errors.isEmpty()) {
           res.status(400).json({status: 'error', errors: errors.array()})
           return
         }
         const data: any = {
           text: req.body.text,
           user: user._id
         }
         const tweet = await TweetModel.create(data)
         res.status(201).json({status: 'success', data: tweet})
       }

     }
     catch (error) {
       res.status(500).json({
         status: 'error',
         message: error
       })
     }
  }
  async delete (req: express.Request, res: express.Response) {
    const user = req.user as UserModelDocumentInterface
    try {
       const tweetId = req.params._id
       const tweet = await TweetModel.findById(tweetId).exec()
       if (tweet) {
         if (String(user._id) === String(tweet.user._id)) {
           await tweet.remove()
           res.send()
           return
         } else {
           res.status(403).send()
         }
       }
       else res.status(404).send()
     } catch (error) {
       res.status(500).json({
         status: 'error',
         message: error
       })
     }
  }
}

export const TweetsCtrl = new TweetsController()
