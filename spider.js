const http = require("http");
const url = require("url");
const cheerio = require("cheerio");
const superagent = require("superagent");

/**
 * 爬取微博链接里的微博id
 * @param {*} url 微博链接
 * @returns
 */
function getId(url) {
  return new Promise((resolve, reject) => {
    superagent
      .get(url)
      .set({
        "user-agent":
          "Mozilla/5.0 (compatible; Baiduspider-render/2.0; +http://www.baidu.com/search/spider.html)",
      })
      .end((err, res) => {
        if (err) reject(err);
        const $ = cheerio.load(res.text);
        const id = $(".WB_cardwrap.WB_feed_type").attr("mid");
        const time = $(".WB_from.S_txt2 a.S_txt2").attr("title");
        const dom = $('.WB_row_line.WB_row_r4.clearfix.S_line2')
        let repost = $(dom).find('.ficon_forward').next().text()
        let comment = $(dom).find('.ficon_repeat').next().text()
        let like = $(dom).find('.ficon_praised').next().text()
        repost = repost == '转发' ? 0 : Number(repost)
        comment = comment == '评论' ? 0 : Number(comment)
        like = like == '赞' ? 0 : Number(like)
        resolve({
          id,
          data: {
            repost,
            comment,
            like,
          },
          time
        });
      });
  });
}

/**
 * 抓取该条转发的转评赞
 * @param {*} url 抓取请求的url
 * @returns
 */
function getInteracts(url) {
  return new Promise((resolve, reject) => {
    superagent
      .get(url)
      .set({
        "user-agent":
          "Mozilla/5.0 (compatible; Baiduspider-render/2.0; +http://www.baidu.com/search/spider.html)",
      }).end((err, res) => {
        if (err) reject(err);
        try {
          const $ = cheerio.load(res.text);
          const dom = $('.WB_row_line.WB_row_r4.clearfix.S_line2')
          let repost = $(dom).find('.ficon_forward').next().text()
          let comment = $(dom).find('.ficon_repeat').next().text()
          let like = $(dom).find('.ficon_praised').next().text()
          repost = repost == '转发' ? 0 : Number(repost)
          comment = comment == '评论' ? 0 : Number(comment)
          like = like == '赞' ? 0 : Number(like)
          resolve({
            repost,
            comment,
            like
          })
        } catch (error) {
          reject(error.message);
        }
      })
  })
}

/**
 * 抓取转发关系,每一代限三条
 * @param {*} id 抓取请求的id
 * @returns
 */
function getReposts(id) {
  return new Promise((resolve, reject) => {
    superagent
      .get("https://weibo.com/aj/v6/mblog/info/big?ajwvr=6&id=" + id)
      .set({
        cookie:
          "SINAGLOBAL=782000699330.2897.1561030946907; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9WhbJ-Pr7O9ZvSKHPApUv7Cv5JpX5KMhUgL.FoqXS05R1KMNeKq2dJLoIEQLxK-LBKBL12qLB0zLBoMLxK-LBKBL1-eLxKqL1-eLB-2LxK-LBKBLB--t; wb_view_log_6470897716=1536*8641.25; ALF=1650179553; SSOLoginState=1618643553; SCF=AqpnW2-Bxs7XrEqVCIMQ4QBC75Iqrmq_vN4FItxpVzU28tUAS84Q6_RmHXj98OcHijtV5NfiLIG4sjY9IOflMcI.; SUB=_2A25NfvoxDeRhGeBK7FIZ-SnLyjqIHXVuCmz5rDV8PUNbmtAKLVimkW9NR5E8ODZfnCYrpQiG9sfM6nsnpcjTIX0s; _s_tentry=login.sina.com.cn; UOR=,,login.sina.com.cn; Apache=3782902769201.7725.1618643552444; ULV=1618643552473:66:9:2:3782902769201.7725.1618643552444:1618626078756; webim_unReadCount=%7B%22time%22%3A1618643832703%2C%22dm_pub_total%22%3A0%2C%22chat_group_client%22%3A0%2C%22chat_group_notice%22%3A0%2C%22allcountNum%22%3A0%2C%22msgbox%22%3A0%7D",
      })
      .end(async (err, res) => {
        if (err) reject(err);
        try {
          const text = JSON.parse(res.text);
          const $ = cheerio.load(text.data.html);
          const repost = [];
          const elements = $(".list_li.S_line1.clearfix");
          for (const el of elements.slice(0, 3)) {
            const mid = $(el).attr("mid");
            const content = $(el)
              .find(".list_con .WB_text")
              .text();
            const time = $(el)
              .find(".list_con .WB_from.S_txt2 a")
              .attr("title");
            const url = $(el)
              .find(".list_con .WB_from.S_txt2 a").attr('href')
            const data = await getInteracts(url)
            const name = `${time}\n${content}`;
            const children = await getReposts(mid);
            console.info(children);
            repost.push({
              name,
              data,
              children,
            });
          }
          resolve(repost);
        } catch (error) {
          reject(error.message);
        }
      });
  });
}

const server = http
  .createServer(async function (req, res) {
    // 解析get请求传入的参数
    const obj = url.parse(req.url, true);

    // 确认请求路径,排除icon请求
    if (obj.pathname === "/") {
      // 拿到微博id
      const { id, data, time } = await getId(obj.query.link);
      // 拿到转发结果
      const children = await getReposts(id);
      // 设置返回格式
      res.writeHeader(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      const response = {
        time,
        data,
        children,
      };
      // 返回数据
      res.end(JSON.stringify(response));
    }
  })
  .listen(8000);
