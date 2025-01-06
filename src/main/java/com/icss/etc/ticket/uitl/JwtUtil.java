package com.icss.etc.ticket.uitl;

/**
 * {@code JwtUtil}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
import io.jsonwebtoken.*;

import java.util.Date;

public class JwtUtil {

    private static final String SECRET = "your_secret_key"; // 密钥
    private static final long JWT_EXPIRATION = 604800000; // 一周的有效期
    // 生成JWT令牌

    public static String generateToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + JWT_EXPIRATION);

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(SignatureAlgorithm.HS512, SECRET)
                .compact();
    }
    // 验证JWT令牌
    public static Claims validateToken(String token) {
        try {
            return Jwts.parser().setSigningKey(SECRET).parseClaimsJws(token).getBody();
        } catch (ExpiredJwtException e) {
            // JWT过期

            e.printStackTrace();
        } catch (UnsupportedJwtException e) {
            // 不支持的JWT
            e.printStackTrace();
        } catch (MalformedJwtException e) {
            // JWT格式错误
            e.printStackTrace();
        } catch (SignatureException e) {
            // JWT签名不一致
            e.printStackTrace();
        } catch (IllegalArgumentException e) {
            // JWT为空或格式错误
            e.printStackTrace();
        }
        return null;
    }
}
