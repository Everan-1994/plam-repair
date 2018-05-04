<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row class="margin-top-20">
            <Col span="24">
            <Card>
                <p slot="title">
                    <Icon type="paper-airplane"></Icon>
                    客户列表
                </p>
                <Row>
                    <Col span="12">
                    <span @click="addModal = true" style="margin: 0 10px;">
                            <Button type="primary" icon="plus-round">新增客户</Button>
                        </span>
                    </Col>
                </Row>
                <Row class="margin-top-10">
                    <Table :columns="columns" :data="customerList" :loading="loading"></Table>
                    <div style="margin: 10px; padding-bottom: 1px; overflow: hidden" v-if="showPage">
                        <div style="float: right;">
                            <Page :total="count"
                                  :current="page"
                                  :page-size="pageSize"
                                  @on-change="changePage"
                                  @on-page-size-change="changePageSize"
                                  show-sizer
                                  show-elevator
                                  show-total
                                  :page-size-opts="pageSizeOpts"
                                  :placement="'top'">
                            </Page>
                        </div>
                    </div>
                </Row>
            </Card>
            </Col>
        </Row>
        <Modal title="新增客户" v-model="addModal" :mask-closable="false" width="400" @on-cancel="resetAddModel">
            <div>
                <Form ref="addForm" :model="addForm" :label-width="80" :rules="arules" style="margin-right: 25px;">
                    <Form-item label="客户昵称" prop="name">
                        <Input v-model="addForm.name" placeholder="请输入客户昵称"/>
                    </Form-item>
                    <Form-item label="客户邮箱" prop="email">
                        <Input v-model="addForm.email" placeholder="请输入客户邮箱"/>
                    </Form-item>
                    <Form-item label="账号密码" prop="password">
                        <Input type="password" v-model="addForm.password" placeholder="请输入账号密码"/>
                    </Form-item>
                    <Form-item label="绑定学校" prop="school_id">
                        <Select v-model="addForm.school_id">
                            <Option v-for="item in schools" :value="item.id" :key="item.id" :disabled="item.bind == 1">{{ item.school_name }}
                            </Option>
                        </Select>
                    </Form-item>
                    <Form-item label="状态" prop="status">
                        <i-switch v-model="addForm.status" size="large" :true-value="1" :false-value="2">
                            <span slot="open">正常</span>
                            <span slot="close">禁用</span>
                        </i-switch>
                    </Form-item>
                    <Form-item style="text-align: right;">
                        <Button type="primary" @click="handleSubmit('addForm')" icon="paper-airplane"
                                :loading="addloading"> 提 交
                        </Button>
                        <Button type="ghost" @click="handleReset('addForm')" style="margin-left: 8px">Reset</Button>
                    </Form-item>
                </Form>
            </div>
            <div slot="footer"></div>
        </Modal>
        <Modal v-model="editModal" :mask-closable="false" width="400">
            <p slot="header" style="color:#f60;text-align:center">
                <Icon type="edit"></Icon>
                <span>编辑客户</span>
            </p>
            <div>
                <Form ref="editForm" :model="editForm" :label-width="80" :rules="erules" style="margin-right: 25px;">
                    <Form-item label="客户昵称" prop="name">
                        <Input v-model="editForm.name" placeholder="请输入客户昵称"/>
                    </Form-item>
                    <Form-item label="客户邮箱" prop="email">
                        <Input v-model="editForm.email" placeholder="请输入客户邮箱"/>
                    </Form-item>
                    <Form-item label="账号密码" prop="password">
                        <Input type="password" style="width: 75%;" :disabled="isdisplay" v-model="editForm.password" placeholder="请输入账号密码"/>
                        <Checkbox style="margin-left: 10px;" v-model="isdisplay"> {{ isdisplay ? open_close.open : open_close.close }} </Checkbox>
                    </Form-item>
                    <Form-item label="绑定学校" prop="school_id">
                        <Select v-model="editForm.school_id">
                            <Option v-for="item in schools" :value="item.id" :key="item.id" :disabled="item.bind == 1 && editForm.school_id != item.id">{{ item.school_name }}
                            </Option>
                        </Select>
                    </Form-item>
                    <Form-item label="状态" prop="status">
                        <i-switch v-model="editForm.status" size="large" :true-value="1" :false-value="2">
                            <span slot="open">正常</span>
                            <span slot="close">禁用</span>
                        </i-switch>
                    </Form-item>
                    <Form-item style="text-align: right;">
                        <Button type="primary" @click="handleSubmit('editForm')" icon="paper-airplane"
                                :loading="editloading"> 提 交
                        </Button>
                        <Button type="ghost" @click="handleReset('editForm')" style="margin-left: 8px">Reset</Button>
                    </Form-item>
                </Form>
            </div>
            <div slot="footer"></div>
        </Modal>
    </div>
</template>

<script>
    import axios from 'axios';
    import {path} from './../../helpers/path';
    import JWT from './../../helpers/jwt';

    export default {
        name: 'customers',
        data() {
            return {
                total: 0,
                page: 1,
                pageSize: 10,
                pageSizeOpts: [10, 20, 30, 50],
                showPage: false,
                loading: true,
                addloading: false,
                eloading: false,
                editloading: false,
                isdisplay: true,
                open_close: {
                    open: '开启',
                    close: '关闭'
                },
                id: 0,
                addForm: {
                    name: '',
                    email: '',
                    password: '',
                    school_id: '',
                    status: 1,
                },
                editForm: {
                    name: '',
                    email: '',
                    school_id: '',
                    status: 1,
                    password: '',
                },
                schools: [],
                addModal: false,
                editModal: false,
                columns: [
                    {
                        key: 'id',
                        title: '排序',
                        align: 'center',
                        width: 60
                    },
                    {
                        key: 'avatar',
                        title: '头像',
                        align: 'center',
                        render: (h, params) => {
                            return h('Avatar', {
                                props: {
                                    src: params.row.avatar
                                }
                            });
                        }
                    },
                    {
                        key: 'name',
                        title: '昵称',
                        align: 'center'
                    },
                    {
                        key: 'email',
                        title: '邮箱',
                        align: 'center'
                    },
                    {
                        key: 'phone',
                        title: '手机号',
                        align: 'center',
                        render: (h, params) => {
                            if (params.row.phone) {
                                return params.row.phone;
                            } else {
                                return h('Tag', {
                                    props: {
                                        color: 'default'
                                    }
                                }, '未绑定');
                            }
                        }
                    },
                    {
                        key: 'school',
                        title: '学校',
                        align: 'center',
                        render: (h, params) => {
                            let school = params.row.school;
                            return h('div', [
                                h('Icon', {
                                    props: {
                                        type: 'ios-home',
                                        size: '15',
                                        color: '#2fb0dc'
                                    }
                                }),
                                h('span', ' ' + school.school_name)
                            ]);
                        }
                    },
                    {
                        key: 'status',
                        title: '状态',
                        align: 'center',
                        width: 120,
                        render: (h, params) => {
                            return h('i-switch', {
                                props: {
                                    size: 'large',
                                    value: params.row.status,
                                    'true-value': 1,
                                    'false-value': 2
                                },
                                scopedSlots: {
                                    open: () => h('span', '正常'),
                                    close: () => h('span', '禁用')
                                },
                                on: {
                                    'on-change': (value) => {
                                        this.changeCustomerStatus(params.row.id, value);
                                    }
                                },
                            });
                        }
                    },
                    {
                        key: 'action',
                        title: '操作',
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'info',
                                        size: 'small',
                                        icon: 'edit'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.id = params.row.id;
                                            this.editModal = true;
                                            this.getCustomerById(params.row.id);
                                        }
                                    }
                                }, '编辑'),
                                h('Poptip', {
                                    props: {
                                        confirm: true,
                                        title: '确定要删除这条数据吗?',
                                        transfer: true
                                    },
                                    on: {
                                        'on-ok': () => {
                                            this.deleteCustomer(params.row.id, params.index)
                                        }
                                    }
                                }, [
                                    h('Button', {
                                        style: {
                                            marginRight: '5px'
                                        },
                                        props: {
                                            type: 'error',
                                            size: 'small',
                                            placement: 'top',
                                            icon: 'trash-a'
                                        }
                                    }, '删除')
                                ])
                            ])
                        }
                    }
                ],
                customerList: [],
                arules: {
                    name: [
                        {required: true, message: '请填写客户昵称', trigger: 'blur'}
                    ],
                    email: [
                        {required: true, message: '请填写邮箱', trigger: 'blur'},
                        {type: 'email', message: '邮箱格式不正确', trigger: 'change'}
                    ],
                    password: [
                        {required: true, message: '请填写账号密码', trigger: 'blur'}
                    ],
                    school_id: [
                        {required: true, message: '请绑定学校', pattern: /.+/, trigger: 'change'}
                    ]
                },
                erules: {
                    name: [
                        {required: true, message: '请填写客户昵称', trigger: 'blur'}
                    ],
                    email: [
                        {required: true, message: '请填写邮箱', trigger: 'blur'},
                        {type: 'email', message: '邮箱格式不正确', trigger: 'change'}
                    ],
                    school_id: [
                        {required: true, message: '请绑定学校', pattern: /.+/, trigger: 'change'}
                    ]
                }
            }
        },
        created() {
            // 获取学校
            this.getSchoolList();
            // 获取客户列表
            this.getCustomerList();
        },
        methods: {
            getSchoolList() {
                axios.get(path + '/api/getSchoolList').then(response => {
                    this.schools = response.data;
                }).catch(error => {
                    console.log(error);
                });
            },
            getCustomerList() {
                let _this = this;
                let params = {
                    page: _this.page,
                    pageSize: _this.pageSize
                };
                axios.get(path + '/api/customer', {params}).then(response => {
                    _this.customerList = response.data.data;
                    this.total = response.data.meta.total;
                    this.total >= 10 ? this.showPage = true : this.showPage = false;
                    this.loading = false;
                }).catch(error => {
                    console.log(error);
                });
            },
            changePage(value) {
                this.loading = true;
                this.page = value;
                this.getCustomerList();
            },
            changePageSize(value) {
                this.loading = true;
                this.pageSize = value;
                this.getCustomerList();
            },
            getCustomerById(id) {
                axios.get(`${path}/api/customer/${id}`).then(response => {
                    let data = response.data;
                    this.editForm.name = data.name;
                    this.editForm.school_id = data.school_id;
                    this.editForm.status = data.status;
                    this.editForm.email = data.email;
                }).catch(error => {
                    console.log(error);
                })
            },
            remove(index) {
                this.customerList.splice(index, 1);
            },
            closeAddModal() {
                this.addModal = false;
                this.id = 0;
            },
            closeEditModal() {
                this.editModal = false;
                this.id = 0;
            },
            resetAddModel() {
                this.handleReset('addForm');
            },
            handleSubmit(name) {
                let _this = this;
                _this.addloading = true;
                _this.editloading = true;
                _this.$refs[name].validate((valid) => {
                    if (valid) {
                        if (_this.id > 0) {
                            let formData = {
                                'name': _this.editForm.name,
                                'email': _this.editForm.email,
                                'school_id': _this.editForm.school_id,
                                'status': _this.editForm.status,
                            };

                            if (_this.editForm.password.length > 0) {
                                formData.password = _this.editForm.password;
                            }

                            axios.patch(`${path}/api/customer/${_this.id}`, formData).then(response => {
                                _this.$Message.success('更新成功');
                                setTimeout(function () {
                                    _this.editloading = false;
                                    _this.getCustomerList();
                                    _this.getSchoolList();
                                    _this.handleReset(name);
                                    _this.editModal = false;
                                }, 1000);
                                _this.addloading = false;
                                _this.editloading = false;
                            }).catch(error => {
                                _this.addloading = false;
                                _this.editloading = false;
                                _this.$Message.error(error.response.data.msg || '系统出错，请稍后再试。');
                            });
                        } else {
                            let formData = {
                                'name': _this.addForm.name,
                                'email': _this.addForm.email,
                                'password': _this.addForm.password,
                                'school_id': _this.addForm.school_id,
                                'status': _this.addForm.status,
                            };
                            axios.post(path + '/api/customer', formData).then(response => {
                                _this.$Message.success('新增成功');
                                setTimeout(function () {
                                    _this.addloading = false;
                                    _this.getCustomerList();
                                    _this.getSchoolList();
                                    _this.handleReset(name);
                                    _this.addModal = false;
                                }, 1000);
                                _this.addloading = false;
                                _this.editloading = false;
                            }).catch(error => {
                                _this.addloading = false;
                                _this.editloading = false;
                                _this.$Message.error(error.response.data.msg || '系统出错，请稍后再试。');
                            });
                        }
                    } else {
                        _this.addloading = false;
                        _this.editloading = false;
                    }
                });
            },
            handleReset(name) {
                this.$refs[name].resetFields();
            },
            changeCustomerStatus(id, value) {
                this.$Modal.confirm({
                    title: '温馨提示',
                    content: '<h3>确定要进行当前操作吗？</h3>',
                    onOk: () => {
                        axios.patch(path + `/api/customer/${id}`, {
                            status: value
                        }).then(response => {
                            this.$Message.success('状态变更成功', 1.5);
                        }).catch(error => {
                            this.$Message.error('状态变更失败', 1.5);
                            this.getCustomerList();
                        })
                    },
                    onCancel: () => {
                         this.getCustomerList();
                    }
                });
            },
            deleteCustomer(id, index) {
                axios.delete(`${path}/api/customer/${id}`).then(response => {
                    this.$Message.success('删除成功', 1.5);
                    this.remove(index);
                }).catch(error => {
                    console.log(error);
                    this.$Message.error('删除失败', 1.5);
                })
            },
            remove (index) {
                this.schools.splice(index, 1);
                this.total-- ;
            },
        }
    }
</script>
