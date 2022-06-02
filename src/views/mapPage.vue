<template>
    <div class="map">
        <MapBlock class="echarts-wrapper"></MapBlock>
    </div>
</template>

<script>
import MapBlock from '@/component/MutiMode.vue'
export default {
    components: {
        MapBlock
    }
}
</script>

<style lang="scss" scoped>
.map {
    .echarts-wrapper {
        margin: 0 auto;
        width: 900px;
        height: 800px;
    }
}
</style>