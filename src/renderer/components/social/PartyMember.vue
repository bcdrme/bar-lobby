<template>
    <div class="slot" v-if="user">
        <div
            class="banner"
            :style="{
                backgroundImage: `url(${user.bannerId ? `/src/renderer/assets/images/banners/${user.bannerId}.webp` : ''})`,
            }"
        ></div>
        <!-- <div class="avatar">
            <img src="/src/renderer/assets/images/icons/terrains/map_metal.png" alt="rank" />
        </div> -->
        <div class="ribbon" :style="{ backgroundColor: user.isMe ? 'rgb(255, 203, 107)' : 'rgb(220, 220, 220)' }">
            <Rank class="rank" :rank="user.rank" />
            <div class="username">
                {{ user.username }}
                <div class="state txt-outlined">ready</div>
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
import Rank from "@renderer/components/misc/Rank.vue";

defineProps<{
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
    transition: all 0.3s ease;
    clip-path: polygon(calc(100% - 15px) 0, 100% 15px, 100% 100%, 0 100%, 0 15px, 15px 0);

    &.empty {
        opacity: 0.5;
        &:hover {
            // background: rgba(255, 255, 255, 0.2);
            opacity: 0.8;
            transform: scale(1.02);
            color: #fff;
        }
        .add {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
            font-size: 30px;
            text-shadow: none;
            // color: rgba(255, 255, 255, 0.1);
        }
    }
}

.banner {
    // border-radius: 2px;
    // border-top: 2px solid rgba(0, 0, 0, 0.2);
    border-left: 1px solid rgba(0, 0, 0, 0.2);
    border-right: 1px solid rgba(0, 0, 0, 0.2);
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("/src/renderer/assets/images/banners/66b3a6cd-1df0-48ff-9c68-62d679f8fd0a.webp");
    background-size: cover;
    background-position: center;
    mask-image: linear-gradient(rgba(0, 0, 0, 1), rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
    &.empty {
        background-image: none;
        background-color: rgba(11, 11, 11, 0.63);
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
    position: absolute;
    bottom: 200px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 40px;
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
        font-family: "Exo2";
        font-weight: bold;
        .state {
            position: absolute;
            bottom: -30px;
            font-size: 16px;
            color: rgb(255, 255, 255);
            filter: drop-shadow(0 0 5px #000);
        }
    }
    .rank {
        width: 40px;
    }
}
</style>
