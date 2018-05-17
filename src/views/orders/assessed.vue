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
                    <Option v-for="item in types" :value="item.id" :key="item.id">{{ item.value }}</Option>
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
  </Col>
</template>

<script>
    import axios from 'axios';
    import {path} from './../../helpers/path';
    import util from './../../helpers/utils'
    import Cookie from 'js-cookie';

    import orderDetail from './order-detail';

    export default {
        name: 'assessed',
        components: {
            orderDetail
        },
        data() {
            return {
                type: ['水务', '电务', '木工', '其他'],
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
                id: 0, // 申报id
                orderType: null,
                open: 'one',
                examineForm: {
                    repair: ''
                },
                types: [
                    {
                        id: 0,
                        value: '水务'
                    },
                    {
                        id: 1,
                        value: '电务'
                    },
                    {
                        id: 2,
                        value: '木工'
                    },
                    {
                        id: 3,
                        value: '其他'
                    },
                ],
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
                        align: 'center',
                        width: 200,
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
                                    color: this.color[params.row.type]
                                }
                            }, this.type[params.row.type])
                        }
                    },
                    {
                        key: 'time',
                        title: '申报日期',
                        align: 'center',
                        width: 150,
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
                        key: 'action',
                        title: '操作',
                        align: 'center',
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
                                }, '详情')
                            ])
                        }
                    }
                ],
                orderList: [],
            }
        },
        created() {
            // 获取工单
            this.getOrderList();
        },
        methods: {
            getOrderList() {
                let school_id = Cookie.get('school_id');
                let _this = this;
                let params = {
                    page: _this.page,
                    pageSize: _this.pageSize,
                    order: _this.order,
                    sort: _this.sort,
                    status: 5,
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
