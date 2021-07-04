<template>
  <div>
    <PartitionCanvans
      :currentTem.sync="ctemp"
      :canvasGradient="variableColor[cmode].canvasGradient"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import PartitionCanvans from "./partitionCanvans/src/canvas.vue";

@Component({
  components: {
    PartitionCanvans,
  },
})
export default class Canvas extends Vue {
  private ctemp = 20;
  private cmode = "snow";
  private variableColor = {
    auto: {
      canvasGradient: { 0: "#00C48C", 0.5: "#00C48C", 1: "#02D3ED" },
      title: "#09B66D",
      bg: "#D1F1E3",
    },
    sun: {
      canvasGradient: { 0: "#EF6866", 1: "#FFB76B" },
      title: "#ff9966",
      bg: "#FFEDDA",
    },
    snow: {
      canvasGradient: { 0: "#5353C5", 1: "#02D3ED" },
      title: "#007AFF",
      bg: "#BFDEFF",
    },
    wind: {
      canvasGradient: { 0: "#00C48C", 0.5: "#00C48C", 1: "#02D3ED" },
      title: "#09B66D",
      bg: "#D1F1E3",
    },
    hum: {
      canvasGradient: { 0: "#5353C5", 1: "#02D3ED" },
      title: "#007AFF",
      bg: "#BFDEFF",
    },
  };
}
</script>

<style></style>
