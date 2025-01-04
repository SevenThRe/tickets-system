package com.icss.etc.ticket.mapper;

import com.icss.etc.ticket.entity.Ticket;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

//@Mapper
public interface TicketMapper {
    /**
     * 插入工单，忽略空值
     * @param record 工单对象
     * @return 影响的行数
     */
    int insertTicket(Ticket record);

    /**
     * 根据工单ID删除工单
     * @param ticket_id 工单ID
     * @return 删除的行数
     */
    int deleteById(Long ticket_id);


    /**
     * 根据工单ID更新工单
     * @param record 工单对象
     * @return 影响的行数
     */
    int updateByPrimaryKey(Ticket record);

    /**
     * 根据工单ID查询工单
     * @param ticket_id 工单ID
     * @return 工单对象
     */
    Ticket selectByPrimaryKey(Long ticket_id);

    /**
     * 查询全部未删除工单
     * @return 工单列表
     */
    List<Ticket> selectAll();

    /**
     * 根据对象中不为空的属性查询工单
     * @param condition 条件对象
     * @return 工单列表
     */
    List<Ticket> selectByCondition(Ticket condition);


}