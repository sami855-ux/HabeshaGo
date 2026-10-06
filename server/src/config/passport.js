import "dotenv/config"
import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import prisma from "../prisma/client.js"

const STAFF_ROLES = new Set([
  "DRIVER",
  "ADMIN",
  "EV_CHARGER_MANAGER",
  "PARKING_MANAGER",
])

//  GOOGLE STRATEGY
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
      },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        })

        if (!user) {
          const email = profile.emails?.[0]?.value

          if (email) {
            const existingUser = await prisma.user.findUnique({
              where: { email },
            })

            if (existingUser) {
              if (STAFF_ROLES.has(existingUser.role)) {
                return done(null, false, { message: "Use staff sign-in" })
              }
              user = await prisma.user.update({
                where: { email },
                data: { googleId: profile.id },
              })
            }
          }

          if (!user) {
            user = await prisma.user.create({
              data: {
                name: profile.displayName,
                email,
                avaterUrl: profile.photos?.[0]?.value || null,
                googleId: profile.id,
                role: "PASSENGER",
                emailVerified: true,
              },
            })
          }
        }

        if (user && STAFF_ROLES.has(user.role)) {
          return done(null, false, { message: "Use staff sign-in" })
        }
        done(null, user)
      } catch (err) {
        done(err, null)
      }
    },
  ))
}

//  SESSION HANDLING
passport.serializeUser((user, done) => done(null, user.id))

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } })
    done(null, user)
  } catch (err) {
    done(err, null)
  }
})
