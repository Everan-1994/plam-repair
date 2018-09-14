<template>
    <div style="width:100%;height:100%;" id="visite_volume_con"></div>
</template>

<script>
import echarts from 'echarts';

import axios from 'axios';
import {path} from './../../../helpers/path';
import JWT from './../../../helpers/jwt';
import Cookies from 'js-cookie';

export default {
    name: 'visiteVolume',
    data () {
        return {
            data: []
        };
    },
    mounted () {
        this.$nextTick(() => {
            const _this = this;
            const school_id = Cookies.get('school_id');

            axios.get(`${path}/api/week/order?school_id=${school_id}`).then(response => {
                _this.data = response.data;
                _this.getWeekOrder();
            }).catch(error => {
                console.log(error);
            });
        });
    },
    methods: {
        getWeekOrder() {
            const _this = this;
            let visiteVolume = echarts.init(document.getElementById('visite_volume_con'));
            let xAxisData = [];
            let data1 = [];
            let data2 = [];
            for (let i = 0; i < 20; i++) {
                xAxisData.push('类目' + i);
                data1.push((Math.sin(i / 5) * (i / 5 - 10) + i / 6) * 5);
                data2.push((Math.cos(i / 5) * (i / 5 - 10) + i / 6) * 5);
            }

            const option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                grid: {
                    top: 0,
                    left: '2%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'value',
                    boundaryGap: [0, 0.01]
                },
                yAxis: {
                    type: 'category',
                    data: [
                        _this.data[6]['days'],
                        _this.data[5]['days'],
                        _this.data[4]['days'],
                        _this.data[3]['days'],
                        _this.data[2]['days'],
                        _this.data[1]['days'],
                        _this.data[0]['days'],
                    ],
                    nameTextStyle: {
                        color: '#c3c3c3'
                    }
                },
                series: [
                    {
                        name: '申报量',
                        type: 'bar',
                        data: [
                            {value: _this.data[6]['count'], name: _this.data[6]['days'], itemStyle: {normal: {color: '#2d8cf0'}}},
                            {value: _this.data[5]['count'], name: _this.data[5]['days'], itemStyle: {normal: {color: '#2d8cf0'}}},
                            {value: _this.data[4]['count'], name: _this.data[4]['days'], itemStyle: {normal: {color: '#2d8cf0'}}},
                            {value: _this.data[3]['count'], name: _this.data[3]['days'], itemStyle: {normal: {color: '#2d8cf0'}}},
                            {value: _this.data[2]['count'], name: _this.data[2]['days'], itemStyle: {normal: {color: '#2d8cf0'}}},
                            {value: _this.data[1]['count'], name: _this.data[1]['days'], itemStyle: {normal: {color: '#2d8cf0'}}},
                            {value: _this.data[0]['count'], name: _this.data[0]['days'], itemStyle: {normal: {color: '#2d8cf0'}}}
                        ]
                    }
                ]
            };

            visiteVolume.setOption(option);

            window.addEventListener('resize', function () {
                visiteVolume.resize();
            });
            _this.$emit('rdweek', false);
        }
    }
};
</script>
