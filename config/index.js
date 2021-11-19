// 配置文件
module.exports = {
    // 每日说配置项（必填项）
    SENDDATE: '0 0 */1 * * *', //定时发送时间 规则见 /schedule/index.js
    // 摸鱼提示的群
    DAYGROUP: ['得闲饮茶', '碗碗广告专用群-墨水摸鱼副群'],
    //开启自动回复的群
    GROUP: ['得闲饮茶', '碗碗广告专用群-墨水摸鱼副群'],
    GROUP_REPLY: [true, true], // 对应是否开启群聊
}