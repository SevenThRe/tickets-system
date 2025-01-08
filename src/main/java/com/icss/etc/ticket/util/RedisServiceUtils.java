package com.icss.etc.ticket.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.*;

@Component
public class RedisServiceUtils {
    @Autowired
    private RedisUtil redisUtil;

    /**
     * Redis键的分隔符
     */
    public static final String DELIMITER = ":";

    /**
     * 列表后缀标识
     */
    public static final String LIST_SUFFIX = "list";

    /**
     * 默认缓存过期时间（1小时）
     */
    private static final long DEFAULT_EXPIRE_TIME = 3600;

    /**
     * 生成缓存键
     * @param className 类名
     * @param identifier 标识符
     * @return 格式化的缓存键
     */
    public String generateKey(String className, String identifier) {
        return String.format("%s%s%s",
                className.toLowerCase(),
                DELIMITER,
                identifier);
    }

    /**
     * 生成列表缓存键
     * @param className 类名
     * @return 列表缓存键
     */
    public String generateListKey(String className) {
        return String.format("%s%s%s",
                className.toLowerCase(),
                DELIMITER,
                LIST_SUFFIX);
    }

    /**
     * 缓存单个对象
     * @param key 缓存键
     * @param object 要缓存的对象
     */
    public <T> void cacheObject(String key, T object) {
        redisUtil.set(key, object, DEFAULT_EXPIRE_TIME);
    }

    /**
     * 缓存对象列表
     * @param className 类名
     * @param list 对象列表
     * @param idFieldName ID字段名
     */
    public <T> void cacheList(String className, List<T> list, String idFieldName) {
        // 存储列表大小
        String listKey = generateListKey(className);
        redisUtil.set(listKey, list.size(), DEFAULT_EXPIRE_TIME);

        // 存储每个对象
        for (T item : list) {
            try {
                String id = String.valueOf(item.getClass().getDeclaredField(idFieldName).get(item));
                String itemKey = generateKey(className, id);
                cacheObject(itemKey, item);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * 从缓存获取对象
     * @param key 缓存键
     * @param clazz 对象类型
     * @return 缓存的对象，如果不存在返回null
     */
    public <T> T getObject(String key, Class<T> clazz) {
        Object obj = redisUtil.get(key);
        if (obj != null && clazz.isInstance(obj)) {
            return clazz.cast(obj);
        }
        return null;
    }

    /**
     * 从缓存获取对象列表
     * @param className 类名
     * @param ids ID列表
     * @param clazz 对象类型
     * @return 对象列表
     */
    public <T> List<T> getList(String className, List<String> ids, Class<T> clazz) {
        List<T> result = new ArrayList<>();
        for (String id : ids) {
            String key = generateKey(className, id);
            T item = getObject(key, clazz);
            if (item != null) {
                result.add(item);
            }
        }
        return result;
    }

    /**
     * 更新缓存
     * @param className 类名
     * @param object 更新的对象
     * @param idFieldName ID字段名
     */
    public <T> void updateCache(String className, T object, String idFieldName) {
        try {
            String id = String.valueOf(object.getClass().getDeclaredField(idFieldName).get(object));
            String key = generateKey(className, id);

            // 清除旧缓存
            redisUtil.del(key);
            // 设置新缓存
            cacheObject(key, object);
            // 清除列表缓存强制刷新
            redisUtil.del(generateListKey(className));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 清除指定类名的所有缓存
     * @param className 类名
     */
    public void clearCache(String className) {
        String pattern = className.toLowerCase() + DELIMITER + "*";
        Set<String> keys = redisUtil.getListKey(pattern);
        if (keys != null && !keys.isEmpty()) {
            redisUtil.del(keys.toArray(new String[0]));
        }
    }
}