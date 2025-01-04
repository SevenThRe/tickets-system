package com.icss.etc.ticket.service;

import com.icss.etc.ticket.entity.Ticket;
import com.icss.etc.ticket.mapper.TicketMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @ClassName
 * @Author SevenThRe
 * @Description
 * @Date 周六 22:35
 * @Version 1.0
 */
@Service
public class TicketServiceImpl implements TicketService {
    @Autowired
    private TicketMapper ticketMapper;
    @Override
    public int insertTicket(Ticket record) {
        return ticketMapper.insertTicket(record);
    }

    @Override
    public int deleteById(Long ticket_id) {
        return ticketMapper.deleteById(ticket_id);
    }

    @Override
    public int updateByPrimaryKey(Ticket record) {
        return ticketMapper.updateByPrimaryKey(record);
    }

    @Override
    public Ticket selectByPrimaryKey(Long ticket_id) {
        return ticketMapper.selectByPrimaryKey(ticket_id);
    }

    @Override
    public List<Ticket> selectAll() {
        return ticketMapper.selectAll();
    }

    @Override
    public List<Ticket> selectByCondition(Ticket condition) {
        return ticketMapper.selectByCondition(condition);
    }
}
