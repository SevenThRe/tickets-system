/**
 * TicketModal.js
 * 工单操作弹窗组件
 *
 * 核心功能：
 * 1. 工单创建/编辑表单
 * 2. 表单验证和提交
 * 3. 文件上传处理
 * 4. 状态管理和事件通知
 * 5. 错误处理和用户提示
 */
class TicketModal extends BaseComponent {
    /**
     * 构造函数
     * @param {Object} options - 配置参数
     * @param {String} options.containerId - 模态框容器ID
     * @param {Function} [options.onSubmit] - 提交回调
     * @param {Function} [options.onClose] - 关闭回调
     */
    constructor(options) {
        super({
            container: `#${options.containerId}`,
            events: {
                'submit #ticketForm': '_handleSubmit',
                'change #department': '_handleDepartmentChange',
                'change #priority': '_handlePriorityChange',
                'change .attachment-input': '_handleFileSelect',
                'click .remove-file': '_handleFileRemove',
                'click .close-modal': '_handleClose',
                'shown.bs.modal': '_handleModalShow',
                'hidden.bs.modal': '_handleModalHide'
            }
        });

        // 组件状态
        this.state = {
            mode: 'create',           // create|edit
            submitting: false,        // 提交状态
            departments: [],          // 部门列表
            attachments: [],          // 附件列表
            formData: {              // 表单数据
                title: '',
                content: '',
                departmentId: '',
                priority: '0',
                expectFinishTime: ''
            },
            errors: {}               // 表单错误
        };

        // 回调函数
        this.onSubmit = options.onSubmit;
        this.onClose = options.onClose;

        // Bootstrap Modal实例
        this.modal = null;

        // 验证规则配置
        this.validationRules = {
            title: {
                required: true,
                maxLength: 50
            },
            content: {
                required: true,
                maxLength: 500
            },
            departmentId: {
                required: true
            },
            priority: {
                required: true
            }
        };

        // 初始化组件
        this._initModal();
    }

    /**
     * 初始化Bootstrap Modal
     * @private
     */
    _initModal() {
        this.modal = new bootstrap.Modal(this.container[0], {
            backdrop: 'static',
            keyboard: false
        });
    }

    /**
     * 加载部门数据
     * @private
     */
    async _loadDepartments() {
        try {
            const departments = await window.request.get('/api/departments');
            this.state.departments = departments;
            this._renderDepartmentOptions();
        } catch (error) {
            console.error('加载部门数据失败:', error);
            this.showError('部门数据加载失败');
        }
    }

    /**
     * 渲染部门选项
     * @private
     */
    _renderDepartmentOptions() {
        const options = this.state.departments.map(dept =>
            `<option value="${dept.id}">${dept.name}</option>`
        ).join('');

        $('#department').html(`
            <option value="">请选择处理部门</option>
            ${options}
        `);
    }

    /**
     * 打开模态框
     * @param {Object} [data] - 编辑模式下的工单数据
     * @public
     */
    open(data) {
        this.state.mode = data ? 'edit' : 'create';
        if (data) {
            this._fillFormData(data);
        } else {
            this._resetForm();
        }
        this.modal.show();
    }

    /**
     * 填充表单数据
     * @param {Object} data - 工单数据
     * @private
     */
    _fillFormData(data) {
        this.state.formData = {
            title: data.title || '',
            content: data.content || '',
            departmentId: data.departmentId || '',
            priority: data.priority || '0',
            expectFinishTime: data.expectFinishTime || ''
        };
        this._updateFormUI();
    }

    /**
     * 更新表单UI
     * @private
     */
    _updateFormUI() {
        const { formData } = this.state;
        Object.entries(formData).forEach(([key, value]) => {
            $(`#${key}`).val(value);
        });
    }

    /**
     * 重置表单
     * @private
     */
    _resetForm() {
        this.state.formData = {
            title: '',
            content: '',
            departmentId: '',
            priority: '0',
            expectFinishTime: ''
        };
        this.state.errors = {};
        this.state.attachments = [];
        $('#ticketForm')[0].reset();
        $('.attachment-list').empty();
    }

    /**
     * 处理表单提交
     * @param {Event} e - 事件对象
     * @private
     */
    async _handleSubmit(e) {
        e.preventDefault();

        if (this.state.submitting) return;

        if (!this._validateForm()) {
            return;
        }

        try {
            this.state.submitting = true;
            this._updateSubmitButton(true);

            const formData = this._getFormData();
            const url = this.state.mode === 'create' ?
                '/api/tickets' : `/api/tickets/${formData.id}`;

            const result = await window.request[this.state.mode === 'create' ? 'post' : 'put'](
                url,
                formData
            );

            if (this.onSubmit) {
                this.onSubmit(result);
            }

            this.modal.hide();
            this.showSuccess(`工单${this.state.mode === 'create' ? '创建' : '更新'}成功`);

        } catch (error) {
            console.error('提交工单失败:', error);
            this.showError(error.message || '提交失败，请重试');
        } finally {
            this.state.submitting = false;
            this._updateSubmitButton(false);
        }
    }

    /**
     * 获取表单数据
     * @returns {Object} 表单数据对象
     * @private
     */
    _getFormData() {
        const formData = new FormData($('#ticketForm')[0]);
        const data = {};
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        return data;
    }

    /**
     * 验证表单
     * @returns {Boolean} 验证结果
     * @private
     */
    _validateForm() {
        const formData = this._getFormData();
        const errors = {};

        Object.entries(this.validationRules).forEach(([field, rules]) => {
            const value = formData[field];
            if (rules.required && !value) {
                errors[field] = '此项是必填的';
            } else if (rules.maxLength && value.length > rules.maxLength) {
                errors[field] = `不能超过${rules.maxLength}个字符`;
            }
        });

        this.state.errors = errors;
        this._showErrors();

        return Object.keys(errors).length === 0;
    }

    /**
     * 显示表单错误
     * @private
     */
    _showErrors() {
        // 清除所有错误提示
        $('.is-invalid').removeClass('is-invalid');
        $('.invalid-feedback').remove();

        // 显示新的错误提示
        Object.entries(this.state.errors).forEach(([field, message]) => {
            const $field = $(`#${field}`);
            $field.addClass('is-invalid');
            $field.after(`<div class="invalid-feedback">${message}</div>`);
        });
    }

    /**
     * 更新提交按钮状态
     * @param {Boolean} submitting - 是否提交中
     * @private
     */
    _updateSubmitButton(submitting) {
        const $btn = $('#submitBtn');
        $btn.prop('disabled', submitting)
            .html(submitting ? '<span class="spinner-border spinner-border-sm"></span> 提交中...' : '提交');
    }
}

// 添加到全局命名空间
window.TicketModal = TicketModal;