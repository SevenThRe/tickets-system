package com.icss.etc.ticket.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;

@Controller
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public ResponseEntity<ErrorInfo> handleError(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
        Object exception = request.getAttribute(RequestDispatcher.ERROR_EXCEPTION);
        Object path = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);

        ErrorInfo errorInfo = new ErrorInfo();
        errorInfo.setStatus(status != null ? Integer.valueOf(status.toString()) : HttpStatus.INTERNAL_SERVER_ERROR.value());
        errorInfo.setMessage(message != null ? message.toString() : "Unknown error");
        errorInfo.setException(exception != null ? exception.toString() : "Unknown exception");
        errorInfo.setPath(path != null ? path.toString() : "Unknown path");

        return ResponseEntity.status(errorInfo.getStatus()).body(errorInfo);
    }

    public String getErrorPath() {
        return "/error";
    }

    public static class ErrorInfo {
        private int status;
        private String message;
        private String exception;
        private String path;

        // Getters and setters
        public int getStatus() {
            return status;
        }

        public void setStatus(int status) {
            this.status = status;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getException() {
            return exception;
        }

        public void setException(String exception) {
            this.exception = exception;
        }

        public String getPath() {
            return path;
        }

        public void setPath(String path) {
            this.path = path;
        }
    }
}