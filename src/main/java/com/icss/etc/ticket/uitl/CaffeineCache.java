package com.icss.etc.ticket.uitl;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;


import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * {@code CaffeineCache}
 * 缓存工具类 用于缓存数据 以减少数据库访问次数
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Component
@Slf4j
@ConfigurationProperties(prefix = "cache")
public class CaffeineCache {
    /**
     * 缓存对象
     */
    private final Cache<String, Object> cache;
    /**
     * 最大缓存大小
     */
    @Value("${max-size:1000}")
    private static final long MAX_CACHE_SIZE = 1000;
    /**
     * 缓存过期时间
     */
    @Value("${expire-time:10}")
    private final static int EXPIRE_TIME = 1;
    /**
     * 缓存过期时间单位
     */
    @Value("${expire-time-unit:MINUTES}")
    private final static TimeUnit EXPIRE_TIME_UNIT = TimeUnit.MINUTES;
    /**
     * 构造方法
     */
    public CaffeineCache() {
        this.cache = Caffeine.newBuilder()
                .maximumSize(MAX_CACHE_SIZE)  // 设置最大缓存项数
                .expireAfterWrite(EXPIRE_TIME, EXPIRE_TIME_UNIT)  // 设置写缓存后n秒钟过期
                .build();
    }
    /**
     * 从缓存中获取对象
     * @param key 缓存的key
     * @param type 缓存的对象类型
     * @param <T> 缓存的对象类型
     * @return 缓存的对象
     */
    public <T> T getFromCache(String key, Class<T> type) {
        return (T) cache.getIfPresent(key);
    }

    /**
     * 将对象放入缓存
     * @param key 缓存的key
     * @param value 缓存的对象
     */
    public void putToCache(String key, Object value) {
        cache.put(key, value);
    }
    /**
     * 将列表放入缓存
     * @param keyName 列表中对象的属性名
     * @param list 列表
     * @param <T> 列表中对象的类型
     */
    public <T> void putListToCache(String keyName,List<T> list) {
        Method get = null;
        try {
            get = list.get(0).getClass().getMethod("get" + keyName);
            for (T t : list) {
                cache.put(String.valueOf(get.invoke(t)), t);
            }
        } catch (NoSuchMethodException e) {
            log.error("缓存失败，找不到方法：get{}", keyName);
            e.printStackTrace();
        } catch (InvocationTargetException e) {
            log.error("缓存失败，调用目标异常");
            throw new RuntimeException(e);
        } catch (IllegalAccessException e) {
            log.error("缓存失败，非法访问");
            throw new RuntimeException(e);
        }
        if (get == null) {
            return;
        }
    }


    /**
    * 失效缓存
    * @param key 缓存的key
    */
    public void invalidateCache(String key) {
        cache.invalidate(key);
    }

    /**
     * 清空缓存
     */
    public void clearCache() {
        cache.invalidateAll();
    }
}
