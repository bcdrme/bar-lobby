<template>
    <div class="slot" v-if="user">
        <div class="banner"></div>
        <div class="avatar">
            <img src="/src/renderer/assets/images/icons/terrains/map_metal.png" alt="rank" />
        </div>
        <div class="ribbon">
            <Rank class="rank" :rank="user.rank" />
            <div class="username">
                <!-- <Flag :country="user.countryCode" /> -->
                {{ user.username }}
                <div class="state">ready</div>
            </div>
            <Rank class="rank" :rank="user.rank" />
        </div>
    </div>
    <div class="slot empty" v-else>
        <div class="banner empty"></div>
        <div class="add">
            <span>+</span>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { User } from "@main/model/user";
import Flag from "@renderer/components/misc/Flag.vue";
import Rank from "@renderer/components/misc/Rank.vue";

const props = defineProps<{
    user?: User;
}>();
</script>

<style lang="scss" scoped>
.slot {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 250px;
    height: 100%;
    margin-top: 40px;
    transition: all 0.3s ease;

    &.empty {
        &:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.02);
            color: #fff;
        }
        .add {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
            font-size: 60px;
            text-shadow: none;
            color: rgba(255, 255, 255, 0.5);
            &:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.02);
                color: #fff;
            }
        }
    }
}

.banner {
    border-top: 2px solid rgb(255, 255, 255);
    border-left: 1px solid rgb(255, 255, 255);
    border-right: 1px solid rgb(255, 255, 255);
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("/src/renderer/assets/images/backgrounds/3.png");
    background-size: cover;
    mask-image: linear-gradient(rgba(0, 0, 0, 1), rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
    &.empty {
        background-image: none;
        background-color: rgba(255, 255, 255, 0.1);
    }
}

.avatar {
    width: 100%;
    height: 100%;
    // border-radius: 50%;
    overflow: hidden;
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}

.avatar {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    position: absolute;
    top: -40px;
    background: rgba(255, 255, 255, 1);
    width: 80px;
    height: 80px;
    outline: 2px solid rgba(255, 255, 255, 0.8);
    border-radius: 100%;
}

.ribbon {
    padding: 0 10px;
    position: absolute;
    bottom: 200px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    font-size: 20px;
    background: rgb(255, 203, 107);
    border-top: 2px double rgba(255, 255, 255, 0.5);
    border-bottom: 2px double rgb(255, 255, 255, 0.5);
    .username {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: black;
        text-shadow: none;
        .state {
            position: absolute;
            bottom: -30px;
            font-size: 16px;
            color: rgb(255, 255, 255);
            text-transform: uppercase;
            font-weight: bold;
            text-shadow: 1px 1px 0 rgba(0, 0, 0, 1);
        }
    }
    .rank {
        width: 40px;
    }
}
</style>
