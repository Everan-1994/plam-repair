<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row class="margin-top-20">
            <Col span="24">
            <Card>
                <p slot="title">
                    <Icon type="paper-airplane"></Icon> 客户列表
                </p>
                <Row>
                    <Col span="12">
                        <span @click="addModal = true" style="margin: 0 10px;">
                            <Button type="primary" icon="plus-round">新增客户</Button>
                        </span>
                    </Col>
                </Row>
                <Row class="margin-top-10">
                    <Table :columns="columns" :data="customerList" :loading="cloading"></Table>
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
        <Modal title="新增客户" v-model="addModal" :mask-closable="false" width="600" @on-cancel="resetAddModel">
            <div>
                <Form ref="addForm" :model="addForm" :label-width="80" :rules="rules" style="margin-right: 25px;">
                    <Form-item label="客户名称" prop="name">
                        <Input v-model="addForm.name" placeholder="请输入客户名称" />
                    </Form-item>
                    <Form-item label="绑定学校" prop="school_id">
                        <Select v-model="addForm.school_id">
                            <Option v-for="item in schools" :value="item.id" :key="item.id">{{ item.school_name }}</Option>
                        </Select>
                    </Form-item>
                    <Form-item label="图标" prop="post">
                        <div style="display: block;width: 100%;">
                            <Upload
                                    action="//admin.api.bitbithi.framework7.cn/common/uploadImg"
                                    :on-format-error="handleFormatError"
                                    :on-progress="handleProgress"
                                    :on-success="handleSuccess"
                                    :on-error="handleError"
                                    :show-upload-list="false"
                            >
                                <img src="../../images/logo.jpg" alt=""
                                     style="max-width: 240px; max-height: 180px; border-radius: 3px; margin-right: 10px; border: 1px dashed #2d8bf0;"
                                     ref="addPost">
                                <input v-model="addForm.post" type="hidden">
                            </Upload>
                        </div>
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
        <Modal v-model="editModal" :mask-closable="false" width="600">
            <p slot="header" style="color:#f60;text-align:center">
                <Icon type="edit"></Icon>
                <span>编辑客户</span>
            </p>
            <div>
                <Form ref="editForm" :model="editForm" :label-width="80" :rules="rules" style="margin-right: 25px;">
                    <Form-item label="客户名称" prop="name">
                        <Input v-model="editForm.name" placeholder="请输入客户名称"/>
                    </Form-item>
                    <Form-item label="图标" prop="post">
                        <div style="display: block;width: 100%;">
                            <Upload
                                    action="//admin.api.bitbithi.framework7.cn/common/uploadImg"
                                    :on-format-error="handleFormatError"
                                    :on-progress="handleProgress"
                                    :on-success="handleSuccess"
                                    :on-error="handleError"
                                    :show-upload-list="false"
                            >
                                <img src="../../images/logo.jpg" alt=""
                                     style="max-width: 240px; max-height: 180px; border-radius: 3px; margin-right: 10px; border: 1px dashed #2d8bf0;"
                                     ref="editPost">
                                <input v-model="editForm.post" type="hidden">
                            </Upload>
                        </div>
                    </Form-item>
                    <Form-item label="状态" prop="status">
                        <i-switch v-model="editForm.status" size="large" :true-value="1" :false-value="2">
                            <span slot="open">正常</span>
                            <span slot="close">禁用</span>
                        </i-switch>
                    </Form-item>
                    <Form-item label="排序" prop="sort">
                        <Input v-model="editForm.sort" style="width: 70px;" placeholder="请输入排序"/>
                        <span><i style="color: red;">*</i> 数字大的排前面</span>
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
                count: 0,
                page: 1,
                pageSize: 10,
                pageSizeOpts: [10, 20, 30, 50],
                showPage: false,
                cloading: false,
                loading: false,
                addloading: false,
                eloading: false,
                editloading: false,
                id: 0,
                addForm: {
                    name: '',
                    school_id: '',
                    status: 1,
                    post: '',
                },
                editForm: {
                    name: '',
                    school_id: '',
                    status: 1,
                    post: '',
                },
                schools: [],
                addModal: false,
                editModal: false,
                columns: [
                    {
                        key: 'sort',
                        title: '排序',
                        align: 'center',
                        width: 60
                    },
                    {
                        key: 'title',
                        title: '名称',
                        align: 'center'
                    },
                    {
                        key: 'color',
                        title: '名称颜色',
                        align: 'center',
                        width: 100,
                        render: (h, params) => {
                            return h('Tag', {
                                props: {
                                    color: params.row.color
                                }
                            })
                        }
                    },
                    {
                        key: 'icon',
                        title: '图标',
                        align: 'center',
                        width: 450,
                        render: (h, params) => {
                            return h('img', {
                                attrs: {
                                    src: params.row.icon,
                                    style: 'max-width: 400px; max-height: 200px; border-radius: 10px; padding: 5px;'
                                }
                            })
                        }
                    },
                    {
                        key: 'status',
                        title: '状态',
                        align: 'center',
                        width: 120,
                        render: (h, params) => {
                            return h('Tag', {
                                props: {
                                    type: 'dot',
                                    color: params.row.status == 1 ? 'green' : 'red'
                                }
                            }, params.row.status == 1 ? '正常' : '禁用')
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
                                            this.getCategoryById(params.row.id);
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
                                            this.deleteCategoryById(params.row.id, params.index)
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
                rules: {
                    name: [
                        {required: true, message: '请填写客户名称', trigger: 'blur'}
                    ],
                    school_id: [
                        {required: true, message: '请绑定学校', trigger: 'change'}
                    ],
                    post: [
                        {required: true, message: '请上传图标', trigger: 'blur'}
                    ]
                }
            }
        },
        created() {
//            this.getCustomerList();
//            if (this.count > 0) {
//                this.showPage = true;
//            }
        },
        methods: {
            getCustomerList() {
                let _this = this;
                let params = {
                    page: _this.page,
                    pageSize: _this.pageSize
                };
                axios.get(path + 'category/getCustomerList', {params}).then(response => {
                    if (response.data.errcode == 200) {
                        _this.customerList = response.data.data.data;
                        _this.count = response.data.data.count;
                        _this.cloading = false;
                    }
                })
            },
            changePage(value) {
                this.cloading = true;
                this.page = value;
                this.getCustomerList();
            },
            changePageSize(value) {
                this.cloading = true;
                this.pageSize = value;
                this.getCustomerList();
            },
            getCategoryById(id) {
                let _this = this;
                axios.get(path + 'category/getCategoryById?id=' + id).then(response => {
                    if (response.data.errcode == 200) {
                        let data = response.data.data;
                        _this.editForm.title = data.title;
                        _this.editForm.post = data.icon;
                        _this.$refs.editPost.src = data.icon;
                        _this.editForm.status = data.status;
                        _this.editForm.sort = data.sort;
                        _this.editForm.color = data.color;
                    }
                })
            },
            deleteCategoryById(id, index) {
                axios.get(path + 'category/del', {
                    params: {
                        id: id
                    }
                }).then(response => {
                    if (response.data.errcode == 200) {
                        this.$Message.success('删除成功', 1.5);
                        this.remove(index)
                    } else {
                        this.$Message.error('删除失败', 1.5);
                    }
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
                        if (_this.id == 0) {
                            var formData = {
                                'id': _this.id,
                                'title': _this.addForm.title,
                                'status': _this.addForm.status,
                                'post': _this.addForm.post,
                                'color': _this.addForm.color,
                                'sort': _this.addForm.sort
                            }
                        } else {
                            var formData = {
                                'id': _this.id,
                                'title': _this.editForm.title,
                                'status': _this.editForm.status,
                                'post': _this.editForm.post,
                                'color': _this.editForm.color,
                                'sort': _this.editForm.sort
                            }
                        }
                        axios.post(path + 'category/addAndEdit', formData).then(response => {
                            if (response.data.errcode == 200) {
                                _this.$Message.success('提交成功');
                                setTimeout(function () {
                                    _this.addloading = false;
                                    _this.editloading = false;
                                    if (_this.id > 0) {
                                        _this.closeEditModal();
                                        _this.$refs.editPost.src = '../../images/logo.jpg';
                                    } else {
                                        _this.closeAddModal();
                                        _this.$refs.addPost.src = '../../images/logo.jpg';
                                    }
                                    _this.getCustomerList();
                                    _this.$refs[name].resetFields();
                                }, 1000)
                            } else {
                                _this.$Message.error(response.data.errmsg);
                                _this.addloading = false;
                                _this.editloading = false;
                            }
                        }).cache(error => {
                            _this.addloading = false;
                            _this.editloading = false;
                            _this.$Message.error('系统出错，请稍后再试。');
                        })
                    }
                });
            },
            handleReset(name) {
                this.$refs[name].resetFields();
            },
            handleError(error, file) {
                this.$Notice.error({
                    title: '图标上传失败',
                    desc: '系统错误。'
                })
                this.loading = false;
                this.eloading = false;
            },
            handleSuccess(res, file) {
                let response = file.response

                if (response.code == 0) {
                    if (this.id > 0) {
                        this.editForm.post = response.data.url;
                        this.$refs.editPost.src = response.data.url;
                    } else {
                        this.addForm.post = response.data.url;
                        this.$refs.addPost.src = response.data.url;
                    }

                    this.$Notice.success({
                        title: '温馨提示',
                        desc: '图标 ' + file.name + ' 上传成功。'
                    });
                } else {
                    this.$Notice.error({
                        title: '温馨提示',
                        desc: '图标 ' + file.name + ' 上传失败。'
                    });
                }

                this.loading = false;
                this.eloading = false;
            },
            handleFormatError(file) {
                this.$Notice.warning({
                    title: '温馨提示',
                    desc: '图标 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图标。'
                }, 1.5)
            },
            handleMaxSize(file) {
                this.$Notice.warning({
                    title: '温馨提示',
                    desc: '图标 ' + file.name + ' 太大，不能超过 2M。'
                }, 1.5)
            },
            handleProgress(event, file) {
                this.loading = true;
                this.eloading = true;
                this.$Notice.info({
                    title: '温馨提示',
                    desc: '图标 ' + file.name + ' 正在上传。'
                });
            }
        }
    }
</script>
