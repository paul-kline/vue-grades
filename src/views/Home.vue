<template>
  <div class="home">
    <div class="flex-row">
      <b-form-select v-model="selectedSemester" :options="semesters" class="m-2">
        <template slot="first">
          <option :value="null" disabled>-- Select Semester --</option>
        </template>
      </b-form-select>
      <b-form-select
        :disabled="!selectedSemester"
        v-model="selectedClass"
        :options="classes"
        class="m-2"
      >
        <template slot="first">
          <option :value="null" disabled>-- Select Class --</option>
        </template>
      </b-form-select>
    </div>
    <hr>
    <div class="flex-row">
      <b-form-input v-model="username" placeholder="username" class="m-2"></b-form-input>
      <b-form-input v-model="psw" type="password" placeholder="password" class="m-2"></b-form-input>
      <b-button v-b-modal.modal-1 @click="showingChangePassword">Change password</b-button>

      <b-modal id="modal-1" title="BootstrapVue">
        Current Password
        <b-form-input v-model="curPass" type="password" placeholder="current password" class="m-2"></b-form-input>
        <hr>New Password
        <b-form-input v-model="newPass" type="password" placeholder="new password" class="m-2"></b-form-input>
        <b-form-input
          v-model="confirmNewPass"
          type="password"
          placeholder="confirm new password"
          class="m-2"
        ></b-form-input>

        <b-button @click="changePassword">{{changePasswordText}}</b-button>
        <b-alert v-if="modalMessage" show :variant="modalMessageStyle">{{modalMessage}}</b-alert>
      </b-modal>
    </div>
    <b-button variant="success" @click="fetcher">{{btnText}}</b-button>
    <b-alert v-if="message" show variant="danger">{{message}}</b-alert>

    <GradeViewer v-if="myGrades && myGrades.length > 0" class="grades" :grades="myGrades"></GradeViewer>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src
import md5 from "@/hash";
import { proxyPost, postData } from "@/Utils";
import GradeViewer from "@/views/GradeViewer.vue";

import options from "@/options.json";
console.log("options are:", options);
@Component({
  components: {
    GradeViewer
  }
})
export default class Home extends Vue {
  private semesters = options;

  private get classes() {
    return (this.selectedSemester && this.selectedSemester.classes) || [];
  }
  // [
  //   { value: null, disabled: true, text: "Please select a semester" },
  //   { value: "Fall 2019", text: "Fall 2019" }
  // ];
  // private classes = [
  //   { value: null, disabled: true, text: "Please select a class" },
  //   { value: "Grades", text: "Software Engineering" }
  // ];

  private curPass: string = "";
  private newPass: string = "";
  private confirmNewPass: string = "";
  private modalMessage: string = "";
  private modalMessageStyle: string = "danger";
  private selectedSemester: any | null = null;
  private selectedClass: string | null = null;
  private username: string = "";
  private psw: string = "example";
  private btnText: string = "Fetch Grades";
  private changePasswordText: string = "Change Password";
  private message: string = "";
  private myGrades: any[] = [];
  private get hashed(): string {
    return md5(this.psw) as string;
  }
  mounted() {
    console.log("this", this);
    if(!this.selectedSemester){
      this.selectedSemester = this.semesters[this.semesters.length-1].value
    }
  }
  private showingChangePassword() {
    console.log("showing change password");
    this.preChangePasswordOpenCheck();
  }
  private preChangePasswordOpenCheck(): boolean {
    this.modalMessage = "";
    let state = true;
    if (!this.selectedSemester) {
      this.modalMessage += "Please Select a semester on the previous page.\n";
      this.modalMessageStyle = "danger";
      state = false;
    }
    if (!this.selectedClass) {
      this.modalMessage += "Please select a class on the previous page.\n";
      this.modalMessageStyle = "danger";
      state = false;
    }
    if (!this.username) {
      this.modalMessage += "Please enter your username on the previous page.\n";
      this.modalMessageStyle = "danger";
      state = false;
    }

    return state;
  }
  private async changePassword() {
    this.modalMessage = "";
    const oldPass = md5(this.curPass);
    const newPass = md5(this.newPass);
    const confirmedNewPass = md5(this.confirmNewPass);
    if (!this.preChangePasswordOpenCheck()) {
      return;
    }
    if (newPass != confirmedNewPass) {
      this.modalMessageStyle = "danger";
      this.modalMessage = "Passwords do not match!";
      return;
    }

    if (this.curPass.length < 1 || this.newPass.length < 1) {
      this.modalMessageStyle = "danger";
      this.modalMessage = "New Password does not meet requirements";
      return;
    }
    this.changePasswordText = "please wait...";
    const response = await postData(this.currentEndpoint, {
      oldpassword: oldPass,
      newpassword: newPass,
      class: this.selectedClass,
      username: this.username
    });
    this.changePasswordText = "Change Password";
    console.log("change password response", response);
    if (response.error) {
      this.modalMessage = response.error;
      this.modalMessageStyle = "danger";
    } else {
      this.modalMessage = response.success;
      this.modalMessageStyle = "success";
    }
    console.log("changed");
  }
  get currentEndpoint(): string {
    return (this.selectedSemester && this.selectedSemester.url) || "";
  }
  public async fetcher() {
    const me = this;
    this.btnText = "fetching...";
    console.log("clicked");
    // console.log(this);
    // return;
    const psw = this.hashed;
    console.log(this.hashed);
    // return;
    const cls = this.selectedClass;
    const endpoint = this.currentEndpoint;
    if (!endpoint || !cls) {
      console.error("no valid enpoint");
      me.message = "Please select semester/class";
      me.btnText = me.message;
      return;
    }
    if (endpoint) {
      const response = await postData(endpoint, {
        class: cls,
        username: this.username,
        password: psw
      });
      console.log(response);
      me.btnText = "Fetch Grades";
      if (response.error) {
        me.message = response.error;
      } else {
        me.message = "";
        // me.myGrades = response.grades;
        me.processData(response);
      }
    } else {
      console.error("no valid enpoint");
      me.message = "Please select semester/class";
      me.btnText = me.message;
    }
    console.log(this.hashed);
  }
  public processData(data: any) {
    data.grades.forEach((g: any) => {
      if (g.Date) {
        console.log("g.Date is true", g.Date);
        g.Date = new Date(g.Date);
      }
    });
    const now = new Date().getTime();
    this.myGrades = data.grades.sort(
      (a: any, b: any) =>
        ((b.Date && b.Date.getTime()) || now) -
        ((a.Date && a.Date.getTime()) || now)
    );
  }
}
</script>

<style lang="scss">
.flex-row {
  display: flex;
  flex-direction: row;
}
</style>
