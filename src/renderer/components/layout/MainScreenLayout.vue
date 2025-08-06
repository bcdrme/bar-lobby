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
    padding-top: 24px;
    padding-left: 96px;
    flex-grow: 1;
    gap: 16px;
    // overflow: hidden;
}

// media queries to add padding left for larger screens (more than 16:9 aspect ratio)
@media (min-aspect-ratio: 16/9) {
    .main-screen-layout {
        padding-left: 200px;
    }
}

.header {
    display: flex;
    flex-direction: column;
    padding: $padding;
    color: white;
}

.title {
    font-size: 24px;
    font-weight: bold;
    text-transform: uppercase;
}

.subtitle {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
}

.content {
    width: 1420px;
    height: 720px;
    padding: $padding;
}

.footer {
    padding: $padding;
    display: flex;
    flex-direction: row;
    gap: 24px;
}
</style>
