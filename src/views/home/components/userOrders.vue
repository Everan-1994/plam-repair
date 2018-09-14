<template>
    <div style="width:100%;height:100%;" id="user_orders"></div>
</template>

<script>
import echarts from 'echarts';
require('echarts/theme/macarons.js');

import axios from 'axios';
import {path} from './../../../helpers/path';
import JWT from './../../../helpers/jwt';
import Cookies from 'js-cookie';

export default {
    name: 'user_order',
    data() {
        return {
            names: [],
            orders: [],
            evaluates: []
        }
    },
    mounted () {
        this.$nextTick(() => {
            const _this = this;
            const school_id = Cookies.get('school_id');

            axios.get(`${path}/api/user/order?school_id=${school_id}`).then(response => {
                let data = response.data;
                data.forEach((v) => {
                    _this.names.push(v.name);
                    _this.orders.push(v.order_count);
                    _this.evaluates.push(v.evaluate);
                });

                _this.getUserOrderCount();
            }).catch(error => {
                console.log(error);
            });
        });
    },
    methods: {
        getUserOrderCount() {
            const _this = this;
            var orders = echarts.init(document.getElementById('user_orders'), 'macarons');
            const option = {
                tooltip : {
                    trigger: 'axis'
                },
                grid: {
                    top: '25%',
                    left: '2%',
                    right: '10%',
                    bottom: '3%',
                    containLabel: true
                },
                calculable : true,
                xAxis : [
                    {
                        type : 'category',
                        boundaryGap : false,
                        data : _this.names
                    }
                ],
                yAxis : [
                    {
                        type : 'value',
                        axisLabel : {
                            formatter: '{value} 单'
                        }
                    }
                ],
                series : [
                    {
                        name:'完成工单',
                        type:'line',
                        data:_this.orders,
                        markPoint : {
                            data : [
                                {type : 'max', name: '最大值'},
                                {type : 'min', name: '最小值'}
                            ]
                        },
                        markLine : {
                            data : [
                                {type : 'average', name: '平均值'}
                            ]
                        }
                    },
                    {
                        name:'好评工单',
                        type:'line',
                        data:_this.evaluates,
                        markPoint : {
                            data : [
                                {type : 'max', name: '最大值'},
                                {type : 'min', name: '最小值'}
                            ]
                        },
                        markLine : {
                            data : [
                                {type : 'average', name : '平均值'}
                            ]
                        }
                    }
                ]
            };

            orders.setOption(option);
            window.addEventListener('resize', function () {
                orders.resize();
            });
            _this.$emit('rdud', false);
        }
    }
};
</script>


