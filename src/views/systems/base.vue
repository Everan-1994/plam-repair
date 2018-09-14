<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row :gutter="10" class="margin-top-20">
            <Col :md="24" :lg="12">
            <Card>
                <p slot="title">
                    <Icon type="paper-airplane"></Icon>
                    区域列表
                </p>
                <Row>
                    <Col span="12">
                    <span @click="area.addModal = true" style="margin: 0 10px;">
                                <Button type="primary" icon="plus-round">新增区域</Button>
                            </span>
                    </Col>
                </Row>
                <Row class="margin-top-10">
                    <Table :columns="columns" :data="areaList" :loading="area.loading"></Table>
                    <div style="margin: 10px; padding-bottom: 1px; overflow: hidden" v-if="area.showPage">
                        <div style="float: right;">
                            <Page :total="area.total" :current="area.page" @on-change="changePage" simple></Page>
                        </div>
                    </div>
                </Row>
            </Card>
            </Col>
            <Col :md="24" :lg="12">
            <Card>
                <p slot="title">
                    <Icon type="edit"></Icon>
                    申报类型
                </p>
                <Row>
                    <Col span="12">
                    <span @click="type.addModal = true" style="margin: 0 10px;">
                            <Button type="primary" icon="plus-round">新增类型</Button>
                        </span>
                    </Col>
                </Row>
                <Row class="margin-top-10">
                    <Table :columns="typeColumns" :data="typeList" :loading="type.loading"></Table>
                    <div style="margin: 10px; padding-bottom: 1px; overflow: hidden" v-if="type.showPage">
                        <div style="float: right;">
                            <Page :total="type.total" :current="type.page" @on-change="typeChangePage" simple></Page>
                        </div>
                    </div>
                </Row>
            </Card>
            </Col>
        </Row>
        <Modal title="新增区域" v-model="area.addModal" :mask-closable="false" width="400" @on-cancel="resetAreaModel('addAreaForm')">
            <div>
                <Form ref="addAreaForm" :model="addAreaForm" :label-width="80" :rules="area_rules"
                      style="margin-right: 25px;">
                    <Form-item label="区域名称" prop="name">
                        <Input v-model="addAreaForm.name" placeholder="请输入区域名称"/>
                    </Form-item>
                    <Form-item label="状态" prop="status">
                        <i-switch v-model="addAreaForm.status" size="large" :true-value="1" :false-value="2">
                            <span slot="open">正常</span>
                            <span slot="close">禁用</span>
                        </i-switch>
                    </Form-item>
                    <Form-item style="text-align: right;">
                        <Button type="primary" @click="handleSubmit('addAreaForm')" icon="paper-airplane"
                                :loading="addAreaLoading"> 提 交
                        </Button>
                        <Button type="ghost" @click="handleReset('addAreaForm')" style="margin-left: 8px">Reset</Button>
                    </Form-item>
                </Form>
            </div>
            <div slot="footer"></div>
        </Modal>
        <Modal title="编辑区域" v-model="area.editModal" :mask-closable="false" width="400" @on-cancel="resetAreaModel('editAreaForm')">
            <div>
                <Form ref="editAreaForm" :model="editAreaForm" :label-width="80" :rules="area_rules"
                      style="margin-right: 25px;">
                    <Form-item label="区域名称" prop="name">
                        <Input v-model="editAreaForm.name" placeholder="请输入区域名称"/>
                    </Form-item>
                    <Form-item label="状态" prop="status">
                        <i-switch v-model="editAreaForm.status" size="large" :true-value="1" :false-value="2">
                            <span slot="open">正常</span>
                            <span slot="close">禁用</span>
                        </i-switch>
                    </Form-item>
                    <Form-item style="text-align: right;">
                        <Button type="primary" @click="handleSubmit('editAreaForm')" icon="paper-airplane"
                                :loading="addAreaLoading"> 提 交
                        </Button>
                        <Button type="ghost" @click="handleReset('editAreaForm')" style="margin-left: 8px">Reset</Button>
                    </Form-item>
                </Form>
            </div>
            <div slot="footer"></div>
        </Modal>
        <Modal title="新增类型" v-model="type.addModal" :mask-closable="false" width="400" @on-cancel="resetAddTypeModel">
            <div>
                <Form ref="addTypeForm" :model="addTypeForm" :label-width="80" :rules="type_rules"
                      style="margin-right: 25px;">
                    <Form-item label="类型名称" prop="name">
                        <Input v-model="addTypeForm.name" placeholder="请输入类型名称"/>
                    </Form-item>
                    <Form-item style="text-align: right;">
                        <Button type="primary" @click="typeHandleSubmit('addTypeForm')" icon="paper-airplane"
                                :loading="addTypeLoading"> 提 交
                        </Button>
                        <Button type="ghost" @click="handleReset('addTypeForm')" style="margin-left: 8px">Reset</Button>
                    </Form-item>
                </Form>
            </div>
            <div slot="footer"></div>
        </Modal>
        <Modal title="编辑类型" v-model="type.editModal" :mask-closable="false" width="400" @on-cancel="resetAddTypeModel">
            <div>
                <Form ref="editTypeForm" :model="editTypeForm" :label-width="80" :rules="type_rules"
                      style="margin-right: 25px;">
                    <Form-item label="类型名称" prop="name">
                        <Input v-model="editTypeForm.name" placeholder="请输入类型名称"/>
                    </Form-item>
                    <Form-item style="text-align: right;">
                        <Button type="primary" @click="typeHandleSubmit('editTypeForm')" icon="paper-airplane"
                                :loading="editTypeLoading"> 提 交
                        </Button>
                        <Button type="ghost" @click="handleReset('editTypeForm')" style="margin-left: 8px">Reset</Button>
                    </Form-item>
                </Form>
            </div>
            <div slot="footer"></div>
        </Modal>
    </div>
</template>

<script>
    import axios from 'axios';
    import Cookies from 'js-cookie';
    import {path} from './../../helpers/path';

    export default {
        name: 'base_index',
        data() {
            return {
                school_id: Cookies.get('school_id'),
                area: {
                    id: 0,
                    total: 0,
                    page: 1,
                    loading: true,
                    showPage: false,
                    addModal: false,
                },
                type: {
                    id: 0,
                    total: 0,
                    page: 1,
                    loading: true,
                    showPage: false,
                    addModal: false,
                    editModal: false,
                },
                addAreaForm: {
                    name: '',
                    status: 1
                },
                editAreaForm: {
                    name: '',
                    status: 1
                },
                addTypeForm: {
                    name: '',
                },
                editTypeForm: {
                    name: '',
                },
                area_rules: {
                    name: [
                        {required: true, message: '请填写区域名称', trigger: 'blur'}
                    ],
                },
                type_rules: {
                    name: [
                        {required: true, message: '请填写类型名称', trigger: 'blur'}
                    ],
                },
                addAreaLoading: false,
                editAreaLoading: false,
                addTypeLoading: false,
                editTypeLoading: false,
                areaList: [],
                typeList: [],
                columns: [
                    {
                        key: 'id',
                        title: '序号',
                        align: 'center',
                        width: 60
                    },
                    {
                        key: 'name',
                        title: '区域',
                        align: 'center'
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
                                        this.changeAreaStatus(params.row.id, value);
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
                                            this.area.id = params.row.id;
                                            this.area.editModal = true;
                                            this.getAreaById(params.row.id);
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
                                            this.deleteArea(params.row.id, params.index)
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
                typeColumns: [
                    {
                        key: 'id',
                        title: '序号',
                        align: 'center',
                        width: 60
                    },
                    {
                        key: 'name',
                        title: '分类名称',
                        align: 'center'
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
                                            this.type.id = params.row.id;
                                            this.type.editModal = true;
                                            this.getTypeById(params.row.id);
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
                                            this.deleteType(params.row.id, params.index)
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
        created() {
            this.getAreaList(); // 区域
            this.getTypeList(); // 类型
        },
        methods: {
            resetAreaModel(name) {
                this.handleReset(name);
            },
            resetAddTypeModel() {
                this.editModal = false;
                this.handleReset('addTypeForm');
            },
            handleSubmit(name) {
                let _this = this;
                _this.addAreaLoading = true;
                _this.editAreaLoading = true;
                _this.$refs[name].validate((valid) => {
                    if (valid) {
                        if (_this.area.id > 0) {
                            let formData = {
                                'name': _this.editAreaForm.name,
                                'status': _this.editAreaForm.status,
                            };

                            axios.patch(`${path}/api/area/${_this.area.id}`, formData).then(response => {
                                _this.$Message.success('更新成功');
                                setTimeout(function () {
                                    _this.editAreaLoading = false;
                                    _this.getAreaList();
                                    _this.handleReset(name);
                                    _this.area.editModal = false;
                                }, 1000);
                                _this.addAreaLoading = false;
                                _this.editAreaLoading = false;
                            }).catch(error => {
                                _this.addAreaLoading = false;
                                _this.editAreaLoading = false;
                                _this.$Message.error(error.response.data.msg || '系统出错，请稍后再试。');
                            });
                        } else {
                            let formData = {
                                'name': _this.addAreaForm.name,
                                'school_id': _this.school_id,
                                'status': _this.addAreaForm.status,
                            };
                            axios.post(`${path}/api/area`, formData).then(response => {
                                _this.$Message.success('新增成功');
                                setTimeout(function () {
                                    _this.addAreaLoading = false;
                                    _this.getAreaList();
                                    _this.handleReset(name);
                                    _this.area.addModal = false;
                                }, 1000);
                                _this.addAreaLoading = false;
                                _this.editAreaLoading = false;
                            }).catch(error => {
                                _this.addAreaLoading = false;
                                _this.editAreaLoading = false;
                                _this.$Message.error(error.response.data.msg || '系统出错，请稍后再试。');
                            });
                        }
                    } else {

                    }
                });
            },
            handleReset(name) {
                this.$refs[name].resetFields();
            },
            getAreaList() {
                let _this = this;
                let params = {
                    page: _this.area.page,
                    school_id: _this.school_id
                };
                axios.get(`${path}/api/area`, {params}).then(response => {
                    _this.areaList = response.data.data;
                    _this.area.total = response.data.meta.total;
                    _this.area.total > 0 ? _this.area.showPage = true : _this.area.showPage = false;
                    _this.area.loading = false;
                }).catch(error => {
                    console.log(error);
                });
            },
            changePage(value) {
                this.area.loading = true;
                this.area.page = value;
                this.getAreaList();
            },
            getTypeList() {
                let _this = this;
                let params = {
                    page: _this.type.page,
                    school_id: _this.school_id
                };
                axios.get(`${path}/api/type`, {params}).then(response => {
                    _this.typeList = response.data.data;
                    _this.type.total = response.data.meta.total;
                    _this.type.total > 0 ? _this.type.showPage = true : _this.type.showPage = false;
                    _this.type.loading = false;
                }).catch(error => {
                    console.log(error);
                });
            },
            typeChangePage(value) {
                this.type.loading = true;
                this.type.page = value;
                this.getTypeList();
            },
            typeHandleSubmit(name) {
                let _this = this;
                _this.addTypeLoading = true;
                _this.editTypeLoading = true;
                _this.$refs[name].validate((valid) => {
                    if (valid) {
                        if (_this.type.id > 0) {
                            let formData = {
                                'name': _this.editTypeForm.name
                            };
                            axios.patch(`${path}/api/type/${_this.type.id}`, formData).then(response => {
                                _this.$Message.success('更新成功');
                                setTimeout(function () {
                                    _this.editTypeLoading = false;
                                    _this.getTypeList();
                                    _this.handleReset(name);
                                    _this.type.editModal = false;
                                }, 1000);
                                _this.addTypeLoading = false;
                                _this.editAreaLoading = false;
                            }).catch(error => {
                                _this.addTypeLoading = false;
                                _this.editTypeLoading = false;
                                _this.$Message.error(error.response.data.msg || '系统出错，请稍后再试。');
                            });
                        } else {
                            let formData = {
                                'name': _this.addTypeForm.name,
                                'school_id': _this.school_id
                            };
                            axios.post(`${path}/api/type`, formData).then(response => {
                                _this.$Message.success('新增成功');
                                setTimeout(function () {
                                    _this.addTypeLoading = false;
                                    _this.getTypeList();
                                    _this.handleReset(name);
                                    _this.type.addModal = false;
                                }, 1000);
                                _this.addTypeLoading = false;
                                _this.editTypeLoading = false;
                            }).catch(error => {
                                _this.addTypeLoading = false;
                                _this.editTypeLoading = false;
                                _this.$Message.error(error.response.data.msg || '系统出错，请稍后再试。');
                            });
                        }
                    } else {

                    }
                });
            },
            getAreaById(id) {
                axios.get(`${path}/api/area/${id}`).then(response => {
                    let data = response.data;
                    this.editAreaForm.name = data.name;
                    this.editAreaForm.status = data.status;
                }).catch(error => {
                    console.log(error);
                })
            },
            getTypeById(id) {
                axios.get(`${path}/api/type/${id}`).then(response => {
                    let data = response.data;
                    this.editTypeForm.name = data.name;
                }).catch(error => {
                    console.log(error);
                })
            },
            deleteArea(id, index) {
                axios.delete(`${path}/api/area/${id}`).then(response => {
                    this.$Message.success('删除成功', 1.5);
                    this.remove(index);
                }).catch(error => {
                    console.log(error);
                    this.$Message.error('删除失败', 1.5);
                })
            },
            remove (index) {
                this.areaList.splice(index, 1);
                this.area.total-- ;
            },
            deleteType(id, index) {
                axios.delete(`${path}/api/type/${id}`).then(response => {
                    this.$Message.success('删除成功', 1.5);
                    this.removeType(index);
                }).catch(error => {
                    console.log(error);
                    this.$Message.error('删除失败', 1.5);
                })
            },
            removeType (index) {
                this.typeList.splice(index, 1);
                this.type.total-- ;
            },
            changeAreaStatus(id, value) {
                this.$Modal.confirm({
                    title: '温馨提示',
                    content: '<h3>确定要进行当前操作吗？</h3>',
                    onOk: () => {
                        axios.patch(path + `/api/area/status/${id}`, {
                            status: value
                        }).then(response => {
                            this.$Message.success('状态变更成功', 1.5);
                        }).catch(error => {
                            this.$Message.error('状态变更失败', 1.5);
                            this.getAreaList();
                        })
                    },
                    onCancel: () => {
                        this.getAreaList();
                    }
                });
            }
        }
    };
</script>

<style>

</style>
