package com.icss.etc.ticket;

import com.icss.etc.ticket.constants.ApplicationConstants;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.ComponentScan;
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

public class TicketApplication {

    public static void main(String[] args) {

        ConfigurableApplicationContext run = SpringApplication.run(TicketApplication.class, args);

    }
}
