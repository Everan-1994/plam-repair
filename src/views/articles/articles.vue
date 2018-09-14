<style lang="less">
    @import '../../styles/common.less';

    .mlefts {
        margin-left: 10px;
    }
</style>

<template>
    <div>
        <Row class="margin-top-20">
            <Col span="24">
            <Card>
                <p slot="title">
                    <Icon type="ios-people-outline"></Icon>
                    文章列表
                </p>
                <Row>
                    <Col span="24">
                        <span @click="addModal = true" style="margin: 0 10px;">
                          <Button type="primary" icon="compose">新增文章</Button>
                        </span>
                    </Col>
                </Row>
                <Row class="margin-top-10">
                    <Table :columns="columns" :data="articleList" :loading="loading"></Table>
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

        <Modal title="新增文章" v-model="addModal" :mask-closable="false" width="80" @on-cancel="handleReset('addForm')">
            <div>
                <Form ref="addForm" :model="addForm" :label-width="80" :rules="rules" style="margin-right: 25px;">
                    <Form-item label="标题" prop="title">
                        <Input v-model="addForm.title" placeholder="请输入标题"/>
                    </Form-item>
                    <Form-item label="内容">
                        <textarea class='tinymce-textarea' id="addArticelEditer"></textarea>
                    </Form-item>
                    <Spin fix v-if="addShow">
                        <Icon type="load-c" size=18  class="demo-spin-icon-load"></Icon>
                        <div>编辑器加载中...</div>
                    </Spin>
                    <Form-item label="状态" prop="status">
                        <i-switch v-model="addForm.status" size="large" :true-value="1" :false-value="0">
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

        <Modal title="编辑文章" v-model="editModal" :mask-closable="false" width="80" @on-cancel="handleReset('editForm')">
            <div>
                <Form ref="editForm" :model="editForm" :label-width="80" :rules="rules" style="margin-right: 25px;">
                    <Form-item label="标题" prop="title">
                        <Input v-model="editForm.title" placeholder="请输入标题"/>
                    </Form-item>
                    <Form-item label="内容" prop="body">
                        <textarea class='tinymce-textarea' id="editArticelEditer"></textarea>
                    </Form-item>
                    <Spin fix v-if="editShow">
                        <Icon type="load-c" size=18  class="demo-spin-icon-load"></Icon>
                        <div>编辑器加载中...</div>
                    </Spin>
                    <Form-item label="状态" prop="status">
                        <i-switch v-model="editForm.status" size="large" :true-value="1" :false-value="0">
                            <span slot="open">正常</span>
                            <span slot="close">冻结</span>
                        </i-switch>
                    </Form-item>
                    <Form-item style="text-align: right;">
                        <Button type="primary" @click="handleSubmit('editForm')" icon="paper-airplane"
                                :loading="addOrEditloading"> 提 交
                        </Button>
                        <Button type="ghost" @click="handleReset('editForm')" style="margin-left: 8px">Reset</Button>
                    </Form-item>
                </Form>
            </div>
            <div slot="footer"></div>
        </Modal>
        <!--<Modal v-model="article_detail" width="500" :mask-closable="false" :closable="false" :styles="{top: '10px'}">-->
            <!--<p>-->
                <!--&lt;!&ndash;<detail :id="id"></detail>&ndash;&gt;-->
            <!--</p>-->
            <!--<div slot="footer">-->
                <!--<Button type="primary" size="large" long  @click="article_detail = false">关 闭</Button>-->
            <!--</div>-->
        <!--</Modal>-->
    </div>
</template>

<script>
    import axios from 'axios';
    import {path} from './../../helpers/path';
    import JWT from './../../helpers/jwt';
    import TIMES from './../../helpers/utils';
    import Cookie from 'js-cookie';
    import tinymce from 'tinymce';
    // import Detail from '../staffs/articleDetail';

    export default {
        name: 'article_default',
//        components: {
////            VueQArt,
//            Detail
//        },
        data() {
            return {
                id: 0,
                author_id: 0,
                total: 0,
                page: 1,
                pageSize: 20,
                pageSizeOpts: [10, 20, 30, 50],
                order: '',
                sort: '',
                showPage: false,
                loading: true,
                addModal: false,
                editModal: false,
                article_detail: false,
                addShow: true,
                editShow: true,
                addOrEditloading: false,
                article_url: '',
                downloadButton: false,
                addForm: {
                    title: null,
                    status: 1
                },
                editForm: {
                    title: null,
                    status: 1
                },
                rules: {
                    title: [
                        {required: true, message: '请填写文章标题', trigger: 'blur'}
                    ]
                },
                open_close: {
                    open: '开启',
                    close: '关闭'
                },
                columns: [
                    {
                        key: 'id',
                        title: '序号',
                        align: 'center',
                        width: 60
                    },
                    {
                        key: 'title',
                        title: '文章标题'
                    },
                    {
                        key: 'view_count',
                        title: '阅读数',
                        align: 'center',
                        width: 80
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
                                    close: () => h('span', '失效')
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
                        key: 'created_at',
                        title: '发布时间',
                        align: 'center',
                        width: 150,
                        render: (h, params) => {
                            return h('div', [
                                h('Icon', {
                                    props: {
                                        type: 'clock'
                                    }
                                }),
                                h('span', {
                                    style: 'margin-left: 3px;'
                                }, TIMES.diffForHumans(params.row.created_at))
                            ])
                        }
                    },
                    {
                        key: 'action',
                        title: '操作',
                        align: 'center',
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
                                            this.article_detail = true;
                                        }
                                    }
                                }, '预览'),
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
                                            this.getArticleById(params.row.id);
                                        }
                                    }
                                }, '编辑'),
                                h('Poptip', {
                                    props: {
                                        confirm: true,
                                        title: '确定要删除此文章吗?',
                                        transfer: true
                                    },
                                    on: {
                                        'on-ok': () => {
                                            this.deleteArticle(params.row.id, params.index)
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
                articleList: [],
            }
        },
        created() {
            // 获取文章
            this.getArticleList();
            // 新增文章-编辑器
            this.init('#addArticelEditer');
            // 编辑文章-编辑器
            this.init('#editArticelEditer');
        },
        methods: {
            init(name) {
                this.$nextTick(() => {
                    let vm = this;
                    let height = document.body.offsetHeight - 300;
                    tinymce.init({
                        selector: name,
                        branding: false,
                        elementpath: false,
                        height: height,
                        language: 'zh_CN.GB2312',
                        menubar: 'edit insert view format table tools',
                        plugins: [
                            'advlist autolink lists link image charmap print preview hr anchor pagebreak imagetools',
                            'fullpage',
                            'insertdatetime nonbreaking save table contextmenu directionality',
                            'emoticons paste textcolor colorpicker textpattern imagetools'
                        ],
                        toolbar1: ' newnote print preview | undo redo | insert | styleselect | forecolor backcolor bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link emoticons image',
                        autosave_interval: '20s',
                        image_advtab: true,
                        table_default_styles: {
                            width: '100%',
                            borderCollapse: 'collapse'
                        },
                        insert_button_items: 'image link | inserttable',
                        setup: function (editor) {
                            editor.on('init', function (e) {
                                if (name == '#editArticelEditer') {
                                    vm.editShow = false;
                                }
                                if (name == '#addArticelEditer') {
                                    vm.addShow = false;
                                }
                            });
                        },
                        images_upload_url: `${path}/api/article/image`,
                        images_upload_credentials: false,
                        images_upload_handler: (blobInfo, success, failure) => {
                            let xhr, formData;
                            xhr = new XMLHttpRequest();
                            xhr.withCredentials = false;
                            xhr.open('POST', `${path}/api/article/image`);
                            xhr.setRequestHeader('Authorization', JWT.getToken());
                            xhr.onload = function () {
                                let json;
                                if (xhr.status != 200) {
                                    failure('HTTP Error: ' + xhr.status);
                                    return;
                                }

                                if (vm.id > 0) {
                                    vm.editForm.images.push(xhr.responseText);
                                } else {
                                    vm.addForm.images.push(xhr.responseText);
                                }
                                success('https://repair.lzdu.com/' + xhr.responseText);
                            };
                            formData = new FormData();
                            formData.append('image', blobInfo.blob(), blobInfo.filename());
                            xhr.send(formData);
                        }
                    });
                });
            },
            getArticleList() {
                let _this = this;
                let params = {
                    page: _this.page,
                    pageSize: _this.pageSize,
                    order: _this.order,
                    sort: _this.sort,
                    status: 1
                };
                axios.get(`${path}/api/article`, {params}).then(response => {
                    _this.articleList = response.data.data;
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
                this.getArticleList();
            },
            changePageSize(value) {
                this.loading = true;
                this.pageSize = value;
                this.getArticleList();
            },
            handleSubmit(name) {
                let _this = this;
                _this.addOrEditloading = true;
                _this.$refs[name].validate((valid) => {
                    if (valid) {
                        if (_this.id > 0) {
                            let formData = {
                                'id': _this.id,
                                'title': _this.editForm.title,
                                'content': tinymce.get('editArticelEditer').getBody().innerHTML,
                                'status': _this.editForm.status
                            };
                            axios.patch(`${path}/api/article`, formData).then(response => {
                                _this.$Message.success('更新成功');
                                _this.id = 0;
                                setTimeout(function () {
                                    _this.addOrEditloading = false;
                                    _this.getArticleList();
                                    _this.handleReset(name);
                                    _this.editModal = false;
                                }, 1000);
                            }).catch(error => {
                                _this.addOrEditloading = false;
                                _this.$Message.error('系统出错，请稍后再试。');
                            })
                        } else {
                            let formData = {
                                'title': _this.addForm.title,
                                'content': tinymce.get('addArticelEditer').getBody().innerHTML,
                                'status': _this.addForm.status
                            };

                            axios.post(`${path}/api/article`, formData).then(response => {
                                _this.$Message.success('新增成功');
                                setTimeout(function () {
                                    _this.addOrEditloading = false;
                                    _this.getArticleList();
                                    _this.handleReset(name);
                                    _this.addModal = false;
                                }, 1000);
                            }).catch(error => {
                                _this.addOrEditloading = false;
                                _this.$Message.error('系统出错，请稍后再试。');
                            });
                        }
                    } else {
                        _this.addOrEditloading = false;
                    }
                });
            },
            handleReset(name) {
                this.id = 0;
                this.$refs[name].resetFields();
                if (name == 'addForm') {
                    tinymce.get('addArticelEditer').setContent('');
                }
            },
            getArticleById(id) {
                axios.get(`${path}/api/article/${id}`).then(response => {
                    let data = response.data;
                    this.editForm.title = data.title;
                    this.editForm.status = data.status;

                    tinymce.get('editArticelEditer').setContent(data.content);

                }).catch(error => {
                    console.log(error);
                })
            },
            deleteArticle(id, index) {
                axios.delete(`${path}/api/article/${id}`).then(response => {
                    this.$Message.success('删除成功', 1.5);
                    this.remove(index);
                }).catch(error => {
                    this.$Message.error('删除失败', 1.5);
                    this.getArticleList();
                })
            },
            remove(index) {
                this.articleList.splice(index, 1);
            },
            changeStatus(id, value) {
                axios.patch(`${path}/api/article/status`, {
                    id: id,
                    status: value,
                }).then(response => {
                    this.$Message.success('操作成功', 1.5);
                }).catch(error => {
                    this.$Message.error('操作失败', 1.5);
                    this.getArticleList();
                })
            },
            query() {
                this.loading = true;
                this.page = 1;
                this.getArticleList();
            },
            resetQuery() {
                this.loading = true;
                this.page = 1;
                this.search.title = null;
                this.search.status = null;
                this.getArticleList();
            },
            uploads(formData) {
                axios.post(`${path}/api/article/image`, formData).then(response => {
                    return 'https://upyun.lzdu.com' + response.data.image_url;
                }).catch(error => {
                    console.log(error);
                })
            }
        }
    }
</script>
