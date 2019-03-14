const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');

let map = require('map-stream');
let vfs = require('vinyl-fs');
let nodeID3 = require('node-id3');

const testFolder = './tests/';

var router = new Router();

router.get('/mp3', async function (ctx, next)  {
 
    return fileList
});

app
    .use(async (ctx, next) => {
        const start = Date.now();
        await next();
        const ms = Date.now() - start;
        ctx.set('X-Response-Time', `${ms}ms`);
        console.log('mp3 route called')
        ctx.body =  fileList;         
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

let fileList = '';

let createDB = (file, cb) => {
    let id3 = nodeID3.read(file.path)
    let newFile = ''
    if(id3 === 'false' || !id3) { 
        newFile = file.path.match(/([^\\]*)(?=\.)/, '')[1]
    }
    else {
        newFile = id3.artist + ' - ' + id3.title + '\n'
    }
    console.log('id3 : ' + id3 + ' result: ' + newFile)
    fileList += newFile
    
    cb(null, file)
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
        .on('end', () => {
            resolve();
        })          
    });
    }     

vinyl(writeit, failit)

app.listen(8000);