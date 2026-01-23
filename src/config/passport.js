import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import AppleStrategy from "passport-apple"
import prisma from "../prisma/client.js"

//  GOOGLE STRATEGY
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

        done(null, user)
      } catch (err) {
        done(err, null)
      }
    },
  ),
)

// APPLE STRATEGY
// passport.use(
//   new AppleStrategy(
//     {
//       clientID: process.env.APPLE_CLIENT_ID,
//       teamID: process.env.APPLE_TEAM_ID,
//       keyID: process.env.APPLE_KEY_ID,
//       privateKeyString: process.env.APPLE_PRIVATE_KEY,
//       callbackURL: process.env.APPLE_CALLBACK_URL,
//       scope: ["name", "email"],
//     },
//     async (accessToken, refreshToken, idToken, profile, done) => {
//       try {
//         const appleId = profile.id
//         const email = profile.email // only on FIRST login

//         let user = await prisma.user.findUnique({
//           where: { appleId },
//         })

//         if (!user && email) {
//           const existingUser = await prisma.user.findUnique({
//             where: { email },
//           })

//           if (existingUser) {
//             user = await prisma.user.update({
//               where: { email },
//               data: { appleId },
//             })
//           }
//         }

//         if (!user) {
//           user = await prisma.user.create({
//             data: {
//               name:
//                 profile.name?.firstName && profile.name?.lastName
//                   ? `${profile.name.firstName} ${profile.name.lastName}`
//                   : "Apple User",
//               email: email || null,
//               appleId,
//               role: "PASSENGER",
//               emailVerified: true,
//             },
//           })
//         }

//         done(null, user)
//       } catch (err) {
//         done(err, null)
//       }
//     },
//   ),
// )

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
