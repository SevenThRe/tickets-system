package com.icss.etc.ticket.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code UserPermission}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserPermission {
    private String ticketId;
    private boolean canClose; // 是否可以关闭工单
    private boolean canComment; // 是否可以备注
    private boolean canTransfer; // 是否可以转交
    private boolean canEvaluate; // 是否可以评价
    private boolean canProcess; // 是否可以分配


}
