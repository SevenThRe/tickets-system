/**
 * RoleManagement.js
 * 角色权限管理页面控制器
 */
let pageNumber = 1; //当前页码
let total;//总页数
let pageSize;//每页显示的条数
$(function () {
    // 初始化 length 变量
    // 初始加载列表
    getList();
    $("#length").change(function () {
        pageSize = parseInt($(this).val());
        pageNumber = 1; // 当改变每页显示条数时，重置到第一页
        getList();
    });

    // 分页功能
    $("#first").click(function (e) {
        e.preventDefault();
        pageNumber = 1;
        getList();
    });

    $("#pre").click(function (e) {
        e.preventDefault();
        if (pageNumber === 1) {
            alert('当前在第一页');
            return;
        }
        pageNumber--;
        getList();
    });

    $("#next").click(function (e) {
        e.preventDefault();
        if (pageNumber === total) {
            alert('当前在最后一页');
            return;
        }
        pageNumber++;
        getList();
    });

    $("#end").click(function (e) {
        e.preventDefault();
        pageNumber = total;
        getList();
    });
});
// 获取角色权限
//获取详细角色信息
function getSomePermission(roleId) {
    let url = `/api/roles/selectByRoleId/${roleId}`;
    $.ajax({
        url: url,
        headers: {"token": localStorage.getItem("token")},
        success: function (result) {
            // 确保 result.data 和 result.data.morePermission 存在且是数组
            if (result && result.data && Array.isArray(result.data.morePermission)) {
                let html = "";
                $.each(result.data.morePermission, function (index, permission) {
                    // 确保 permission 对象有 permissionName 属性
                    if (permission && permission.permissionName) {
                        html += "<tr>";
                        html += "<td>" + permission.permissionName + "</td>";
                        html += "<td>";
                        html += "<button class='btn btn-danger' onclick='del(" + permission.permissionId + ")'>删除</button>";
                        html += "</td>";
                        html += "</tr>";
                    }
                });
                // 确保 #permission 是表格的 tbody，或者表格本身（如果没有 tbody）
                $("#permission").html(html);
            } else {
                console.error("Invalid response format:", result);
                alert("无法加载权限信息，请稍后再试。");
            }
        },
        error: function (xhr, status, error) {
            if (xhr.status === 401) {
                alert('请登录！');
                window.location.href = '/login.html';
            } else {
                // 可以添加其他错误处理逻辑，或者只是简单地显示错误信息
                console.error("AJAX Error:", status, error);
                alert("发生错误，请稍后再试。");
            }
        }
    });
}

//获取详细角色信息
function getSomeThing(roleId) {
    // 使用模板字符串正确插入 roleName
    let url = `/api/roles/selectByRoleId/${roleId}`;
    $.ajax({
        url: url,
        headers: {"token": localStorage.getItem("token")},
        success: function (result) {
            let html = `
                <tr>
                   <td>${result.data.roleCode}</td>
                    <td>${result.data.baseRoleCode}</td>
                    <td>${result.data.status}</td>
                    <td>${result.data.description}</td>
                </tr>
            `;
            $("#someThingRole").html(html); // 确保 #someThingRole 是表格的 tbody 或整个表格
        },
        error: function (xhr, status, error) {
            if (xhr.status === 401) {
                alert('请登录！');
                window.location.href = '/login.html';
            } else {
                // 可以添加其他错误处理逻辑，或者只是简单地显示错误信息
                console.error("AJAX Error:", status, error);
                alert("发生错误，请稍后再试。");
            }
        }
    });
}

//删除权限
function del(permissionId) {
    if (confirm('确定删除吗？')) {
        $.ajax({
            url: `/api/permissions/deletePermission/${permissionId}`,
            headers: {"token": localStorage.getItem("token")},
            success: function (result) {
                alert(result.msg);
                if (result.code === 200) {
                    window.location.reload();
                }
            },
            error: function (xhr, status, error) {
                if (xhr.status === 401) {
                    alert('请登录！');
                    window.location.href = '/pages/auth/login.html';
                } else {
                    // 可以添加其他错误处理逻辑，或者只是简单地显示错误信息
                    console.error("AJAX Error:", status, error);
                    alert("发生错误，请稍后再试。");
                }
            }
        });
    }
}

//添加权限
function addPermission() {

}

//左侧获取角色名字
function getList() {
    // 确保 pageNumber 和 length 已经被传递进来
    $.ajax({
        url: "/api/roles/selectAll",
        data: {
            pageNumber: pageNumber,
            pageSize: $("#length").val(),
            keyword: $("#roleSearch").val(),
        },
        headers: {"token": localStorage.getItem("token")},
        success: function (result) {
            total = result.data.total; // 使用 var, let 或 const 声明变量
            let html = '';
            $(result.data.list).each(function (index, e) {
                html += "<tr>";
                html += "<td class='role-name' data-id='" + e.roleId + "'>" + e.roleName + "</td>"; // 修改 data-i 为 data-id，更语义化
                html += "<td>";
                html += "<button class='btn btn-primary' onclick='updateRoleModal(" + JSON.stringify(e) + ")'>修改</button>";
                html += "<button class='btn btn-danger' onclick='delRole(" + e.roleId + ")'>删除</button>";
                html += "</td>";
                html += "</tr>";
            });
            // 先移除之前绑定的事件，防止多次绑定
            $("#roleTable").off("click", ".role-name").on("click", ".role-name", function () {
                // alert($(this).text());
                getSomeThing($(this).data("id"));
                getSomePermission($(this).data("id"));
            });
            $("#RoleNameList").html(html); // 确保 #RoleNameList 是表格的容器或者表格本身
        },
        error: function (xhr, status, error) {
            if (xhr.status === 401) {
                alert('请登录！');
                window.location.href = '/login.html';
            } else {
                // 可以添加其他错误处理逻辑，或者只是简单地显示错误信息
                console.error("AJAX Error:", status, error);
                alert("发生错误，请稍后再试。");
            }
        }
    });
}

//增加的模态层
function showroleModal() {
    $("#roleModal").modal('show');
    $("#roleModal :input").val("");
}

//修改的模态层
function updateRoleModal(e) {
    $("#roleModal1").modal('show');
    $("#baseRoleSelect1").val(e.baseRoleCode);
    $("#roleCodeInput1").val(e.roleCode);
    $("#roleName1").val(e.roleName);
    $("#description1").val(e.description);
    $("#status1").val(e.status);
    $("#roleId1").val(e.roleId);
}

$("#createRoleBtn").on('click', function () {
    showroleModal();
});

//修改
function updateRole() {
    let P = $("#roleForm1").serialize();
    console.log(P);
    $.ajax({
        url: "/api/roles/updateRole",
        data: P,
        headers: {"token": localStorage.getItem("token")},
        success: function () {
            alert("修改成功");
            window.location.reload();
        }, error: function (xhr, status, error) {
            if (xhr.status == 401) {
                alert('请登录！');
                window.location.href = '/login.html';
            }
        }
    })
}

//删除角色
function delRole(id) {
    if (confirm('确定删除吗')) {
        $.ajax({
            url: "/api/roles/deleteByRoleId/" + id,
            headers: {"token": localStorage.getItem("token")},
            success: function (result) {
                alert("删除成功");
                window.location.reload();
            }, error: function (xhr, status, error) {
                if (xhr.status == 401) {
                    alert('请登录！');
                    window.location.href = '/login.html';
                }
            }
        })
    }
}

// 这段代码的主要目的是创建一个防抖函数，可以将一个函数延迟执行，避免函数被频繁调用，从而降低系统的负担。下面是加上注释后的代码：
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}
//搜索框模糊查询
$(document).ready(function () {
    let debouncedSearch; // 保存防抖后的函数
    // 初始化防抖函数
    debouncedSearch = debounce(function () {
        getList();
    }, 300);

    $('#roleSearch').on('keyup', function (event) {
        debouncedSearch();
    });
});


//增加
function addRole() {
    let P = $("#roleForm").serialize();
    console.log(P);
    $.ajax({
        url: "/api/roles/insert",
        data: P,
        headers: {"token": localStorage.getItem("token")},
        success: function () {
            alert("添加成功");
            window.location.reload();
        }, error: function (xhr, status, error) {
            if (xhr.status == 401) {
                alert('请登录！');
                window.location.href = '/login.html';
            }
        }
    })
}

// class RoleManagement {
//     /**
//      * 角色管理类构造函数
//      * @throws {Error} 当必要的DOM元素或依赖未找到时抛出错误
//      */
//     constructor() {
//         // 验证必要的DOM元素
//         // 缓存DOM元素引用
//         this.$roleList = $('#roleList');
//         this.$permissionTree = $('#permissionTree');
//         this.$roleForm = $('#roleForm');
//         this.$roleSearch = $('#roleSearch');
//
//         // 状态管理
//         this.state = {
//             roles: [],
//             permissions: [],
//             currentRole: null,
//             loading: false,
//             editMode: false
//         };
//
//         // 初始化模态框
//         this.roleModal = new bootstrap.Modal('#roleModal');
//         this.deleteModal = new bootstrap.Modal('#deleteModal');
//
//         // 绑定事件处理
//         this._bindEvents();
//
//         // 初始化页面
//         this.init();
//     }
//
//     /**
//      * 初始化数据和组件
//      * @private
//      */
//     async init() {
//         try {
//             await Promise.all([
//                 this._loadRoles(),
//                 this._loadPermissions()
//             ]);
//         } catch (error) {
//             console.error('初始化失败:', error);
//             this._showError('页面初始化失败，请刷新重试');
//         }
//     }
//
//     /**
//      * 绑定事件处理函数
//      * @private
//      */
//     _bindEvents() {
//         // 角色列表相关事件
//         $('#createRoleBtn').on('click', () => this._handleCreateRole());
//         $('#roleList').on('click', '.role-item', (e) => this._handleRoleSelect($(e.currentTarget)));
//         $('#editRoleBtn').on('click', () => this._handleEditRole());
//         $('#deleteRoleBtn').on('click', () => this._handleDeleteRole());
//
//         // 角色搜索事件
//         this.$roleSearch.on('input', _.debounce(() => this._handleRoleSearch(), 300));
//
//         // 权限树相关事件
//         $('#expandAllBtn').on('click', () => this._expandAllNodes());
//         $('#collapseAllBtn').on('click', () => this._collapseAllNodes());
//         $('#savePermissionsBtn').on('click', () => this._handleSavePermissions());
//
//         // 表单提交事件
//         $('#saveRoleBtn').on('click', () => this._handleSaveRole());
//     }
//
//     /**
//      * 加载角色列表
//      * @private
//      */
//     async _loadRoles() {
//         try {
//             this.state.loading = true;
//             const response = await $.ajax({
//                 url: '/api/roles',
//                 method: 'GET'
//             });
//
//             if (response.code === 200) {
//                 this.state.roles = response.data;
//                 this._renderRoleList();
//             } else {
//                 throw new Error(response.message || '加载角色列表失败');
//             }
//         } catch (error) {
//             console.error('加载角色列表失败:', error);
//             this._showError('加载角色列表失败');
//         } finally {
//             this.state.loading = false;
//         }
//     }
//
//     /**
//      * 加载权限树数据
//      * @private
//      */
//     async _loadPermissions() {
//         try {
//             const response = await $.ajax({
//                 url: '/api/permissions',
//                 method: 'GET'
//             });
//
//             if (response.code === 200) {
//                 this.state.permissions = this._transformPermissionTree(response.data);
//             } else {
//                 throw new Error(response.message || '加载权限数据失败');
//             }
//         } catch (error) {
//             console.error('加载权限数据失败:', error);
//             this._showError('加载权限数据失败');
//         }
//     }
//
//     /**
//      * 渲染角色列表
//      * @private
//      */
//     _renderRoleList() {
//         const html = this.state.roles.map(role => `
//             <div class="list-group-item list-group-item-action role-item" data-id="${role.id}">
//                 <div class="d-flex justify-content-between align-items-center">
//                     <div>
//                         <h6 class="mb-1">${role.name}</h6>
//                         <small class="text-muted">${role.code}</small>
//                     </div>
//                     <span class="badge ${role.status ? 'bg-success' : 'bg-secondary'} rounded-pill">
//                         ${role.status ? '启用' : '禁用'}
//                     </span>
//                 </div>
//             </div>
//         `).join('');
//
//         this.$roleList.html(html || '<div class="text-center p-3">暂无角色数据</div>');
//     }
//
//     /**
//      * 渲染角色详情
//      * @param {Object} role - 角色信息
//      * @private
//      */
//     _renderRoleDetail(role) {
//         // 更新基础信息
//         $('#roleCode').text(role.code);
//         $('#baseRole').text(this._getBaseRoleName(role.baseRoleCode));
//         $('#roleStatus').html(`
//             <span class="badge ${role.status ? 'bg-success' : 'bg-secondary'}">
//                 ${role.status ? '启用' : '禁用'}
//             </span>
//         `);
//         $('#roleDescription').text(role.description || '暂无描述');
//         $('#currentRoleTitle').text(role.name);
//
//         // 显示操作按钮
//         $('.role-actions').show();
//
//         // 渲染权限树
//         this._renderPermissionTree(role.permissions);
//     }
//
//     /**
//      * 渲染权限树
//      * @param {Array} selectedPermissions - 已选中的权限ID数组
//      * @private
//      */
//     _renderPermissionTree(selectedPermissions = []) {
//         // 使用递归函数构建树形结构HTML
//         const buildTreeHtml = (nodes, level = 0) => {
//             return nodes.map(node => {
//                 const checked = selectedPermissions.includes(node.id);
//                 const hasChildren = node.children && node.children.length > 0;
//                 const indent = level * 20;
//
//                 return `
//                     <div class="permission-node" style="margin-left: ${indent}px">
//                         <div class="form-check">
//                             <input class="form-check-input" type="checkbox"
//                                    value="${node.id}"
//                                    id="perm_${node.id}"
//                                    ${checked ? 'checked' : ''}>
//                             <label class="form-check-label" for="perm_${node.id}">
//                                 ${node.name}
//                             </label>
//                         </div>
//                         ${hasChildren ? buildTreeHtml(node.children, level + 1) : ''}
//                     </div>
//                 `;
//             }).join('');
//         };
//
//         this.$permissionTree.html(buildTreeHtml(this.state.permissions));
//     }
//
//     /**
//      * 处理角色选择
//      * @param {jQuery} $item - 选中的角色列表项
//      * @private
//      */
//     async _handleRoleSelect($item) {
//         const roleId = $item.data('id');
//         try {
//             const response = await $.ajax({
//                 url: `/api/roles/${roleId}`,
//                 method: 'GET'
//             });
//
//             if (response.code === 200) {
//                 this.state.currentRole = response.data;
//                 this._renderRoleDetail(response.data);
//
//                 // 更新选中状态
//                 $('.role-item').removeClass('active');
//                 $item.addClass('active');
//             } else {
//                 throw new Error(response.message || '加载角色详情失败');
//             }
//         } catch (error) {
//             console.error('加载角色详情失败:', error);
//             this._showError('加载角色详情失败');
//         }
//     }
//
//     /**
//      * 处理创建角色
//      * @private
//      */
//     _handleCreateRole() {
//         this.state.editMode = false;
//         this._resetForm();
//         $('#roleModalTitle').text('新建角色');
//         this.roleModal.show();
//     }
//
//     /**
//      * 处理保存角色
//      * @private
//      */
//     async _handleSaveRole() {
//         if (!this._validateForm()) {
//             return;
//         }
//
//         const formData = this._getFormData();
//         const isEdit = this.state.editMode;
//
//         try {
//             const response = await $.ajax({
//                 url: isEdit ? `/api/roles/${this.state.currentRole.id}` : '/api/roles',
//                 method: isEdit ? 'PUT' : 'POST',
//                 contentType: 'application/json',
//                 data: JSON.stringify(formData)
//             });
//
//             if (response.code === 200) {
//                 this._showSuccess(`${isEdit ? '更新' : '创建'}角色成功`);
//                 this.roleModal.hide();
//                 await this._loadRoles();
//             } else {
//                 throw new Error(response.message || `${isEdit ? '更新' : '创建'}角色失败`);
//             }
//         } catch (error) {
//             console.error(`${isEdit ? '更新' : '创建'}角色失败:`, error);
//             this._showError(`${isEdit ? '更新' : '创建'}角色失败：${error.message}`);
//         }
//     }
//
//     /**
//      * 处理保存权限
//      * @private
//      */
//     async _handleSavePermissions() {
//         if (!this.state.currentRole) {
//             this._showError('请先选择角色');
//             return;
//         }
//
//         const selectedPermissions = Array.from(
//             this.$permissionTree.find('input[type="checkbox"]:checked')
//         ).map(input => $(input).val());
//
//         try {
//             const response = await $.ajax({
//                 url: `/api/roles/${this.state.currentRole.id}/permissions`,
//                 method: 'PUT',
//                 contentType: 'application/json',
//                 data: JSON.stringify({ permissions: selectedPermissions })
//             });
//
//             if (response.code === 200) {
//                 this._showSuccess('更新权限成功');
//             } else {
//                 throw new Error(response.message || '更新权限失败');
//             }
//         } catch (error) {
//             console.error('更新权限失败:', error);
//             this._showError('更新权限失败：' + error.message);
//         }
//     }
//
//     /**
//      * 转换权限数据为树形结构
//      * @param {Array} permissions - 原始权限数据
//      * @returns {Array} 树形结构的权限数据
//      * @private
//      */
//     _transformPermissionTree(permissions) {
//         const map = {};
//         const roots = [];
//
//         permissions.forEach(perm => {
//             map[perm.id] = { ...perm, children: [] };
//         });
//
//         permissions.forEach(perm => {
//             if (perm.parentId) {
//                 const parent = map[perm.parentId];
//                 if (parent) {
//                     parent.children.push(map[perm.id]);
//                 }
//             } else {
//                 roots.push(map[perm.id]);
//             }
//         });
//
//         return roots;
//     }
//
//     /**
//      * 获取基础角色名称
//      * @param {string} code - 基础角色代码
//      * @returns {string} 基础角色名称
//      * @private
//      */
//     _getBaseRoleName(code) {
//         const baseRoles = {
//             'ADMIN': '系统管理员',
//             'DEPT': '部门主管',
//             'USER': '普通用户'
//         };
//         return baseRoles[code] || code;
//     }
//
//     /**
//      * 表单验证规则
//      * @private
//      */
//     _validationRules = {
//         roleCode: {
//             pattern: /^[A-Z][A-Z0-9_]{2,19}$/,
//             message: '角色编码必须以大写字母开头，只能包含大写字母、数字和下划线，长度3-20位'
//         },
//         roleName: {
//             required: true,
//             maxLength: 50,
//             message: '角色名称不能为空，最大长度50个字符'
//         },
//         baseRoleCode: {
//             required: true,
//             message: '请选择基础角色类型'
//         },
//         description: {
//             maxLength: 200,
//             message: '角色描述最大长度200个字符'
//         }
//     };
//
//     /**
//      * 验证表单数据
//      * @returns {boolean} 验证是否通过
//      * @private
//      */
//     _validateForm() {
//         const form = this.$roleForm[0];
//         if (!form.checkValidity()) {
//             form.classList.add('was-validated');
//             return false;
//         }
//
//         // 自定义验证
//         const formData = this._getFormData();
//         for (const [field, rule] of Object.entries(this._validationRules)) {
//             const value = formData[field];
//
//             if (rule.required && !value) {
//                 this._showFieldError(field, rule.message);
//                 return false;
//             }
//
//             if (rule.pattern && value && !rule.pattern.test(value)) {
//                 this._showFieldError(field, rule.message);
//                 return false;
//             }
//
//             if (rule.maxLength && value && value.length > rule.maxLength) {
//                 this._showFieldError(field, rule.message);
//                 return false;
//             }
//         }
//
//         return true;
//     }
//
//     /**
//      * 获取表单数据
//      * @returns {Object} 表单数据对象
//      * @private
//      */
//     _getFormData() {
//         const formData = {};
//         const form = this.$roleForm[0];
//         const formElements = form.elements;
//
//         for (let i = 0; i < formElements.length; i++) {
//             const element = formElements[i];
//             if (element.name) {
//                 if (element.type === 'checkbox') {
//                     formData[element.name] = element.checked ? 1 : 0;
//                 } else {
//                     formData[element.name] = element.value.trim();
//                 }
//             }
//         }
//
//         return formData;
//     }
//
//     /**
//      * 显示字段错误信息
//      * @param {string} fieldName - 字段名
//      * @param {string} message - 错误信息
//      * @private
//      */
//     _showFieldError(fieldName, message) {
//         const field = this.$roleForm.find(`[name="${fieldName}"]`);
//         field.addClass('is-invalid');
//
//         const feedback = field.siblings('.invalid-feedback');
//         if (feedback.length) {
//             feedback.text(message);
//         } else {
//             field.after(`<div class="invalid-feedback">${message}</div>`);
//         }
//
//         field.one('input', function() {
//             $(this).removeClass('is-invalid');
//         });
//     }
//
//     /**
//      * 重置表单状态
//      * @private
//      */
//     _resetForm() {
//         const form = this.$roleForm[0];
//         form.reset();
//         form.classList.remove('was-validated');
//         this.$roleForm.find('.is-invalid').removeClass('is-invalid');
//         this.$roleForm.find('.invalid-feedback').remove();
//     }
//
//     /**
//      * 填充表单数据
//      * @param {Object} role - 角色数据
//      * @private
//      */
//     _fillForm(role) {
//         this.$roleForm.find('[name="roleCode"]').val(role.code);
//         this.$roleForm.find('[name="roleName"]').val(role.name);
//         this.$roleForm.find('[name="baseRoleCode"]').val(role.baseRoleCode);
//         this.$roleForm.find('[name="description"]').val(role.description);
//         this.$roleForm.find('[name="status"]').prop('checked', role.status === 1);
//     }
//
//     /**
//      * 处理角色搜索
//      * @private
//      */
//     _handleRoleSearch() {
//         const keyword = this.$roleSearch.val().toLowerCase().trim();
//
//         this.$roleList.find('.role-item').each((_, item) => {
//             const $item = $(item);
//             const name = $item.find('h6').text().toLowerCase();
//             const code = $item.find('small').text().toLowerCase();
//
//             if (name.includes(keyword) || code.includes(keyword)) {
//                 $item.show();
//             } else {
//                 $item.hide();
//             }
//         });
//     }
//
//     /**
//      * 展开所有权限节点
//      * @private
//      */
//     _expandAllNodes() {
//         this.$permissionTree.find('.permission-node').show();
//     }
//
//     /**
//      * 收起所有权限节点
//      * @private
//      */
//     _collapseAllNodes() {
//         this.$permissionTree.find('.permission-node').each((_, node) => {
//             const $node = $(node);
//             const level = parseInt($node.css('margin-left')) / 20;
//             if (level > 0) {
//                 $node.hide();
//             }
//         });
//     }
//
//     /**
//      * 显示成功提示
//      * @param {string} message - 提示信息
//      * @private
//      */
//     _showSuccess(message) {
//         $.toast({
//             heading: '成功',
//             text: message,
//             icon: 'success',
//             position: 'top-right',
//             hideAfter: 3000
//         });
//     }
//
//     /**
//      * 显示错误提示
//      * @param {string} message - 错误信息
//      * @private
//      */
//     _showError(message) {
//         $.toast({
//             heading: '错误',
//             text: message,
//             icon: 'error',
//             position: 'top-right',
//             hideAfter: 3000
//         });
//     }
//
//     /**
//      * 处理编辑角色
//      * @private
//      */
//     _handleEditRole() {
//         if (!this.state.currentRole) {
//             this._showError('请先选择要编辑的角色');
//             return;
//         }
//
//         this.state.editMode = true;
//         this._fillForm(this.state.currentRole);
//         $('#roleModalTitle').text('编辑角色');
//         this.roleModal.show();
//     }
//
//     /**
//      * 处理删除角色
//      * @private
//      */
//     _handleDeleteRole() {
//         if (!this.state.currentRole) {
//             this._showError('请先选择要删除的角色');
//             return;
//         }
//
//         $('#deleteRoleName').text(this.state.currentRole.name);
//         this.deleteModal.show();
//     }
//
//     /**
//      * 确认删除角色
//      * @private
//      */
//     async _confirmDelete() {
//         try {
//             const response = await $.ajax({
//                 url: `/api/roles/${this.state.currentRole.id}`,
//                 method: 'DELETE'
//             });
//
//             if (response.code === 200) {
//                 this._showSuccess('删除角色成功');
//                 this.deleteModal.hide();
//                 // 刷新角色列表
//                 await this._loadRoles();
//                 // 清空当前选中的角色
//                 this.state.currentRole = null;
//                 this._clearRoleDetail();
//             } else {
//                 throw new Error(response.message || '删除角色失败');
//             }
//         } catch (error) {
//             console.error('删除角色失败:', error);
//             this._showError('删除角色失败：' + error.message);
//         }
//     }
//
//     /**
//      * 清空角色详情显示
//      * @private
//      */
//     _clearRoleDetail() {
//         $('#currentRoleTitle').text('选择角色查看权限');
//         $('#roleCode').text('');
//         $('#baseRole').text('');
//         $('#roleStatus').html('');
//         $('#roleDescription').text('');
//         $('.role-actions').hide();
//         this.$permissionTree.empty();
//     }
// }
//
// /**
//  * 确保页面完全加载后再初始化应用
//  * 使用 DOMContentLoaded 和 jQuery ready 双重保证
//  */
// document.addEventListener('DOMContentLoaded', function() {
//     try {
//         // 等待 jQuery 和其他依赖完全加载
//         $(document).ready(function() {
//             // 检查必要的依赖是否存在
//             if (typeof $ === 'undefined') {
//                 throw new Error('jQuery未加载');
//             }
//             if (typeof bootstrap === 'undefined') {
//                 throw new Error('Bootstrap未加载');
//             }
//
//             console.log('开始初始化角色管理模块...');
//
//             // 初始化全局错误处理
//             _setupGlobalErrorHandler();
//
//             // 初始化应用实例
//             window.roleManagement = new RoleManagement();
//
//             console.log('角色管理模块初始化完成');
//         });
//     } catch (error) {
//         console.error('应用初始化失败:', error);
//         _handleInitializationError(error);
//     }
// });
//
// /**
//  * 设置全局错误处理器
//  * @private
//  */
// function _setupGlobalErrorHandler() {
//     window.onerror = function(message, source, lineno, colno, error) {
//         console.error('全局错误:', {
//             message: message,
//             source: source,
//             lineno: lineno,
//             colno: colno,
//             error: error
//         });
//
//         // 显示用户友好的错误提示
//         if ($ && $.toast) {
//             $.toast({
//                 heading: '系统错误',
//                 text: '操作出现异常，请刷新页面重试',
//                 icon: 'error',
//                 position: 'top-right',
//                 hideAfter: 5000
//             });
//         }
//
//         return false; // 允许错误继续冒泡
//     };
// }
//
// /**
//  * 处理初始化错误
//  * @param {Error} error - 错误对象
//  * @private
//  */
// function _handleInitializationError(error) {
//     // 创建错误提示元素
//     const errorElement = document.createElement('div');
//     errorElement.className = 'alert alert-danger m-3';
//     errorElement.innerHTML = `
//         <h4 class="alert-heading">系统初始化失败</h4>
//         <p>抱歉，系统初始化过程中遇到问题：${error.message}</p>
//         <hr>
//         <p class="mb-0">
//             <button class="btn btn-outline-danger btn-sm" onclick="location.reload()">
//                 刷新页面
//             </button>
//         </p>
//     `;
//
//     // 插入到页面顶部
//     const mainContent = document.querySelector('#main');
//     if (mainContent) {
//         mainContent.insertBefore(errorElement, mainContent.firstChild);
//     } else {
//         document.body.insertBefore(errorElement, document.body.firstChild);
//     }
// }