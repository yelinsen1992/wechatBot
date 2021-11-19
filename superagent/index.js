const superagent = require('./superagent');
const config = require('../config/index');
const cheerio = require('cheerio');
const {
    machineIdSync
} = require('node-machine-id');
const crypto = require('crypto');
let md5 = crypto.createHash('md5');
let uniqueId = md5.update(machineIdSync()).digest('hex'); // 获取机器唯一识别码并MD5，方便机器人上下文关联
const ONE = 'http://wufazhuce.com/'; // ONE的web版网站

async function getOne() {
    // 获取每日一句
    try {
        let res = await superagent.req({
            url: ONE,
            method: 'GET',
            spider: true
        });
        let $ = cheerio.load(res);
        let todayOneList = $('#carousel-one .carousel-inner .item');
        let todayOne = $(todayOneList[0])
            .find('.fp-one-cita')
            .text()
            .replace(/(^\s*)|(\s*$)/g, '');
        return todayOne;
    } catch (err) {
        console.log('获取每日一句出错', err);
        return err;
    }
}

// 青云客智能聊天接口
async function getReply(word) {
    let url = 'http://api.qingyunke.com/api.php?key=free&appid=0&msg=' + encodeURI(word);
    let content = await superagent.req({
        url,
        method: 'GET'
    })
    if (content.content) {
        return content.content
    } else {
        return '我好像迷失在无边的网络中了，你能找回我么'
    }
}

// 思知智能聊天接口
async function ruyiGetReplay(word) {
    word = word.replace(/煤球/g, '小思')
    let url = 'https://api.ownthink.com/bot?appid=f2dcb6c66f0f798dbc814e246dc6df3c&userid=EmCpmXQp&spoken=' + encodeURI(word)
    let content = await superagent.req({
        url,
        method: 'GET',
    })
    if (content.data) {
        return content.data.info.text.replace(/{br}/g, '\r\n').replace(/小思/g, '煤球').replace(/思知/g, '多木')
    } else {
        return '我好像迷失在无边的网络中了，你能找回我么'
    }
}

module.exports = {
    getOne,
    getReply,
    ruyiGetReplay,
};