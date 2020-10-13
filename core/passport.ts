import passport from 'passport'
import {Strategy as LocalStrategy} from 'passport-local'
import {ExtractJwt, Strategy as JwtStrategy} from 'passport-jwt'
import {UserModel, UserModelInterface} from "../models/UserModel";
import {generateMD5} from "../utils/generateHash";

passport.use(new LocalStrategy(
  async (username, password, done): Promise<void> => {
    const user = await UserModel.findOne({$or: [{email: username}, {username}]}).exec()
    try {
      if (!user) {
        return done(null, false)
      }
      if (user.password !== generateMD5(password + process.env.SECRET_KEY)) {
        return done (null, false)
      }
      done(null, user)
    } catch (error) {
      done(error, false)
    }
  }
))

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY || 'SECRET_KEY'
}, function (payload, done) {
  try {
    return done(null, payload.user)
  } catch (error) {
    done(error, false)
  }
}))

passport.serializeUser((user: UserModelInterface, done) => {
  done(null, user._id)
})

passport.deserializeUser((id, done) => {
  UserModel.findById(id, (err, user) => {
    done(err, user)
  })
})

export default passport
