package com.icss.etc.ticket.entity.sys;

import lombok.Data;

/**
 * {@code CacheConfig}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
public class CacheConfig {
    private boolean enableCache;
    private int expireTime;
    private String expireTimeUnit;
    private int maxSize;
}
