package com.icss.etc.ticket.handler;

import org.springframework.core.convert.converter.Converter;
import org.springframework.core.convert.converter.GenericConverter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * {@code LocalDateTimeToStringConverter}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
public class LocalDateTimeToStringConverter implements Converter<LocalDateTime, String> {
    private DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public String convert(LocalDateTime source) {
        return source == null ? null : source.format(formatter);
    }
}