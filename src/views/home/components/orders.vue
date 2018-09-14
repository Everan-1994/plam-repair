<template>
    <div style="width:100% ;height:305px;" id="orders"></div>
</template>

<script>
import echarts from 'echarts';
require('echarts/theme/macarons.js');

import axios from 'axios';
import {path} from './../../../helpers/path';
import JWT from './../../../helpers/jwt';
import Cookies from 'js-cookie';

export default {
    name: 'order',
    data() {
        return {
            data_m: [],
            data_d: [],
        }
    },
    mounted () {
        this.$nextTick(() => {
            const _this = this;
            const school_id = Cookies.get('school_id');

            axios.get(`${path}/api/month/order?school_id=${school_id}`).then(response => {
                let data = response.data;
                data.forEach((v) => {
                    _this.data_m.push(v.day);
                    _this.data_d.push(v.count);
                });

                _this.getMonthOrderCount();
            }).catch(error => {
                console.log(error);
            });
        });
    },
    methods: {
        getMonthOrderCount() {
            const _this = this;
            var orders = echarts.init(document.getElementById('orders'), 'macarons');
            const option = {
                tooltip : {
                    trigger: 'axis'
                },
                grid: {
                    top: '15%',
                    left: '2%',
                    right: '5%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis : [
                    {
                        type : 'category',
                        data : _this.data_m
                    }
                ],
                yAxis : [
                    {
                        type : 'value'
                    }
                ],
                series : [
                    {
                        name:'申报量',
                        type:'bar',
                        data: _this.data_d,
                        markPoint : {
                            data : [
                                {type : 'max', name: '最大量'},
                                {type : 'min', name: '最小量'}
                            ]
                        },
                        markLine : {
                            data : [
                                {type : 'average', name: '平均值'}
                            ]
                        }
                    }
                ]
            };
            orders.setOption(option);
            window.addEventListener('resize', function () {
                orders.resize();
            });
            _this.$emit('rdm', false);
        }
    }
};
</script>


