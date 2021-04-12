const http = require("http");
const url = require("url");
const cheerio = require("cheerio");
const superagent = require("superagent");
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
          const text = JSON.parse(res.text)
          const $ = cheerio.load(text.data.html);
          const repost = [];
          const elements = $(".list_li.S_line1.clearfix");
          for (const el of elements.slice(0, 3)) {
            const mid = $(el).attr("mid");
            const content = $(el).find(".list_con .WB_text").text();
            const time = $(el).find(".list_con .WB_from.S_txt2 a").attr("title");
            const children = await getReposts(mid);
            console.info(children);
            repost.push({
              mid,
              content,
              time,
              children,
            });
          }
          resolve(repost);
        }catch(error) {
          reject(error.message)
        }
      });
  });
}

const server = http
  .createServer(function (req, res) {
    const obj = url.parse(req.url, true);
    console.info(obj.query.id);

    if (obj.pathname === "/") {
      getReposts(`${obj.query.id}`)
        .then((repost) => {
          console.info("啊啊", repost);
          res.writeHeader(200, {
            "Content-Type": "application/json",
          });

          res.end(JSON.stringify(repost));
        })
        .catch(() => {
          res.writeHeader(200, {
            "Content-Type": "text/plain; charset=utf-8",
          });

          res.end("出错了");
        });
    }
  })
  .listen(8080);
