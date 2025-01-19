package com.icss.etc.ticket.controller;

import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.entity.TicketRecord;
import com.icss.etc.ticket.enums.CodeEnum;
import com.icss.etc.ticket.service.TicketRecordService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * {@code TicketRecordController}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@RequestMapping("/records")
@RestController
@Slf4j
public class TicketRecordController {

    @Autowired
    private TicketRecordService ticketRecordService;
    @RequestMapping("/detail/{id}/")
    public TicketRecord getTicketRecords(@PathVariable("id") Long recordId) {
        return ticketRecordService.selectByPrimaryKey(recordId);
    }

    /**
     * 添加备注信息
     * @param record 工单记录
     * @return 工单记录
     */
    @PostMapping
    public R<Void> addRecord(TicketRecord record) {
        try {
            record.setCreateTime(LocalDateTime.now());
            record.setIsDeleted(0);

            int result = ticketRecordService.insertSelective(record);
            return result > 0 ? R.OK() : R.FAIL();
        } catch (Exception e) {
            log.error("添加工单记录失败:", e);
            return R.FAIL(CodeEnum.INTERNAL_ERROR);
        }
    }




}
