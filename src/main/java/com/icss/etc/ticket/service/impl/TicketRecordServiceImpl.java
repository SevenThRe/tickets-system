package com.icss.etc.ticket.service.impl;

import com.icss.etc.ticket.entity.Ticket;
import com.icss.etc.ticket.entity.TicketRecord;
import com.icss.etc.ticket.entity.dto.ticket.AddTicketRecordDTO;
import com.icss.etc.ticket.enums.TicketEnum;
import com.icss.etc.ticket.exceptions.BusinessException;
import com.icss.etc.ticket.mapper.TicketRecordMapper;
import com.icss.etc.ticket.service.TicketRecordService;
import com.icss.etc.ticket.service.TicketService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * {@code TicketRecordServiceImpl}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Service
@Slf4j

public class TicketRecordServiceImpl implements TicketRecordService {
    @Autowired
    private TicketRecordMapper ticketRecordMapper;

    @Autowired
    private TicketService ticketService;

    @Override
    public int insert(TicketRecord record) {
        return ticketRecordMapper.insert(record);
    }

    @Override
    public int insertSelective(TicketRecord record) {
        return ticketRecordMapper.insertSelective(record);
    }

    @Override
    public TicketRecord selectByPrimaryKey(Long recordId) {
        return ticketRecordMapper.selectByPrimaryKey(recordId);
    }

    @Override
    public int updateByPrimaryKeySelective(TicketRecord record) {
        return ticketRecordMapper.updateByPrimaryKeySelective(record);
    }

    @Override
    public int updateByPrimaryKey(TicketRecord record) {
        return ticketRecordMapper.updateByPrimaryKey(record);
    }

    @Override
    public List<TicketRecord> selectByAll(TicketRecord ticketRecord) {
        return ticketRecordMapper.selectByAll(ticketRecord);
    }

    @Override
    public int updateBatchSelective(List<TicketRecord> list) {
        return ticketRecordMapper.updateBatchSelective(list);
    }

    @Override
    public int batchInsert(List<TicketRecord> list) {
        return ticketRecordMapper.batchInsert(list);
    }


    @Override
    @Transactional
    public void addRecord(AddTicketRecordDTO recordDTO) {
        // 验证工单状态
        Ticket ticket = ticketService.getTicketById(recordDTO.getTicketId());
        if (ticket == null) {
            throw new BusinessException(TicketEnum.TICKET_NOT_EXIST);
        }



        // 创建记录
        TicketRecord record = new TicketRecord();
        record.setTicketId(recordDTO.getTicketId());
        record.setOperatorId(recordDTO.getOperatorId());
        record.setOperationType(recordDTO.getOperationType());
        record.setOperationContent(recordDTO.getOperationContent());
        record.setEvaluationScore(recordDTO.getEvaluationScore());
        record.setEvaluationContent(recordDTO.getEvaluationContent());

        ticketRecordMapper.insert(record);
    }

    @Override
    public List<TicketRecord> getTicketRecords(Long ticketId) {
        return ticketRecordMapper.selectByTicketId(ticketId);
    }
}
