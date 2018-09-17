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
            <span class="mleft">日期范围：</span>
            <DatePicker type="daterange" placement="bottom-end" v-model="fdate" placeholder="选择时间范围" style="width: 200px"></DatePicker>
            <Button type="info" icon="search" class="mleft" @click="query">查询</Button>
            <Button type="default" icon="android-sync" class="mleft" @click="resetQuery">重置查询</Button>
            <Button type="primary" icon="share" class="mleft" @click="exportData">导出工单</Button>
        </span>
    </Col>
  </Row>
  <Row class="margin-top-10">
    <Table :columns="columns" :data="orderList" :height="pc_height" :loading="loading" ref="tableCsv"></Table>
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
        name: 'repaired',
        components: {
            orderDetail
        },
        data() {
            return {
                color: ['green', 'red', 'blue', 'yellow'],
                total: 0,
                page: 1,
                pageSize: 10,
                pageSizeOpts: [10, 20, 30, 50, 100],
                order: 'created_at',
                sort: 'desc',
                fdate: '',
                showPage: false,
                loading: true,
                detailModal: false, // 详情model
                id: 0, // 申报id
                orderType: null,
                open: 'one',
                examineForm: {
                    repair: ''
                },
                pc_height: 0,
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
                                    color: this.color[params.row.type.id] || 'default'
                                }
                            }, params.row.type.name)
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
                selectMinRow: 1,
                selectMaxRow: 100,
                selectMinCol: 1,
                selectMaxCol: 9,
            }
        },
        created() {
            this.pc_height = document.body.clientHeight - 250;
            // 获取工单
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
                    status: 3,
                    school_id: school_id,
                    type: _this.orderType,
                    startTime: _this.fdate[0] ? Date.parse(_this.fdate[0]) / 1000 : 0,
                    endTime: _this.fdate[1] ? Date.parse(_this.fdate[1]) / 1000 : 0
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
            exportData() {
                const _this = this;

                if (_this.total == 0) {
                    this.$Message.warning('没有数据，无法导出工单。', 1.5);
                    return false;
                }

                var orders = [];
                _this.orderList.forEach((val) => {
                    orders.push({
                        name: val.user.name,
                        order: val.order,
                        content: val.content,
                        area: val.area.name,
                        address: val.address,
                        type: val.type.name,
                        time: val.created_at,
                        rname: val.repair.truename || val.repair.name, // 维修员姓名 或 昵称
                        otime: val.updated_at
                    });
                });

                const columns = [
                    {
                        'title': '申报用户',
                        'key': 'name'
                    },
                    {
                        'title': '工单号',
                        'key': 'order'
                    },
                    {
                        'title': '申报内容',
                        'key': 'content'
                    },
                    {
                        'title': '申报区域',
                        'key': 'area'
                    },
                    {
                        'title': '申报地点',
                        'key': 'address'
                    },
                    {
                        'title': '申报类型',
                        'key': 'type'
                    },
                    {
                        'title': '申报时间',
                        'key': 'time'
                    },
                    {
                        'title': '维修员',
                        'key': 'rname'
                    },
                    {
                        'title': '完成时间',
                        'key': 'otime'
                    },
                ];
                _this.$refs.tableCsv.exportCsv({
                    filename: '已维修工单表',
                    columns: columns.filter((col, index) => index >= _this.selectMinCol - 1 && index <= _this.selectMaxCol - 1),
                    data: orders.filter((data, index) => index >= _this.selectMinRow - 1 && index <= _this.selectMaxRow - 1)
                });
            }
        }
    };
</script>

<style>

</style>
