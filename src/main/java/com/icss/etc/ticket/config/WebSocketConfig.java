//package com.icss.etc.ticket.config;
//
//import com.icss.etc.ticket.interceptors.WebSocketInterceptor;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.stereotype.Component;
//import org.springframework.web.socket.config.annotation.EnableWebSocket;
//import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
//import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
//
///**
// * {@code WebSocketConfig}
// *
// * @author SevenThRe
// * @version 1.0
// * @since 1.0
// */
//@Configuration
//@EnableWebSocket
//public class WebSocketConfig implements WebSocketConfigurer {
//
//    @Autowired
//    private WebSocketInterceptor webSocketInterceptor;
//
//    @Override
//    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
//        registry.addHandler(webSocketServer(), "/ws/notification")
//                .addInterceptors(webSocketInterceptor)
//                .setAllowedOrigins("*");
//    }
//
//    @Bean
//    public WebSocketServer webSocketServer() {
//        return new WebSocketServer();
//    }
//}
//
//
//
