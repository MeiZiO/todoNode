var express = require('express');
var router = express.Router();
var mysql = require('mysql');


// 创建连接
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'todolist'
});



// 连接数据库
// connection.connect();


// router.get('/', function (req, res) {
//   console.log('你好');
// });

// router.get('/todo/add', function (req, res) {
//   console.log('/todo/add');
// });

// router.post('/todo/add', function (req, res) {
//   console.log('/todo/add,post');
//   console.log(req.body,'body');
//   res.setHeader('Content-Type','text/plain; charset=utf-8');
//   let data = {
//     data: {
//       name:'丫头',
//       age: '11'
//     }
//   };

//   // 操作数据库
//   connection.query('select * from users', function(error, results, fields) {
//     if (error) console.log(error, '连接数据库失败');
//     if(results)

//     {

//         for(var i = 0; i < results.length; i++)

//         {

//             console.log("%d\t%s\t%s", results[i].id, results[i].name, results[i].age);

//         }

//     }   
//   // 关闭数据库连接
//   connection.end();
//   });

//   res.json(data);
//   // res.end(JSON.stringify(data));
//   res.end();
// });




// 新增todo
router.post('/todo/addEvent', function (req, res) {
  // 编码
  // res.setHeader('Content-Type','text/plain; charset=utf-8');
  // 输出接口
  console.log('接口:',req.url,' 参数：',req.body);
  // 获取创建时间
  createTime = formatDate(new Date());
  //处理开始的参数
  startTime = formatDate(req.body.startTime);
  // 处理提醒方式的参数
  let interval=0, ranges=0, targetTotal=0;
  targetTotal = req.body.ownNum;
  interval = req.body.ownInterval;
  ranges = req.body.ownRange;
  
  let temp = startTime || createTime;
  let item = initNextTime(temp, req.body.repeatType, req.body.type,ranges);

  let sql = 'insert into event(userId, intervals, ranges, targetTotal,createTime,startTime,nextSTime,nextETime,eventStatus,type,y,m,d,tag,priority,timepoint,remark,eventName) '
  +'values( \''+ req.body.userId +'\', \''+ interval +'\',  \''+ ranges +'\', \''+ targetTotal +'\',\''+ createTime +'\',\''+ startTime +'\', \''+ item.st +'\', \''+ item.et +'\', 1,\''+ req.body.repeatType +'\',\''+ req.body.type +'\',\''+ req.body.type +'\',\''+ req.body.type +'\',\'['+ req.body.tagData +']\',\''+ req.body.priority +'\',\''+ req.body.deadline +'\',\''+ req.body.remark +'\',\''+ req.body.name +'\')';

    connection.query(sql, function (error, results, fields) {
    let data = {};
    if (error) {
      console.log('查询数据库失败');
      data.success = false;
    }
    else {
      console.log('新增todo成功');
      data.success = true;
    }
    res.end(JSON.stringify(data));
  });

  initEvent();
});

// 添加新的标签
router.post('/tagData/add', function (req, res) {
  // 输出接口
  // console.log('接口:',req.url,' 参数：',req.body);
  console.log(req.body.name);
  // 编码
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  connection.query('insert into tag(name) values(\''+ req.body.name +'\')', function (error, results, fields) {
    let data = {};
    if (error) {
      console.log('查询数据库失败');
      data.success = false;
    }
    else {
      console.log('添加新的标签成功');
      data.success = true;
    }
    res.end(JSON.stringify(data));
  });
});

// 创建新的todo,查询已有的标签
router.post('/tagData/list', function (req, res) {
  // 输出接口
  // console.log('接口:',req.url,' 参数：',req.body);
  // 编码
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  connection.query('select id,name from tag', function (error, results, fields) {
    let data = {};
    if (error) {
      console.log('查询数据库失败');
      data.success = false;
    }
    else {
      console.log('查询已有的标签成功');
      data.success = true;
      data.data =[];
      for (i = 0; i < results.length; i++) {
        let temp = {};
        temp.label = results[i].name;
        temp.key = results[i].name;
        // temp.id = results[i].id;
        // temp.disabled = true;
        data.data.push(temp);
      }
    res.end(JSON.stringify(data));
    }
  });
});


// 测试函数
router.post('/test', function (req, res) {
  // 编码
  // res.setHeader('Content-Type','text/plain; charset=utf-8');
  // 输出接口
  console.log('接口:',req.url,' 参数：',req.body);

});

// 初始化新建事件
function initEvent(){
  let sql = `SELECT * FROM event WHERE eventID =(SELECT MAX(eventID) FROM event)`;
  connection.query(sql, function(error, results, fields) {
    if(error) {
      console.log('初始化新建事件失败');
    } 
    else {
      let item = results[0];
      if(item.nextSTime == formatDate(new Date())) {
        item.total++;
        addHis(item);
        updateHandle(item);
        eventStatusHandle(item);
      }
    }
  });
}

// 系统每日的更新
function systemUpdate() {
  // 为所需事件更新休眠状态
  // toSleep();
  let sql = `SELECT * FROM event WHERE eventIsSleep!=2 && eventStatus!=2`;
  connection.query(sql,  function(error, results, fields) {
    if(error) {
      console.log('筛选更新数据失败');
    }else{
      for(let i=0; i<results.length();i++) {
        let item = results[i];
        if (item.nextSTime < formatDate(new Date())){
          if(item.total == item.targetTotal) {
            
          }
        }
      }
    }
  });


}

// 为所需事件更新nextTime
function toNextTime() {
  let sql = `SELECT * FROM event WHERE nextETime<'`+ formatDate(new Date()) +`' &&eventIsSleep!=2&&(targetTotal>total || targetTotal = 'max')`;
  connection.query(sql, function(error, results, fields) {
    console.log('共', results.length, '条需要处理的数据');
    if(error) {
      console.log('筛选需要计算nextTime的数据出错');
    }else {
      results.forEach( item=> {
        getNextTime(item);
      });
    }
  });
}

// 更新所有需要休眠数据
function toSleep(){
  let sql = `SELECT eventID FROM event WHERE total=targetTotal && targetTotal!='max')`;
  connection.query(sql, function (error, results, fields) {
    if(error){
      console.log('筛选需要休眠的数据时发生错误');
    }
    else {
      for(let i = 0; i < results.length(); i++) {
        let item = results[i];
        sleepHandle(item);
      }
    }
  });
}

// 创建时，初始化时间
function initNextTime(time, type, typeDetail,ranges) {
  switch (type) {
    case 'y': {
      switch (typeDetail) {
        case 'every': return initeveryY(time);
        case 'once': return initeveryY(time);
        case 'own': return initownY(time, ranges);
        case 'odd': return initOddY(time);
        case 'even': return initEvenY(time);
      }
    }
    break;
    case 'm': {
      switch(typeDetail) {
        case'every': return initeveryM(time);
        case'once': return initeveryM(time);
        case'odd': return initOddM(time);
        case'even': return initEvenM(time);
        case'own': return initownM(time,ranges);
      }
    }
    break;
    case 'd': {
      switch(typeDetail) {
        case'workday': return initworkday(time);
        case'weekend': return initweekday(time);
        case'every': return initeveryD(time);
        case'once': return initeveryD(time);
        case'own': return initownD(time, ranges);
        case 'even': return initEvenD(time);
        case 'odd': return initoddD(time);
      }
    }
    break;
  }
}

// 初始化下次时间，天，每天,一次
function initeveryD(time) {
  let st, et;
  st = et = time;
  return {st, et};  
} 

// 初始化下次时间，天，奇数
function initoddD(time) {
  while(time.substring(8,10) %2 ==0) {
    time =  GetDay(time, 1);
  }
  let st, et;
  st = et = time;
  return {st, et};  
} 

// 初始化下次时间，天，偶数
function initEvenD(time) {
  while(time.substring(8,10) %2 !=0) {
    time =  GetDay(time, 1);
  }
  let st, et;
  st = et = time;
  return {st, et};  
} 

// 初始化下次时间，天，自定义
function initownD(time, ranges) {
  let st = time;
  let et = GetDay(time, ranges);
  return {st, et};
}

// 初始化下次时间，天，周末
function initweekday(time) {
  let st, et;
  time = GetDay(time, -1)
  st = et = getWeekDay(time);
  return {st, et};
}

// 初始化下次时间，天，工作日
function initworkday(time) {
  let st, et;
  time = GetDay(time, -1)
  st = et = getWorkDay(time);
  return {st, et};
}

// 初始化下次提醒时间，月，偶数
function initEvenM(time) {
  let date = Month(time, 0);
  if ((new Date(time)).getMonth % 2 == 0) {
    date = Month(time, 1);
  }
  let et = getLastDateOfMonth(date);;
  let st = getFirstDateOfMonth(date);
  return {st, et};
}

// 初始化下次提醒时间，月，奇数
function initOddM(time) {
  let date = Month(time, 0);
  if ((new Date(time)).getMonth % 2 != 0) {
    date = Month(time, 1);
  }
  let et = getLastDateOfMonth(date);
  let st = getFirstDateOfMonth(date);
  return {st, et};
}

// 初始化下次提醒时间，月，自定义
function initownM(time, ranges) {
  let date = Month(time, ranges);
  let et = getLastDateOfMonth(date);
  let st = getFirstDateOfMonth(time);
  return {st, et};
}

// 初始化下次提醒时间，月，每月，一次
function initeveryM(time) {
  let et = getLastDateOfMonth(time);
  let st = getFirstDateOfMonth(time);
  return {st, et};
}

// 初始化下次提醒时间，年，偶数
function initEvenY(time) {
  let year = (new Date(time)).getFullYear();
  if (year%2 != 0) {
    year++;
  }
  let st = year + '-01-01';
  let et = year + '-12-31'
  return {st, et};
}

// 初始化下次提醒时间，年，奇数
function initOddY(time) {
  let year = (new Date(time)).getFullYear();
  if (year%2 == 0) {
    year++;
  }
  let st = year + '-01-01';
  let et = year + '-12-31'
  return {st, et};
}

// 初始化下次提醒时间，年，自定义
function initownY(time, ranges) {
  let year = (new Date(time)).getFullYear();
  let st = year + '-01-01';
  let et = year + ranges + '-12-31'
  return {st, et};
}

//初始化下次提醒时间，年，每年，一年
function initeveryY(time) {
  let year = (new Date(time)).getFullYear();
  let st = year + '-01-01';
  let et = year + '-12-31'
  return {st, et};
}

// 获取下一次提醒时间的方法
function getNextTime(item) {
  switch (item.type) {
    case 'y': {
      switch (item.y) {
        case 'every': everyY(item);
        break;
        case 'own': ownY(item);
        break;
        default: oddEvenY(item);
      }
    }
    break;
    case 'm': {
      switch(item.m) {
        case'every' :everyM(item);
        break;
        case'own' :ownM(item);
        break;
        default:oddEvenM(item);
      }
    }
    break;
    case 'd': {
      switch(item.d) {
        case'workday' : workday(item);
        break;
        case'weekend' : weekday(day);
        break;
        case'every' : everyD(item);
        break;
        case'own' : ownD(item);
        break;
        default: oddEvenD(item);
      }
    }
    break;
  }
}

// nextTime,天，偶数奇数天
function oddEvenD(item) {
  item.nextETime = item.nextSTime = GetDay(item.nextETime, 2);
  item.total++;
  updateHandle(item);
  addHis(item);
  if (item.nextETime < formatDate(new Date())) {
    // 关闭历史记录，并设定为用户错过
    closeHis(item, 3);
    if (item.targetTotal > item.total || item.targetTotal == 'max') {
      oddEvenD(item);
    }else{
      sleepHandle(item);
    }
  }else{
    eventStatusHandle(item);
  }
}

// nextTime,天，自定义
function ownD(item){
  let st = GetDay(item.nextETime, item.intervals);
  let et = GetDay(st, item.range);
  item.nextSTime = st;
  item.nextETime =et;
  item.total++;
  updateHandle(item);
  addHis(item);
  if (item.nextETime < formatDate(new Date())) {
    // 关闭历史记录，并设定为用户错过
    closeHis(item, 3);
    if (item.targetTotal > item.total || item.targetTotal == 'max') {
      ownD(item);
    }else{
      sleepHandle(item);
    }
  }else{
    eventStatusHandle(item);
  }
}

// nextTime,天，周末
function weekday(item) {
  item.nextSTime = item.nextETime = getWeekDay(item.nextSTime);
  item.total++;
  updateHandle(item);
  addHis(item);
  if (item.nextETime < formatDate(new Date())) {
    // 关闭历史记录，并设定为用户错过
    closeHis(item, 3);
    if (item.targetTotal > item.total || item.targetTotal == 'max') {
      weekday(item);
    }else{
      sleepHandle(item);
    }
  }else{
    eventStatusHandle(item);
  }
}

// nextTime,天，工作日
function workday(item) {
  item.nextSTime = item.nextETime = getWorkDay(item.nextSTime);
  item.total++;
  updateHandle(item);
  addHis(item);
  if (item.nextETime < formatDate(new Date())) {
    // 关闭历史记录，并设定为用户错过
    closeHis(item, 3);
    if (item.targetTotal > item.total || item.targetTotal == 'max') {
      workday(item);
    }else{
      sleepHandle(item);
    }
  }else{
    eventStatusHandle(item);
  }
}

// nextTime,天，每天
function everyD(item) {
  let st = GetDay(item.nextETime,1);
  item.nextETime = item.nextSTime =st;
  total++;
  updateHandle(item);
  addHis(item);
  if (item.nextETime < formatDate(new Date())) {
    // 关闭历史记录，并设定为用户错过
    closeHis(item, 3);
    everyD(item);
  }else{
    eventStatusHandle(item);
  }
}

// 获取最近的一个工作日 
function getWorkDay(data) {
  let day;
  do{
    data = GetDay(data, 1)
    day =(new Date(data)).getDay();
  }while( day == 6 || day == 0)
  return data;
}

// 获取最近的一个周末
function getWeekDay(data) {
  let day;
  do{
    data = GetDay(data, 1)
    day =(new Date(data)).getDay();
  }while( day == 1 || day == 2 || day == 3 || day == 4 || day == 5)
  return data;
}

// 获取指定的天
function GetDay(date, day) {
  var time = new Date(date);
  time.setDate(time.getDate() + day);//获取Day天后的日期 
  var y = time.getFullYear();
  var m = time.getMonth() + 1;//获取当前月份的日期 
  var d = time.getDate();
  m = m < 10? '0'+ m: m;
  d = d < 10? '0'+ d: d;
  return y + "-" + m + "-" + d;
}

// nextTime,月，奇数月，偶数月
function oddEvenM(item) {
  let st = Month(item.nextSTime, 2);
  let et = Month(item.nextETime, 2);
  item.nextSTime = st
  item.nextETime = et;
  item.total++;
  updateHandle(item);
  addHis(item);
  if (item.nextETime < formatDate(new Date())) {
    // 关闭历史记录，并设定为用户错过
    closeHis(item, 3);
    if (item.targetTotal > item.total || item.targetTotal == 'max') {
      oddEvenM(item);
    }else{
      sleepHandle(item);
    }
  }else{
    eventStatusHandle(item);
  }
}

// nextTime,月，自定义月
function ownM(item) {
  let st = Month(item.nextETime, item.intervals);
  let et = Month(st, item.ranges);
  item.nextSTime = st
  item.nextETime = et;
  item.total++;
  updateHandle(item);
  addHis(item);
  if (item.nextETime < formatDate(new Date())) {
    // 关闭历史记录，并设定为用户错过
    closeHis(item, 3);
    if (item.targetTotal > item.total || item.targetTotal == 'max') {
      ownM(item);
    }else{
      sleepHandle(item);
    }
  }else{
    eventStatusHandle(item);
  }
}

// nextTime,月，每月
function everyM(item) {
  let date = Month(item.nextSTime, 1);
  item.nextSTime = item.nextETime;
  item.nextETime = date;
  item.total++;
  updateHandle(item);
  addHis(item);
  if (item.nextETime < formatDate(new Date())) {
    // 关闭历史记录，并设定为用户错过
    closeHis(item, 3);
    everyM(item);
  }else{
    eventStatusHandle(item);
  }
}

// 获取指定的月份
function Month(date, month) {
  var time = new Date(date);
  time.setDate(time.getDate());//获取Day天后的日期 
  var y = time.getFullYear();
  var m;
  if (time.getMonth() + month + 1>12){
    y = y+1;
    m = time.getMonth() + month - 11;//获取当前月份的日期 d
  }else{
    m = time.getMonth() + month + 1;//获取当前月份的日期 d
  }
  var d = time.getDate();
  m = m < 10? '0'+ m: m;
  d = d < 10? '0'+ d: d;
  return y + "-" + m + "-" + d;
}

// 获取月末
function getLastDateOfMonth(time) {
  year = time.substring(0,4)
  month = time.substring(5,7)
	return new Date(year, month).toJSON().substring(0,10)
}

// 获取月初
function getFirstDateOfMonth(time) {
  time = time.substring(0,7)
	return new Date(time).toJSON().substring(0,10)
}


//nextTime,年,奇数，偶数
function oddEvenY(item) {
  let year = parseInt((new Date(item.nextETime)).getFullYear())+ 2;
  item.nextSTime = year.toString() +'-01-01';
  item.nextETime = year +'-12-30'
  item.total++;
  updateHandle(item);
  addHis(item);
  if (year < (new Date()),getFullYear()) {
    // 关闭历史记录，并设定为用户错过
   closeHis(item, 3);
   if (item.targetTotal > item.total || item.targetTotal == 'max') {
    oddEvenY(item);
   }else{
     sleepHandle(item);
   }
  }else{
   eventStatusHandle(item);
  }
 }

//nextTime,年自定义
function ownY(item) {
 let year = parseInt((new Date(item.nextETime)).getFullYear())+ parseInt(item.intervals);
 item.nextSTime = year.toString() +'-01-01';
 item.nextETime = (year+item.ranges) +'-12-30'
 item.total++;
 updateHandle(item);
 addHis(item);
 if (year < (new Date()),getFullYear()) {
   // 关闭历史记录，并设定为用户错过
  closeHis(item, 3);
  if (item.targetTotal > item.total || item.targetTotal == 'max') {
    ownY(item);
  }else{
    sleepHandle(item);
  }
 }else{
  eventStatusHandle(item);
 }
}

// nextTime,每年
function everyY (item) {
 let year = (new Date(item.nextSTime)).getFullYear()+1;
 item.nextSTime = year +'-01-01';
 item.nextETime = year+'-12-30'
 item.total++;
 updateHandle(item);
 addHis(item);
 if (year < (new Date()),getFullYear()) {
   // 关闭历史记录，并设定为用户错过
  closeHis(item, 3);
  everyY(item);
 }else{
  eventStatusHandle(item);
 }
}

// 更新事件提醒次数，提醒日期范围
function updateHandle(item) {
  let sql = '';
  if (item.total == item.targetTotal) {
    sql = `UPDATE  event SET eventIsSleep=2,total=`+ item.total +`,nextSTime='`+ item.nextSTime +`',nextETime='`+ item.nextETime +`' WHERE eventID=`+item.eventID;
  }else{
    sql = `UPDATE  event SET total=`+ item.total +`,nextSTime='`+ item.nextSTime +`',nextETime='`+ item.nextETime +`' WHERE eventID=`+item.eventID;
  }
  connection.query(sql, function (error, results, fields) {
    if(error) {
      console.log('更新事件提醒次数失败eventID:'+item.eventID);
    }else{
      console.log('更新事件提醒次数成功eventID:'+item.eventID,'--total:',item.total);
    }
  });
}

// 关闭对应的历史记录
function closeHis(item, log) {
  let sql =`UPDATE  history SET LOG = '`+ log+`',hisStatus=0 WHERE eventID = '`+ item.eventID +`' && hisOrder=`+item.total;
  connection.query(sql, function(error, results, fields){
    if (error) {
      console.log('关闭对应历史记录出错eventID:',item.eventID,' ---hisOrder:', item.total);
    }
  });
}

// 新增历史记录，状态为开启状态1
function addHis(item) {
  let sql = `INSERT INTO history(eventID,createTime,hisStatus,userid, hisOrder,startTime,endTime) VALUES ('`+ item.eventID +`', '`+ formatDate(new Date()) +`', 1,'`+ item.userId +`', '`+ item.total +`', '`+ item.nextSTime +`', '`+ item.nextETime +`')`;
  connection.query(sql, function(error, results, fields) {
    if (error) {
      console.log('新增历史记录失败');
    } else {
      console.log('新增历史记录成功');
    }
  });
}


// 事件设置为休眠
function sleepHandle (item) {
  let sql = 'update event set eventIsSleep=2 where eventID='+item.eventID;
  connection.query (sql, function (error, results, fields) {
    let data;
    if (error) {
      console.log('修改事件为睡眠状态失败,eventid:' + item.eventID);
      data.success = false;
    }
    else {
      console.log('修改事件为睡眠状态成功eventid:' + item.eventID);
    }
  });
}

// 判断事件状态是否更改为提醒、待提醒
function eventStatusHandle (item) {
  let start = day(item.nextSTime);
  let end = day(item.nextETime);
  let now = day(new Date());
  let sql ='';
  if (start <= now && end >= now) {
    sql = 'update event set eventStatus=1 where eventID='+item.eventID;
    console.log('设置事件状态为提醒中eventid:' + item.eventID);
  }else{
    sql = 'update event set eventStatus=0 where eventID='+item.eventID;
    console.log('设置事件状态为待提醒eventid:' + item.eventID);
  }
  connection.query (sql, function(error, results, fields) {
    if (error) {
      console.log('修改事件状态失败eventid:' + item.eventID);
      return false;
    }else {
      console.log('修改事件状态成功eventid:' + item.eventID);
      return true;
    }
  })
}


// 时间变成天数
function day(date) {
  date = time(date);
  let day = date / (1000*60*60*24)
  day = day.toFixed(0);
  return day;
}

// 时间变成毫秒值,ms
function time(date) {
  return (new Date(date)).getTime();
}

// 格式化时间,yyyy-mm-dd
function formatDate(time) {
  date = ''+ (new Date(time)).getFullYear()+ '-';
  date = date + ((new Date(time)).getMonth()+1<10? ('0'+((new Date(time)).getMonth()+1)): ((new Date(time)).getMonth()+1));
  date = date + ((new Date(time)).getDate()<10? ('-0'+ (new Date(time)).getDate()):('-'+(new Date(time)).getDate()));
  return date;
}

 // 关闭数据库连接
//  connection.end();
module.exports = router;