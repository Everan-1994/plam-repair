<style lang="less">
    @import './login.less';
</style>

<template>
    <div class="login" @keydown.enter="handleSubmit">
        <div class="login-con">
            <Card :bordered="false">
                <p slot="title">
                    <Icon type="log-in"></Icon>
                    欢迎登录
                </p>
                <div class="form-con">
                    <Form ref="loginForm" :model="form" :rules="rules">
                        <FormItem prop="userName">
                            <Input v-model="form.userName" placeholder="请输入用户名">
                            <span slot="prepend">
                                    <Icon :size="16" type="person"></Icon>
                                </span>
                            </Input>
                        </FormItem>
                        <FormItem prop="password">
                            <Input type="password" v-model="form.password" placeholder="请输入密码">
                            <span slot="prepend">
                                    <Icon :size="14" type="locked"></Icon>
                                </span>
                            </Input>
                        </FormItem>
                        <FormItem prop="captcha">
                            <Input type="text" v-model="form.captcha"
                                   placeholder="请输入验证码">
                            <span slot="prepend">
                                    <Icon :size="14" type="ios-keypad"></Icon>
                                </span>
                            <span slot="append" class="img-code">
                                    <img ref="captcha" src="../images/everan.gif" title="刷新验证码" alt="验证码"
                                         @click="codeInit">
                                </span>
                            </Input>
                        </FormItem>
                        <FormItem>
                            <Button @click="handleSubmit" type="primary" long :loading="loading">登录</Button>
                        </FormItem>
                    </Form>
                    <p class="login-tip">欢迎使用凯悦科技 -- 掌上报修管理系统</p>
                </div>
            </Card>
        </div>
    </div>
</template>

<script>
    import axios from 'axios';
    import JWT from '../helpers/jwt';
    import {path} from '../helpers/path';
    import Cookies from 'js-cookie';

    export default {
        data () {
            return {
                form: {
                    userName: '',
                    password: '',
                    captcha: ''
                },
                captcha_key: 'captcha-no',
                default_src: '',
                loading: false,
                rules: {
                    userName: [
                        { required: true, message: '账号不能为空', trigger: 'blur' }
                    ],
                    password: [
                        { required: true, message: '密码不能为空', trigger: 'blur' }
                    ],
                    captcha: [
                        { required: true, message: '验证码不能为空', trigger: 'blur' }
                    ]
                }
            };
        },
        mounted() {
            this.default_src = this.$refs.captcha.src;
            this.codeInit();
        },
        methods: {
            handleSubmit () {
                let _this = this;
                _this.loading = true;
                let formData = {
                    'username': _this.form.userName,
                    'password': _this.form.password,
                    'captcha': _this.form.captcha,
                    'captcha_key': _this.captcha_key,
                };
                this.$refs.loginForm.validate((valid) => {
                    if (valid) {
                        axios.post(path + '/api/login', formData).then(response => {
                            let data = response.data;
                            JWT.setToken('Bearer ' + data.meta.access_token);
                            Cookies.set('user', data.data.name);
                            Cookies.set('password', _this.form.password);
                            Cookies.set('school_id', data.data.school_id);
                            Cookies.set('access', data.data.identify);
                            _this.$store.commit('setAvator', data.data.avatar);
                            _this.$Message.success({
                                content: '登陆成功',
                                onClose: () => {
                                    _this.$router.push({name: 'home_index'})
                                }
                            });
                        }).catch(error => {
                            _this.loading = false;
                            _this.$Message.error(error.response.data.message || '服务器异常');
                        });
                    } else {
                        _this.loading = false;
                    }
                });
            },
            codeInit() {
                let _this = this;
                _this.$refs.captcha.src = _this.default_src;
                axios.get(path + '/api/captchas/' + _this.captcha_key).then(response => {
                    _this.captcha_key = response.data.captcha_key;
                    setTimeout(() => {
                        _this.$refs.captcha.src = response.data.captcha_image_content;
                    }, 1000);
                });
            }
        }
    };
</script>

<style>

</style>
