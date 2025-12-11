import { json, urlencoded } from "express"

export const bodyParser = json({ inflate: false, limit: "100mb" })
export const urlEncode = urlencoded({ limit: '100mb', extended: true, parameterLimit: 1000000 })
