package com.icss.etc.ticket.entity;

import com.icss.etc.ticket.enums.CodeEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code R}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class R<T> {

    private int code; // 响应的状态码
    private String msg; // 响应的消息
    private T data; // 响应的数据体

    /**
     * 用于构建成功的响应，默认状态码和消息，不携带数据
     * @return  响应对象
     * @param <T> 响应的数据类型
     */
    public static <T> R<T> OK() {
        return R.<T>builder()
                .code(CodeEnum.OK.getCode())
                .msg(CodeEnum.OK.getMsg())
                .build();
    }


    /**
     * 用于构建成功的响应，携带数据
     * @param data 响应的数据体
     */
    public static <T> R<T> OK(T data) {
        return R.<T>builder()
                .code(CodeEnum.OK.getCode())
                .msg(CodeEnum.OK.getMsg())
                .data(data)
                .build();
    }

    /**
     * 用于构建失败的响应，默认错误码和消息
     * @return 响应对象
     * @param <T> 响应的数据类型
     */
    public static <T> R<T> FAIL() {
        return R.<T>builder()
                .code(CodeEnum.FAIL.getCode())
                .msg(CodeEnum.FAIL.getMsg())
                .build();
    }

    /**
     * 用于构建失败的响应，携带状态码和消息，不携带数据
     * @param codeEnum 状态码和消息
     * @return 响应对象
     * @param <T> 响应的数据类型
     */
    public static <T> R<T> FAIL(CodeEnum codeEnum) {
        return R.<T>builder()
                .code(codeEnum.getCode())
                .msg(codeEnum.getMsg())
                .build();
    }
}