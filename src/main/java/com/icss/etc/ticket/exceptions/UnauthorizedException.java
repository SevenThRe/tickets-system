package com.icss.etc.ticket.exceptions;

/**
 * {@code UnauthorizedException}
 * @apiNote  无权限异常
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }

    public UnauthorizedException(String message, Throwable cause) {
        super(message, cause);
    }
}