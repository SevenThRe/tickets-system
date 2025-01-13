package com.icss.etc.ticket.entity.sys;

import lombok.Data;

import java.util.List;

/**
 * {@code UploadConfig}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
public class UploadConfig {
    String uploadPath;
    Long maxSize;
    List<String> allowedTypes;
    String avatarPath;
}
