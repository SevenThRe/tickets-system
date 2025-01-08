package com.icss.etc.ticket.config;

import com.icss.etc.ticket.interceptors.AuthInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
/**
 * {@code AppConfig}
 * 123
 * 配置类1521
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Configuration
public class AppConfig implements WebMvcConfigurer {
    private final AuthInterceptor authInterceptor;
    public AppConfig(AuthInterceptor authInterceptor) {
        this.authInterceptor = authInterceptor;
    }

    /**
     * 配置路径匹配
     * @param configurer 路径匹配配置器
     *                   为所有带有{@code RestController}注解的类添加/api前缀
     */
    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        configurer.addPathPrefix("/api", c -> c.isAnnotationPresent(RestController.class));
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/attachment/**").addResourceLocations("classpath:/static/attachment/");
    }

//    /**
//     * TODO: 身份验证拦截器
//     * 结合JWT实现身份验证
//     */
//    @Override
//    public void addInterceptors(InterceptorRegistry registry) {
//        // 添加登录认证拦截器
//        registry.addInterceptor(authInterceptor)
//                .addPathPatterns("/**")   // 拦截所有请求
//                .excludePathPatterns("/pages/auth/**")
//                .excludePathPatterns("/api/auth/**");   // 排除登录注册等不需要验证的路径
//
//    }

}