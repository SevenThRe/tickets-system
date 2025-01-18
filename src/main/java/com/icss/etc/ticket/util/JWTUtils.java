package com.icss.etc.ticket.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.icss.etc.ticket.entity.vo.UserViewBackDTO;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import java.util.Date;

public class JWTUtils {
    private static final String SECRET_KEY = "your_secret_key";
    private static final long EXPIRE_TIME = 24 * 60 * 60 * 1000;
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static String generateToken(String userId, String[] permissions, UserViewBackDTO u) {
        Date expireDate = new Date(System.currentTimeMillis() + EXPIRE_TIME);
        String userInfoJson = null;
        try {
            userInfoJson = objectMapper.writeValueAsString(u);
        } catch (Exception e) {
            throw new RuntimeException("序列化用户信息失败", e);
        }
        return Jwts.builder()
                .setSubject(userId)
                .claim("userId", userId)
                .claim("permissions", permissions)
                .claim("userInfo", userInfoJson)
                .setExpiration(expireDate)
                .signWith(SignatureAlgorithm.HS512, SECRET_KEY)
                .compact();
    }

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

    public static String updateToken(String token) {
        Claims claims = verifyToken(token);
        if (claims.getExpiration().getTime() - System.currentTimeMillis() < 12 * 60 * 60 * 1000) {
            String userId = claims.getSubject();
            String[] permissions = claims.get("permissions", String[].class);
            String userInfoJson = claims.get("userInfo", String.class);
            UserViewBackDTO userInfo = null;
            try {
                userInfo = objectMapper.readValue(userInfoJson, UserViewBackDTO.class);
            } catch (Exception e) {
                throw new RuntimeException("反序列化用户信息失败", e);
            }
            return generateToken(userId, permissions, userInfo);
        }
        return token;
    }

    public static UserViewBackDTO getTokenInfo(String token) {
        Claims claims = verifyToken(token);
        String userInfoJson = claims.get("userInfo", String.class);
        UserViewBackDTO userInfo = null;
        try {
            userInfo = objectMapper.readValue(userInfoJson, UserViewBackDTO.class);
        } catch (Exception e) {
            throw new RuntimeException("反序列化用户信息失败", e);
        }
        return userInfo;
    }
}