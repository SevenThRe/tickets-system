package com.icss.etc.ticket.service;

import com.icss.etc.ticket.entity.TicketRecord;
import com.icss.etc.ticket.entity.dto.ticket.AddTicketRecordDTO;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * {@code TicketRecordMapper}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */

public interface TicketRecordService {
    /**
     * insert record to table
     *
     * @param record the record
     * @return insert count
     */
    int insert(TicketRecord record);

    /**
     * insert record to table selective
     *
     * @param record the record
     * @return insert count
     */
    int insertSelective(TicketRecord record);

    /**
     * select by primary key
     *
     * @param recordId primary key
     * @return object by primary key
     */
    TicketRecord selectByPrimaryKey(Long recordId);

    /**
     * update record selective
     *
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKeySelective(TicketRecord record);

    /**
     * update record
     *
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKey(TicketRecord record);

    List<TicketRecord> selectByAll(TicketRecord ticketRecord);

    int updateBatchSelective(@Param("list") List<TicketRecord> list);

    int batchInsert(@Param("list") List<TicketRecord> list);

    /**
     * add record
     * @param recordDTO the record DTO
     */
    void addRecord(AddTicketRecordDTO recordDTO);

    List<TicketRecord> getTicketRecords(Long ticketId);
}