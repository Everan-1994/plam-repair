<template>
    <div style="width:100%;height:100%;" id="data_evaluate_con"></div>
</template>

<script>
import echarts from 'echarts';

import axios from 'axios';
import {path} from './../../../helpers/path';
import JWT from './../../../helpers/jwt';
import Cookies from 'js-cookie';

export default {
    name: 'dataEvaluatePie',
    data () {
        return {
            hp: 0,
            zp: 0,
            cp: 0,
            color: ['#9bd598', '#ffd58f', '#e14f60']
        };
    },
    mounted () {
        this.$nextTick(() => {
            const _this = this;
            const school_id = Cookies.get('school_id');

            axios.get(`${path}/api/order/evaluate?school_id=${school_id}`).then(response => {
                let data = response.data;
                _this.hp = data.hp;
                _this.zp = data.zp;
                _this.cp = data.cp;
                _this.init();
            }).catch(error => {
                console.log(error);
            });
        });
    },
    methods: {
        init() {
            const _this = this;
            var dataSourcePie = echarts.init(document.getElementById('data_evaluate_con'));
            const option = {
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b} : {c} ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    left: 'true',
                    data: ['好评', '中评', '差评']
                },
                series: [
                    {
                        name: '工单评价',
                        type: 'pie',
                        radius: '66%',
                        center: ['50%', '60%'],
                        data: [
                            {value: _this.hp, name: '好评', itemStyle: {normal: {color: '#9bd598'}}},
                            {value: _this.zp, name: '中评', itemStyle: {normal: {color: '#abd5f2'}}},
                            {value: _this.cp, name: '差评', itemStyle: {normal: {color: '#e14f60'}}}
                        ],
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            };
            dataSourcePie.setOption(option);
            window.addEventListener('resize', function () {
                dataSourcePie.resize();
            });
            _this.$emit('hp', false);
        }
    }
};
</script>
