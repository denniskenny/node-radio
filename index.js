const Koa = require("koa")
const Router = require("koa-router")
const map = require("map-stream")
const vfs = require("vinyl-fs")
const nodeID3 = require("node-id3")
const testFolder = "./tests/"
const app = new Koa()
const router = new Router()

let fileList = ""

const dbinit = () => {
  const createDB = (file, cb) => {
    const id3 = nodeID3.read(file.path)
    let newFile = ""
    if (id3 === "false" || !id3) {
      newFile = file.path.match(/([^\\]*)(?=\.)/, "")[1]
    } else {
      newFile = `${id3.artist} - ${id3.title}\n`
    }
    console.log(`id3 : ${id3} result: ${newFile}`)
    fileList += newFile

    cb(null, file)
  }

  const writeit = () => {
    console.log("done")
    ctx.body = `scanning files...${fileList}`
  }
  const failit = () => {
    console.log("failed")
    ctx.body = "failed"
  }

  const vinyl = (resolve, reject) =>
    new Promise((resolve, reject) => {
      vfs
        .src([`${testFolder}**/*.mp3`], { read: false })
        .pipe(map(createDB))
        .on("end", () => {
          resolve()
        })
    })

  vinyl(writeit, failit)
}

router.get("/init", async (ctx, next) => {
  const start = Date.now()
  console.log("Database init")

  dbinit()

  const ms = Date.now() - start
  ctx.set("X-Response-Time", `${ms}ms`)

  await next()
})

router.get("/mp3", async (ctx, next) => {
  console.log("get mp3s")
  const start = Date.now()
  const ms = Date.now() - start
  ctx.set("X-Response-Time", `${ms}ms`)
  ctx.body = fileList
})

app
  .use(async (ctx, next) => {
    const start = Date.now()
    const ms = Date.now() - start
    console.log(`default route called' ${ms}ms`)
    await next()
  })
  // logger
  .use(async (ctx, next) => {
    const start = Date.now()
    await next()
    const ms = Date.now() - start
    console.log(`${ctx.method} ${ctx.url} - ${ms}`)
  })
  .use(async (ctx, next) => {
    ctx.set("Access-Control-Allow-Origin", "*")
    ctx.set(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    )
    ctx.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
    await next()
  })

  .use(router.routes())
  .use(router.allowedMethods())

app.listen(8000)

dbinit()
