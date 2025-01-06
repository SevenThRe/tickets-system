package com.icss.etc.ticket.mapper;

import com.icss.etc.ticket.entity.TicketType;
import java.time.LocalDateTime;
import java.util.List;
import org.apache.ibatis.annotations.Param;

/**
 * {@code TicketTypeMapper} 
 * 
 * @since 1.0
 * @version 1.0
 * @author SevenThRe
 */
    
public interface TicketTypeMapper {
    /**
     * insert record to table
     * @param record the record
     * @return insert count
     */
    int insert(TicketType record);

    /**
     * insert record to table selective
     * @param record the record
     * @return insert count
     */
    int insertSelective(TicketType record);

    /**
     * select by primary key
     * @param type_id primary key
     * @return object by primary key
     */
    TicketType selectByPrimaryKey(Long type_id);

    /**
     * update record selective
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKeySelective(TicketType record);

    /**
     * update record
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKey(TicketType record);

    List<TicketType> selectByAll(TicketType ticketType);

    int updateBatchSelective(@Param("list") List<TicketType> list);

    int batchInsert(@Param("list") List<TicketType> list);
}