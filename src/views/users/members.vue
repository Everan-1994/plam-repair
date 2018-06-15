<style lang="less">
  @import '../../styles/common.less';
</style>

<template>
  <div>
    <Row class="margin-top-20">
      <Col span="24">
      <Card>
        <p slot="title">
          <Icon type="ios-people-outline"></Icon>
          用户列表
        </p>
        <Row class="margin-top-10">
          <Table :columns="columns" :data="memberList" :loading="loading"></Table>
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
  </div>
</template>

<script>
    import axios from 'axios';
    import {path} from './../../helpers/path';
    import JWT from './../../helpers/jwt';
    import Cookie from 'js-cookie';

    export default {
        name: 'members',
        data() {
            return {
                total: 0,
                page: 1,
                pageSize: 20,
                pageSizeOpts: [10, 20, 30, 50],
                order: '',
                sort: '',
                showPage: false,
                loading: true,
                open_close: {
                    open: '开启',
                    close: '关闭'
                },
                columns: [
                    {
                        key: 'id',
                        title: '排序',
                        align: 'center',
                        width: 60
                    },
                    {
                        key: 'avatar',
                        title: '用户',
                        width: 200,
                        render: (h, params) => {
                            return h('div', [
                                h('Avatar', {
                                    props: {
                                        src: params.row.avatar
                                    }
                                }),
                                h('span', {
                                    style: 'margin-left: 10px;'
                                }, params.row.name)
                            ])
                        }
                    },
                    {
                        key: 'address',
                        title: '地址',
                    },
                    {
                        key: 'phone',
                        title: '手机号',
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
                                        this.changeStatus(params.row.id, value);
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
                                        icon: 'search'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.id = params.row.id;
                                            this.getMemberById(params.row.id);
                                        }
                                    }
                                }, '详情'),
                                h('Poptip', {
                                    props: {
                                        confirm: true,
                                        title: '确定要将该用户变为『维修员』吗?',
                                        transfer: true
                                    },
                                    on: {
                                        'on-ok': () => {
                                            this.changeIdentify(params.row.id)
                                        }
                                    }
                                }, [
                                    h('Button', {
                                        style: {
                                            marginRight: '5px'
                                        },
                                        props: {
                                            type: 'info',
                                            size: 'small',
                                            placement: 'top',
                                            icon: 'shuffle'
                                        }
                                    }, '变更身份')
                                ]),
                                h('Poptip', {
                                    props: {
                                        confirm: true,
                                        title: '确定要删除这条数据吗?',
                                        transfer: true
                                    },
                                    on: {
                                        'on-ok': () => {
                                            this.deleteMember(params.row.id, params.index)
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
                memberList: [],
            }
        },
        created() {
            // 获取用户
            this.getMemberList();
        },
        methods: {
            getMemberList() {
                let _this = this;
                let params = {
                    page: _this.page,
                    pageSize: _this.pageSize,
                    order: _this.order,
                    sort: _this.sort,
                    identify: 5,
                    school_id: Cookie.get('school_id')
                };
                axios.get(path + '/api/member', {params}).then(response => {
                    _this.memberList = response.data.data;
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
                this.getMemberList();
            },
            changePageSize(value) {
                this.loading = true;
                this.pageSize = value;
                this.getMemberList();
            },
            getMemberById(id) {
                axios.get(`${path}/api/member/${id}`).then(response => {
                    let data = response.data;
                    this.editForm.name = data.name;
                    this.editForm.school_id = data.school_id;
                    this.editForm.status = data.status;
                    this.editForm.email = data.email;
                }).catch(error => {
                    console.log(error);
                })
            },
            deleteMember(id) {

            },
//            remove(index) {
//                this.memberList.splice(index, 1);
//            },
            changeMemberStatus(id, value) {
                this.$Modal.confirm({
                    title: '温馨提示',
                    content: '<h3>确定要冻结该用户吗？</h3>',
                    onOk: () => {
                        axios.patch(`${path}/api/member/${id}`, {
                            status: value
                        }).then(response => {
                            this.$Message.success('状态变更成功', 1.5);
                        }).catch(error => {
                            this.$Message.error('状态变更失败', 1.5);
                            this.getMemberList();
                        })
                    },
                    onCancel: () => {
                        this.getMemberList();
                    }
                });
            },
            changeIdentify(id) {
                axios.patch(`${path}/api/member`, {
                    user_id: id,
                    identify: 4,
                    type: 1 // 用户
                }).then(response => {
                    this.$Message.success('身份变更成功', 1.5);
                    this.getMemberList();
                }).catch(error => {
                    this.$Message.error('已存在工单关系，身份变更失败。', 2);
                    this.getMemberList();
                });
            },
            changeStatus(id, value) {
                axios.patch(`${path}/api/member/status`, {
                    user_id: id,
                    status: value,
                }).then(response => {
                    this.$Message.success('操作成功', 1.5);
                }).catch(error => {
                    this.$Message.error('操作失败', 1.5);
                    this.getMemberList();
                })
            }
        }
    }
</script>
