import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser(async (id, done) => {
  const user = await prisma.user.findUnique({ where: { id } })
  done(null, user)
})

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      let user = await prisma.user.findUnique({
        where: { googleId: profile.id },
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            image: profile.photos[0]?.value || null,
          },
        })
      }

      done(null, user)
    }
  )
)
