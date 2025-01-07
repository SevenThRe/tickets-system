package com.icss.etc.ticket.mapper;

import com.icss.etc.ticket.entity.User;

import java.time.LocalDateTime;
import java.util.List;

import org.apache.ibatis.annotations.Param;

/**
 * {@code UserMapper}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */

public interface UserMapper {
    /**
     * insert record to table
     *
     * @param record the record
     * @return insert count
     */
    int insert(User record);

    /**
     * insert record to table selective
     *
     * @param record the record
     * @return insert count
     */
    int insertSelective(User record);

    /**
     * select by primary key
     *
     * @param userId primary key
     * @return object by primary key
     */
    User selectByPrimaryKey(Long userId);

    /**
     * update record selective
     *
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKeySelective(User record);

    /**
     * update record
     *
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKey(User record);

    List<User> selectByAll(User user);

    int updateBatchSelective(@Param("list") List<User> list);

    int batchInsert(@Param("list") List<User> list);


//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    //  注册
    int register(User user);

    //登陆
    User login(@Param("username") String username);

}