<style>
    .mleft {
        margin-left: 10px;
    }

    .vertical-center-modal {
        display: flex;
        align-items: center;
        justify-content: center;

    .ivu-modal {
        top: 0;
    }

    }
</style>
<template>
    <Col span="24">
    <Row>
        <Col span="24" style="text-align: center; margin-bottom: 10px;">
            <span style="">
                <span>申报类型：</span>
                <Select v-model="orderType" style="width:100px">
                    <Option v-for="item in types" :value="item.id" :key="item.id">{{ item.name }}</Option>
                </Select>
                <Button type="info" icon="search" class="mleft" @click="query">查询</Button>
                <Button type="default" icon="android-sync" class="mleft" @click="resetQuery">重置查询</Button>
            </span>
        </Col>
    </Row>
    <Row class="margin-top-10">
        <Table :columns="columns" :data="orderList" :loading="loading"></Table>
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
    <Modal v-model="detailModal" class-name="vertical-center-modal" :mask-closable="false" :width="60"
           :styles="{top: '20px'}" :scrollable="false"
           @on-cancel="id = 0">
        <p slot="header" style="color:#f60;text-align:center">
            <Icon type="flag"></Icon>
            <span>申报详情</span>
        </p>
        <order-detail :id="id"></order-detail>
        <div slot="footer"></div>
    </Modal>
    <!--派工-->
    <Modal v-model="dispatchModal" class-name="vertical-center-modal" :mask-closable="false" :width="350"
           :styles="{top: '20px'}" :scrollable="false">
        <p slot="header" style="color: #39cd28;text-align: center">
            <Icon type="android-bicycle"></Icon>
            <span>派工</span>
        </p>
        <div style="text-align:center">
            <Form ref="dispatchForm" :model="dispatchForm">
                <Form-item>
                    <Select v-model="dispatchForm.repair_id"
                            filterable
                            size="large"
                            placeholder="请选择派遣的维修员">
                        <Option v-for="(item, index) in repairs" :value="item.id" :key="index">
                            <Icon type="android-contact"></Icon> {{ item.truename }}
                        </Option>
                    </Select>
                </Form-item>
            </Form>
        </div>
        <div slot="footer">
            <Button type="primary" @click="dispatchSubmit" icon="paper-airplane" size="large" long
                    :loading="dispatch"> 提 交
            </Button>
        </div>
    </Modal>
    </Col>
</template>

<script>
    import axios from 'axios';
    import {path} from './../../helpers/path';
    import util from './../../helpers/utils'
    import Cookie from 'js-cookie';

    import orderDetail from './order-detail';

    export default {
        name: 'repairing',
        components: {
            orderDetail
        },
        data() {
            return {
                color: ['green', 'red', 'blue', 'yellow'],
                total: 0,
                page: 1,
                pageSize: 10,
                pageSizeOpts: [10, 20, 30, 50],
                order: 'created_at',
                sort: 'desc',
                showPage: false,
                loading: true,
                detailModal: false, // 详情model
                dispatchModal: false, // 派工model
                id: 0, // 申报id
                orderType: null,
                open: 'one',
                dispatchForm: {
                    repair_id: null, // 维修员id
                },
                fixedForm: {
                    // select: null,
                    content: null, // 回复内容
                    repair_id: null,
                    index: null,
                    form_id: null,
                    id: 0
                },
                dispatch: false, // 派工加载
                fixeding: false, // 完工加载
                types: [],
                repairs: [],
                truename: null,
                open_close: {
                    open: '开启',
                    close: '关闭'
                },
                columns: [
                    {
                        key: 'avatar',
                        width: 120,
                        title: '用户',
                        fixed: 'left',
                        render: (h, params) => {
                            return h('div', [
                                h('Avatar', {
                                    props: {
                                        src: params.row.user.avatar
                                    }
                                }),
                                h('span', {
                                    style: 'margin-left: 10px;'
                                }, params.row.user.name)
                            ])
                        }
                    },
                    {
                        key: 'order',
                        title: '工单号',
                        align: 'center',
                        width: 150,
                        render: (h, params) => {
                            return h('div', [
                                h('Icon', {
                                    props: {
                                        type: 'document-text'
                                    }
                                }),
                                h('span', {
                                    style: 'margin-left: 3px;'
                                }, params.row.order)
                            ])
                        }
                    },
                    {
                        key: 'content',
                        title: '申报内容',
                        render: (h, params) => {
                            return h('div', [
                                h('Icon', {
                                    props: {
                                        type: 'compose'
                                    }
                                }),
                                h('span', {
                                    style: 'margin-left: 3px;'
                                }, params.row.content)
                            ])
                        }
                    },
                    {
                        key: 'area',
                        title: '申报区域',
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Icon', {
                                    props: {
                                        type: 'ios-home'
                                    }
                                }),
                                h('span', {
                                    style: 'margin-left: 3px;'
                                }, params.row.area.name)
                            ])
                        }
                    },
                    {
                        key: 'address',
                        title: '申报地址',
                        render: (h, params) => {
                            return h('div', [
                                h('Icon', {
                                    props: {
                                        type: 'android-pin'
                                    }
                                }),
                                h('span', {
                                    style: 'margin-left: 3px;'
                                }, params.row.address)
                            ])
                        }
                    },
                    {
                        key: 'type',
                        title: '申报类型',
                        align: 'center',
                        render: (h, params) => {
                            return h('Tag', {
                                props: {
                                    type: 'dot',
                                    color: this.color[params.row.type.id] || 'default'
                                }
                            }, params.row.type.name)
                        }
                    },
                    {
                        key: 'time',
                        title: '申报日期',
                        align: 'center',
                        sortable: true,
                        render: (h, params) => {
                            return h('div', [
                                h('Icon', {
                                    props: {
                                        type: 'clock'
                                    }
                                }),
                                h('span', {
                                    style: 'margin-left: 3px;'
                                }, util.diffForHumans(params.row.created_at))
                            ])
                        }
                    },
                    {
                        key: 'repair',
                        title: '维修员',
                        width: 120,
                        render: (h, params) => {
                            return h('div', [
                                h('Avatar', {
                                    props: {
                                        src: params.row.repair.avatar
                                    }
                                }),
                                h('span', {
                                    style: 'margin-left: 10px;'
                                }, params.row.repair.truename)
                            ])
                        }
                    },
                    {
                        key: 'ptime',
                        title: '派工时间',
                        width: 120,
                        sortable: true,
                        render: (h, params) => {
                            return h('div', [
                                h('Icon', {
                                    props: {
                                        type: 'clock'
                                    }
                                }),
                                h('span', {
                                    style: 'margin-left: 3px;'
                                }, util.diffForHumans(params.row.updated_at))
                            ])
                        }
                    },
                    {
                        key: 'action',
                        title: '操作',
                        align: 'center',
                        fixed: 'right',
                        width: 230,
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'success',
                                        size: 'small',
                                        icon: 'search'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.id = params.row.id;
                                            this.detailModal = true;
                                        }
                                    }
                                }, '详情'),
                                h('Button', {
                                    props: {
                                        type: 'info',
                                        size: 'small',
                                        icon: 'shuffle'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.id = params.row.id;
                                            this.dispatchModal = true;
                                        }
                                    }
                                }, '改派'),
                                h('Poptip', {
                                    props: {
                                        confirm: true,
                                        title: '确定工单已经完成了吗?',
                                        transfer: true
                                    },
                                    on: {
                                        'on-ok': () => {
                                            this.fixedOrder(params.row.id, params.row.repair_id, params.row.form_id, params.index)
                                        }
                                    }
                                }, [
                                    h('Button', {
                                        style: {
                                            marginRight: '5px'
                                        },
                                        props: {
                                            type: 'primary',
                                            size: 'small',
                                            placement: 'top',
                                            icon: 'wrench'
                                        }
                                    }, '完成')
                                ])
                            ])
                        }
                    }
                ],
                orderList: [],
            }
        },
        created() {
            // 获取新工单
            this.getOrderList();
            this.getType();
            // 获取维修员
            this.getRepair();
        },
        methods: {
            getRepair() {
                let school_id = Cookie.get('school_id');
                let _this = this;
                let params = {
                    school_id: school_id,
                    identify: 4,
                    status: 1,
                    truename: _this.truename
                };
                axios.get(path + '/api/member', {params}).then(response => {
                    _this.repairs = response.data.data;
                }).catch(error => {
                    console.log(error);
                });
            },
            getType() {
                let school_id = Cookie.get('school_id');
                let _this = this;
                let params = {
                    school_id: school_id
                };
                axios.get(path + '/api/type', {params}).then(response => {
                    _this.types = response.data.data;
                }).catch(error => {
                    console.log(error);
                });
            },
            getOrderList() {
                let school_id = Cookie.get('school_id');
                let _this = this;
                let params = {
                    page: _this.page,
                    pageSize: _this.pageSize,
                    order: _this.order,
                    sort: _this.sort,
                    status: 2,
                    school_id: school_id,
                    type: _this.orderType
                };
                axios.get(path + '/api/orders', {params}).then(response => {
                    _this.orderList = response.data.data;
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
                this.getOrderList();
            },
            changePageSize(value) {
                this.loading = true;
                this.pageSize = value;
                this.getOrderList();
            },
            query() {
                this.loading = true;
                this.page = 1;
                this.getOrderList();
            },
            resetQuery() {
                this.loading = true;
                this.page = 1;
                this.orderType = null;
                this.getOrderList();
            },
            dispatchSubmit() {
                let formData = {
                    order_id: this.id,
                    repair_id: this.dispatchForm.repair_id
                };
                axios.post(path + '/api/dispatch', formData).then(response => {
                    this.$Message.success('派工成功');
                    this.dispatchForm.id = 0;
                    this.repair_id = 0;
                    this.dispatchModal = false;
                    this.dispatch = false;
                    this.getOrderList();
                }).catch(error => {
                    this.$Message.error('系统出错，请稍后再试。');
                })
            },
            fixedOrder(id, repair_id, form_id, index) {
                const _this = this;
                let formData = {
                    'order_id': id,
                    'user_id': repair_id,
                    'form_id': form_id,
                    // 'content': _this.fixedForm.content || _this.fixedForm.select
                };
                axios.post(path + '/api/orders/fixedOrder', formData).then(response => {
                    _this.$Message.success('操作成功');
                    _this.remove(index);
                }).catch(error => {
                    _this.$Message.error('系统出错，请稍后再试。');
                })
            },
            remove(index) {
                this.total--;
                this.orderList.splice(index, 1);
            }
        }
    };
</script>

<style>

</style>
