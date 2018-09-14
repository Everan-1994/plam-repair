<style lang="less">
    @import "./home.less";
    @import "../../styles/common.less";
</style>
<template>
    <div class="home-main">
        <Row :gutter="10">
            <Col :md="24" :lg="8">
                <Row class-name="home-page-row1" :gutter="10">
                    <Col :md="12" :lg="24" :style="{marginBottom: '16px'}">
                        <Card>
                            <Row type="flex" class="user-infor">
                                <Col span="8">
                                    <Row class-name="made-child-con-middle" type="flex" align="middle">
                                        <img class="avator-img" :src="avatorPath" />
                                    </Row>
                                </Col>
                                <Col span="16" style="padding-left:6px;">
                                    <Row class-name="made-child-con-middle" type="flex" align="middle">
                                        <div>
                                            <b class="card-user-infor-name">{{ name }}</b>
                                            <p>super admin</p>
                                        </div>
                                    </Row>
                                </Col>
                            </Row>
                            <!--<div class="line-gray"></div>-->
                            <!--<Row class="margin-top-8">-->
                                <!--<Col span="8"><p class="notwrap">上次登录时间:</p></Col>-->
                                <!--<Col span="16" class="padding-left-8">2017.09.12-13:32:20</Col>-->
                            <!--</Row>-->
                            <!--<Row class="margin-top-8">-->
                                <!--<Col span="8"><p class="notwrap">上次登录地点:</p></Col>-->
                                <!--<Col span="16" class="padding-left-8">北京</Col>-->
                            <!--</Row>-->
                        </Card>
                    </Col>
                    <Col :md="12" :lg="24" :style="{marginBottom: '10px'}">
                        <Card>
                            <p slot="title" class="card-title">
                                <Icon type="ios-pulse-strong"></Icon>
                                好评率统计
                            </p>
                            <div class="data-source-row">
                                <data-evaluate-pie v-on:hp="HPSpinShow = !HPSpinShow"></data-evaluate-pie>
                                <Spin size="large" fix v-if="HPSpinShow"></Spin>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Col>
            <Col :md="24" :lg="16">
                <Row :gutter="5">
                    <Col :xs="24" :sm="12" :md="6" :style="{marginBottom: '10px'}">
                        <infor-card
                            id-name="user_created_count"
                            :end-val="count.createUser"
                            iconType="android-contacts"
                            color="#2d8cf0"
                            intro-text="用户总数"
                        ></infor-card>
                    </Col>
                    <Col :xs="24" :sm="12" :md="6" :style="{marginBottom: '10px'}">
                        <infor-card
                            id-name="visit_count"
                            :end-val="count.visit"
                            iconType="compose"
                            color="#ffd572"
                            :iconSize="50"
                            intro-text="今日工单数"
                        ></infor-card>
                    </Col>
                    <Col :xs="24" :sm="12" :md="6" :style="{marginBottom: '10px'}">
                        <infor-card
                            id-name="collection_count"
                            :end-val="count.collection"
                            iconType="android-checkmark-circle"
                            color="#64d572"
                            intro-text="今日维修数"
                        ></infor-card>
                    </Col>
                    <Col :xs="24" :sm="12" :md="6" :style="{marginBottom: '10px'}">
                        <infor-card
                            id-name="transfer_count"
                            :end-val="count.transfer"
                            iconType="clipboard"
                            color="#f25e43"
                            intro-text="工单总数"
                        ></infor-card>
                    </Col>
                </Row>
                <Row>
                    <Card :padding="0">
                        <p slot="title" class="card-title">
                            <Icon type="map"></Icon>
                            每月申报统计
                        </p>
                        <div class="map-con">
                            <Col span="24" class="map-incon">
                                <Row type="flex" justify="center" align="middle">
                                    <orders v-on:rdm="MSpinShow = !MSpinShow"></orders>
                                    <Spin size="large" fix v-if="MSpinShow"></Spin>
                                </Row>
                            </Col>
                        </div>
                    </Card>
                </Row>
            </Col>
        </Row>
        <Row :gutter="10" class="margin-top-10">
            <Col :md="24" :lg="8" :style="{marginBottom: '10px'}">
                <Card>
                    <p slot="title" class="card-title">
                        <Icon type="android-map"></Icon>
                        最近七天申报量
                    </p>
                    <div class="data-source-row">
                        <visite-volume v-on:rdweek="WSpinShow = !WSpinShow"></visite-volume>
                        <Spin size="large" fix v-if="WSpinShow"></Spin>
                    </div>
                </Card>
            </Col>
            <Col :md="24" :lg="8" :style="{marginBottom: '10px'}">
                <Card>
                    <p slot="title" class="card-title">
                        <Icon type="aperture"></Icon>
                        申报类型统计
                    </p>
                    <div class="data-source-row">
                        <data-type-pie v-on:rdtype="spinShow = !spinShow"></data-type-pie>
                        <Spin size="large" fix v-if="spinShow"></Spin>
                    </div>
                </Card>
            </Col>
            <Col :md="24" :lg="8">
                <Card>
                    <p slot="title" class="card-title">
                        <Icon type="ios-people"></Icon>
                        维修员完成工单统计
                    </p>
                    <div class="data-source-row">
                        <user-orders v-on:rdud="UOspinShow = !UOspinShow"></user-orders>
                        <Spin size="large" fix v-if="UOspinShow"></Spin>
                    </div>
                </Card>
            </Col>
        </Row>
        <!--<Row class="margin-top-10">-->
            <!--<Card>-->
                <!--<p slot="title" class="card-title">-->
                    <!--<Icon type="ios-shuffle-strong"></Icon>-->
                    <!--上周每日服务调用量(万)-->
                <!--</p>-->
                <!--<div class="line-chart-con">-->
                    <!--<service-requests></service-requests>-->
                <!--</div>-->
            <!--</Card>-->
        <!--</Row>-->
    </div>
</template>

<script>
import dataTypePie from './components/dataTypePie.vue';
import visiteVolume from './components/visiteVolume.vue';
import inforCard from './components/inforCard.vue';

import dataEvaluatePie from './components/dataEvaluatePie.vue';
import orders from './components/orders.vue';
import userOrders from './components/userOrders.vue';

import axios from 'axios';
import {path} from './../../helpers/path';
import JWT from './../../helpers/jwt';
import Cookies from 'js-cookie';

export default {
    name: 'home',
    components: {
        dataTypePie,
        visiteVolume,
        inforCard,

        dataEvaluatePie,
        orders,
        userOrders,
    },
    data () {
        return {
            spinShow: true, // 类型比率加载
            HPSpinShow: true, // 好评率加载
            WSpinShow: true, // 7天前的申报量
            MSpinShow: true, // 每月申报量
            UOspinShow: true, // 维修员完成量
            count: {
                createUser: 0,
                visit: 0,
                collection: 0,
                transfer: 0
            }
        };
    },
    computed: {
        avatorPath () {
            return localStorage.avatorImgPath;
        },
        name () {
            return Cookies.get('user');
        },
        school_id() {
            return Cookies.get('school_id');
        }
    },
    created() {
        this.getUserCount(); // 用户数
        this.getToDayNewOrder(); // 今日工单
        this.getToDayFixedOrder(); // 今日已完成工单
        this.getOrderCount(); // 工单总数
    },
    methods: {
        getUserCount() {
            const _this = this;
            axios.get(`${path}/api/user/count?school_id=${_this.school_id}`).then(response => {
                let data = response.data;
                _this.count.createUser = data.count;
            }).catch(error => {
                console.log(error);
            });
        },
        getToDayNewOrder() {
            const _this = this;
            axios.get(`${path}/api/order/count?type=1&school_id=${_this.school_id}`).then(response => {
                let data = response.data;
                _this.count.visit = data.count;
            }).catch(error => {
                console.log(error);
            })
        },
        getToDayFixedOrder() {
            const _this = this;
            axios.get(`${path}/api/order/count?type=2&school_id=${_this.school_id}`).then(response => {
                let data = response.data;
                _this.count.collection = data.count;
            }).catch(error => {
                console.log(error);
            })
        },
        getOrderCount() {
            const _this = this;
            axios.get(`${path}/api/order/count?school_id=${_this.school_id}`).then(response => {
                let data = response.data;
                _this.count.transfer = data.count;
            }).catch(error => {
                console.log(error);
            })
        },
    }
};
</script>
