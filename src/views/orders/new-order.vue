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

    .ivu-form-item {
        margin-bottom: 4px !important;
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
        <!--详情-->
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
        <!--驳回-->
        <!--<Modal v-model="examineModal" class-name="vertical-center-modal" :mask-closable="false" :width="350"-->
               <!--:styles="{top: '20px'}" :scrollable="false">-->
            <!--<p slot="header" style="color: #1F90CD;text-align: center">-->
                <!--<Icon type="edit"></Icon>-->
                <!--<span>驳回</span>-->
            <!--</p>-->
            <!--<div style="text-align:center">-->
                <!--<Form ref="examineForm" :model="examineForm">-->
                    <!--<Form-item>-->
                        <!--<Input v-model="examineForm.content" type="textarea" :autosize="{minRows: 2,maxRows: 10}"-->
                               <!--placeholder="填写驳回原因"></Input>-->
                    <!--</Form-item>-->
                <!--</Form>-->
            <!--</div>-->
            <!--<div slot="footer">-->
                <!--<Button type="primary" @click="rejectSubmit" icon="paper-airplane" size="large" long-->
                        <!--:loading="reject"> 提 交-->
                <!--</Button>-->
            <!--</div>-->
        <!--</Modal>-->
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
                                <Icon type="android-contact"></Icon>
                                {{ item.truename }}
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
        <!--驳回-->
        <Modal v-model="examineModal" class-name="vertical-center-modal" :mask-closable="false" :width="570"
               :styles="{top: '20px'}" :scrollable="false"
               @on-cancel="rejectOrderCancel">
            <p slot="header" style="color:#4dcb25;text-align:center">
                <Icon type="android-checkmark-circle"></Icon>
                <span>驳回工单</span>
            </p>
            <Form :label-width="100">
                <FormItem label="选项">
                    <RadioGroup v-model="examineForm.select">
                        <Radio label="报修地点不明，请完善。">报修地点不明，请完善。</Radio>
                        <Radio label="无钥匙进行维修。">无钥匙进行维修。</Radio>
                        <Radio label="恶意故意报修，不进行维修。">恶意故意报修，不进行维修。</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="内容">
                    <Input v-model="examineForm.content" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="自定义回复内容"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="primary" @click="rejectSubmit" icon="paper-airplane" size="large" long
                        :loading="reject"> 提 交
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
        name: 'new-order',
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
                searchLoading: true, // 搜索维修员
                detailModal: false, // 详情model
                examineModal: false, // 审核model
                dispatchModal: false, // 派工model
                id: 0, // 申报id
                truename: null, // 搜索的维修员名称
                dispatchForm: {
                    repair_id: null, // 维修员id
                    index: null
                },
                repairs: [], // 维修员
                orderType: null,
                open: 'one',
                reject: false, //  驳回加载
                dispatch: false, // 派工加载
                examineForm: {
                    index: null,
                    content: null,
                    repair: null,
                    select: null
                },
                pc_height: 0,
                types: [],
                open_close: {
                    open: '开启',
                    close: '关闭'
                },
                columns: [
                    {
                        key: 'avatar',
                        title: '用户',
                        fixed: 'left',
                        width: 150,
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
                        width: 150,
                        // sortable: true,
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
                        fixed: 'right',
                        width: 300,
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
                                        type: 'warning',
                                        size: 'small',
                                        icon: 'close-circled'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.examineModal = true;
                                            this.id = params.row.id;
                                            this.examineForm.index = params.index;
                                        }
                                    }
                                }, '驳回'),
                                // h('Button', {
                                //     props: {
                                //         type: 'warning',
                                //         size: 'small',
                                //         icon: 'close-circled'
                                //     },
                                //     style: {
                                //         marginRight: '5px'
                                //     },
                                //     on: {
                                //         click: () => {
                                //             this.id = params.row.id;
                                //             this.examineModal = true;
                                //         }
                                //     }
                                // }, '驳回'),
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
                                            this.dispatchModal = true;
                                            this.examineForm.index = params.index;
                                        }
                                    }
                                }, '派工'),
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
                selectMinRow: 1,
                selectMaxRow: 3000,
                selectMinCol: 1,
                selectMaxCol: 7,
            }
        },
        created() {
            this.pc_height = document.body.clientHeight - 250;
            // 获取新工单
            this.getOrderList();
            // 获取工单类型
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
                    status: 0,
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
            deleteOrder(id, index) {
                axios.delete(`${path}/api/orders/${id}`).then(response => {
                    this.$Message.success('删除成功', 1.5);
                    this.remove(index);
                }).catch(error => {
                    console.log(error);
                })
            },
            remove(index) {
                this.total--;
                this.orderList.splice(index, 1);
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
                this.fdate = '';
                this.getOrderList();
            },
            rejectSubmit() {
                let formData = {
                    order_id: this.id,
                    content: this.examineForm.content || this.examineForm.select,
                    type: 1,
                };
                axios.put(path + '/api/processes', formData).then(response => {
                    this.$Message.success('驳回成功');
                    this.remove(this.examineForm.index);
                    this.examineForm.content = null;
                    this.examineForm.select = null;
                    this.examineForm.index = null;
                    this.examineModal = false;
                    this.id = 0;
                    this.reject = false;
                    // this.getOrderList();
                }).catch(error => {
                    this.$Message.error('系统出错，请稍后再试。');
                })
            },
            dispatchSubmit() {
                let formData = {
                    order_id: this.id,
                    repair_id: this.dispatchForm.repair_id
                };
                axios.post(path + '/api/dispatch', formData).then(response => {
                    this.$Message.success('派工成功');
                    this.remove(this.examineForm.index);
                    this.dispatchForm.id = 0;
                    this.dispatchForm.index = null;
                    this.repair_id = 0;
                    this.dispatchModal = false;
                    this.dispatch = false;
                    // this.getOrderList();
                }).catch(error => {
                    this.$Message.error('系统出错，请稍后再试。');
                })
            },
            searchRepair(query) {
                let _this = this;
                if (query !== '') {
                    _this.searchLoading = true;
                    setTimeout(() => {
                        _this.searchLoading = false;
                        _this.truename = query;
                        _this.getRepair();
                    }, 200);
                } else {
                    _this.repairs = [];
                }
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
                        time: val.created_at
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
                ];
                _this.$refs.tableCsv.exportCsv({
                    filename: '待维修工单表',
                    columns: columns.filter((col, index) => index >= _this.selectMinCol - 1 && index <= _this.selectMaxCol - 1),
                    data: orders.filter((data, index) => index >= _this.selectMinRow - 1 && index <= _this.selectMaxRow - 1)
                });
            },
            getDate() {
                let dd = new Date();
                let n = 0;
                dd.setDate(dd.getDate() + n);
                let y = dd.getFullYear();
                let m = dd.getMonth() + 1;
                let d = dd.getDate();
                m = m < 10 ? "0" + m : m;
                d = d < 10 ? "0" + d : d;
                let day = y + "-" + m + "-" + d;
                return day;
            },
            rejectOrderCancel() {
                this.id = 0;
                this.examineForm.index = null;
                this.examineForm.select = null;
                this.examineForm.content = null;
            },
        }
    };
</script>

<style>

</style>
