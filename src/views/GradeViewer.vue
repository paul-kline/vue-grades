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
    <div ref="tabs">
      <b-tabs content-class="mt-3 left" v-model="tabIndex">
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
    </div>
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
  private touchCoords: [number, number] = [-1, -1];
  private tabIndex: number = 0;

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
    this.setupTouchListeners();
  }
  setupTouchListeners() {
    const someElement = this.$refs["tabs"] as HTMLElement;
    console.log("somelement", someElement);
    someElement.addEventListener("touchstart", this.process_touchstart, false);
    // someElement.addEventListener("touchmove", this.process_touchmove, false);
    someElement.addEventListener(
      "touchcancel",
      this.process_touchcancel,
      false
    );
    someElement.addEventListener("touchend", this.process_touchend, false);
  }
  process_touchstart(ev: TouchEvent) {
    console.log("touchstart", ev);
    const t = ev.touches[0];
    this.touchCoords = [t.clientX, t.clientY];
  }

  process_touchcancel(ev: TouchEvent) {
    console.log("touchcancel", ev);
  }
  process_touchend(ev: TouchEvent) {
    console.log("touchend", ev);
    const t = ev.changedTouches[0];
    const result = [t.clientX, t.clientY];
    const xdiff = result[0] - this.touchCoords[0];
    const ydiff = Math.abs(result[1] - this.touchCoords[1]);

    if (Math.abs(xdiff) > 3 * ydiff) {
      if (xdiff > 0) {
        if (this.tabIndex == 0) {
        } else {
          this.tabIndex--;
        }
      } else {
        if (this.tabIndex < this.categories.length - 1) {
          this.tabIndex++;
        }
      }
    }
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
