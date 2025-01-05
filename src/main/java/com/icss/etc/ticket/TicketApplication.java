package com.icss.etc.ticket;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.annotation.PropertySources;

@MapperScan("com.icss.etc.ticket.mapper")
@SpringBootApplication
@PropertySources({
//        @PropertySource("classpath:application.properties"),
        @PropertySource("classpath:option.yml")
})
public class TicketApplication {

    public static void main(String[] args) {
        SpringApplication.run(TicketApplication.class, args);
    }

}
