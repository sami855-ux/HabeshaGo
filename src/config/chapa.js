import { Chapa } from "chapa-nodejs"

const chapa = new Chapa({
  secretKey: process.env.CHAPA_SECRET_KRY,
})

export default chapa
