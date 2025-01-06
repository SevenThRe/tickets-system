package com.icss.etc.ticket.handler;

import com.icss.etc.ticket.enums.TicketStatus;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.springframework.stereotype.Component;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@Component
public class TicketStatusTypeHandler extends BaseTypeHandler<TicketStatus> {
    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, TicketStatus parameter, JdbcType jdbcType) throws SQLException {
        ps.setInt(i, parameter.ordinal());
    }

    @Override
    public TicketStatus getNullableResult(ResultSet rs, String columnName) throws SQLException {
        int ordinal = rs.getInt(columnName);

        if (ordinal < 0 || ordinal >= TicketStatus.values().length) {
            return null; // or throw an exception, or handle it as needed
        }

        return TicketStatus.values()[ordinal];
    }

    @Override
    public TicketStatus getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        int ordinal = rs.getInt(columnIndex);
        if (ordinal < 0 || ordinal >= TicketStatus.values().length) {
            return null; // or throw an exception, or handle it as needed
        }
        return TicketStatus.values()[ordinal];
    }

    @Override
    public TicketStatus getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        int ordinal = cs.getInt(columnIndex);
        if (ordinal < 0 || ordinal >= TicketStatus.values().length) {
            return null; // or throw an exception, or handle it as needed
        }
        return TicketStatus.values()[ordinal];
    }
}