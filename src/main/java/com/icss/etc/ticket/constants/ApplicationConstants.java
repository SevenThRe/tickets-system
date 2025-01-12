package com.icss.etc.ticket.constants;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

/**
 * {@code ApplicationConstants}
 *  全局常量类
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Component
@Getter
@Setter
@PropertySource("classpath:options.properties")
public class ApplicationConstants {







}
