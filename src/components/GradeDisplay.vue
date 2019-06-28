<template>
  <b-card
    :bg-variant="variant"
    class="shadow mb-1 rounded"
    :class="colorScaled && hasGrade? colorClass : ''"
    :title="(displayGrade + '/' + gradeObject.Points)"
    :sub-title="asPercent(percent)"
    :header-bg-variant="headerVariant"
    :text-variant="textVariant || (colorClass == 'f'? 'white' : 'black')"
  >
    <template slot="header">
      <h4 style="display:inline-block">{{gradeObject.Title}}</h4>
      <template v-if="showCat && gradeObject.Category">&nbsp;({{ gradeObject.Category}})</template>
    </template>
    <h6 slot="footer" v-if="gradeObject.Date">{{gradeObject.Date.toLocaleDateString()}}</h6>

    <!-- {{ gradeObject }} -->
  </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class HelloWorld extends Vue {
  @Prop() private gradeObject!: any;
  @Prop() private showCat!: boolean;
  @Prop() private colorScaled!: boolean;
  @Prop() private variant!: string;
  @Prop() private textVariant!: string;
  @Prop() private headerVariant!: string;
  get displayGrade(): string {
    const str = "" + this.pointsEarned;
    const b = str.length > 0;
    if (b) {
      return str;
    } else {
      return "--";
    }
  }
  get hasGrade(): boolean {
    return ("" + this.pointsEarned).length > 0;
  }
  get pointsEarned(): number {
    return this.gradeObject.grade;
  }
  get percent(): number {
    return this.pointsEarned / this.gradeObject.Points;
  }
  get colorClass(): string {
    if (!this.hasGrade) {
      return "";
    }
    if (this.percent >= 0.9) {
      return "a";
    } else if (this.percent >= 0.8) {
      return "b";
    } else if (this.percent >= 0.7) {
      return "c";
    } else if (this.percent >= 0.6) {
      return "d";
    } else {
      return "f";
    }
  }

  asPercent(num: number) {
    return "" + round(num, 2) * 100 + "%";
  }
}
function round(num: number, decimals: number) {
  const k = Math.pow(10, decimals);
  const r = Math.round(num * k);
  return r / k;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
// http://www.perbang.dk/rgbgradient/
.a {
  background-color: #00e593;
}
.b {
  background-color: #c1ff4e;
}
.c {
  background-color: #ff8928;
}
.d {
  background-color: #aa3a61;
}
.f {
  background-color: #b8114c;
}
</style>
