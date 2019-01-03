const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');

let map = require('map-stream');
let vfs = require('vinyl-fs');
let nodeID3 = require('node-id3');

const testFolder = './tests/';

var router = new Router();

router.get('/mp3', async function (ctx, next)  {
 
    let fileList = '';

    let createDB = (file, cb) => {
        console.log(file.path);
        var id3 = nodeID3.read(file.path);
        console.log('id3 : ' + id3);
        fileList += id3.artist + ' - ' + id3.title + '\n';
        cb(null, file);
    };   

    let writeit =  () => {
        console.log('done');
        ctx.body = 'scanning files...' +  fileList;
    }
    let failit =  () => {
        console.log('failed');
        ctx.body = 'failed';
    }

    let vinyl = (resolve, reject) => {
        return new Promise((resolve, reject) => {
            vfs.src([testFolder + '**/*.mp3'], { read: false })
            .pipe(map(createDB))
            .on('end', () => {resolve();  ctx.body =  fileList;} )          
        });
     }     

     await vinyl()

});

app
  .use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
  })
    // logger
  .use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}`);
  })
  .use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    await next();
  })
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(8000);