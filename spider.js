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
        resolve({ id, time });
      });
  });
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
          "SUB=_2AkMXM300f8NxqwJRmP4Uzm7rbI9wyQ_EieKhb4zvJRMxHRl-yT9kqlM5tRB6PLNT28YEWvewpN-5kzs5WRNdAKZT-1br; SUBP=0033WrSXqPxfM72-Ws9jqgMF55529P9D9WWBR48eZR4oUj0kkog-AdRe; WBStorage=202104091419|undefined; SINAGLOBAL=7317627877531.534.1617949191473; wb_view_log=1360*7681; login_sid_t=cd4f31f88f9c556b51db1e210f275c3c; cross_origin_proto=SSL; _s_tentry=-; Apache=4125257925321.497.1617949242493; ULV=1617949242501:2:2:2:4125257925321.497.1617949242493:1617949191479; UOR=,,www.baidu.com",
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
            const name = `${time}\n${content}`;
            const children = await getReposts(mid);
            console.info(children);
            repost.push({
              name,
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
  .createServer(async function(req, res) {
    // 解析get请求传入的参数
    const obj = url.parse(req.url, true);

    // 确认请求路径,排除icon请求
    if (obj.pathname === "/") {
      // 拿到微博id
      const { id, time } = await getId(obj.query.link);
      // 拿到转发结果
      const children = await getReposts(id);
      // 设置返回格式
      res.writeHeader(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      const response = {
        time,
        children,
      };
      // 返回数据
      res.end(JSON.stringify(response));
    }
  })
  .listen(8000);
