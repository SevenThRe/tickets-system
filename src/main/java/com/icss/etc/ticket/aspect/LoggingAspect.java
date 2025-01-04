package com.icss.etc.ticket.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Arrays;

/**
 * @ClassName LoggingAspect
 * @Author SevenThRe
 * @Description 日志切面类
 * @Date 周六 22:38
 * @Version 1.0
 */
@Aspect
public class LoggingAspect {

    Logger log = LoggerFactory.getLogger(getClass());
    @Pointcut(value = "execution(* com.icss.etc.ticket.service.*.*(..))")
    public void serviceMethods() {}

    @Before("serviceMethods()")
    public void beforeAdvice(JoinPoint joinPoint) {
        log.info("Entering method: " + joinPoint.getSignature().getName());
        log.debug("Arguments: " + Arrays.toString(joinPoint.getArgs()));
    }

    @After("serviceMethods()")
    public void afterAdvice(JoinPoint joinPoint) {
        log.info("Exiting method: " + joinPoint.getSignature().getName());
    }

    @AfterThrowing(pointcut = "serviceMethods()", throwing = "error")
    public void afterThrowingAdvice(JoinPoint joinPoint, Throwable error) {
        log.error("Exception in method: " + joinPoint.getSignature().getName(), error);
    }

    @Around("serviceMethods()")
    public Object aroundAdvice(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        try {
            return proceedingJoinPoint.proceed();
        } finally {
            long endTime = System.currentTimeMillis();
            log.info("Execution time of method: " + proceedingJoinPoint.getSignature().getName() + " is " + (endTime - startTime) + " ms");
        }
    }
}