package com.icss.etc.ticket.util;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import javax.crypto.spec.SecretKeySpec;
import javax.xml.bind.DatatypeConverter;
import java.security.Key;
import java.util.Date;

/**
 * Java web token 工具类
 */
public class JWTUtils {
    private static final String SECRET_KEY = "your_secret_key"; // 密钥
    private static final long EXPIRE_TIME = 24 * 60 * 60 * 1000; // Token有效期24小时

    /**
     * 生成Token
     */
    public static String generateToken(String userId, String username, String role) {
        Date expireDate = new Date(System.currentTimeMillis() + EXPIRE_TIME);
        return Jwts.builder()
                .setSubject(userId)
                .claim("username", username)
                .claim("role", role)
                .setExpiration(expireDate)
                .signWith(SignatureAlgorithm.HS512, SECRET_KEY)
                .compact();
    }

    /**
     * 验证Token
     */
    public static Claims verifyToken(String token) {
        try {
            return Jwts.parser()
                    .setSigningKey(SECRET_KEY)
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            throw new RuntimeException("Token无效");
        }
    }

    /**
     * 更新Token
     */
    public static String updateToken(String token) {
        Claims claims = verifyToken(token);
        // 如果token还有12小时就过期，则更新token
        if (claims.getExpiration().getTime() - System.currentTimeMillis() < 12 * 60 * 60 * 1000) {
            return generateToken(claims.getSubject(),
                    claims.get("username", String.class),
                    claims.get("role", String.class));
        }
        return token;
    }
}
