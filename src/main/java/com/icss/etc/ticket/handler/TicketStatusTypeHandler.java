package com.icss.etc.ticket.handler;

import com.icss.etc.ticket.enums.TicketStatus;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;
import org.springframework.stereotype.Component;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@MappedTypes(TicketStatus.class)
@Component
public class TicketStatusTypeHandler extends BaseTypeHandler<TicketStatus> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, TicketStatus parameter, JdbcType jdbcType) throws SQLException {
        ps.setInt(i, parameter.getValue());  // 使用getValue()而不是ordinal()
    }

    @Override
    public TicketStatus getNullableResult(ResultSet rs, String columnName) throws SQLException {
        int value = rs.getInt(columnName);
        if (rs.wasNull()) {
            return null;
        }
        for (TicketStatus status : TicketStatus.values()) {
            if (status.getValue() == value) {
                return status;
            }
        }
        throw new SQLException("Unknown status value: " + value);
    }

    @Override
    public TicketStatus getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        int value = rs.getInt(columnIndex);
        if (rs.wasNull()) {
            return null;
        }
        for (TicketStatus status : TicketStatus.values()) {
            if (status.getValue() == value) {
                return status;
            }
        }
        throw new SQLException("Unknown status value: " + value);
    }

    @Override
    public TicketStatus getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        int value = cs.getInt(columnIndex);
        if (cs.wasNull()) {
            return null;
        }
        for (TicketStatus status : TicketStatus.values()) {
            if (status.getValue() == value) {
                return status;
            }
        }
        throw new SQLException("Unknown status value: " + value);
    }
}