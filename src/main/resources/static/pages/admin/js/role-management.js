/**
 * RoleManagement.js
 * 角色权限管理页面控制器
 */
let roleId = 0;
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
            NotifyUtil.error('当前在第一页');
            return;
        }
        pageNumber--;
        getList();
    });

    $("#next").click(function (e) {
        e.preventDefault();
        if (pageNumber === total) {
            NotifyUtil.error('当前在最后一页');
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
    let url = `/api/permissions/selectPermissionByPermissionId/${roleId}`;
    $.ajax({
        url: url,
        headers: {"token": localStorage.getItem("token")},
        success: function (result) {
            _renderPermission(result.data)
        },
        error: function (xhr, status, error) {
            if (xhr.status === 401) {
                NotifyUtil.error('请登录！');
                window.location.href = '/pages/auth/login.html';
            } else {
                // 可以添加其他错误处理逻辑，或者只是简单地显示错误信息
                console.error("AJAX Error:", status, error);
                NotifyUtil.error("发生错误，请稍后再试。");
            }
        }
    });
}
_renderPermission = function (data){
        try{
            let html = "";
            $.each(data, function (index, permission) {
                if (permission) {
                    html += "<tr>";
                    html += "<td>" + permission.permissionName + "</td>";
                    html += "<td>";
                    html += "<button class='btn btn-danger' onclick='del(" + permission.permissionId + ")'>删除</button>";
                    html += "</td>";
                    html += "</tr>";
                }
            });
        $("#permission").html(html);
        }
    catch(error)  {
        console.error("Invalid response format:", error);
        NotifyUtil.error("无法加载权限信息，请稍后再试。");
    }
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
                NotifyUtil.error('请登录！');
                window.location.href = '/pages/auth/login.html';
            } else {
                // 可以添加其他错误处理逻辑，或者只是简单地显示错误信息
                console.error("AJAX Error:", status, error);
                NotifyUtil.error("发生错误，请稍后再试。");
            }
        }
    });
}

//删除权限
function del(permissionId) {
    if (confirm('确定删除吗？')) {
        $.ajax({
            url: `/api/permissions/deletePermission`,
            data :{
              permissionId,
              roleId
            },
            headers: {"token": localStorage.getItem("token")},
            success: function (result) {
                NotifyUtil.error(result.msg);
                if (result.code === 200) {
                    window.location.reload();
                }
            },
            error: function (xhr, status, error) {
                if (xhr.status === 401) {
                    NotifyUtil.error('请登录！');
                    window.location.href = '/pages/auth/pages/auth/login.html';
                } else {
                    // 可以添加其他错误处理逻辑，或者只是简单地显示错误信息
                    console.error("AJAX Error:", status, error);
                    NotifyUtil.error("发生错误，请稍后再试。");
                }
            }
        });
    }
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
                // NotifyUtil.error($(this).text());
                roleId = $(this).data("id")
                getSomeThing(roleId);
                getSomePermission(roleId);
            });
            $("#RoleNameList").html(html); // 确保 #RoleNameList 是表格的容器或者表格本身
        },
        error: function (xhr, status, error) {
            if (xhr.status === 401) {
                NotifyUtil.error('请登录！');
                setTimeout(function () {
                    window.location.href = '/pages/auth/login.html';
                },3000);
            } else {
                // 可以添加其他错误处理逻辑，或者只是简单地显示错误信息
                console.error("AJAX Error:", status, error);
                NotifyUtil.error("发生错误，请稍后再试。");
            }
        }
    });
}

// 获取所有权限信息
// 获取所有权限信息并渲染到页面
function getAllPermissionAndRender() {
    $.ajax({
        url: `/api/roles/OneRoleMorePermission`,
        data: {keyword: $("#PermissionSearch").val(),
                roleId},
        headers: {"token": localStorage.getItem("token")},
        method: "GET",
        success: function (result) {
            renderPermissions(result.data);
        },
        error: function (xhr, status, error) {
            if (xhr.status === 401) {
                NotifyUtil.error('请登录！');
                window.location.href = '/pages/auth/login.html';
            } else {
                console.error("AJAX Error:", status, error);
                NotifyUtil.error("发生错误，请稍后再试。");
            }
        }
    });
}

// 渲染权限信息到指定的 DOM 元素
function renderPermissions(permissions) {
    let html = '';
    $(permissions).each(function (index, e) {
        html += "<tr>";
        html += "<td class='permission-name' data-id='" + e.permissionId + "'>" + e.permissionName + "</td>";
        html += "<td><button class='btn btn-primary add-permission-btn' data-permission-id='" + e.permissionId + "'>添加</button></td>";
        html += "</tr>";
    });
    $("#someThingRole2").html(html); // 填充表格的 tbody
}

//添加权限
function showModal2() {
    $("#roleModal2").on('shown.bs.modal', function () { // 使用模态层的 shown.bs.modal 事件来确保在模态层完全显示后加载数据
        getAllPermissionAndRender();
    }).modal('show'); // 先显示模态层
}

$("#createRoleBtn").on('click', function () {
    showroleModal();
});
$("#addPer").on('click', function () {
    showModal2();
});

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}


//搜索框模糊查询
$(document).ready(function () {
    let debouncedSearch; // 保存防抖后的函数
    let debouncedSearchPermission; // 保存防抖后的函数
    // 初始化防抖函数
    debouncedSearch = debounce(function () {
        getList();
    }, 300);

    $('#roleSearch').on('keyup', function (event) {
        debouncedSearch();
    });

    debouncedSearchPermission = debounce(function () {
        getAllPermissionAndRender();
    }, 300);

    $('#PermissionSearch').on('keyup', function (event) {
        debouncedSearchPermission();
    });

    $('#roleModal2').on('click', '.add-permission-btn', function () {
        let permissionId = $(this).data('permission-id');
        $.ajax({
            url: `/api/permissions/addPermission`,
            data: {
                roleId,
                permissionId
            },

            headers: {"token": localStorage.getItem("token")},
            success: function (result) {
                NotifyUtil.error(result.msg);
                if (result.code === 200) {
                    window.location.reload();
                }
            },
            error: function (xhr, status, error) {
                if (xhr.status === 401) {
                    NotifyUtil.error('请登录！');
                    window.location.href = '/pages/auth/login.html';
                } else {
                    console.error("AJAX Error:", status, error);
                    NotifyUtil.error("发生错误，请稍后再试。");
                }
            }
        });
    });
});
$(function () {
    // 初始化表单校验
    const $roleForm = $("#roleForm");
    const $roleForm1 = $("#roleForm1");

    // 绑定字段变化事件
    $roleForm.find("input, select").on("input change", function () {
        const fieldName = $(this).attr("name");
        validateForm("#roleForm", fieldName);
    });

    $roleForm1.find("input, select").on("input change", function () {
        const fieldName = $(this).attr("name");
        validateForm("#roleForm1", fieldName);
    });

    // 绑定表单提交事件
    $("#saveRoleBtn").on("click", function () {
        if (validateForm("#roleForm")) {
            addRole();
        }
    });

    $("#saveRoleBtn2").on("click", function () {
        if (validateForm("#roleForm1")) {
            updateRole();
        }
    });
});
/**
 * 验证表单
 * @param {string} formSelector - 表单选择器
 * @param {string} fieldName - 字段名称（可选）
 * @returns {boolean} - 验证结果
 */
function validateForm(formSelector, fieldName) {
    const $form = $(formSelector);
    let isValid = true;

    const validationRules = {
        roleCode: {
            required: true,
            pattern: /^[A-Z][A-Z0-9_]{2,19}$/,
            message: "角色编码格式不正确（大写字母开头，仅允许大写字母、数字和下划线，3-20位）"
        },
        roleName: {
            required: true,
            maxLength: 50,
            message: "角色名称不能为空，且长度不能超过50个字符"
        },
        baseRoleSelect: {
            required: true,
            message: "请选择基础角色类型"
        }
    };

    const validateField = (fieldName) => {
        const $field = $form.find(`[name="${fieldName}"]`);
        const value = $field.val()?.trim() || '';

        // 清除之前的校验状态
        $field.removeClass("is-invalid is-valid");
        $field.next(".invalid-feedback").remove();

        // 检查字段是否在规则中定义
        const rules = validationRules[fieldName];
        if (!rules) {
            console.warn(`No validation rules defined for field: ${fieldName}`);
            return;
        }

        // 校验逻辑
        if (rules.required && !value) {
            $field.addClass("is-invalid");
            $field.after(`<div class="invalid-feedback">${rules.message}</div>`);
            isValid = false;
        } else if (rules.pattern && !rules.pattern.test(value)) {
            $field.addClass("is-invalid");
            $field.after(`<div class="invalid-feedback">${rules.message}</div>`);
            isValid = false;
        } else if (rules.maxLength && value.length > rules.maxLength) {
            $field.addClass("is-invalid");
            $field.after(`<div class="invalid-feedback">${rules.message}</div>`);
            isValid = false;
        } else {
            $field.addClass("is-valid");
        }
    };

    if (fieldName) {
        validateField(fieldName);
    } else {
        Object.keys(validationRules).forEach(validateField);
    }

    return isValid;
}
//修改
function updateRole() {

    let P = $("#roleForm1").serialize();
    console.log(P);
    $.ajax({
        url: "/api/roles/updateRole",
        data: P,
        headers: {"token": localStorage.getItem("token")},
        success: function () {
            NotifyUtil.error("修改成功");
            window.location.reload();
        }, error: function (xhr, status, error) {
            if (xhr.status == 401) {
                NotifyUtil.error('请登录！');
                window.location.href = '/pages/auth/login.html';
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
                NotifyUtil.error("删除成功");
                window.location.reload();
            }, error: function (xhr, status, error) {
                if (xhr.status == 401) {
                    NotifyUtil.error('请登录！');
                    window.location.href = '/pages/auth/login.html';
                }
            }
        })
    }
}

//增加的模态层
function showroleModal() {
    $("#roleModal").modal('show');
    $("#roleForm")[0].reset(); // 重置表单
    $("#roleModalTitle").text("新建角色");
}

//修改的模态层
function updateRoleModal(e) {
    $("#roleModal1").modal('show');
    $("#roleId1").val(e.roleId);
    $("#baseRoleSelect1").val(e.baseRoleCode);
    $("#roleCodeInput1").val(e.roleCode);
    $("#roleName1").val(e.roleName);
    $("#description1").val(e.description);
    $("#status1").prop("checked", e.status === 1);
    $("#roleModalTitle1").text("修改角色");
}

//增加
function addRole() {
    let P = $("#roleForm").serialize();
    console.log(P);
    $.ajax({
        url: "/api/roles/insert",
        data: P,
        headers: {"token": localStorage.getItem("token")},
        success: function () {
            NotifyUtil.error("添加成功");
            window.location.reload();
        }, error: function (xhr, status, error) {
            if (xhr.status == 401) {
                NotifyUtil.error('请登录！');
                window.location.href = '/pages/auth/login.html';
            }
        }
    })
}

