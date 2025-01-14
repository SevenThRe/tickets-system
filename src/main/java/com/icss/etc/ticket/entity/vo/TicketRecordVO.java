package com.icss.etc.ticket.entity.vo;

import com.icss.etc.ticket.enums.OperationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * {@code TicketRecord} 
 * 
 * @since 1.0
 * @version 1.0
 * @author SevenThRe
 */

/**
 * 工单处理记录表
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TicketRecordVO implements Serializable {
    /**
     * 记录ID
     */
    private Long recordId;

    /**
     * 工单ID
     */
    private Long ticketId;

    /**
     * 操作人ID
     */
    private Long operatorId;

    /**
     * 操作人姓名
     */
    private String operatorName;
    /**
     * 操作类型：0-创建，1-分配，2-处理，3-完成，4-关闭，5-转交
     */
    private OperationType operationType;

    /**
     * 操作内容
     */
    private String operationContent;

    /**
     * 评分(1-5)
     */
    private Integer evaluationScore;

    /**
     * 评价内容
     */
    private String evaluationContent;

    /**
     * 是否删除
     */
    private Integer isDeleted;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    @Serial
    private static final long serialVersionUID = 1L;
}