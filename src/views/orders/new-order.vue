<template>
    <Col span="24">
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
    </Col>
</template>

<script>
    import axios from 'axios';
    import {path} from './../../helpers/path';
    import Cookie from 'js-cookie';

    export default {
        name: 'new-order',
        data() {
            return {
                type: ['水务', '电务', '木工', '其他'],
                total: 0,
                page: 1,
                pageSize: 10,
                pageSizeOpts: [10, 20, 30, 50],
                order: 'created_at',
                sort: 'desc',
                showPage: false,
                loading: true,
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
                    },
                    {
                        key: 'avatar',
                        title: '用户',
                        align: 'center',
                        width: 80,
                        render: (h, params) => {
                            return h('Avatar', {
                                props: {
                                    src: params.row.user.avatar
                                }
                            });
                        }
                    },
                    {
                        key: 'name',
                        title: '昵称',
                        align: 'center',
                        width: 120,
                        render: (h, params) => {
                            return params.row.user.name
                        }
                    },
                    {
                        key: 'area',
                        title: '申报区域',
                        align: 'center',
                        render: (h, params) => {
                            return params.row.area.name;
                        }
                    },
                    {
                        key: 'type',
                        title: '申报类型',
                        align: 'center',
                        render: (h, params) => {
                            return this.type[params.row.type];
                        }
                    },
                    {
                        key: 'time',
                        title: '申报日期',
                        align: 'center',
                        render: (h, params) => {
                            return params.row.created_at;
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
                                            this.getOrderById(params.row.id);
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
                                            this.deleteOrder(params.row.id, params.index)
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
                orderList: [],
            }
        },
        created() {
            // 获取新工单
            this.getOrderList();
        },
        methods: {
            getOrderList() {
                let school_id = Cookie.get('school_id');
                console.log(school_id);
                let _this = this;
                let params = {
                    page: _this.page,
                    pageSize: _this.pageSize,
                    order: _this.order,
                    sort: _this.sort,
                    status: 1,
                    school_id: school_id
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
            getOrderById(id) {

            },
            deleteOrder(id, index) {

            }
        }
    };
</script>

<style>

</style>
