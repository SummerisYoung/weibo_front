export default {
    // 时间戳转换成指定格式日期
    dateFormat: function (timestamp, formats) {
        // formats格式包括
        // 1. Y-m-d
        // 2. Y-m-d H:i:s
        // 3. Y年m月d日
        // 4. Y年m月d日 H时i分
        formats = formats || "Y-m-d H:i";

        // 判断位数不足两位的要在前面加0，比如9要变成09
        let zero = function (value) {
            if (value < 10) {
                return "0" + value;
            }
            return value;
        };

        // 格式化传入的时间戳，长度如果小于13位(以秒为单位)，要加三个零，变成以毫秒为单位的
        timestamp =
            timestamp.length < 13 ? Number(timestamp + "000") : Number(timestamp);

        // 时间戳转日期
        let myDate = timestamp ? new Date(timestamp) : new Date();

        // 得到日期年份
        let year = myDate.getFullYear();
        // 计算日期月份
        let month = zero(myDate.getMonth() + 1);
        // 计算日期天数
        let day = zero(myDate.getDate());

        // 计算时分秒
        let hour = zero(myDate.getHours());
        let minite = zero(myDate.getMinutes());
        let second = zero(myDate.getSeconds());

        // 把字母Y|m|d|H|i|s转换成对应的年月日时分秒
        return formats.replace(/Y|m|d|H|i|s/gi, function (matches) {
            return {
                Y: year,
                m: month,
                d: day,
                H: hour,
                i: minite,
                s: second,
            }[matches];
        });
    },
    // 根据给定时间获取数据库内该时间范围内的开始时间戳和结束时间戳
    dateRange: async function (startTime, endTime, query) {
        // 查询数据库里距离开始时间最近的时间戳
        query.equalTo("time", ">=", `${Date.parse(startTime) / 1000}`);
        query.limit(1);
        // 把开始时间置为该时间戳
        await query.find().then((res) => {
            startTime = Number(res[0].time);
        });

        // 查询数据库里距离结束时间最近的时间戳，使用>=来包括该时间
        query.equalTo("time", ">=", `${Date.parse(endTime) / 1000}`);
        query.limit(1);
        // 把结束时间置为该时间戳
        await query.find().then((res) => {
            endTime = Number(res[0].time);
        });
        return [startTime, endTime]
    }
}
