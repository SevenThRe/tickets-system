import {eventBus} from "./event-bus";

/**
 * HTTP请求工具类
 * 基于jQuery ajax的封装
 * @constructor RequestUtil 默认携带一个baseURL属性，用于存储请求的基础URL
 * @method request(options) 发起请求，options参数为请求配置对象，包含url、method、data等属性
 * @method get(url, params) 发起GET请求，url为请求URL，params为请求参数对象
 * @method post(url, data) 发起POST请求，url为请求URL，data为请求数据对象
 * @method put(url, data) 发起PUT请求，url为请求URL，data为请求数据对象
 * @method delete(url) 发起DELETE请求，url为请求URL
 * @method _getRequestKey(options) 生成请求唯一标识
 * @method _initAjaxSetup() 初始化全局Ajax设置
 * @method _debug() 打印调试信息
 * @method _warn() 打印警告信息
 * @method _error() 打印错误信息
 */
class RequestUtil {
    constructor() {
        this.baseURL = '/api';
        this._pendingRequests = new Map();
        this._initAjaxSetup();
    }

    /**
     * 初始化全局Ajax设置
     */
    _initAjaxSetup() {
        $.ajaxSetup({
            timeout: 10000,
            contentType: 'application/json',
            beforeSend: (xhr) => {
                const token = localStorage.getItem('token');
                if (token) {
                    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                }
            }
        });

        // 全局错误处理
        $(document).ajaxError((event, jqXHR) => {
            if (jqXHR.status === 401) {
                eventBus.emit('auth:logout');
                window.location.href = '/login.html';
            }

        });
    }

    /**
     * 请求方法
     */
    request(options) {
        const requestKey = this._getRequestKey(options);

        if (this._pendingRequests.has(requestKey)) {
            return Promise.reject(new Error('重复请求'));
        }

        this._pendingRequests.set(requestKey, true);

        return new Promise((resolve, reject) => {
            $.ajax({
                url: this.baseURL + options.url,
                method: options.method,
                data: options.data ? JSON.stringify(options.data) : null,
                success: (response) => {
                    if (response.code === 200) {
                        resolve(response.data);
                    } else {
                        reject(new Error(response.message || '请求失败'));
                    }
                },
                error: (jqXHR) => {
                    reject(new Error(jqXHR.responseJSON?.message || '网络错误'));
                },
                complete: () => {
                    this._pendingRequests.delete(requestKey);
                }
            });
        });
    }

    // GET请求
    get(url, params) {
        const queryString = params ? '?' + $.param(params) : '';
        return this.request({
            method: 'GET',
            url: url + queryString
        });
    }

    // POST请求
    post(url, data) {
        return this.request({
            method: 'POST',
            url,
            data
        });
    }

    // PUT请求
    put(url, data) {
        return this.request({
            method: 'PUT',
            url,
            data
        });
    }

    // DELETE请求
    delete(url) {
        return this.request({
            method: 'DELETE',
            url
        });
    }

    /**
     * 生成请求唯一标识
     */
    _getRequestKey(options) {
        return `${options.method}:${options.url}`;
    }
}

export const request = new RequestUtil();
export default RequestUtil;