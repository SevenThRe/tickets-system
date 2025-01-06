package com.icss.etc.ticket.entity;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code User} 
 * 
 * @since 1.0
 * @version 1.0
 * @author SevenThRe
 */
    
/**
 * 用户表
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User implements Serializable {
    /**
    * 用户ID
    */
    private Long user_id;

    /**
    * 用户名
    */
    private String username;

    /**
    * 密码
    */
    private String password;

    /**
    * 真实姓名
    */
    private String real_name;

    /**
    * 所属部门ID
    */
    private Long department_id;

    /**
    * 邮箱
    */
    private String email;

    /**
    * 电话
    */
    private String phone;

    /**
    * 状态：0-禁用，1-启用
    */
    private Integer status;

    /**
    * 0 未删除 1删除
    */
    private Integer is_deleted;

    /**
    * 创建人
    */
    private Long create_by;

    /**
    * 更新人
    */
    private Long update_by;

    /**
    * 创建时间
    */
    private LocalDateTime create_time;

    /**
    * 更新时间
    */
    private LocalDateTime update_time;



    @Serial
    private static final long serialVersionUID = 1L;
}