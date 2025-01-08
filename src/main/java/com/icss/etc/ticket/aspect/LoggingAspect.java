package com.icss.etc.ticket.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;
import org.springframework.util.StopWatch;

@Aspect
@Slf4j
@Component
public class LoggingAspect {

    @Pointcut("execution(* com.icss.etc.ticket.service.impl.*(..))")
    public void serviceMethods() {}

    @Around("serviceMethods()")
    public Object logMethod(ProceedingJoinPoint joinPoint) throws Throwable {
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        Object result = null;
        try {
            // 执行目标方法
            result = joinPoint.proceed();
        } catch (Throwable e) {
            log.error("Error in method {}: {}", joinPoint.getSignature().toShortString(), e.getMessage());
            throw e;
        } finally {
            stopWatch.stop();
            log.info("Method: {} - Args: {} - Result: {} - Time: {} ms",
                    joinPoint.getSignature().toShortString(),
                    joinPoint.getArgs(),
                    result,
                    stopWatch.lastTaskInfo());
        }
        return result;
    }
}