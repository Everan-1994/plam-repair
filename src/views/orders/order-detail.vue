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
                    <Steps :current="steps">
                        <Step :icon="icon[0]" :title="title[0]" :content="created_at + ' 填写申报'"></Step>
                        <Step v-for="item in processes"
                              :key="item.id"
                              :icon="icon[item.type]"
                              :title="title[item.type]"
                              :content="item.content || '-- ' + created_at"></Step>
                    </Steps>
                </div>
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
                    _this.spinShow = false;
                    _this.avatar = detail.user.avatar;
                    _this.name = detail.user.name;
                    _this.created_at = util.diffForHumans(detail.created_at);
                    _this.content = detail.content;
                    _this.processes = detail.processes;
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
