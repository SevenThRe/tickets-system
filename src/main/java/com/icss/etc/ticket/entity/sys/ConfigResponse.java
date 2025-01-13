package com.icss.etc.ticket.entity.sys;


import lombok.Data;

/**
 * {@code ConfigResponse}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
public class ConfigResponse {
    private GeneralConfig general;
    private CacheConfig cache;
    private LogConfig log;
    private UploadConfig upload;

}
