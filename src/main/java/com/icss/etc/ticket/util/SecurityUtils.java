package com.icss.etc.ticket.util;

import com.icss.etc.ticket.entity.vo.UserViewBackDTO;
import com.icss.etc.ticket.enums.CodeEnum;
import com.icss.etc.ticket.exceptions.BusinessException;
import org.springframework.stereotype.Component;

/**
 * {@code SecurityUtils}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Component
public class SecurityUtils {
    private static final ThreadLocal<UserViewBackDTO> userViewBackDTOHolder = new ThreadLocal<>();

    public static void setCurrentUser(UserViewBackDTO userViewBackDTO) {
        userViewBackDTOHolder.set(userViewBackDTO);

    }

    public static Long getCurrentUserId() {
        Long userId = userViewBackDTOHolder.get().getUserId();
        if (userId == null) {
            throw new BusinessException(CodeEnum.UNKNOW_USER);
        }
        return userId;
    }
    public static String getCurrentUsername() {
        return userViewBackDTOHolder.get().getUsername();
    }

    public static String getCurrentRealName() {
        return userViewBackDTOHolder.get().getRealName();
    }

    public static String getCurrentPhone() {
        return userViewBackDTOHolder.get().getPhone();
    }

    public static String getCurrentEmail() {
        return userViewBackDTOHolder.get().getEmail();
    }

    public static String getCurrentPassword() {
        return userViewBackDTOHolder.get().getPassword();
    }

    public static String getCurrentDepartmentName() {
        return userViewBackDTOHolder.get().getDepartmentName();
    }

    public static String getCurrentRoleName() {
        return userViewBackDTOHolder.get().getRoleName();
    }

    public static String getCurrentBaseRoleCode() {
        return userViewBackDTOHolder.get().getBaseRoleCode();
    }

    public static Integer getCurrentStatus() {
        return userViewBackDTOHolder.get().getStatus();
    }

    public static UserViewBackDTO getCurrentUserInfo() {
        return userViewBackDTOHolder.get();
    }

    public static Long getCurrentDepartmentId() {
        return userViewBackDTOHolder.get().getDepartmentId();
    }

    public static void clear() {
        userViewBackDTOHolder.remove();
    }
}