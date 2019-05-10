var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var async = require('async');
var await = require('await');


// 创建连接
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'todolist'
});

// 测试函数
router.post('/test', function (req, res) {
  // 编码
  // res.setHeader('Content-Type','text/plain; charset=utf-8');
  // 输出接口
  console.log('接口:',req.url,' 参数：',req.body);
  // console.log(formatDate(GetDay(new Date(), -1)), 'ormatDate(GetDay(new Date(), -1))');
  // console.log(formatDate(new Date()));
  // console.log('2019-09-11 23:33:11'>'2019-09-11 23:38:11');
  // console.log(GetDay('2019-04-01', 3));
  let date = new Date();
  console.log(formatDate(date) + ' ' +getHMS(date));
});

// 登录
router.post('/login', function (req, res) {
  // 编码
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  // 输出接口
  console.log('接口:',req.url,' 参数：',req.body);
  let sql = `SELECT id FROM users WHERE NAME='`+ req.body.username +`' && PASSWORD='`+ req.body.password +`'`
  let data ={};
  data.success = false;
  connection.query(sql, function(error, result) {
    if(error) {
      console.log('登录查询信息失败');
      console.log(sql);
      res.end(JSON.stringify(data));
    }else{
      if(result.length > 0) {
        data.success = true;
        data.messags = '';
        data.id = result[0].id;
        res.end(JSON.stringify(data));
      }else{
        data.messags = '用户名或密码错误，请重试';
        res.end(JSON.stringify(data));
      }
    }
  });
});

// 注册
router.post('/sign', function (req, res) {
  // 编码
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  // 输出接口
  console.log('接口:',req.url,' 参数：',req.body);
  let sql = `SELECT * FROM users WHERE NAME='`+ req.body.username +`'`;
  let sql2 = `SELECT * FROM users WHERE email='`+ req.body.email +`'`;
  let data ={};
  data.success = false;
  connection.query(sql2, function(error, result){
    if(error) {
      console.log('新增用户校验邮箱失败');
      console.log(sql2);
      data.message = '注册失败，请稍后重试'
      res.end(JSON.stringify(data));
    }else{
      console.log(result,'result');
      if(result.length != 0) {
        data.message ='邮箱已存在，请使用别的邮箱注册';
        data.data ='email';
        res.end(JSON.stringify(data));
      }else{
        connection.query(sql, function(error, result2){
          if(error) {
            console.log('新增用户校验用户名失败');
            console.log(sql);
            data.message = '注册失败，请稍后重试'
            res.end(JSON.stringify(data));
          }else{
            if(result2.length != 0){
              data.message ='用户名已存在，请使用别的用户名注册'
              data.data = 'name';
              res.end(JSON.stringify(data));
            }else{
              let sql3 = `INSERT INTO users(NAME,PASSWORD,email) VALUES('`+ req.body.username +`','`+ req.body.password +`','`+ req.body.email +`')`
              connection.query(sql3, function(error, result) {
                if(error) {
                  console.log('新增用户失败');
                  console.log(sql);
                  data.message = '注册失败，请稍后重试'
                  res.end(JSON.stringify(data));
                }else{
                  data.success = true;
                  res.end(JSON.stringify(data));
                }
              });
            }
          }
        });
      }
    }
  })
});

// 个人中心
router.post('/userData', function (req, res) {
  // 编码
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  // 输出接口
  console.log('接口:',req.url,' 参数：',req.body);
  let sql = `SELECT * FROM users WHERE id='`+ req.body.id +`'`;
  let data ={};
  data.success = false;
  connection.query(sql, function(error, result) {
    if(error) {
      console.log('登录用户个人信息失败');
      console.log(sql);
      res.end(JSON.stringify(data));
    }else{
      data.success = true;
      data.name = result[0].name
      data.id = result[0].id;
      res.end(JSON.stringify(data));
    }
  });
});

// 修改密码
router.post('/editpassword', function (req, res) {
  // 编码
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  // 输出接口
  console.log('接口:',req.url,' 参数：',req.body);
  let sql = `UPDATE users set password='`+ req.body.ps +`' WHERE id='`+ req.body.id +`' && email= '`+ req.body.email +`'`;
  let data ={};
  data.success = false;
  connection.query(sql, function(error, result) {
    if(error) {
      console.log('修改密码失败');
      console.log(sql);
      res.end(JSON.stringify(data));
    }else{
      data.success = true;
      res.end(JSON.stringify(data));
    }
  });
});

// 验证邮箱
router.post('/edituser', function (req, res) {
  // 编码
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  // 输出接口
  console.log('接口:',req.url,' 参数：',req.body);
  let sql = `SELECT * FROM users WHERE id='`+ req.body.id +`' && email= '`+ req.body.email +`'`;
  let data ={};
  data.success = false;
  connection.query(sql, function(error, result) {
    if(error) {
      console.log('查询邮箱信息失败');
      console.log(sql);
      res.end(JSON.stringify(data));
    }else{
      if(result.length > 0){
        data.success = true;
        res.end(JSON.stringify(data));
      }else{
        res.end(JSON.stringify(data));
      }
    }
  });
});

// function (error, results, fields) 
// res.end(JSON.stringify(data));

var flag = false;
var hisflag = false;
// init();

// 删除所有的记录
router.post('/list/history/deleteAll', function(req, res) {
  // 编码
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  // 输出接口
  console.log('接口:',req.url,' 参数：',req.body);
  let data ={};
  data.success = false;
  let sql = `UPDATE history SET shows=1`;
  connection.query(sql, function(error) {
    if(error) {
      res.end(JSON.stringify(data));
      console.log('删除所有的记录失败');
      console.log(sql);
    }else{
      data.success =true;
      res.end(JSON.stringify(data));
    }
  });
});

// 删除记录
router.post('/list/history/delete', function(req, res) {
  // 编码
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  // 输出接口
  console.log('接口:',req.url,' 参数：',req.body);
  let data ={};
  data.success = false;
  let sql = `UPDATE history SET shows=1 WHERE hisId =`+ req.body.id;
  connection.query(sql, function(error) {
    if(error) {
      res.end(JSON.stringify(data));
      console.log('删除记录失败');
      console.log(sql);
    }else{
      data.success =true;
      res.end(JSON.stringify(data));
    }
  });
});

// 暂停事件
router.post('/list/history/pause', function (req, res) {
  // 编码
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  // 输出接口
  console.log('接口:',req.url,' 参数：',req.body);
  let sql = `UPDATE event SET eventIsSleep='1' WHERE eventID=` + req.body.id;
  let data = {};
  data.success = false;
  connection.query(sql, function(error) {
    if(error) {
      console.log('暂停事件失败');
      console.log(sql);
      res.end(JSON.stringify(data));
    }else{
      data.success = true;
      res.end(JSON.stringify(data));
    }
  });
});

// 事件清单
router.post('/eventlist', function (req, res) {
  // 编码
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  // 输出接口
  console.log('接口:',req.url,' 参数：',req.body);
  let data = {};
  let sql = `SELECT count(eventID) as total FROM event WHERE userid = '`+ req.body.userid +`'`;
  connection.query(sql, function(error, result) {
    if(error) {
      console.log('查询总数失败');
      console.log(sql);
    }else{
      data.total = result[0].total;
      console.log(data.total,'hahhahahahhahah');

    }
  });
  let startData =  (req.body.page-1)*req.body.rows;
  let sql1 = `SELECT * FROM event WHERE userid = '`+ req.body.userid +`' limit `+ startData +`,`+req.body.rows;
  data.success = false;
  connection.query(sql1, function(error, result){
    if(error){
      console.log('查询时间清单失败');
      console.log(sql);
      res.end(JSON.stringify(data));
    }else{
      data.success = true;
      data.data = [];
      for(let i = 0; i<result.length;i++){
        let temp = result[i];
        let unit;
        switch(temp.type) {
          case 'y': unit = "年";break;
          case 'm': unit = "月";break;
          case 'd': unit = "天";break;
        }
        switch(temp.y){
          case 'once': unit = '一' + unit; break;
          case 'workday': unit = '工作日'; break;
          case 'weekend': unit = '周末'; break;
          case 'every': unit = '每' + unit; break;
          case 'odd': unit = '奇数' + unit; break;
          case 'even': unit = '偶数' + unit; break;
          case 'own': unit = '一天' + unit; break;
        }
        switch(temp.eventIsSleep) {
          case '0': temp.eventIsSleep = '可以触发';break;
          case '1': temp.eventIsSleep = '暂时停止';break;
          case '2': temp.eventIsSleep = '永久失效';break;
        }
        switch(temp.priority){
          case '0': temp.priority = '最高';break;
          case '1': temp.priority = '中等';break;
          case '2': temp.priority = '最低';break;
        }
        if(temp.remark == undefined || temp.remark == 'undefined') {
          temp.remark = '暂无';
        }
        data.data.push({
          id: temp.eventID,
          name: temp.eventName,
          createTime: temp.createTime,
          nearTime: temp.nextSTime + ' ~ ' +temp.nextETime,
          unit: unit,
          createTime: temp.createTime,
          priority: temp.priority,
          remark: temp.remark,
          status: temp.eventIsSleep
        });
        
      }
      res.end(JSON.stringify(data));
    }
  });
});

// 查询某一日的完成清单
router.post('/day/before', async function (req, res) {
  // 编码
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  // 输出接口
  console.log('接口:',req.url,' 参数：',req.body);
  let date = formatDate(req.body.time);
  let data = {};
  let sql = `SELECT * FROM history WHERE usertime LIKE '`+ date +`%' && userid='`+ req.body.userid +`' ORDER BY usertime`;
  connection.query(sql, function (error,result){
    if (error) {
      console.log('查询往日清单失败');
      console.log(sql);
    }else{
      data.success = true;
      data.data = [];
      for(let i=0; i<result.length; i++) {
        let temp = result[i];
        data.data.push({name: temp.eventName, time: temp.usertime.substring(11, temp.usertime.length)});
      }
      res.end(JSON.stringify(data));
    }
  });
});

// 每天的todo完成清单
router.post('/day', async function (req, res) {
  // 编码
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  // 输出接口
  console.log('接口:',req.url,' 参数：',req.body);
  let data = {};
  let sql = `SELECT * FROM history WHERE usertime LIKE '`+ formatDate(new Date()) +`%' && userid='`+ req.body.userid +`' ORDER BY usertime`;
  connection.query(sql, function (error,result){
    if (error) {
      console.log('查询今日清单失败');
      console.log(sql);
    }else{
      data.success = true;
      data.data = [];
      for(let i=0; i<result.length; i++) {
        let temp = result[i];
        data.data.push({name: temp.eventName, time: temp.usertime.substring(11, temp.usertime.length)});
      }
      res.end(JSON.stringify(data));
    }
  });
});

// 今日与昨日，视图
router.post('/pandect', async function (req, res) {
   // 编码
   res.setHeader('Content-Type','text/plain; charset=utf-8');
   // 输出接口
   console.log('接口:',req.url,' 参数：',req.body);
  let data = {};
  data.success = false;
  let sql =`SELECT * FROM statistics WHERE createTime = '`+ formatDate(new Date()) +`' && userid ='`+ req.body.userid +`'`;
  connection.query(sql, function(error, result) {
    if (error) {
      console.log('查询统计失败');
      console.log(sql);
    }else{
      data.success = true;
      let temp =result[0];
      data.data = [];
      data.data.push({value: temp.doTotal, name: '已经完成的事情'});
      data.data.push({value: temp.cancel, name: '取消掉的事情'});
      data.data.push({value: temp.total - temp.cancel - temp.doTotal, name: '待做的事情'});
      data.names = ['已经完成的事情', '取消掉的事情','待做的事情']
      res.end(JSON.stringify(data));
    }
  });
});
router.post('/pandect/Yestday', async function (req, res) {
  // 编码
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  // 输出接口
  console.log('接口:',req.url,' 参数：',req.body);
 let data = {};
 data.success = false;
 let sql =`SELECT * FROM statistics WHERE createTime = '`+ GetDay(new Date(), -1) +`' && userid ='`+ req.body.userid +`'`;
 connection.query(sql, function(error, result) {
   if (error) {
     console.log('查询统计失败');
     console.log(sql);
   }else{
     if (result.length == 0) {
      res.end(JSON.stringify(data));
     }else {
      data.success = true;
      let temp =result[0];
      data.data = [];
      data.data.push({value: temp.doTotal, name: '已经完成的事情'});
      data.data.push({value: temp.cancel, name: '取消掉的事情'});
      data.data.push({value: temp.total - temp.cancel - temp.doTotal, name: '待做的事情'});
      data.names = ['已经完成的事情', '取消掉的事情','待做的事情']
      res.end(JSON.stringify(data));
     }
   }
 });
});

// 首页
router.post('/init', async function (req, res) {
  await init(req.body.userid);
  setTimeout(() => {
    res.end()
  },1300)
});

// 初入页面的响应
function init(userid){
   console.log('初入页面的响应');
   // 调用更新库中状态的方法
   isUpdate(userid);
   // 调用本日待做事项的方法
  //  isStatistics(2);
}

// function isStatistics(userid) {
//   let sql = `SELECT COUNT(pass) as nums FROM statistics WHERE userid = `+ userid +` && createTime='`+ formatDate(new Date()) +`'`;
//   connection.query(sql, function (error, results, fields) {
//     if(error) {
//       console.log('查询今日总计失败');
//     }else{
//       if(results[0] == 0) {
//         // 创建记录
//         createStatistics(userid);
//       }
//     }
//   });
// }

function getHMS(date){
  let h = date.getHours();
  let m = date.getMinutes();
  let s = date.getSeconds();
  h = h<10? '0'+h : h;
  m = m<10? '0'+m : m;
  s = s<10? '0'+s : s;
  return h + ':' + m + ':' + s;
}


// 查询昨日todo,根据事件名称
router.post('/list/todo/yesterdayByName', function(req,res){
  // 编码
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  // 输出接口
  console.log('接口:',req.url,' 参数：',req.body);
  let startData =  (req.body.page-1)*req.body.rows;
  let sql = `SELECT eventID,hisOrder,loges,createTime,startTime,endTime,hisId FROM history WHERE endTime<= '`+ formatDate(new Date()) +`'&& userid= '`+ req.body.userId +`' && hisStatus!=1 && eventName LIKE '`+ req.body.name +`%' limit `+ startData +`,`+req.body.rows;
  let sql3 = `SELECT count(userid) as total FROM history WHERE endTime<= '`+ formatDate(new Date()) +`'&& userid= '`+ req.body.userId +`' && hisStatus!=1 && eventName LIKE '%`+ req.body.name +`%'`;  
  let data = {};
  data.data = [];
  connection.query(sql3, function(error, results3) {
    if(error) {
      console.log('查询总数失败了');
      console.log(sql3);
    }else{
      data.total = results3[0].total
    }
  });
  connection.query(sql, function(error, results) {
    if(error) {
      console.log('获取历史记录失败');
      console.log(sql);
    }else{
      for(let i=0; i<results.length; i++){
        let temp ={};
        temp.eventID = results[i].eventID;
        let sql2 = `SELECT * FROM event WHERE eventID= '`+ temp.eventID +`' && eventName like '`+ req.body.name +`%'`;
        connection.query(sql2, function(error,results2) {
          if(error){
            console.log('查询昨日todo，查询事件详情失败');
            console.log(sql2);
          }
          else{
            temp.hisOrder = results[i].hisOrder;
            temp.loges = results[i].loges;
            switch(temp.loges) {
              case '0': temp.loges= '已完成';break;
              case '1': temp.loges= '已取消';break;
              case '2': temp.loges= '用户已终止';break;
              case '3': temp.loges= '用户错过';break;
              default: temp.loges= '';break;
            }
            temp.name = results2[0].eventName;
            temp.eventCreateTime = results2[0].createTime;
            temp.createTime = results[i].createTime;
            temp.startTime = results[i].startTime;
            temp.endTime = results[i].endTime;
            temp.id = results2[0].eventID;
            temp.hisId = results[i].hisId;
            switch(results2[0].eventIsSleep){
              case '0': temp.eventIsSleep = '可以触发';break;
              case '1': temp.eventIsSleep = '暂时停止';break;
              case '2': temp.eventIsSleep = '永久失效';break;
            }
            data.data.push(temp);
            if(i==results.length-1) { 
              data.success = true;
              res.end(JSON.stringify(data));
            }
          }
        });
      }
    }
  });
});


// 查询昨日todo
router.post('/list/todo/yesterday', function(req,res){
  // 编码
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  // 输出接口
  console.log('接口:',req.url,' 参数：',req.body);
  let startData =  (req.body.page-1)*req.body.rows;
  let sql = `SELECT eventID,hisOrder,loges,createTime,startTime,endTime,hisId FROM history WHERE endTime<= '`+ formatDate(new Date()) +`'&& userid= '`+ req.body.userId +`' && hisStatus!=1 && shows IS NULL limit `+ startData +`,`+req.body.rows;
  let sql3 = `SELECT count(userid) as total FROM history WHERE endTime<= '`+ formatDate(new Date()) +`'&& userid= '`+ req.body.userId +`' && hisStatus!=1 && shows IS NULL`;  
  let data = {};
  data.data = [];
  connection.query(sql3, function(error, results3) {
    if(error) {
      console.log('查询总数失败了');
      console.log(sql3);
    }else{
      data.total = results3[0].total
    }
  });
  connection.query(sql, function(error, results) {
    if(error) {
      console.log('获取历史记录失败');
      console.log(sql);
    }else{
      for(let i=0; i<results.length; i++){
        let temp ={};
        temp.eventID = results[i].eventID;
        let sql2 = `SELECT * FROM event WHERE eventID= '`+ temp.eventID +`'`;
        connection.query(sql2, function(error,results2) {
          if(error){
            console.log('查询昨日todo，查询事件详情失败');
            console.log(sql2);
          }
          else{
            temp.hisOrder = results[i].hisOrder;
            temp.loges = results[i].loges;
            switch(temp.loges) {
              case '0': temp.loges= '已完成';break;
              case '1': temp.loges= '已取消';break;
              case '2': temp.loges= '用户已终止';break;
              case '3': temp.loges= '用户错过';break;
              default: temp.loges= '';break;
            }
            temp.name = results2[0].eventName;
            temp.eventCreateTime = results2[0].createTime;
            temp.createTime = results[i].createTime;
            temp.startTime = results[i].startTime;
            temp.endTime = results[i].endTime;
            temp.id = results2[0].eventID;
            temp.hisId = results[i].hisId;
            switch(results2[0].eventIsSleep){
              case '0': temp.eventIsSleep = '可以触发';break;
              case '1': temp.eventIsSleep = '暂时停止';break;
              case '2': temp.eventIsSleep = '永久失效';break;
            }
            data.data.push(temp);
            if(i==results.length-1) { 
              data.success = true;
              res.end(JSON.stringify(data));
            }
          }
        });
      }
    }
  });
});

// 修改todo信息
router.post('/list/todo/totady/edit', function(req,res) {
  // 编码
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  // 输出接口
  console.log('接口:',req.url,' 参数：',req.body);
  let data = {};
  data.success = false;
  let sql =`UPDATE event SET remark='`+ req.body.remark +`',priority= '`+ req.body.type +`', eventName='`+ req.body.name +`' WHERE eventID=`+req.body.id;
  connection.query(sql, function(error) {
    if (error) {
      console.log('修改事件信息失败');
      console.log(sql);
    }else{
      data.success = true;
    }
    res.end(JSON.stringify(data));
  });
  let sql2 =`UPDATE history SET eventName='`+ req.body.name +`' WHERE eventName='`+ req.body.oldName +`'`;
  connection.query(sql2, function(error) {
    if(error) {
      console.log('修改历史记录中的名称失败');
    }else{
      console.log('修改历史记录中的名称成功');
    }
  }) 
});

// 用户删除提醒
router.post('/list/todo/today/delete', function(req,res) {
  // 编码
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  // 输出接口
  console.log('接口:',req.url,' 参数：',req.body);
  let data = {};
  data.success = false;
  let sql = `UPDATE event SET eventIsSleep='2',loges='1' WHERE eventID=`+ req.body.id;
  connection.query(sql, function (error, results, fields) {
    if(error){
      console.log('删除提醒失败');
      console.log(sql);
      res.end(JSON.stringify(data));
    }else{
      data.success = true;
      res.end(JSON.stringify(data));
    }
  });
});

// 用户取消提醒
router.post('/list/todo/today/cancel', function(req,res) {
  // 编码
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  // 输出接口
  console.log('接口:',req.url,' 参数：',req.body);
  let sql = `SELECT * FROM event WHERE eventID='`+ req.body.id+ `'`;
  let data = {};
  connection.query(sql, function (error, results, fields) {
    if (error) {
      console.log('获取事件信息失败eventID:',req.body.id);
      console.log(sql);
    }
    else{
      console.log('获取事件信息成功eventID:',req.body.id);
      let item = results[0];
      let sql2 = `UPDATE history SET hisStatus='0',usertime='`+ formatDate(new Date()) +`',loges='1' WHERE eventID= '`+ item.eventID +`' && userid= '`+ item.userId +`'&&hisOrder= '`+ item.total +`'`;
      connection.query(sql2, function (error, results, fields) {
        if (error) {
        console.log('用户取消提醒，关闭历史记录失败');
        console.log(sql2);
        }else{
         console.log('用户取消提醒，关闭历史记录成功');
          let sql3 = `UPDATE event SET eventStatus=2 WHERE eventID=`+item.eventID;
          connection.query(sql3, function(error, results, fields){
            if(error){
              console.log('用户取消，更新事件状态失败');
              console.log(sql3);
            }else {
              data.success = true;
              updateStatisticsCancel(item.userId)
              res.end(JSON.stringify(data));
            }
          });
        }
      });
    }
  });
});

// 用户取消，刷新今日统计
function updateStatisticsCancel (userid) {
  let sql =`UPDATE statistics SET cancel=cancel+1 WHERE userid='`+ userid +`' && createTime='`+ formatDate(new Date()) +`'`;
  connection.query(sql, function(error) {
    if(error) {
      console.log('用户取消，刷新今日统计失败');
      console.log(sql);
    }else{
      console.log('用户取消，刷新今日统计成功');
    }
  });
}

// 创建今日的总计
function createStatistics(userid) {
  let sql = `INSERT INTO statistics(userid,createTime,total,doTotal,cancel,pass) VALUES('`+ userid +`', '`+ formatDate(new Date()) +`',0,0,0,0)`;
  connection.query(sql, function (error, results, fields) {
    if(error) {
      console.log('创建今日统计记录失败');
      console.log(sql);
    }else{
      console.log('创建今日统计记录成功');
    }
  });
}

// 查询todo事项的详情
router.post('/list/todo/detail', function(req,res){
   // 编码
   res.setHeader('Content-Type','text/plain; charset=utf-8');
   // 输出接口
   console.log('接口:',req.url,' 参数：',req.body);
   let sql = `SELECT * FROM event WHERE eventID =`+ req.body.id;
   let data = {};
   connection.query(sql,  function (error, results, fields) {
     if(error) {
      console.log('查询todo详情失败');
      console.log(sql);
     }else{
      data.success = true;
      let temp =results[0];
      data.id = temp.eventID;
      data.type = temp.priority;
      data.remark = temp.remark;
      if (temp.remark == undefined || temp.remark == 'undefined') {
        data.remark = '';
      }
      data.name = temp.eventName;
      data.tagData = [];
      temp.tag = temp.tag.substring(1,temp.tag.length-1);
      temp.tag = temp.tag.split(',')
      for(let i =0; i<temp.tag.length; i++) {
        let obj = {};
        obj.key = i;
        obj.label = temp.tag[i];
        obj.disabled =false;
        data.tagData.push(obj);
      }
      data.remaining = temp.targetTotal=='max'?'无限': (parseInt(temp.targetTotal)-parseInt(temp.total));
      data.eventCreateTime = temp.createTime;
      switch (temp.type) {
        case 'y': {
          switch (temp.y) {
            case 'every': data.alertType = '每年';
            break;
            case 'own': data.alertType = '自定义年份';
            break;
            case'odd' : data.alertType = '奇数年';
            break;
            case'even' : data.alertType = '偶数年';
            break;
          }
        }
        break;
        case 'm': {
          switch(temp.m) {
            case'every' :data.alertType = '每月';
            break;
            case'own' :data.alertType = '自定义月份';
            break;
            case'odd' : data.alertType = '奇数月';
            break;
            case'even' : data.alertType = '偶数月';
            break;
          }
        }
        break;
        case 'd': {
          switch(temp.d) {
            case'workday' : data.alertType = '工作日';
            break;
            case'weekend' : data.alertType = '周末';
            break;
            case'every' : data.alertType = '每天';
            break;
            case'own' : data.alertType = '自定义天';
            break;
            case'odd' : data.alertType = '奇数天';
            break;
            case'even' : data.alertType = '偶数天';
            break;
          }
        }
        break;
      }
    //   var actions = [];
    //   for(let i =0; i<temp.tag.length; i++) {
    //     var action = () => {
    //       return new Promise(resolve => {
    //         let sql1 = `SELECT * FROM tag WHERE NAME = '`+temp.tag[i] + `'`;
    //         connection.query(sql1, function (error, results, fields) {
    //           if(error) {
    //             console.log('获取标签详情出错');
    //           }else {
    //             let obj = {};
    //             obj.key = results[0].id;
    //             obj.name = results[0].name;
    //             data.tag.push(obj);
    //           }
    //         });
    //       })
    //     }
    //     actions.push(action());
    //   }
    //   Promise.all(actions).then(() => {
    //     console.log('查询全部完毕')
    //     console.log(data.tag, 'data.tag');
    // })
      res.end(JSON.stringify(data));
      }
   });
});

// 事情完成的处理
router.post('/today/doit', function(req,res){
   // 编码
   res.setHeader('Content-Type','text/plain; charset=utf-8');
   // 输出接口
   console.log('接口:',req.url,' 参数：',req.body);
   // 修改事件状态，设置为提醒关闭
   let sql1 = `UPDATE event SET eventStatus=2 WHERE eventID=` +req.body.id;
   connection.query(sql1, function (error, results, fields) {
     if(error) {
        console.log('响应用户处理，更新事件失败');
        console.log(sql);
     }else{
      console.log('响应用户处理，更新事件成功');
     }
   });
   // 获取事件的信息
   let item = {};
   let sql2 = `SELECT * FROM event WHERE eventID =`+ req.body.id;
   connection.query(sql2,  function (error, results, fields) {
     if(error){
       console.log('查询事件详情失败');
      console.log(sql);
     }else{
       item = results[0];
        // 关闭历史记录，并设置为用户处理
        let date = new Date();
        let sql3 = `UPDATE history SET loges='0', hisStatus ='0', usertime='`+ formatDate(date) + ' ' +getHMS(date) +`' where eventID= '`+ item.eventID +`' && hisOrder='`+item.total + `'`;
        connection.query(sql3, async function (error, results, fields) {
          if(error) {
            console.log('响应用户处理，关闭历史记录失败');
            console.log(sql3);
          }else{
            console.log('响应用户处理，关闭历史记录成功');
            // 更新今日统计
            await updateStatisticsDoTotal(req.body.userid);
            // 计算下一次提醒时间
            await getNextTime(item);
          }
        });
     }
   });
   let data ={};
   data.success = true;
   res.end(JSON.stringify(data));
});

//更新统计，已做+1
function updateStatisticsDoTotal(userid) {
  let sql2 = `UPDATE statistics SET doTotal =doTotal+1 WHERE createTime='`+ formatDate(new Date()) +`' && userid='`+ userid +`'`;
  connection.query(sql2, function (error, results, fields) {
    if(error) {
      console.log('更新统计，已做+1，失败');
      console.log(sql);
    }else{
      console.log('更新统计，已做+1，成功');
    }
  });
}

// 更新统计，总数+1
function statisticsToTalAdd(userid) {
  let sql2 = `UPDATE statistics SET total = total+1 WHERE createTime='`+ formatDate(new Date()) +`' && userid='`+ userid +`'`;
  connection.query(sql2, function (error, results, fields) {
    if(error) {
      console.log('更新统计总数+1，失败');
      console.log(sql);
    }else{
      console.log('更新统计总数+1，成功');
    }
  });
} 


// 查询今天的待做事项
router.post('/list/todo/today', function(req,res) {
  // 编码
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  // 输出接口
  console.log('接口:',req.url,' 参数：',req.body);
  // 按照tag的查询处理
  let tags = [];
  let tagData = ' ' ;
  if (req.body.type == 'tag') {
    tag = req.body.tagData;
    for (let i =0; i<tag.length;i++) {
      tagData += `&& tag LIKE '%`+tag[i]+`%' `;
    }
    console.log(tagData, 'tagData');
  }
  let data = {};
  let sql1 = `SELECT count(eventID) as total FROM event WHERE eventStatus=1 && userId=`+ req.body.userId;
  if (req.body.type == 'tag') {
    sql1 = `SELECT count(eventID) as total FROM event WHERE eventStatus=1 && userId=`+ req.body.userId + tagData;
  }
  connection.query(sql1,  function (error, results, fields) {
    if(error) {
      console.log('查询总条数失败');
    }else{
      console.log(results);
      data.total = results[0].total
    }
  });
  let startData =  (req.body.page-1)*req.body.rows;
  // let endData = req.body.page*req.body.rows+req.body.rows;
  let sql = `SELECT * FROM event WHERE eventStatus=1 && userId=`+ req.body.userId +` limit `+ startData +`,`+req.body.rows;
  if (req.body.type == 'type') {
    sql = `SELECT * FROM event WHERE eventStatus=1 && userId=`+ req.body.userId + ` ORDER BY priority limit `+ startData +`,`+req.body.rows;
  }
  if (req.body.type == 'time') {
    sql = `SELECT * FROM event WHERE eventStatus=1 && userId=`+ req.body.userId + ` ORDER BY timepoint limit `+ startData +`,`+req.body.rows;
  }
  if (req.body.type == 'tag') {
    sql = `SELECT * FROM event WHERE eventStatus=1 && userId=`+ req.body.userId + tagData +` ORDER BY timepoint limit `+ startData +`,`+req.body.rows;
  }
  connection.query(sql,  function (error, results, fields) {
    if (error) {
      console.log('查询今日待做事项失败');
      console.log(sql);
    }else{
      data.success = true;
      data.data = []
      for(let i=0; i<results.length; i++) {
        let temp = {};
        temp.name = results[i].eventName;
        if (results[i].priority == 0) temp.type = 'alert';
        if (results[i].priority == 1) temp.type = 'need';
        if (results[i].priority == 2) temp.type = 'free';
        temp.remark = results[i].remark;
        console.log(results[i].timepoint, 'results[i].timepoint');
        console.log((new Date(results[i].timepoint)).getTime(), 'results[i].timepoint');
        if (results[i].timepoint) {
          temp.timepoint = (new Date(results[i].timepoint)).getTime();
        }else{
          temp.timepoint = 0;
        }
        temp.id = results[i].eventID;
        data.data.push(temp);
      }
      // if(flag) {
      //   createStatistics(req.body.id, data.total);
      //   flag = false;
      // }
      res.end(JSON.stringify(data));
    }
  });
});

// 新增todo
router.post('/todo/addEvent', function (req, res) {
  // 编码
  res.setHeader('Content-Type','text/plain; charset=utf-8');
  // 输出接口
  console.log('接口:',req.url,' 参数：',req.body);
  // 获取创建时间
  createTime = formatDate(new Date());
  //处理开始的参数
  let startTime;
  if (req.body.startTime == '' || req.body.startTime == undefined) {
    startTime = createTime;
  }else {
    startTime = formatDate((new Date(req.body.startTime)).getTime()+1000*60*60*8);
  }
  // 处理提醒方式的参数
  let intervals=0, ranges=0, targetTotal=0;
  targetTotal = 'max';
  if (req.body.type == 'once') targetTotal = 1;
  if (req.body.times == 'yes') {
    targetTotal = req.body.ownNum
  }
  intervals = req.body.ownInterval;
  ranges = req.body.ownRange;
  
  let temp = startTime || createTime;
  let item = initNextTime(temp, req.body.repeatType, req.body.type, ranges);

  let sql = 'insert into event(eventIsSleep, userId, intervals, ranges, targetTotal,createTime,startTime,nextSTime,nextETime,eventStatus,type,y,m,d,tag,priority,timepoint,remark,eventName) '
  +'values( 0, \''+ req.body.userId +'\', \''+ intervals +'\',  \''+ ranges +'\', \''+ targetTotal +'\',\''+ createTime +'\',\''+ startTime +'\', \''+ item.st +'\', \''+ item.et +'\', 0,\''+ req.body.repeatType +'\',\''+ req.body.type +'\',\''+ req.body.type +'\',\''+ req.body.type +'\',\'['+ req.body.tagData +']\',\''+ req.body.priority +'\',\''+ req.body.deadline +'\',\''+ req.body.remark +'\',\''+ req.body.name +'\')';

  connection.query(sql, function (error, results, fields) {
    let data = {};
    if (error) {
      console.log('查询数据库失败');
      data.success = false;
    }
    else {
      console.log('新增todo成功');
      data.success = true;
      initEvent();
    }
    res.end(JSON.stringify(data));
  });
});

// 添加新的标签
router.post('/tagData/add', function (req, res) {
  // 输出接口
  console.log('接口:',req.url,' 参数：',req.body);
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


// 初始化新建事件
function initEvent(){
  let sql = `SELECT * FROM event WHERE eventID =(SELECT MAX(eventID) FROM event)`;
  connection.query(sql, function(error, results, fields) {
    if(error) {
      console.log('初始化新建事件失败');
    } 
    else {
      let item = results[0];
      if(item.nextSTime <= formatDate(new Date())) {
        item.total++;
        addHis(item);
        updateHandle(item);
        eventStatusHandle(item);
      }
      console.log('初始化新建事件成功');
    }
  });
}

// 系统是否需要更新
function isUpdate(userid){
  let sql = `SELECT * FROM systemLog WHERE createTime='`+ formatDate(new Date()) + `'`;
  connection.query(sql, function(error, results, fields) {
    if(error){
      console.log('查询系统日志错误');
    }else{
      if(results.length ==0) {
        // flag = true;
        systemUpdate(userid);
      }
    }
  })
}

// 系统每日的更新
 function systemUpdate(userid) {
  console.log('每日更新');
  // 为所需事件更新休眠状态
  // toSleep();
  // toNextTime();
  let sql = `SELECT * FROM event WHERE eventIsSleep='0' && eventStatus!=2`;
  connection.query(sql, async function(error, results, fields) {
    if(error) {
      console.log('筛选更新数据失败');
      console.log(sql);
    }else{
      console.log('筛选到',results.length,'条需要更新的数据');
      for(let i=0; i<results.length;i++) {
          let item = results[i];
          console.log('更新事件eventID:',item.eventID, item.total);
          if (item.nextETime < formatDate(new Date())){
            console.log(item.total == item.targetTotal, item.total ,item.targetTotal,'---------------------');
            if(item.total == item.targetTotal) {
               await sleepHandle(item);
              // closeHis(item, 3);
              // await hisIsClose(item);
            }else{
              // hisflag = true;
              await hisIsClose(item);
              // getNextTime(item);
              // const fastPromise = new Promise((item, reject) => {  
              //   hisIsClose(item);
              // })
              // const slowPromise = new Promise((item, reject) => {  
              //   getNextTime(item);
              // })
              // co(function * () {  
              //   yield fastPromise;
              //   yield slowPromise;
              // }).then(() => {
              //   console.log('done')
              // })
              // hisIsClose(item);
              // getNextTime(item);
              
              // async.series({
              //   his:hisIsClose(item),
              //   nextTime:getNextTime(item)
              // });
              // hisIsClose(item);
              // while(true) {
              //   if(hflag) { 
              //     getNextTime(item);
              //     break;
              //   }
              // }
            }
          }
          if(item.nextSTime <= formatDate(new Date()) && item.nextETime >= formatDate(new Date())){
            await eventStatusHandle (item);
          }
      }
    }
  });
  let sql2 = `INSERT INTO systemlog(createTime) VALUES('`+ formatDate(new Date()) +`')`
  connection.query(sql2,  function(error, results, fields){
    if(error) {
      console.log('插入系统更新记录失败');
    }else{
      console.log('插入系统更新记录成功');
    }
  });
  let sql3 = `SELECT count(eventID) as total FROM event WHERE eventStatus='1' && userId='`+ userid + `'`;
  connection.query(sql3,  function (error, results, fields) {
    if(error) {
      console.log('查询总条数失败');
    }else{
      let total = results[0].total;
      createStatistics(userid, total);
    }
  });
}

// 计算下一次时间
function toNextTime(){
  
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
        // closeHis(item, log);
      });
    }
  });
}

// 判断某条记录是否关闭，并且关闭，如果没有则创建过期的历史记录
function hisIsClose(item) {
  let sql = `SELECT hisStatus FROM history WHERE eventID = '`+ item.eventID +`' && hisOrder='` + item.total +`'`;
  connection.query(sql,async function (error, results, fields) {
    if (error) {
      console.log('查询记录状态失败');
    }else{
      if(results.length == 0) {
        await addHisClose(item);
      }else{
        if(results[0].hisStatus == '1') {
          await closeHis(item, '3');
        }
      }
      if(item.total != item.targetTotal) {
         getNextTime(item)
      }
    }
  });
}

// 更新所有需要休眠数据
function toSleep(){
  let sql = `SELECT eventID FROM event WHERE total=targetTotal && targetTotal!='max' && eventIsSleep!=2`;
  connection.query(sql, function (error, results, fields) {
    if(error){
      console.log('筛选需要休眠的数据时发生错误');
    }
    else {
      for(let i = 0; i < results.length; i++) {
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
  let et = GetDay(time, (parseInt(ranges)-1));
  console.log(st,et,ranges,'-----------------------------')
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
  if ((new Date(time)).getMonth % 2 != 0) {
    date = Month(time, 1);
  }
  let et = getLastDateOfMonth(date);;
  let st = getFirstDateOfMonth(date);
  return {st, et};
}

// 初始化下次提醒时间，月，奇数
function initOddM(time) {
  let date = Month(time, 0);
  if ((new Date(time)).getMonth % 2 == 0) {
    date = Month(time, 1);
  }
  let et = getLastDateOfMonth(date);
  let st = getFirstDateOfMonth(date);
  return {st, et};
}

// 初始化下次提醒时间，月，自定义
function initownM(time, ranges) {
  let date = Month(time, (parseInt(ranges)-1));
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
  let et = year + (parseInt(ranges)-1) + '-12-31'
  return {st, et};
}

//初始化下次提醒时间，年，每年，一年
function initeveryY(time) {
  let year = (new Date(time)).getFullYear();
  console.log(year,'year');
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
        case'weekend' : weekday(item);
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
  let oddlflag = true;
  if(item.d == 'even') {
    oddlflag = false;
  }
  if (oddlflag){
    do {
      item.nextETime = item.nextSTime = GetDay(item.nextETime, 1);
    }while(item.nextETime.substring(8,10) %2 ==0)
  }else{
    do {
      item.nextETime = item.nextSTime = GetDay(item.nextETime, 1);
    }while(item.nextETime.substring(8,10) %2 !=0)
  }
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
  let st = GetDay(item.nextETime, parseInt(item.intervals)+1);
  let et = GetDay(st, parseInt(item.ranges)-1);
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
  item.total++;
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
  time.setDate(time.getDate() + parseInt(day));//获取Day天后的日期 
  var y = time.getFullYear();
  var m = time.getMonth() + 1;//获取当前月份的日期 
  var d = time.getDate();
  m = m < 10? '0'+ m: m;
  d = d < 10? '0'+ d: d;
  return y + "-" + m + "-" + d;
}

// nextTime,月，奇数月，偶数月
function oddEvenM(item) {
  // item.nextSTime = GetDay(item.nextETime, 1);
  item.nextSTime = Month(item.nextSTime, 2);
  item.nextETime = getLastDateOfMonth(item.nextSTime);
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
  item.nextSTime = Month(item.nextSTime, parseInt(item.intervals)+1);
  let et = Month(item.nextSTime, parseInt(item.ranges)-1);
  item.nextETime = getLastDateOfMonth(et);
  // item.nextSTime = st
  // item.nextETime = et;
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
  item.nextSTime = GetDay(item.nextETime, 1);
  item.nextETime = getLastDateOfMonth(item.nextSTime);
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
  // time.setDate(time.getDate());//获取Day天后的日期 
  var y = time.getFullYear();
  var m;
  if (time.getMonth() + month + 1>12){
    y = y+1;
    m = time.getMonth() + month - 11;//获取当前月份的日期 d
  }else{
    m = time.getMonth() + month + 1;//获取当前月份的日期 d
  }
  m = m < 10? '0'+ m: m;
  let times = y + '-' + m
  var d = (new Date(times)).getDate();
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
  let year = parseInt((new Date(item.nextSTime)).getFullYear())+ 2;
  console.log(year,'-----------------------------------------------');
  item.nextSTime = year +'-01-01';
  item.nextETime = year +'-12-31'
  item.total++;
  updateHandle(item);
  addHis(item);
  if (year < (new Date()).getFullYear()) {
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
 let year = parseInt((new Date(item.nextETime)).getFullYear())+ (parseInt(item.intervals)+1);
 item.nextSTime = year+'-01-01';
 item.nextETime = (year+parseInt(item.ranges)-1) +'-12-31'
 item.total++;
 updateHandle(item);
 addHis(item);
 if (year < (new Date()).getFullYear()) {
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
  console.log((new Date(item.nextSTime)).getFullYear(), '次年');
 let year = parseInt((new Date(item.nextSTime)).getFullYear())+1;
 item.nextSTime = year +'-01-01';
 item.nextETime = year +'-12-31'
 item.total++;
 updateHandle(item);
 addHis(item);
 console.log(year);
 console.log((new Date()).getFullYear());

 console.log(year < (new Date()).getFullYear());
 if (year < (new Date()).getFullYear()) {
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
  // if (item.total == item.targetTotal) {
  //   sql = `UPDATE  event SET eventIsSleep=2,total=`+ item.total +`,nextSTime='`+ item.nextSTime +`',nextETime='`+ item.nextETime +`' WHERE eventID=`+item.eventID;
  // }else{
  //   sql = `UPDATE  event SET total=`+ item.total +`,nextSTime='`+ item.nextSTime +`',nextETime='`+ item.nextETime +`' WHERE eventID=`+item.eventID;
  // }
  sql = `UPDATE  event SET total=`+ item.total +`,nextSTime='`+ item.nextSTime +`',nextETime='`+ item.nextETime +`' WHERE eventID=`+item.eventID;
  connection.query(sql, function (error, results, fields) {
    if(error) {
      console.log('更新事件提醒次数失败eventID:'+item.eventID);
    }else{
      console.log('更新事件提醒次数成功eventID:'+item.eventID,'--total:',item.total);
    }
  });
}

// 关闭对应的历史记录
async function closeHis(item, loges) {
  let sql =`UPDATE  history SET loges = '`+ loges+`',hisStatus='0' WHERE eventID = '`+ item.eventID +`' && hisOrder='`+item.total +`'`;
  connection.query(sql,await function(error, results, fields){
    if (error) {
      console.log('关闭对应历史记录出错eventID:',item.eventID,' ---hisOrder:', item.total);
      console.log(sql);
    }else{
      console.log('关闭历史记录成功eventID:',item.eventID,'----total', item.total);
    }
  });
}

//新增一个关闭的历史记录
function addHisClose(item) {
  let sql = `INSERT INTO history(eventName, eventID,createTime,hisStatus,userid,hisOrder,startTime,endTime,loges) VALUES ('`+ item.eventName +`','`+ item.eventID +`', '`+ formatDate(new Date()) +`', '0','`+ item.userId +`', '`+ item.total +`', '`+ item.nextSTime +`', '`+ item.nextETime +`','3')`;
  connection.query(sql, function(error, results, fields) {
    if (error) {
      console.log('新增过期历史记录失败');
      console.log(sql);
    } else {
      console.log('新增过期历史记录成功');
    }
  });
}

// 新增历史记录，状态为开启状态1
function addHis(item) {
  let sql = `INSERT INTO history(eventName, eventID,createTime,hisStatus,userid,hisOrder,startTime,endTime) VALUES ('`+ item.eventName +`', '`+ item.eventID +`', '`+ formatDate(new Date()) +`', '1','`+ item.userId +`', '`+ item.total +`', '`+ item.nextSTime +`', '`+ item.nextETime +`')`;
  connection.query(sql, function(error, results, fields) {
    if (error) {
      console.log('新增历史记录失败');
      console.log(sql);
    } else {
      console.log('新增历史记录成功');
    }
  });
}


// 事件设置为休眠
function sleepHandle (item) {
  let sql = 'update event set eventIsSleep=2, eventStatus=3 where eventID='+item.eventID;
  connection.query (sql, function (error, results, fields) {
    let data;
    if (error) {
      console.log('修改事件为睡眠状态失败,eventid:' + item.eventID);
      data.success = false;
    }
    else {
      console.log('修改事件为睡眠状态成功eventid:' + item.eventID);
      hisIsClose(item);
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
    statisticsToTalAdd(item.userId)
  }else{
    sql = 'update event set eventStatus=0 where eventID='+item.eventID;
    console.log('设置事件状态为待提醒eventid:' + item.eventID);
  }
  connection.query (sql, function(error, results, fields) {
    if (error) {
      console.log('修改事件状态失败eventid:' + item.eventID);
    }else {
      console.log('修改事件状态成功eventid:' + item.eventID);
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