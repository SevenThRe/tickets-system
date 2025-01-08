/**
 * utils.js
 * 通用工具函数集合
 */

let utils = {
    /**
     * 格式化日期时间
     * @param {string} dateTimeStr - LocalDateTime格式的日期字符串: '2025-01-07T23:28:25'
     * @param {string} [format='YYYY-MM-DD HH:mm:ss'] - 日期格式化模板
     * @returns {string} 格式化后的日期字符串
     */
    formatDate(dateTimeStr, format = 'YYYY-MM-DD HH:mm:ss') {
        // 参数校验
        if (!dateTimeStr) return '-';

        try {
            // 解析LocalDateTime字符串
            // 处理 ISO格式的日期字符串 '2025-01-07T23:28:25'
            const [datePart, timePart] = dateTimeStr.split('T');
            const [year, month, day] = datePart.split('-').map(Number);
            const [hour, minute, second] = timePart ? timePart.split(':').map(Number) : [0, 0, 0];

            // 创建日期对象
            const date = new Date(year, month - 1, day, hour, minute, second);

            // 验证日期是否有效
            if (isNaN(date.getTime())) {
                console.warn('Invalid date:', dateTimeStr);
                return '-';
            }

            // 日期格式化映射
            const map = {
                'YYYY': date.getFullYear(),
                'MM': String(date.getMonth() + 1).padStart(2, '0'),
                'DD': String(date.getDate()).padStart(2, '0'),
                'HH': String(date.getHours()).padStart(2, '0'),
                'mm': String(date.getMinutes()).padStart(2, '0'),
                'ss': String(date.getSeconds()).padStart(2, '0')
            };

            // 替换格式化模板
            return format.replace(/YYYY|MM|DD|HH|mm|ss/g, matched => map[matched]);

        } catch (error) {
            console.error('Date format error:', error);
            return dateTimeStr; // 转换失败时返回原始字符串
        }
    },

    /**
     * 解析LocalDateTime字符串为Date对象
     * @param {string} dateTimeStr - LocalDateTime格式的日期字符串
     * @returns {Date|null} Date对象,解析失败返回null
     */
    parseLocalDateTime(dateTimeStr) {
        if (!dateTimeStr) return null;

        try {
            const [datePart, timePart] = dateTimeStr.split('T');
            const [year, month, day] = datePart.split('-').map(Number);
            const [hour, minute, second] = timePart ? timePart.split(':').map(Number) : [0, 0, 0];

            const date = new Date(year, month - 1, day, hour, minute, second);
            return isNaN(date.getTime()) ? null : date;

        } catch (error) {
            console.error('Date parse error:', error);
            return null;
        }
    },

    /**
     * 获取相对时间描述
     * @param {string} dateTimeStr - LocalDateTime格式的日期字符串
     * @returns {string} 相对时间描述,如"刚刚"、"5分钟前"等
     */
    getRelativeTime(dateTimeStr) {
        const date = this.parseLocalDateTime(dateTimeStr);
        if (!date) return '-';

        const now = new Date();
        const diff = now - date;
        const minute = 60 * 1000;
        const hour = minute * 60;
        const day = hour * 24;

        if (diff < minute) {
            return '刚刚';
        } else if (diff < hour) {
            return Math.floor(diff / minute) + '分钟前';
        } else if (diff < day) {
            return Math.floor(diff / hour) + '小时前';
        } else if (diff < day * 30) {
            return Math.floor(diff / day) + '天前';
        } else {
            return this.formatDate(dateTimeStr, 'YYYY-MM-DD');
        }
    },

    /**
     * 日期比较
     * @param {string} dateTime1 - LocalDateTime字符串1
     * @param {string} dateTime2 - LocalDateTime字符串2
     * @returns {number} 比较结果: -1小于、0等于、1大于
     */
    compareDateTime(dateTime1, dateTime2) {
        const date1 = this.parseLocalDateTime(dateTime1);
        const date2 = this.parseLocalDateTime(dateTime2);

        if (!date1 || !date2) return 0;

        const time1 = date1.getTime();
        const time2 = date2.getTime();

        return time1 === time2 ? 0 : time1 > time2 ? 1 : -1;
    },



    /**
     * 格式化文件大小
     * @param {number} bytes - 文件字节大小
     * @returns {string} 格式化后的文件大小
     */
    formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 B';

        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + units[i];
    },

    /**
     * 防抖函数
     * @param {Function} fn - 需要防抖的函数
     * @param {number} delay - 延迟时间(ms)
     * @returns {Function} 防抖后的函数
     */
    debounce(fn, delay) {
        let timer = null;
        return function(...args) {
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(() => {
                fn.apply(this, args);
                timer = null;
            }, delay);
        };
    },

    /**
     * 节流函数
     * @param {Function} fn - 需要节流的函数
     * @param {number} threshold - 时间阈值(ms)
     * @returns {Function} 节流后的函数
     */
    throttle(fn, threshold) {
        let last = 0;
        return function(...args) {
            const now = Date.now();
            if (now - last >= threshold) {
                fn.apply(this, args);
                last = now;
            }
        };
    },

    /**
     * 深拷贝对象
     * @param {Object} obj - 需要拷贝的对象
     * @returns {Object} 拷贝后的新对象
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;

        const clone = Array.isArray(obj) ? [] : {};

        for (let key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                clone[key] = this.deepClone(obj[key]);
            }
        }

        return clone;
    }
};
window.utils = utils;