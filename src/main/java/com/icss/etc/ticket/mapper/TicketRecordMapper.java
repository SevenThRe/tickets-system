package com.icss.etc.ticket.mapper;

import com.icss.etc.ticket.entity.TicketRecord;
import java.time.LocalDateTime;
import java.util.List;
import org.apache.ibatis.annotations.Param;

/**
 * {@code TicketRecordMapper} 
 * 
 * @since 1.0
 * @version 1.0
 * @author SevenThRe
 */
    
public interface TicketRecordMapper {
    /**
     * insert record to table
     * @param record the record
     * @return insert count
     */
    int insert(TicketRecord record);

    /**
     * insert record to table selective
     * @param record the record
     * @return insert count
     */
    int insertSelective(TicketRecord record);

    /**
     * select by primary key
     * @param record_id primary key
     * @return object by primary key
     */
    TicketRecord selectByPrimaryKey(Long record_id);

    /**
     * update record selective
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKeySelective(TicketRecord record);

    /**
     * update record
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKey(TicketRecord record);

    List<TicketRecord> selectByAll(TicketRecord ticketRecord);

    int updateBatchSelective(@Param("list") List<TicketRecord> list);

    int batchInsert(@Param("list") List<TicketRecord> list);
}