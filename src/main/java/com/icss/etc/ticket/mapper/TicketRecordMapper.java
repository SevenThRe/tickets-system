package com.icss.etc.ticket.mapper;

import com.icss.etc.ticket.entity.TicketRecord;

import java.time.LocalDateTime;
import java.util.List;

import org.apache.ibatis.annotations.Param;

/**
 * {@code TicketRecordMapper}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */

public interface TicketRecordMapper {

    /**
     * 创建处理记录
     */
    int insertRecord(TicketRecord record);

    /**
     * 查询工单处理记录
     */
    List<TicketRecord> selectRecordsByTicketId(@Param("ticketId") Long ticketId);

    /**
     * 查询处理记录详情
     */
    TicketRecord selectRecordById(@Param("recordId") Long recordId);

    /**
     * 更新处理记录
     */
    int updateRecord(TicketRecord record);


    int updateByPrimaryKeySelective(TicketRecord record);

    TicketRecord selectByPrimaryKey(Long recordId);

    int insert(TicketRecord record);

    int insertSelective(TicketRecord record);

    int updateByPrimaryKey(TicketRecord record);

    List<TicketRecord> selectByAll(TicketRecord ticketRecord);

    int batchInsert(List<TicketRecord> list);

    int updateBatchSelective(List<TicketRecord> list);
}