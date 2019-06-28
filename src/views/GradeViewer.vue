<template>
  <div class="home container">
    <div class="flex-row mt-1 border rounded p-3">
      <GradeDisplay
        header-variant="primary"
        class="item m-1"
        v-if="slot1"
        :key="slot1.Title"
        :show-cat="true"
        :grade-object="slot1"
      />
      <GradeDisplay
        class="item m-1"
        variant="secondary"
        text-variant="white"
        v-if="slot2"
        :key="slot2.Title"
        :show-cat="true"
        :grade-object="slot2"
      />
    </div>

    <b-tabs content-class="mt-3 left">
      <b-tab title="All">
        <GradeDisplay
          v-for="gradeObj in grades"
          :key="gradeObj.Title"
          :show-cat="true"
          :color-scaled="true"
          :grade-object="gradeObj"
        />
      </b-tab>
      <b-tab v-for="cat in categories" :title="cat" :key="cat">
        <GradeDisplay
          v-for="gradeObj in catFilter(cat)"
          :key="gradeObj.Title"
          :color-scaled="true"
          :show-cat="true"
          :grade-object="gradeObj"
        />
      </b-tab>
    </b-tabs>
    <!-- <div class="grades">
      <div v-for="item in myGrades" :key="item.Title">{{ item.Title }}</div>
    </div>-->
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import GradeDisplay from "@/components/GradeDisplay.vue";
@Component({
  components: { GradeDisplay }
})
export default class GradeViewer extends Vue {
  @Prop() private grades!: any[];

  get slot1(): any {
    return this.gradeSlot(1);
  }
  get slot2(): any {
    return this.gradeSlot(2);
  }
  gradeSlot(n: number): any | null {
    return this.grades.find(g => g.Slot == n || g.slot == n) || null;
  }
  get categories(): string[] {
    const answer = new Set<string>();
    this.grades.forEach(g => answer.add(g.Category || g.category));
    const ans: string[] = [];
    answer.forEach(a => ans.push(a));
    return ans.sort();
  }
  catFilter(cat: string) {
    return this.grades.filter(x => x.Category == cat);
  }
  mounted() {
    console.log("grade viewer is alive!");
    console.log(this.grades, "categories", JSON.stringify(this.categories));
  }
}
</script>

<style lang="scss">
.left {
  text-align: left;
}
.item {
  flex-grow: 1;
}
.flex-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
</style>
