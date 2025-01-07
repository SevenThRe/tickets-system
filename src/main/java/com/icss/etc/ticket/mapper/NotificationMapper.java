package com.icss.etc.ticket.mapper;

import com.icss.etc.ticket.entity.Notification;

import java.time.LocalDateTime;
import java.util.List;

import org.apache.ibatis.annotations.Param;

/**
 * {@code NotificationMapper}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */

public interface NotificationMapper {
    /**
     * insert record to table
     *
     * @param record the record
     * @return insert count
     */
    int insert(Notification record);

    /**
     * insert record to table selective
     *
     * @param record the record
     * @return insert count
     */
    int insertSelective(Notification record);

    /**
     * select by primary key
     *
     * @param notificationId primary key
     * @return object by primary key
     */
    Notification selectByPrimaryKey(Long notificationId);

    /**
     * update record selective
     *
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKeySelective(Notification record);

    /**
     * update record
     *
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKey(Notification record);

    List<Notification> selectByAll(Notification notification);

    int updateBatchSelective(@Param("list") List<Notification> list);

    int batchInsert(@Param("list") List<Notification> list);
}