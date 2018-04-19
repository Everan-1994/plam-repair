<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row class="margin-top-20">
            <Col span="24">
            <Card>
                <p slot="title">
                    <Icon type="ios-home"></Icon>
                    学校列表
                </p>
                <Row>
                    <Col span="12">
                        <span @click="addModal = true" style="margin: 0 10px;">
                          <Button type="primary" icon="plus-round">新增学校</Button>
                        </span>
                    </Col>
                </Row>
                <Row class="margin-top-10">
                    <Table :columns="columns" :data="schools" :loading="loading"></Table>
                    <div style="margin: 10px; padding-bottom: 1px; overflow: hidden" v-if="showPage">
                        <div style="float: right;">
                            <Page :total="total"
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
        <Modal title="新增学校" v-model="addModal" :mask-closable="false" width="400" @on-cancel="closeModal('addForm')">
            <div>
                <Form ref="addForm" :model="addForm" :label-width="80" :rules="rules" style="margin-right: 25px;">
                    <Form-item label="学校名称" prop="school_name">
                        <Input v-model="addForm.school_name" placeholder="请输入学校名称" />
                    </Form-item>
                    <Form-item label="学校代码" prop="school_code">
                        <Input v-model="addForm.school_code" placeholder="请输入学校代码" />
                    </Form-item>
                    <Form-item label="LOGO" prop="logo">
                        <div style="display: block;width: 100%;">
                            <Upload
                                    name="logo"
                                    action="//repair-api.wei/api/upload/image"
                                    :on-format-error="handleFormatError"
                                    :on-progress="handleProgress"
                                    :format="['jpg','jpeg','png']"
                                    :on-success="handleSuccess"
                                    :on-error="handleError"
                                    :headers="headers"
                                    :show-upload-list="false"
                            >
                                <img src="../../images/view.png" alt=""
                                     style="max-width: 240px; max-height: 180px; border-radius: 3px; margin-right: 10px; border: 1px dashed #2d8bf0;"
                                     ref="addLogo">
                                <input v-model="addForm.logo" type="hidden">
                            </Upload>
                        </div>
                    </Form-item>
                    <Form-item label="状态" prop="status">
                        <i-switch v-model="addForm.status" size="large" :true-value="1" :false-value="2">
                            <span slot="open">正常</span>
                            <span slot="close">冻结</span>
                        </i-switch>
                    </Form-item>
                    <Form-item style="text-align: right;">
                        <Button type="primary" @click="handleSubmit('addForm')" icon="paper-airplane"
                                :loading="addOrEditloading"> 提 交
                        </Button>
                        <Button type="ghost" @click="handleReset('addForm')" style="margin-left: 8px">Reset</Button>
                    </Form-item>
                </Form>
            </div>
            <div slot="footer"></div>
        </Modal>
    </div>
</template>

<script>
    import axios from 'axios';
    import JWT from '../../helpers/jwt';
    import {path, upyun} from '../../helpers/path';

    export default {
        name: 'schools_index',
        data() {
            return {
                total: 0,
                page: 1,
                pageSize: 10,
                pageSizeOpts: [10, 20, 30, 50],
                showPage: false,
                schools: [],
                addModal: false,
                editModal: false,
                loading: true,
                addOrEditloading: false,
                aloading: false,
                eloading: false,
                zlogo: '',
                addForm: {
                    school_name: '',
                    school_code: '',
                    status: 1,
                    logo: '',
                },
                editForm: {
                    school_name: '',
                    school_code: '',
                    status: 1,
                    logo: '',
                },
                rules: {
                    school_name: [
                        {required: true, message: '请填写学校名称', trigger: 'blur'}
                    ],
                    school_code: [
                        {required: true, message: '请填写学校代码', trigger: 'blur'}
                    ],
                    logo: [
                        {required: true, message: '请上传学校LOGO', trigger: 'blur'}
                    ]
                },
                headers: {
                    Authorization: JWT.getToken()
                },
                columns: [
                    {
                        key: 'id',
                        title: '序号',
                        align: 'center',
                        width: 60
                    },
                    {
                        key: 'logo',
                        title: '学校LOGO',
                        align: 'center',
                        render: (h, params) => {
                            return h('Avatar', {
                                props: {
                                    src: params.row.logo
                                }
                            });
                        }
                    },
                    {
                        key: 'school_name',
                        title: '学校名称',
                        align: 'center'
                    },
                    {
                        key: 'school_code',
                        title: '学校代码',
                        align: 'center',
                        render: (h, params) => {
                            return h('Tag', {
                                props: {
                                    type: 'dot',
                                    color: 'green'
                                }
                            }, params.row.school_code);
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
                                        this.changeWishStatus(params.row.id, value);
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
                                        type: 'success',
                                        size: 'small',
                                        icon: 'ios-search-strong'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.id = params.row.id;
                                            this.editModal = true;
                                            this.getSchoolById(params.row.id);
                                        }
                                    }
                                }, '详情'),
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
                                            this.getSchoolById(params.row.id);
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
            }
        },
        mounted() {
            this.getSchoolList();
            this.zlogo = this.$refs.addLogo.src;
        },
        methods: {
            getSchoolList() {
                let params = {
                    page: this.page,
                    pageSize: this.pageSize
                };
                axios.get(path + '/api/school', {params}).then(response => {
                    this.loading = false;
                    this.schools = response.data.data;
                    this.total = response.data.meta.total;
                    this.total >= 10 ? this.showPage = true : this.showPage = false;
                }).catch(error => {
                    console.log(error);
                });
            },
            changePage(value) {
                this.loading = true;
                this.page = value;
                this.getSchoolList();
            },
            changePageSize(value) {
                this.loading = true;
                this.pageSize = value;
                this.getSchoolList();
            },
            getSchoolById() {

            },
            handleSubmit(name) {
                let _this = this;
                _this.addOrEditloading = true;
                _this.$refs[name].validate((valid) => {
                    if (valid) {
                        let formData = {
                            'id': _this.id,
                            'school_name': _this.addForm.school_name,
                            'school_code': _this.addForm.school_code,
                            'status': _this.addForm.status,
                            'logo': _this.addForm.logo
                        };
                        axios.post(path + '/api/school', formData).then(response => {
                            _this.$Message.success('新增成功');
                            setTimeout(function () {
                                _this.addOrEditloading = false;
                                if (_this.id > 0) {
                                    _this.$refs.editLogo.src = _this.zlogo;
                                } else {
                                    _this.$refs.addLogo.src = _this.zlogo;
                                }
                                _this.getSchoolList();
                                _this.handleReset(name);
                                _this.closeModal();
                            }, 1000);
                        }).catch(error => {
                            _this.addOrEditloading = false;
                            _this.$Message.error('系统出错，请稍后再试。');
                        })
                    }
                });
            },
            handleReset(name) {
                this.$refs[name].resetFields();
                this.$refs.addLogo.src = this.addForm.logo = this.zlogo;
            },
            closeModal(name) {
                this.handleReset(name);
                this.$Modal.remove();
            },
            handleError(error, file) {
                this.$Notice.error({
                    title: 'LOGO上传失败',
                    desc: '系统错误。'
                });
                this.aloading = false;
                this.eloading = false;
            },
            handleSuccess(res, file) {
                let response = file.response;

                if (response.code == 0) {
                    if (this.id > 0) {
                        this.editForm.logo = upyun + response.url;
                        this.$refs.editLogo.src = upyun + response.url;
                    } else {
                        this.addForm.logo = upyun + response.url;
                        this.$refs.addLogo.src = upyun + response.url;
                    }

                    this.$Notice.success({
                        title: '温馨提示',
                        desc: '图片： ' + file.name + ' 上传成功。'
                    });
                } else {
                    this.$Notice.error({
                        title: '温馨提示',
                        desc: '图片： ' + file.name + ' 上传失败。'
                    });
                }

                this.aloading = false;
                this.eloading = false;
            },
            handleFormatError(file) {
                this.$Notice.warning({
                    title: '温馨提示',
                    desc: '文件： ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的LOGO。'
                }, 1.5)
            },
            handleMaxSize(file) {
                this.$Notice.warning({
                    title: '温馨提示',
                    desc: '图片： ' + file.name + ' 太大，不能超过 2M。'
                }, 1.5)
            },
            handleProgress(event, file) {
                this.aloading = true;
                this.eloading = true;
                this.$Notice.info({
                    title: '温馨提示',
                    desc: '图片： ' + file.name + ' 正在上传。'
                });
            },
            changeWishStatus(id, value) {

            }
        }
    };
</script>
