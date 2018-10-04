## spider-icon

### 介绍

应用图标爬虫

* 使用node.js
* html页面数据，借助cheerio解析页面成特定数据格式，后期用类jQuery形式处理dom
* json接口数据，直接处理返回数据，接口数据抓取是自动分页执行，抓取完毕程序结束


### 使用

```console
# 下载到本地
git clone https://github.com/chuanfe/spider-icon.git

# 安装
npm install

# 运行 json或者html
node app_json.js
node app_html.js

# 访问浏览器开始抓取数据
http://localhost:8081/index
```


### 结果
运行后抓取图标1483个，图片名可自己编辑
<p align="center">
  <img width="900" src="https://raw.githubusercontent.com/chuanfe/spider-icon/master/images/appstore-rank.PNG">
</p>
<p align="center">
  <img width="900" src="https://raw.githubusercontent.com/chuanfe/spider-icon/master/images/appstore-rank-name.PNG">
</p>
