import partitionCanvans from "./src/autocomplete";

/* istanbul ignore next */
partitionCanvans.install = function (Vue) {
  Vue.component(partitionCanvans.name, partitionCanvans);
};

export default partitionCanvans;
