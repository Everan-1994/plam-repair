<template>
    <div style="width:100%;height:100%;" id="data_source_con"></div>
</template>

<script>
import echarts from 'echarts';

import axios from 'axios';
import {path} from './../../../helpers/path';
import JWT from './../../../helpers/jwt';
import Cookies from 'js-cookie';

export default {
    name: 'dataTypePie',
    data () {
        return {
            type: [],
            data: [],
            color: [
                '#9bd598', '#ffd58f', '#e14f60', '#32e1ff', '#ff8839',
                '#f096a0', '#2d8cf0'
            ]
        };
    },
    mounted () {
        this.$nextTick(() => {
            const _this = this;
            const school_id = Cookies.get('school_id');

            axios.get(`${path}/api/order/type/ratio?school_id=${school_id}`).then(response => {
                let data = response.data;
                data.forEach((v, i) => {
                    _this.type.push(v.type);
                    _this.data.push({
                        value: v.count,
                        name: v.type,
                        itemStyle: {
                            normal: {
                                color: _this.color[i]
                            }
                        }
                    });
                });

                _this.getOrderTypeRatio();
            }).catch(error => {
                console.log(error);
            });
        });
    },
    methods: {
        getOrderTypeRatio() {
            const _this = this;
            var dataSourcePie = echarts.init(document.getElementById('data_source_con'));
            const option = {
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b} : {c} ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    left: 'right',
                    data: _this.type
                },
                series: [
                    {
                        name: '申报类型统计',
                        type: 'pie',
                        radius: '66%',
                        center: ['50%', '60%'],
                        data: _this.data,
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
            _this.$emit('rdtype', false);
        }
    }
};
</script>
