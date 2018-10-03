/**
 * html 页面数据抓取
 * cheerio 负责解析页面成特定数据格式
 * jQuery 方式处理dom节点，抓取数据
 */
let fs = require("fs");
var superagent = require('superagent');
var charset = require('superagent-charset');
let asyncQuene = require("async").queue;
charset(superagent);
var express = require('express');
var baseUrl = 'http://app.hicloud.com/more/all/'; //输入任何网址都可以
const cheerio = require('cheerio');
var app = express();

const Config = {
    startPage: 1, //开始页码
    endPage: 1, //结束页码，不能大于当前图片类型总页码
    downloadImg: true, //是否下载图片到硬盘,否则只保存Json信息到文件
    downloadConcurrent: 10, //下载图片最大并发数
    currentImgType: "huawei" //当前程序要爬取得图片类型,取下面AllImgType的Key。
};

String.prototype.replaceAll = function(s1,s2){ 
    return this.replace(new RegExp(s1,"gm"),s2); 
}

function GetQueryString(name) {
    return 9
}

app.get('/index', function(req, res) {
    //设置请求头
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    //类型
    var type = req.query.type;
    //页码
    var page = req.query.page;
    type = type || 'weixin';
    page = page || '1';
    var route = `tx/${type}tx_${page}.html`
    //网页页面信息是gb2312，所以chaeset应该为.charset('gb2312')，一般网页则为utf-8,可以直接使用.charset('utf-8')
    superagent.get(baseUrl + GetQueryString("page"))
        // .charset('gb2312')
        .charset('utf-8')
        .end(function(err, sres) {
            var items = [];
            if (err) {
                console.log('ERR: ' + err);
                res.json({ code: 400, msg: err, sets: items });
                return;
            }
            var $ = cheerio.load(sres.text);
            //豌豆荚
            // $('#j-search-list li.search-item .icon-wrap a').each(function(idx, element) {
            //     var $element = $(element);
            //     var $subElement = $element.find('img');
            //     var thumbImgSrc = $subElement.attr('src');
            //     items.push({
            //         idx: idx,
            //         title: $(element).attr('title'),
            //         href: $element.attr('href'),
            //         thumbSrc: thumbImgSrc
            //     });
            // });
            $('.lay-left .unit-main .list-game-app .game-info-ico a').each(function(idx, element) {
                var $element = $(element);
                var $subElement = $element.find('img');
                var thumbImgSrc = $subElement.attr('lazyload').replaceAll('&#x2F;','/');
                console.log('ad',thumbImgSrc)
                items.push({
                    idx: idx,
                    title: $(element).attr('alt'),
                    href: $element.attr('href'),
                    thumbSrc: thumbImgSrc
                });
            });
            res.json({ code: 200, msg: "", data: items });
            downloadImg(items)
        });
});

function downloadImg(albumList) {
    console.log('Start download album`s image ....');
    const folder = `img-${Config.currentImgType}-${GetQueryString("page")}`;
    fs.mkdirSync(folder);
    let downloadCount = 0;
    let q = asyncQuene(async function ({ idx: idx, title: albumTile, url: imageUrl }, taskDone) {
        superagent.get(imageUrl).end(function (err, res) {
            console.log('image: ',imageUrl)
            if (err) {
                console.log(err);
                // taskDone();
            } else {
                if(idx < 10) {
                    idx = '0'+idx
                }
                fs.writeFile(`./${folder}/icon-1000${GetQueryString()}${idx}.png`, res.body, function (err) {
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
    }

    let imgListTemp = [];
    albumList.forEach(function ({ idx, title, thumbSrc }) {
        imgListTemp.push({ idx: idx, title: title, url: thumbSrc })
        // imgList.forEach(function (url) {
        //     imgListTemp.push({ title: title, url: url });
        // });
    });
    q.push(imgListTemp);//将所有任务加入队列
}

var server = app.listen(8081, function() {

    var host = server.address().address
    var port = server.address().port

    console.log("应用实例，访问地址为 http://%s:%s", host, port)

})
