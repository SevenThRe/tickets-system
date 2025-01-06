package com.icss.etc.ticket.mapper;

import com.icss.etc.ticket.entity.Ticket;

import java.time.LocalDateTime;
import java.util.List;

import org.apache.ibatis.annotations.Param;

/**
 * {@code TicketMapper}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */

public interface TicketMapper {

    /**
     * insert record to table selective
     *
     * @param record the record
     * @return insert count
     */
    int insertSelective(Ticket record);

    /**
     * select by primary key
     *
     * @param ticket_id primary key
     * @return object by primary key
     */
    Ticket selectByPrimaryKey(Long ticket_id);

    /**
     * update record
     *
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKey(Ticket record);

    List<Ticket> selectByAll(Ticket ticket);

    int updateBatchSelective(@Param("list") List<Ticket> list);

    int batchInsert(@Param("list") List<Ticket> list);

    /**
     * 插入工单，忽略空值
     *
     * @param record 工单对象
     * @return 影响的行数
     */
    int insertTicket(Ticket record);

    /**
     * 根据工单ID删除工单
     *
     * @param ticket_id 工单ID
     * @return 删除的行数
     */
    int deleteById(Long ticket_id);

    /**
     * 查询全部未删除工单
     *
     * @return 工单列表
     */
    List<Ticket> selectAll();

    /**
     * 根据对象中不为空的属性查询工单
     *
     * @param condition 条件对象
     * @return 工单列表
     */
    List<Ticket> selectByCondition(Ticket condition);

}
