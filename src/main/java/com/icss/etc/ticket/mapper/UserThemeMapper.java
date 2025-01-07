package com.icss.etc.ticket.mapper;

import com.icss.etc.ticket.entity.UserTheme;
import java.util.List;

import org.apache.ibatis.annotations.Param;

/**
 * {@code UserThemeMapper}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */

public interface UserThemeMapper {
    /**
     * insert record to table
     *
     * @param record the record
     * @return insert count
     */
    int insert(UserTheme record);

    /**
     * insert record to table selective
     *
     * @param record the record
     * @return insert count
     */
    int insertSelective(UserTheme record);

    /**
     * select by primary key
     *
     * @param userId primary key
     * @return object by primary key
     */
    UserTheme selectByPrimaryKey(@Param("userId") Long userId, @Param("themeId") String themeId);

    /**
     * update record selective
     *
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKeySelective(UserTheme record);

    /**
     * update record
     *
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKey(UserTheme record);

    List<UserTheme> selectByAll(UserTheme userTheme);

    int updateBatchSelective(@Param("list") List<UserTheme> list);

    int batchInsert(@Param("list") List<UserTheme> list);
}