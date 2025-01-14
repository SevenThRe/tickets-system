package com.icss.etc.ticket.controller;

import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.entity.TicketRecord;
import com.icss.etc.ticket.enums.CodeEnum;
import com.icss.etc.ticket.service.TicketRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * {@code TicketRecordController}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@RequestMapping("/records")
@RestController
public class TicketRecordController {

    @Autowired
    private TicketRecordService ticketRecordService;
    @RequestMapping("/detail/{id}/")
    public TicketRecord getTicketRecords(@PathVariable("id") Long recordId) {
        return ticketRecordService.selectByPrimaryKey(recordId);
    }

    /**
     * 添加备注信息
     * @param ticketRecord 工单记录
     * @return 工单记录
     */
    @PostMapping
    public R addTicketRecord(TicketRecord ticketRecord) {
        int result = ticketRecordService.insertSelective(ticketRecord);
        if (result > 0) {
            return R.OK(result);
        }
        return R.FAIL(CodeEnum.INTERNAL_ERROR);
    }




}
