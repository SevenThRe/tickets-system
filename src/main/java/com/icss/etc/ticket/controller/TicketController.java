package com.icss.etc.ticket.controller;

import com.icss.etc.ticket.entity.Ticket;
import com.icss.etc.ticket.service.TicketService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * {@code TicketController} 类用于处理与 {@code Ticket} 相关的请求。
 * @since 1.0
 * @version 1.0
 * @author SevenThRe
 */
@RestController

@RequestMapping("ticket")

public class TicketController {
    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    public record TicketVO(String title, String content) {
    }


    @RequestMapping("list")
    public TicketVO[] list() {
        TicketVO[] array = ticketService.selectAll().stream().map(
                ticket -> new
                        TicketVO(ticket.getTitle(), ticket.getContent())).toArray(TicketVO[]::new);
        return array;
    }

    @RequestMapping("selectAll")
    public List<Ticket> selectAll() {
        return ticketService.selectAll();
    }

    /**
     * 增加工单
     * @param ticket 工单对象
     * @return
     */
    @RequestMapping("add")
    public int add(Ticket ticket) {
        return ticketService.insertTicket(ticket);
    }

}
