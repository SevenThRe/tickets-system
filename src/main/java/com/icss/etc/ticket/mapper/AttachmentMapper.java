package com.icss.etc.ticket.mapper;

import com.icss.etc.ticket.entity.Attachment;
import java.time.LocalDateTime;
import java.util.List;
import org.apache.ibatis.annotations.Param;

/**
 * {@code AttachmentMapper} 
 * 
 * @since 1.0
 * @version 1.0
 * @author SevenThRe
 */
    
public interface AttachmentMapper {
    /**
     * insert record to table
     * @param record the record
     * @return insert count
     */
    int insert(Attachment record);

    /**
     * insert record to table selective
     * @param record the record
     * @return insert count
     */
    int insertSelective(Attachment record);

    /**
     * select by primary key
     * @param attachment_id primary key
     * @return object by primary key
     */
    Attachment selectByPrimaryKey(Long attachment_id);

    /**
     * update record selective
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKeySelective(Attachment record);

    /**
     * update record
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKey(Attachment record);

    List<Attachment> selectByAll(Attachment attachment);

    int updateBatchSelective(@Param("list") List<Attachment> list);

    int batchInsert(@Param("list") List<Attachment> list);
}