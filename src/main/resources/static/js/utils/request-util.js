import { CONFIG } from '../../config/index';
import { eventBus } from './event-bus';

/**
 * HTTP请求工具类
 * 基于jQuery ajax的封装，提供请求拦截、防重复提交等功能
 */
class RequestUtil {
    constructor() {
        /**
         * 基础URL配置
         * @private
         */
        this.baseURL = CONFIG.BASE_URL;

        /**
         * 存储进行中的请求
         * @private
         * @type {Map<string, boolean>}
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
            timeout: 10000,
            contentType: 'application/json',
            beforeSend: (xhr) => {
                const token = localStorage.getItem(CONFIG.JWT.TOKEN_KEY);
                if (token) {
                    xhr.setRequestHeader(CONFIG.JWT.HEADER_KEY, `Bearer ${token}`);
                }
            }
        });

        // 全局错误处理
        $(document).ajaxError((event, jqXHR) => {
            if (jqXHR.status === 401) {
                eventBus.emit('auth:logout');
                window.location.href = '/login.html';
            } else {
                console.error('请求失败:', jqXHR.responseJSON?.message || CONFIG.MESSAGE.ERROR.SERVER);
            }
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
     * 发送请求
     * @param {Object} options 请求配置
     * @returns {Promise} 请求Promise
     */
    async request(options) {
        const requestKey = this._getRequestKey(options);

        // 防重复提交检查
        if (this._pendingRequests.has(requestKey)) {
            return Promise.reject(new Error('重复请求'));
        }

        this._pendingRequests.set(requestKey, true);

        try {
            const response = await $.ajax({
                url: this.baseURL + options.url,
                method: options.method,
                data: options.data ? JSON.stringify(options.data) : null,
                headers: options.headers,
                timeout: options.timeout
            });

            // 处理响应
            if (response.code === 200) {
                return response.data;
            } else {
                throw new Error(response.message || CONFIG.MESSAGE.ERROR.SERVER);
            }
        } catch (error) {
            // 处理超时
            if (error.statusText === 'timeout') {
                throw new Error(CONFIG.MESSAGE.ERROR.TIMEOUT);
            }
            throw error;
        } finally {
            // 清理请求标记
            this._pendingRequests.delete(requestKey);
        }
    }

    /**
     * GET请求
     * @param {string} url 请求地址
     * @param {Object} params 请求参数
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
     * POST请求
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
     * PUT请求
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
     * DELETE请求
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
     * 上传文件
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
                [CONFIG.JWT.HEADER_KEY]: `Bearer ${localStorage.getItem(CONFIG.JWT.TOKEN_KEY)}`
            }
        });
    }
}

// 导出工具类实例
export const request = new RequestUtil();