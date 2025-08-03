<template>
    <div class="friend">
        <div class="avatar">
            <img :alt="user.username" />
            <div class="status-indicator"></div>
        </div>
        <div class="info">
            <div class="name">{{ user.username }}</div>
            <div class="status">{{ user.status }}</div>
            <div class="rank">{{ user.countryCode }}</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { User } from "@main/model/user";

defineProps<{
    user: User;
}>();
</script>

<style lang="scss" scoped></style>
