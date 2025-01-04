/**
 * RequestUtil.js
 * HTTP请求工具类
 *
 * 主要功能:
 * 1. 统一的请求封装和错误处理
 * 2. 请求拦截器(JWT令牌注入)
 * 3. 防重复提交
 * 4. 响应数据预处理
 * 5. 统一的错误提示
 */
class RequestUtil {
    constructor() {
        /**
         * 基础请求URL
         * @type {string}
         * @private
         */
        this.baseURL = window.CONFIG?.BASE_URL || '';

        /**
         * 存储进行中的请求
         * @type {Map<string, boolean>}
         * @private
         */
        this._pendingRequests = new Map();

        // 初始化全局Ajax配置
        this._initAjaxSetup();
    }

    /**
     * 初始化全局Ajax设置
     * @private
     */
    _initAjaxSetup() {
        $.ajaxSetup({
            timeout: 10000,  // 默认10秒超时
            contentType: 'application/json',
            beforeSend: (xhr) => {
                // 注入JWT令牌
                const token = localStorage.getItem('token');
                if (token) {
                    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                }
            }
        });

        // 全局错误处理
        $(document).ajaxError((event, jqXHR) => {
            if (jqXHR.status === 401) {
                // 未授权,跳转登录
                window.eventBus.emit('auth:logout');
                window.location.href = '/login.html';
                return;
            }
            // 其他错误处理
            console.error('请求失败:', jqXHR.responseJSON?.message || '服务器错误');
        });
    }

    /**
     * 生成请求唯一标识
     * @private
     * @param {Object} options 请求配置
     * @returns {string} 请求标识
     */
    _getRequestKey(options) {
        const { method, url, data } = options;
        let key = `${method}:${url}`;
        if (data) {
            key += `:${JSON.stringify(data)}`;
        }
        return key;
    }

    /**
     * 发送HTTP请求
     * @param {Object} options 请求配置
     * @param {string} options.method 请求方法
     * @param {string} options.url 请求地址
     * @param {Object} [options.data] 请求数据
     * @param {Object} [options.headers] 请求头
     * @returns {Promise} 请求Promise
     */
    async request(options) {
        const requestKey = this._getRequestKey(options);

        // 防重复提交检查
        if (this._pendingRequests.has(requestKey)) {
            return Promise.reject(new Error('重复请求已被阻止'));
        }

        // 标记请求开始
        this._pendingRequests.set(requestKey, true);

        try {
            const response = await $.ajax({
                url: this.baseURL + options.url,
                method: options.method,
                data: options.data ? JSON.stringify(options.data) : null,
                headers: options.headers,
                timeout: options.timeout || 10000
            });

            // 处理响应
            if (response.code === 200) {
                return response.data;
            } else {
                throw new Error(response.message || '请求失败');
            }
        } catch (error) {
            // 处理超时
            if (error.statusText === 'timeout') {
                throw new Error('请求超时,请稍后重试');
            }
            throw error;
        } finally {
            // 清理请求标记
            this._pendingRequests.delete(requestKey);
        }
    }

    /**
     * 发送GET请求
     * @param {string} url 请求地址
     * @param {Object} [params] 请求参数
     * @returns {Promise} 请求Promise
     */
    get(url, params) {
        const queryString = params ? '?' + $.param(params) : '';
        return this.request({
            method: 'GET',
            url: url + queryString
        });
    }

    /**
     * 发送POST请求
     * @param {string} url 请求地址
     * @param {Object} data 请求数据
     * @returns {Promise} 请求Promise
     */
    post(url, data) {
        return this.request({
            method: 'POST',
            url,
            data
        });
    }

    /**
     * 发送PUT请求
     * @param {string} url 请求地址
     * @param {Object} data 请求数据
     * @returns {Promise} 请求Promise
     */
    put(url, data) {
        return this.request({
            method: 'PUT',
            url,
            data
        });
    }

    /**
     * 发送DELETE请求
     * @param {string} url 请求地址
     * @returns {Promise} 请求Promise
     */
    delete(url) {
        return this.request({
            method: 'DELETE',
            url
        });
    }

    /**
     * 文件上传
     * @param {string} url 上传地址
     * @param {FormData} formData 表单数据
     * @returns {Promise} 上传Promise
     */
    upload(url, formData) {
        return $.ajax({
            url: this.baseURL + url,
            method: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
    }

    /**
     * 批量请求
     * @param {Array<Object>} requests 请求配置数组
     * @returns {Promise} Promise.all包装的请求数组
     */
    batch(requests) {
        const promises = requests.map(req => this.request(req));
        return Promise.all(promises);
    }
}

// 创建全局单例
window.requestUtil = new RequestUtil();