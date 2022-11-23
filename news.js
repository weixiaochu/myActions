import { createRequire } from 'module'; 
const require = createRequire(import.meta.url);
import got from 'got';
import cheerio from 'cheerio';
import request from 'request';

var { SocksProxyAgent } = require('socks-proxy-agent');
var proxy = process.env.proxy;
var agent = new SocksProxyAgent(proxy);


/******** 企业微信相关配置信息 填写自己的信息 ***********/
// 企业消息接口文档:https://developer.work.weixin.qq.com/document/path/90236
// 企业ID 替换成自己
const corpId = process.env.corpId
// 应用密钥 替换成自己
const corpSecret = process.env.corpSecret
// 应用ID 替换成自己
const agentId = 1000002
// 发送给所有人
const toUser = '@all'

const tokenUrl = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpId}&corpsecret=${corpSecret}`
const sendMsgUrl = "https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=";
/******** 企业微信相关配置信息 填写自己的信息 ***********/

/**
 * 获取令牌
 */
function getToken(success, error) {
	request(tokenUrl, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var json = JSON.parse(body);
			success(json.access_token)
		} else {
			error('获取token失败')
		}
	})
}

/**
 * 真正发送消息
 */
function sendMessage(token, content) {
	const requestData = {
		touser: toUser,
		msgtype: "text",
		agentid: agentId,
		safe: 0,
		text: {
			content: content
		}
	}
    console.log("开始发送")
	request({
		url: `${sendMsgUrl}${token}`,
		method: "POST",
        strictSSL: false,
        agent,
		json: true,
		headers: {
			"content-type": "application/json",
		},
		body: requestData
	}, function(error, response, body) {
		console.log(body)
		if (!error && response.statusCode == 200) {}
	});
}

/***
 * 发送具体消息 
 */
function sendText(content) {
	getToken((token) => {
		sendMessage(token, content)
	}, (error) => {
		console.log(error)
	})
}

(async () => {
    try {
        // 获取今日热点 url
        const response = await got('https://www.163.com/dy/media/T1603594732083.html');   //想抓取的网址
        var $ = cheerio.load(response.body)//获取网址的DOM结构        
        let result = $('body > div > div.container.clearfix > div.content_box.wrap > div.content_left.tab_wrap.js-list-tab-box > div.tab_content > ul > li:nth-child(1) > a')//想抓取的部位
        let newsUrl = result.attr('href');
        
        const resp = await got(newsUrl);   //想抓取的网址
        $ = cheerio.load(resp.body)//获取网址的DOM结构        

        let newsContent = $('#content > div.post_body')
	console.log($(newsContent).html())
	let newsContents= $(newsContent).children().eq(1).html().replace("<br>", "")
	console.log(1)
	console.log(newsContents)
        // sendText(newsContents.replaceAll("<br>", "\n"))
    } catch (error) {
        console.log(error);
    }

})();
