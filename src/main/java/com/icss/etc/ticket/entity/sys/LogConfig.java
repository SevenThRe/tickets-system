package com.icss.etc.ticket.entity.sys;

import lombok.Data;

/**
 * {@code LogConfig}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
public class LogConfig {
    private String logPath;
    private String logLevel;
    private int logRetentionDays;
}
