package com.icss.etc.ticket.service;

import com.icss.etc.ticket.entity.Ticket;
import com.icss.etc.ticket.mapper.TicketMapper;
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
    private final TicketMapper ticketMapper;

    public TicketServiceImpl(TicketMapper ticketMapper) {
        this.ticketMapper = ticketMapper;
    }

//    private final UserMapper userMapper;

    @Override
    public int insertTicket(Ticket record) {
        //TODO: 判断工单类型是否存在
        //TODO: 判断部门是否存在
        return ticketMapper.insertTicket(record);
    }

    @Override
    public int deleteById(Long ticket_id) {
        //TODO: 判断工单是否存在
        //TODO: 判断工单是否处于待处理状态
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
