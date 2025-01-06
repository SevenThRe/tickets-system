package com.icss.etc.ticket.mapper;

import com.icss.etc.ticket.entity.UserTheme;
import java.time.LocalDateTime;
import java.util.List;
import org.apache.ibatis.annotations.Param;

/**
 * {@code UserThemeMapper} 
 * 
 * @since 1.0
 * @version 1.0
 * @author SevenThRe
 */
    
public interface UserThemeMapper {
    /**
     * insert record to table
     * @param record the record
     * @return insert count
     */
    int insert(UserTheme record);

    /**
     * insert record to table selective
     * @param record the record
     * @return insert count
     */
    int insertSelective(UserTheme record);

    /**
     * select by primary key
     * @param user_id primary key
     * @return object by primary key
     */
    UserTheme selectByPrimaryKey(@Param("user_id") Long user_id, @Param("theme_id") String theme_id);

    /**
     * update record selective
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKeySelective(UserTheme record);

    /**
     * update record
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKey(UserTheme record);

    List<UserTheme> selectByAll(UserTheme userTheme);

    int updateBatchSelective(@Param("list") List<UserTheme> list);

    int batchInsert(@Param("list") List<UserTheme> list);
}