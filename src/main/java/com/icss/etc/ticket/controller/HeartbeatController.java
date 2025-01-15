package com.icss.etc.ticket.controller;

import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.service.impl.OnlineUserManager;
import com.icss.etc.ticket.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * {@code HeartbeatController}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@RestController
@RequestMapping("/heartbeat")
public class HeartbeatController {

    @Autowired
    private OnlineUserManager onlineUserManager;

    @PostMapping
    public R heartbeat() {
        Long userId = SecurityUtils.getCurrentUserId();
        onlineUserManager.updateUserStatus(userId);
        return R.OK();
    }
}