export default {
    // 时间戳转换成指定格式日期
    dateFormat: function (timestamp, formats) {
        // formats格式包括
        // 1. Y-m-d
        // 2. Y-m-d H:i:s
        // 3. Y年m月d日
        // 4. Y年m月d日 H时i分
        formats = formats || "Y-m-d H:i";

        let zero = function (value) {
            if (value < 10) {
                return "0" + value;
            }
            return value;
        };

        // 格式化传入的时间戳
        timestamp =
            timestamp.length < 13 ? Number(timestamp + "000") : Number(timestamp);

        let myDate = timestamp ? new Date(timestamp) : new Date();

        let year = myDate.getFullYear();
        let month = zero(myDate.getMonth() + 1);
        let day = zero(myDate.getDate());

        let hour = zero(myDate.getHours());
        let minite = zero(myDate.getMinutes());
        let second = zero(myDate.getSeconds());

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
    }
}
