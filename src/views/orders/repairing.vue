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
                <Button type="default" icon="android-sync" class="mleft" @click="resetQuery">重置</Button>
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
    <Modal v-model="examineModal" class-name="vertical-center-modal" :mask-closable="false" :width="30"
           :styles="{top: '20px'}" :scrollable="false">
        <p slot="header" style="color: #1F90CD;text-align: center">
            <Icon type="edit"></Icon>
            <span>审核 && 派工</span>
        </p>
        <Tabs value="pass1">
            <TabPane label="审核不通过给予驳回" name="pass1">
                <Form ref="examineForm" :model="examineForm" :label-width="80">
                    <FormItem label="审核内容">
                        <Input v-model="examineForm.content" type="textarea" :autosize="{minRows: 2,maxRows: 5}"
                               placeholder="填写驳回原因"></Input>
                    </FormItem>
                </Form>
            </TabPane>
            <TabPane label="审核通过给予派工" name="pass2">
                <Form ref="examineForm" :model="examineForm" :label-width="80">
                    <FormItem label="维修员">
                        <Select v-model="examineForm.repair" filterable placeholder="请选择维修员">
                            <Option value="beijing">New York</Option>
                            <Option value="shanghai">London</Option>
                            <Option value="shenzhen">Sydney</Option>
                        </Select>
                    </FormItem>
                    <div style="height: 100px;"></div>
                </Form>
            </TabPane>
        </Tabs>
        <div slot="footer"></div>
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
                examineModal: false, // 审核model
                id: 0, // 申报id
                orderType: null,
                open: 'one',
                examineForm: {
                    repair: ''
                },
                types: [],
                open_close: {
                    open: '开启',
                    close: '关闭'
                },
                columns: [
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
                        key: 'avatar',
                        title: '用户',
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
                                }, util.diffForHumans(params.row.updated_at))
                            ])
                        }
                    },
                    {
                        key: 'action',
                        title: '操作',
                        align: 'center',
                        width: 180,
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
                                        icon: 'paper-airplane'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.id = params.row.id;
                                            this.examineModal = true;
                                        }
                                    }
                                }, '派工')
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
        },
        methods: {
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
            }
        }
    };
</script>

<style>

</style>
