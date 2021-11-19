/**
 * WechatBot
 *  - https://github.com/gengchen528/wechatBot
 */
const { Wechaty } = require('wechaty');
const schedule = require('./schedule/index');
// 静态config配置
const config = require('./config/index');
const untils = require('./utils/index');
const superagent = require('./superagent/index');

// 动态获取config配置
const getConfig = ()=> {
  delete require.cache[require.resolve('./config/index.js')]  // 删除缓存
  return require('./config/index.js')
}

// 延时函数，防止检测出类似机器人行为操作
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 二维码生成
function onScan(qrcode, status) {
  require('qrcode-terminal').generate(qrcode); // 在console端显示二维码
  const qrcodeImageUrl = [
    'https://api.qrserver.com/v1/create-qr-code/?data=',
    encodeURIComponent(qrcode),
  ].join('');
  console.log(qrcodeImageUrl);
}

// 登录
async function onLogin(user) {
  console.log(`贴心小助理${user}登录了`);
  const date = new Date()
  console.log(`当前容器时间:${date}`);
  if (getConfig().AUTOREPLY) {
    console.log(`已开启机器人自动聊天模式`);
  }
  // 登陆后创建定时任务
  await initDay();
}

// 登出
function onLogout(user) {
  console.log(`小助手${user} 已经登出`);
}

// 监听对话
async function onMessage(msg) {
  const contact = msg.talker(); // 发消息人
  let content = msg.text().trim(); // 消息内容
  const room = msg.room(); // 是否是群消息
  const alias = await contact.alias() || await contact.name(); // 发消息人备注
  const isText = msg.type() === bot.Message.Type.Text;
  const topic = await room.topic() // 获取群名
  const index = getConfig().GROUP.indexOf(topic) // 是否在设置允许群聊的群名范围
  if (msg.self() || index == -1) { // 自己发的消息忽略
    return;
  }
  if (room && isText) {
    // 如果是群消息 目前只处理文字消息
    console.log(`群名: ${topic} 发消息人: ${alias} 内容: ${content}`);
    if (content.indexOf('关闭机器人') > -1) {
      config.GROUP_REPLY[index] = false
      room.say('下次再见咯--88')
      return
    }
    if (content.indexOf('开启机器人') > -1) {
      config.GROUP_REPLY[index] = true
      room.say('好了，开始吹牛逼吧！')
      return
    }
    if ((content.indexOf('你妈是') > -1 || content.indexOf('你妈妈是') > -1)) {
      room.say('碗碗啊，你怎么这都不知道啊！')
      return
    }
    if (index > -1 && config.GROUP_REPLY[index]) {
      const reply = await superagent.ruyiGetReplay(content);
      room.say(reply)
    }
  }
}

const bot = new Wechaty({
  name: 'WechatEveryDay',
  puppet: 'wechaty-puppet-wechat', // 如果有token，记得更换对应的puppet
  // puppetOptions: {
  //   token: '如果有token，填入wechaty获取的token，并把注释放开'
  // }
});

// 创建微信每日说定时任务
async function initDay() {
  console.log('\x1B[34m%s\x1B[0m', `已经设定每日说任务`);
  schedule.setSchedule(getConfig().SENDDATE, async () => {
    console.log('\x1B[31m%s\x1B[0m', '你的贴心小助理开始工作啦！');
    let today = await untils.formatDate(new Date()); //获取今天的日期
    let day1 = untils.getDay('2022/1/1')
    let day2 = untils.getDay('2022/2/1')
    let str = `摸鱼办提醒您：\n${today}。\n摸鱼人！工作再累 一定不要忘记摸鱼哦！\n有事没事起身去茶水间、去厕所、去廊道走走,别老在工位上坐着，钱是老板的,但命是自己的。\n距离元旦假期还有${day1}天,距离春节假期还有${day2}天。\n放假不易，且行且珍惜。`
    try {
      for (let i = 0; i < getConfig().DAYGROUP.length; i++) {
        const room = await bot.Room.findAll({ topic: getConfig().DAYGROUP[i] })
        await room[0].say(str)
        console.log('\x1B[32m%s\x1B[0m', room[0].payload.topic + ' 群提醒发送成功 ' + today)
      }
    } catch (e) {
      logMsg = e.message;
    }
  });
}

bot.on('scan', onScan);
bot.on('login', onLogin);
bot.on('logout', onLogout);
bot.on('message', onMessage);

bot
  .start()
  .then(() => console.log('开始登陆微信'))
  .catch((e) => console.error(e));
