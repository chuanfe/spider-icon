/**
 * json 接口数据抓取
 * js 方式直接处理返回数据
 * 优点：可以自动分页执行，抓取完毕跳出循环
 */
let fs = require("fs");
var superagent = require('superagent');
var charset = require('superagent-charset');
let asyncQuene = require("async").queue;
charset(superagent);
var express = require('express');
var baseUrl = 'http://mi.talkingdata.com/appstore/rank.json'; //接口地址
var app = express();

var Config = {
    date: '2018-10-02',
    page: 0, //开始页码
    maxPageSize: 10, //最大页码，大于该页码结束爬取
    downloadImg: true, //是否下载图片到硬盘,否则只保存Json信息到文件
    downloadConcurrent: 10, //下载图片最大并发数
    folderName: "apple-icon" //保存图片文件夹名
};

String.prototype.replaceAll = function(s1,s2){ 
    return this.replace(new RegExp(s1,"gm"),s2); 
}

/**
 * 入口地址
 */
app.get('/json', function(req, res) {

    run(res);
    
});

/**
 * 主程序
 */
function run(res) {
    superagent.get(baseUrl)
    // .charset('gb2312')
    .charset('utf-8')
    .query({ cat: '36', tab: '1', pagesize: '30', date: Config.date, page: Config.page })
    .end(function(err, data) {
        var items = [];
        if (err) {
            console.log('ERR: ' + err);
            res.json({ code: 400, msg: err, sets: items });
            return;
        }

        //talkingdata
        var lists = JSON.parse(data.text);
        for (let i = 0; i < lists.rows.length; i++) {
            const element = lists.rows[i];
            items.push({
                idx: element.rank,
                rank: element.rank,
                title: element.appinfo.name,
                thumbSrc: element.appinfo.icon_url
            });
            
        }
        if(res) {
            res.json({ code: 200, msg: "", data: items, lists: lists });
        }
        
        downloadImg(items)
    });
}

/**
 * 文件下载
 */
function downloadImg(albumList) {
    console.log('Start download images ....');
    const folder = Config.folderName;
    if(!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }
    
    let downloadCount = 0;
    let q = asyncQuene(async function ({ idx: idx, title: albumTile, url: imageUrl }, taskDone) {
        superagent.get(imageUrl).end(function (err, res) {
            if (err) {
                console.log(err);
                // taskDone();
            } else {
                // if(idx < 10) {
                //     idx = '000'+idx
                // }
                // else if(idx < 100) {
                //     idx = '00'+idx
                // }
                // else if(idx < 1000) {
                //     idx = '0'+idx
                // }

                //本地保存图标名称
                fs.writeFile(`./${folder}/icon-${idx}-${albumTile}.png`, res.body, function (err) {
                    err ? console.log(err) : console.log(`${albumTile}保存一张`);
                    // taskDone();
                });
            }
        });
    }, Config.downloadConcurrent);
    /**
     * 监听：当所有任务都执行完以后，将调用该函数
     */
    q.drain = function () {
        console.log('All img download');
        Config.page ++;
        if(Config.page <= Config.maxPageSize) {
            run();
        }
    }
    
    let imgListTemp = [];
    albumList.forEach(function ({ idx, title, thumbSrc }) {
        imgListTemp.push({ idx: idx, title: title, url: thumbSrc })
    });
    q.push(imgListTemp);//将所有任务加入队列
}


var server = app.listen(8081, function() {

    var host = server.address().address
    var port = server.address().port

    console.log("访问地址为 http://%s:%s", host, port)

})
