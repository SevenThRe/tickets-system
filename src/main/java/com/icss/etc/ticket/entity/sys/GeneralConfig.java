package com.icss.etc.ticket.entity.sys;

import lombok.Data;

/**
 * {@code GeneralConfig}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
public class GeneralConfig {
    private String systemName;
    private String systemICP;
    private Boolean openRegister;
    private String systemCopyright;

}
