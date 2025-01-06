package com.icss.etc.ticket;

import com.icss.etc.ticket.constants.ApplicationConstants;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
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
//@ComponentScan(basePackages = {"com.icss.etc.ticket.controller",
//        "com.icss.etc.ticket.service",
//        "com.icss.etc.ticket.config",
//        "com.icss.etc.ticket.enums",
//        "com.icss.etc.ticket.entity",
//        "com.icss.etc.ticket.util",
//        "com.icss.etc.ticket.aspect"})
//@PropertySources({
//        @PropertySource("classpath:application.properties"),
//        @PropertySource("classpath:options.yml"),
//
//})
public class TicketApplication {

    public static void main(String[] args) {


        ConfigurableApplicationContext run = SpringApplication.run(TicketApplication.class, args);

//        System.out.println(run.getBean(ApplicationConstants.class));

    }
}
