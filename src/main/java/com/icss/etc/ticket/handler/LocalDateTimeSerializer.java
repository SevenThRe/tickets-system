package com.icss.etc.ticket.handler;

import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.data.redis.serializer.SerializationException;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * {@code LocalDateTimeSerializer}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
public class LocalDateTimeSerializer implements RedisSerializer<LocalDateTime> {
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public byte[] serialize(LocalDateTime localDateTime) throws SerializationException {
        if (localDateTime == null) {
            return new byte[0];
        }
        return localDateTime.format(formatter).getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public LocalDateTime deserialize(byte[] bytes) throws SerializationException {
        if (bytes == null || bytes.length == 0) {
            return null;
        }
        return LocalDateTime.parse(new String(bytes, StandardCharsets.UTF_8), formatter);
    }
}