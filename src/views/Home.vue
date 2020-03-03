<template>
  <div class="home">
    <div class="flex-row mr-3">
      <div>endpoint:</div>
      <b-spinner
        style="width:1.5em; height:1.5em;"
        class="text-center"
        variant="primary"
        label="Spinning"
        v-if="loading"
      ></b-spinner>
      <b-form-select
        v-model="selectedEndpoint"
        :options="endpoints"
        class="m-2"
        v-on:change="endpointChanged"
      >
        <template slot="first">
          <option :value="null" disabled>-- Select SpreadSheet --</option>
        </template>
      </b-form-select>
      <b-button v-b-modal.modal-new-endpoint variant="success" @click="handleNewEndpoint">New</b-button>
    </div>
    <div class="flex-row">
      <b-form-select
        :disabled="!selectedEndpoint"
        v-model="selectedClass"
        :options="sheets"
        class="m-2"
      >
        <template slot="first">
          <option :value="null" disabled>-- Select Class --</option>
        </template>
      </b-form-select>
    </div>
    <hr />
    <div class="flex-row">
      <b-form-input v-model="username" placeholder="username" class="m-2"></b-form-input>
      <b-form-input
        v-model="psw"
        type="password"
        placeholder="password"
        class="m-2"
        @keypress.enter="fetcher"
      ></b-form-input>
      <b-button v-b-modal.modal-1 @click="showingChangePassword" tabindex="100">Change password</b-button>

      <b-modal id="modal-1" title="BootstrapVue">
        Current Password
        <b-form-input v-model="curPass" type="password" placeholder="current password" class="m-2"></b-form-input>
        <hr />New Password
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
      <b-modal id="modal-new-endpoint" title="BootstrapVue">
        New Endpoint:
        <b-form-input
          v-model="newEndpoint"
          type="text"
          placeholder="new endpoint INCLUDE https://.."
          class="m-2"
        ></b-form-input>
        <div class="flex-row">
          <b-button @click="testEndPoint">Test</b-button>
        </div>
        <div>New endpoint name: {{newEndpointName}}</div>

        <div>
          Sheets:
          <div v-for="item in newEndpointSheets" :key="item">{{ item }}</div>
        </div>
        <b-button :disabled="newEndpointSheets.length < 1" @click="addNewEndpoint">Confirm</b-button>
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
const sout = console.log;
@Component({
  components: {
    GradeViewer
  }
})
export default class Home extends Vue {
  private semesters = options;
  selectedEndpoint: any = null;
  endpoint: string = "";
  endpoints: any[] = [];
  loading: boolean = false;
  get selectedObject() {
    return this.endpoints.find(x => x.endpoint == this.selectedEndpoint);
  }
  get sheets() {
    const so = this.selectedObject;
    return (so && so.sheets) || [];
  }
  private get classes() {
    return (this.selectedSemester && this.selectedSemester.classes) || [];
  }
  newEndpoint: string = "";
  newEndpointName: string = "";
  newEndpointSheets: string[] = [];
  newEndpointResponse: any = null;
  addNewEndpoint() {
    if (this.newEndpointResponse) {
      this.addEndpoint(this.newEndpointResponse);
    }
  }
  testEndPoint(x: any) {
    fetch(`${this.newEndpoint}?name=true&list=true`, { method: "GET" })
      .then(response => {
        return response.json();
      })
      .then(data => {
        data.endpoint = this.newEndpoint;
        data.text = data.name; // + " (" + data.endpoint + ")";
        data.value = this.newEndpoint;
        this.newEndpointResponse = data;
        this.newEndpointName = data.name;
        this.newEndpointSheets = data.sheets;
        this.addEndpoint(data);
        console.log(data);
      });
  }
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
  handleNewEndpoint(idk: any) {
    //show modal.
  }
  mounted() {
    console.log("this", this);
    sout("setting options");
    this.setOptions();
    this.setEndpoint();
  }
  endpointChanged(x: any) {
    sout("endpoint changed!", x, this.selectedEndpoint);
    this.saveOptionsAndSelection();
  }
  saveOptionsAndSelection() {
    sout("saving options and selection:", this.endpoints, this.endpoint);
    localStorage.setItem("endpoints", JSON.stringify(this.endpoints));
    localStorage.setItem("endpoint", JSON.stringify(this.selectedEndpoint));
  }
  setOptions() {
    const r = localStorage.getItem("endpoints");
    if (r) {
      try {
        this.endpoints = JSON.parse(r);
        sout("read in endpoints:", this.endpoints);
      } catch (e) {
        sout("could not JSON parse endpoints!", e, r);
      }
    }
    const selected = localStorage.getItem("endpoint");
    if (selected) {
      sout("selected was: ", selected);
      try {
        const r = this.endpoints.find(x => x.endpoint == selected);
        if (r) {
          sout("setting selected ep to ", selected);
          this.selectedEndpoint = selected;
        }
      } catch (e) {
        sout("could not parse selected endpoint", e, selected);
      }
    } else {
      sout("selectedEndpoint was null", selected);
      this.selectedEndpoint = null;
    }
  }
  setEndpoint() {
    //check if endpoint param given.
    const x = new URL(location.href).searchParams.get("endpoint");
    sout("mounted: ", x);
    const newEP = x || "";
    const me = this;
    if (newEP) {
      //fetch endpoint. a new one was given.
      this.loading = true;
      fetch(`${newEP}?name=true&list=true`, { method: "GET" })
        .then(response => {
          return response.json();
        })
        .then(data => {
          data.endpoint = newEP;
          data.text = data.name; // + " (" + data.endpoint + ")";
          data.value = newEP;
          me.loading = false;
          this.addEndpoint(data);
          console.log(data);
        });
      // this.selectedEndpoint = this.endpoint;
    } else {
      //no endpoint url given.
    }
  }
  addEndpoint(data: any) {
    //replace old ep with route if given.
    const ep = data.endpoint;
    const r = this.endpoints.find(x => x.endpoint.trim() == ep.trim());
    if (r) {
      //if ep exists, replace it with updated info.
      this.endpoints.splice(this.endpoints.indexOf(r), 1);
    }
    this.endpoints.push(data);
    this.selectedEndpoint = (r || data).endpoint;
    this.saveOptionsAndSelection();
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
    const response = await postData(this.selectedEndpoint, {
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
    const endpoint = this.selectedEndpoint;
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
