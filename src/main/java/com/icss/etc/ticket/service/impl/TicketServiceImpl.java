package com.icss.etc.ticket.service.impl;
import com.icss.etc.ticket.enums.TicketEnum;
import com.icss.etc.ticket.entity.Ticket;
import com.icss.etc.ticket.mapper.TicketMapper;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class TicketServiceImpl implements TicketService {
    private final TicketMapper ticketMapper;

    public TicketServiceImpl(TicketMapper ticketMapper) {
        this.ticketMapper = ticketMapper;
    }

//    private final UserMapper userMapper;

    @Override
    public int insertTicket(Ticket record) {

        /*
          判断工单类型是否存在
         */
        if (ticketMapper.selectByPrimaryKey(record.getTicket_id()) != null) {
            log.error("{} 工单已存在", this.getClass().getName());
            return TicketEnum.TICKET_EXIST.getCode();
        }
        /*
            判断工单类型是否存在
         */

        /*
            判断部门是否存在
         */

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

    @Override
    public List<Ticket> getTodos() {
        return List.of();
    }
}
