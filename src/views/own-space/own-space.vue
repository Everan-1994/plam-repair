<style lang="less">
    @import './own-space.less';
</style>

<template>
    <div>
        <Card>
            <p slot="title">
                <Icon type="person"></Icon>
                个人信息
            </p>
            <div>
                <Form
                        ref="userForm"
                        :model="userForm"
                        :label-width="100"
                        label-position="right"
                >
                    <FormItem label="用户名：" prop="name">
                        <div style="display:inline-block;width:150px;">
                            <Input v-model="userForm.name" disabled></Input>
                        </div>
                    </FormItem>
                    <FormItem label="E-Mail：" prop="email">
                        <div style="display:inline-block;width:150px;">
                            <Input v-model="userForm.email" disabled></Input>
                        </div>
                    </FormItem>
                    <FormItem label="登录密码：">
                        <Button type="error" icon="edit" @click="showEditPassword">修改密码</Button>
                    </FormItem>
                    <div v-if="false">
                        <Button type="primary" style="width: 100px;" :loading="save_loading" @click="saveEdit">保存</Button>
                    </div>
                </Form>
            </div>
        </Card>
        <Modal v-model="editPasswordModal" :closable='false' :mask-closable=false :width="350">
            <h3 slot="header" style="color:#2D8CF0">修改密码</h3>
            <Form ref="editPasswordForm" :model="editPasswordForm" :label-width="100" label-position="right" :rules="passwordValidate">
                <FormItem label="原密码" prop="oldPass" :error="oldPassError">
                    <Input v-model="editPasswordForm.oldPass" placeholder="请输入现在使用的密码" ></Input>
                </FormItem>
                <FormItem label="新密码" prop="newPass">
                    <Input v-model="editPasswordForm.newPass" placeholder="请输入新密码，至少6位字符" ></Input>
                </FormItem>
                <FormItem label="确认新密码" prop="rePass">
                    <Input v-model="editPasswordForm.rePass" placeholder="请再次输入新密码" ></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" @click="cancelEditPass">取消</Button>
                <Button type="primary" :loading="savePassLoading" @click="saveEditPass">保存</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import axios from 'axios';
    import {path} from './../../helpers/path';
    import JWT from './../../helpers/jwt';
    import Cookie from  'js-cookie';

    export default {
        name: 'ownspace_index',
        data () {
            const oldPassword = (rule, value, callback) => {
                let old_pwd = Cookie.get('password');
                if (value !== old_pwd) {
                    callback(new Error('旧密码不正确'));
                } else {
                    callback();
                }
            };
            const valideRePassword = (rule, value, callback) => {
                if (value !== this.editPasswordForm.newPass) {
                    callback(new Error('两次输入密码不一致'));
                } else {
                    callback();
                }
            };
            return {
                userForm: {
                    name: '',
                    email: '',
                },
                save_loading: false,
                editPasswordModal: false, // 修改密码模态框显示
                savePassLoading: false,
                oldPassError: '',
                editPasswordForm: {
                    oldPass: '',
                    newPass: '',
                    rePass: ''
                },
                passwordValidate: {
                    oldPass: [
                        { required: true, message: '请输入原密码', trigger: 'blur' },
                        { validator: oldPassword, trigger: 'blur' }
                    ],
                    newPass: [
                        { required: true, message: '请输入新密码', trigger: 'blur' },
                        { min: 6, message: '请至少输入6个字符', trigger: 'blur' },
                        { max: 32, message: '最多输入32个字符', trigger: 'blur' }
                    ],
                    rePass: [
                        { required: true, message: '请再次输入新密码', trigger: 'blur' },
                        { validator: valideRePassword, trigger: 'blur' }
                    ]
                },
                initPhone: '',
            };
        },
        methods: {
            showEditPassword () {
                this.editPasswordModal = true;
            },
            saveEdit () {
                this.saveInfoAjax();
            },
            cancelEditPass () {
                this.editPasswordModal = false;
            },
            saveEditPass () {
                let _this = this;
                _this.$refs['editPasswordForm'].validate((valid) => {
                    if (valid) {
                        _this.savePassLoading = true;

                        axios.patch(`${path}/api/user/changePwd`, {new_pwd: _this.editPasswordForm.newPass}).then(response => {
                            _this.$Message.success('密码修改成功');
                            setTimeout(function () {
                                _this.savePassLoading = false;
                                _this.cancelEditPass();
                                _this.logout();
                            }, 1000);
                        }).catch(error => {
                            _this.savePassLoading = false;
                            _this.$Message.error('系统出错，请稍后再试。');
                        });
                    }
                });
            },
            init () {
                axios.get(`${path}/api/user`).then(response => {
                    let data = response.data;
                    this.userForm = {
                        name: data.name,
                        email: data.email
                    };
                }).catch(error => {
                    console.log(error);
                })
            },
            saveInfoAjax () {
                this.save_loading = true;
                setTimeout(() => {
                    this.$Message.success('保存成功');
                    this.save_loading = false;
                }, 1000);
            },
            logout() {
                axios.delete(`${path}/api/logout`).then(response => {
                    this.$Modal.remove();
                    JWT.removeToken();
                    this.$store.commit('logout', this);
                    this.$store.commit('clearOpenedSubmenu');
                    this.$router.push({
                        name: 'login'
                    });
                }).catch(error => {
                    this.$Modal.remove();
                    JWT.removeToken();
                    this.$store.commit('logout', this);
                    this.$store.commit('clearOpenedSubmenu');
                    this.$router.push({
                        name: 'login'
                    });
                });
            }
        },
        mounted () {
            this.init();
        }
    };
</script>
