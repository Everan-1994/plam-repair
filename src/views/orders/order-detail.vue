<style>
    @import '../../styles/common.less';
    @import './order-detail.less';

    .fcolor {
        color: #2e8bece6
    }

    ._content {
        margin: 10px 50px;
        border-bottom: 1px solid #dbdddf;
        padding-bottom: 15px;
    }
</style>
<template>
    <div>
        <Row>
            <div class="step-header-con" style="text-align: center;">
                <strong class="fcolor">申报人：</strong>
                <Avatar v-if="avatar" :src="avatar"></Avatar>
                <Icon type="man"></Icon>
                {{ name }}

                <strong class="fcolor">申报时间：</strong>
                <Icon type="clock"></Icon>
                {{ created_at }}

            </div>

            <p class="step-content">
                <strong>故障描述：</strong>
                <div v-html="content" class="_content"></div>

                <strong>故障配图：</strong>
                <div class="_content">
                    <img v-if="images" v-for="image in images" :src="image" alt="" style="border-radius: 3px; margin-left: 10px; width: 25%;">
                    <span v-else>无</span>
                </div>

                <strong>申报进度：</strong>
                <div class="_content">
                    <Tabs type="card">
                        <TabPane v-for="item in processes"
                                 :key="item.id"
                                 :icon="icon[item.type]"
                                 :label="title[item.type]">
                            <div style="text-align: center; margin-bottom: 20px;" v-text="item.content"></div>
                            <div v-if="item.images" style="text-align: center;">
                                <img v-for="image in item.images" :src="image.image_url" alt="" style="border-radius: 3px; margin-left: 10px; width: 20%;">
                            </div>
                            <div v-if="item.type == 5" style="text-align: center;">
                                <p>评价类型：{{ evaluate.evaluate }}</p>
                                <p>工作效率：<Icon type="ios-star" v-for="n in evaluate.efficiency" :key="n"></Icon></p>
                                <p>服务质量：<Icon type="ios-star" v-for="n in evaluate.service" :key="n"></Icon></p>
                            </div>
                        </TabPane>
                    </Tabs>
                </div>

                <!--<strong>申报进度：</strong>-->
                <!--<div class="_content">-->
                    <!--<Steps :current="steps">-->
                        <!--<Step :icon="icon[0]" :title="title[0]" :content="created_at + ' 填写申报'"></Step>-->
                        <!--<Step v-for="item in processes"-->
                              <!--:key="item.id"-->
                              <!--:icon="icon[item.type]"-->
                              <!--:title="title[item.type]"-->
                              <!--:content="item.content + '['+ item.user.truename +']'"></Step>-->
                    <!--</Steps>-->
                <!--</div>-->
            </p>

            <Spin size="large" fix v-if="spinShow"></Spin>
        </Row>
    </div>
</template>

<script>
    import axios from 'axios'
    import {path, upyun} from './../../helpers/path'
    import util from './../../helpers/utils'

    export default {
        name: 'order-detail',
        data() {
            return {
                steps: 0,
                spinShow: true,
                avatar: '',
                name: '',
                created_at: '',
                content: '',
                processes: {},
                evaluate: {},
                title: ['申报', '驳回', '派工', '完工', '申诉', '评价'],
                icon: ['compose', 'paper-airplane', 'android-bicycle', 'settings', 'android-send', 'android-star-half'],
                images: {}
            }
        },
        props: {
            id: Number
        },
        methods: {
            getOrderById(id) {
                let _this = this;
                axios.get(`${path}/api/orders/${id}`).then(response => {
                    let detail = response.data;
                    if (detail.images.length > 0) {
                        detail.images.forEach((v, i) => {
                            detail.images[i] = `${upyun}${v.image_url}`;
                        })
                    }

                    if (detail.processes) {
                        detail.processes.forEach((val, j) => {
                            if (val.type == 4) {
                                detail.processes[j].images.forEach((a, b) => {
                                    detail.processes[j].images[b].image_url = `${upyun}${a.image_url}`;
                                });
                            }
                        });
                    }

                    _this.spinShow = false;
                    _this.avatar = detail.user.avatar;
                    _this.name = detail.user.name;
                    _this.created_at = util.diffForHumans(detail.created_at);
                    _this.content = detail.content;
                    _this.processes = detail.processes;
                    _this.evaluate = detail.evaluate;
                    _this.images = detail.images;
                    _this.steps = detail.processes.length + 1;
                }).catch(error => {
                    _this.spinShow = false;
                    console.log(error);
                });
            },
        },
        watch: {
            id() {
                if (this.id > 0) {
                    this.getOrderById(this.id);
                } else {
                    this.spinShow = true;
                }
            }
        }
    };
</script>
