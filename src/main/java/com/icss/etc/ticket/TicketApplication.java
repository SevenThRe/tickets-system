package com.icss.etc.ticket;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.annotation.PropertySources;

/**
 * {@code TicketApplication}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@SpringBootApplication
@MapperScan("com.icss.etc.ticket.mapper")
@PropertySources({
        @PropertySource("classpath:application.properties"),
        @PropertySource("classpath:options.yml"),

})
public class TicketApplication {

    public static void main(String[] args) {
        SpringApplication.run(TicketApplication.class, args);
    }
}
