package com.icss.etc.ticket.mapper;

import com.icss.etc.ticket.entity.dto.RegisteredDTO;
import com.icss.etc.ticket.entity.User;

import java.util.List;
import org.apache.ibatis.annotations.Param;

/**
 * {@code UserMapper} 
 *
 * @since 1.0
 * @version 1.0
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
    
public interface UserMapper {

    //  注册
    int register(RegisteredDTO user);

    //登陆
    User login(@Param("username") String username);

    /**
     * insert record to table
     * @param record the record
     * @return insert count
     */
    int insert(User record);

    /**
     * insert record to table selective
     * @param record the record
     * @return insert count
     */
    int insertSelective(User record);

    /**
     * select by primary key
     * @param user_id primary key
     * @return object by primary key
     */
    User selectByPrimaryKey(Long user_id);

    /**
     * update record selective
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKeySelective(User record);

    /**
     * update record
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKey(User record);

    List<User> selectByAll(User user);

    int updateBatchSelective(@Param("list") List<User> list);

    int batchInsert(@Param("list") List<User> list);



}