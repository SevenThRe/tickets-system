package com.icss.etc.ticket.controller;

import com.icss.etc.ticket.entity.Ticket;
import com.icss.etc.ticket.service.TicketService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

/**
 * @ClassName TicketController
 * @Author SevenThRe
 * @Description 工单控制器
 * @Date 周六 22:53
 * @Version 1.0
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

}
