package com.icss.etc.ticket.service;
import java.util.List;

/**
 * {@code CacheService}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
public interface CacheService<T> {
    // 查询缓存，如果不存在则查询数据库并存入缓存
    List<T> getListWithCache(String className, String listKey, List<T> list);

    // 删除缓存
    void deleteCache(String className, String key);

    // 更新缓存
    void updateCache(String className, String key, Object value);
}