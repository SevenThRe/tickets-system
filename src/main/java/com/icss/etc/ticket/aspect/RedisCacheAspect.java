package com.icss.etc.ticket.aspect;

import com.icss.etc.ticket.annotation.RedisOperation;
import com.icss.etc.ticket.util.RedisServiceUtils;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.lang.annotation.Documented;
import java.lang.reflect.Method;
import java.util.List;

@Aspect
@Component
public class RedisCacheAspect {
    @Autowired
    private RedisServiceUtils redisServiceUtils;

    /**
     * 环绕通知处理缓存操作
     */
    @Around("@annotation(com.icss.etc.ticket.annotation.RedisOperation)")
    public Object handleCache(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        RedisOperation annotation = method.getAnnotation(RedisOperation.class);

        RedisOperation.OperationType operationType = determineOperationType(method, annotation);

        return operationType == RedisOperation.OperationType.QUERY ?
                handleQuery(joinPoint) : handleModification(joinPoint);
    }

    /**
     * 判断操作类型
     */
    private RedisOperation.OperationType determineOperationType(Method method, RedisOperation annotation) {
        if (annotation.type() != RedisOperation.OperationType.AUTO) {
            return annotation.type();
        }

        String methodName = method.getName().toLowerCase();
        return methodName.startsWith("get") ||
                methodName.startsWith("find") ||
                methodName.startsWith("select") ||
                methodName.startsWith("query") ?
                RedisOperation.OperationType.QUERY :
                RedisOperation.OperationType.MODIFY;
    }

    /**
     * 处理查询操作
     */
    private Object handleQuery(ProceedingJoinPoint joinPoint) throws Throwable {
        String className = joinPoint.getTarget().getClass().getSimpleName();
        Object[] args = joinPoint.getArgs();

        String cacheKey = generateCacheKey(className, joinPoint.getSignature().getName(), args);

        // 尝试从缓存获取
        Object cachedResult = redisServiceUtils.getObject(cacheKey,
                joinPoint.getSignature().getDeclaringType());
        if (cachedResult != null) {
            return cachedResult;
        }

        // 执行方法并缓存结果
        Object result = joinPoint.proceed();
        if (result != null) {
            if (result instanceof List) {
                redisServiceUtils.cacheList(className, (List<?>) result, "id");
            } else {
                redisServiceUtils.cacheObject(cacheKey, result);
            }
        }
        return result;
    }

    /**
     * 处理修改操作
     */
    private Object handleModification(ProceedingJoinPoint joinPoint) throws Throwable {
        String className = joinPoint.getTarget().getClass().getSimpleName();

        // 清除相关缓存
        redisServiceUtils.clearCache(className);

        // 执行修改操作
        Object result = joinPoint.proceed();

        // 更新缓存
        if (result != null) {
            redisServiceUtils.updateCache(className, result, "id");
        }

        return result;
    }

    /**
     * 生成缓存键
     */
    private String generateCacheKey(String className, String methodName, Object[] args) {
        StringBuilder keyBuilder = new StringBuilder(className.toLowerCase())
                .append(RedisServiceUtils.DELIMITER)
                .append(methodName);

        if (args != null && args.length > 0) {
            for (Object arg : args) {
                if (arg != null) {
                    keyBuilder.append(RedisServiceUtils.DELIMITER)
                            .append(arg.toString());
                }
            }
        }

        return keyBuilder.toString();
    }
}