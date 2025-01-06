package com.icss.etc.ticket.mapper;

import com.icss.etc.ticket.entity.Theme;
import java.time.LocalDateTime;
import java.util.List;
import org.apache.ibatis.annotations.Param;

/**
 * {@code ThemeMapper} 
 * 
 * @since 1.0
 * @version 1.0
 * @author SevenThRe
 */
    
public interface ThemeMapper {
    /**
     * insert record to table
     * @param record the record
     * @return insert count
     */
    int insert(Theme record);

    /**
     * insert record to table selective
     * @param record the record
     * @return insert count
     */
    int insertSelective(Theme record);

    /**
     * select by primary key
     * @param theme_id primary key
     * @return object by primary key
     */
    Theme selectByPrimaryKey(String theme_id);

    /**
     * update record selective
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKeySelective(Theme record);

    /**
     * update record
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKey(Theme record);

    List<Theme> selectByAll(Theme theme);

    int updateBatchSelective(@Param("list") List<Theme> list);

    int batchInsert(@Param("list") List<Theme> list);
}