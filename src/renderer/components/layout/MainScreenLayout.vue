<template>
    <div class="main-screen-layout">
        <div class="header">
            <div class="title">
                <slot name="title" />
            </div>
            <div class="subtitle">
                <slot name="subtitle" />
            </div>
        </div>
        <div class="content">
            <slot name="content" />
        </div>
        <div class="footer">
            <slot name="actions" />
        </div>
    </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
$padding: 8px;

.main-screen-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    // padding-top: 32px;
    padding-left: 96px;
}

// media queries to add padding left for larger screens (more than 16:9 aspect ratio)
@media (min-aspect-ratio: 16/9) {
    .main-screen-layout {
        padding-left: 192px;
    }
}

.header {
    display: flex;
    flex-direction: column;
    padding: $padding;
    padding-top: 42px;
    padding-bottom: 42px;
    color: white;
    font-family: Rajdhani, sans-serif;
}

.title {
    font-size: 36px;
    font-weight: bold;
    text-transform: uppercase;
    text-shadow: 0 0 8px rgb(102, 159, 98);
}

.subtitle {
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
}

.content {
    width: 1420px;
    height: 640px;
    padding: $padding;
}

.footer {
    padding: $padding;
    display: flex;
    flex-direction: row;
    gap: 24px;
}
</style>
