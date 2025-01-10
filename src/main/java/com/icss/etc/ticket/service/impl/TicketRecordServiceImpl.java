package com.icss.etc.ticket.service.impl;

import com.icss.etc.ticket.entity.TicketRecord;
import com.icss.etc.ticket.mapper.TicketRecordMapper;
import com.icss.etc.ticket.service.TicketRecordService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Service;

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
}
