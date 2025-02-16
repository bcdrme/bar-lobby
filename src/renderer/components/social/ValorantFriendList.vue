<template>
    <div class="friends-sidebar" :class="{ expanded: isExpanded }" @mouseenter="expand" @mouseleave="collapse">
        <div class="friends-users-container">
            <div class="party-section">
                <div class="party-slots">
                    <ValorantUser />
                </div>
            </div>
            <div class="party-section">
                <span class="party-text">Party</span>
                <div class="party-slots">
                    <ValorantUser v-for="i in 5" :key="i" />
                </div>
            </div>
            <div class="party-section">
                <span class="party-text">Online</span>
                <div class="party-slots">
                    <ValorantUser />
                </div>
            </div>
            <div class="party-section">
                <span class="party-text">Offline</span>
                <div class="party-slots">
                    <ValorantUser />
                </div>
            </div>
            <div class="party-section">
                <span class="party-text">recentPlayers</span>
                <div class="party-slots">
                    <ValorantUser />
                </div>
            </div>
        </div>

        <div class="footer">
            <div class="invitations-carousel">
                <span class="invitation">Melon wants to add you.</span>
                <button>Accept</button>
                <button>Decline</button>
            </div>
            <div class="button-container">
                <button class="icon-button">Add</button>
                <button class="icon-button">Search</button>
            </div>
        </div>
        <!-- <div class="friends-list">
            <FriendComponent v-for="friend in onlineFriends" :key="friend.userId" :user="friend" />
        </div> -->
    </div>
</template>

<script lang="ts" setup>
import FriendComponent from "@renderer/components/social/FriendComponent.vue";
import ValorantUser from "@renderer/components/social/ValorantUser.vue";
import { useDexieLiveQuery } from "@renderer/composables/useDexieLiveQuery";
import { db } from "@renderer/store/db";
import { ref } from "vue";

const isExpanded = ref(false);

const expand = () => {
    isExpanded.value = true;
};

const collapse = () => {
    isExpanded.value = false;
};

const onlineFriends = useDexieLiveQuery(() => {
    return db.users
        .where({
            status: ["lobby", "menu", "playing"],
            isFriend: 1,
            isMe: 0,
        })
        .toArray();
});

const offlineFriends = useDexieLiveQuery(() => {
    return db.users
        .where({
            status: "offline",
            isFriend: 1,
            isMe: 0,
        })
        .toArray();
});

const recentPlayers = useDexieLiveQuery(() => {
    return db.users
        .where({
            isFriend: 0,
            isMe: 0,
        })
        .limit(20)
        .reverse()
        .sortBy("lastSeen");
});
</script>

<style lang="scss" scoped>
$background-color: #82828272;
$accent-color: #22c55e;

.friends-sidebar {
    position: fixed;
    right: 0;
    top: 0;
    padding-top: 52px;
    height: 100vh;
    width: 300px;
    transform: translate(248px, 0);
    // background: $background-color;
    // backdrop-filter: blur(10px);
    transition: transform 0.3s ease;
    color: #f9f9f9;
    overflow: hidden;
    // border-top: 1px solid rgba(255, 255, 255, 0.938);
    // box-shadow: -5px 0 10px rgba(0, 0, 0, 0.4);

    .friends-users-container {
        overflow-y: scroll;
        background: $background-color;
        border-top: 1px solid rgba(255, 255, 255, 0.938);
        box-shadow: -5px 0 10px rgba(0, 0, 0, 0.4);
        height: 2000px;
    }

    .footer {
        background: $background-color;
        // border-top: 1px solid rgba(255, 255, 255, 0.938);
        box-shadow: -5px 0 10px rgba(0, 0, 0, 0.4);
        position: absolute;
        bottom: 0;
        .invitations-carousel {
            padding-left: 52px;
            // padding: 10px 20px;
            background: rgba(255, 255, 255, 0.1);
            font-size: 14px;
            text-align: center;
            .invitation {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.5);
            }
            button {
                padding: 10px 20px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: background 0.2s ease;
                &:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            }
        }
        .button-container {
            display: flex;
            justify-content: space-around;
            padding-left: 52px;
            button {
                padding: 10px 20px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: background 0.2s ease;
                &:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            }
        }
    }

    &.expanded {
        transform: translate(0, 0);
    }

    .party-section {
        .party-text {
            display: flex;
            height: 40px;
            justify-content: center;
            align-items: center;
            width: 100%;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            background: rgba(255, 255, 255, 0.1);
            width: 100%;
            color: $accent-color;
        }

        .party-slots {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding-top: 8px;
            padding-bottom: 8px;
            padding-left: 5px;
        }
    }

    .social-section {
        .social-text {
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .online-count {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.5);
        }
    }

    .friends-list {
        overflow-y: auto;
        height: calc(100% - 180px);

        .friend {
            padding: 12px 20px;
            display: flex;
            align-items: center;
            gap: 15px;
            cursor: pointer;
            transition: background 0.2s ease;

            &:hover {
                background: rgba(255, 255, 255, 0.05);
            }

            .avatar {
                position: relative;
                width: 40px;
                height: 40px;
                border-radius: 4px;
                overflow: hidden;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .status-indicator {
                    position: absolute;
                    bottom: -2px;
                    right: -2px;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    border: 2px solid $background-color;
                }
            }

            &.online .status-indicator {
                background: #50e3c2;
            }

            &.in-game .status-indicator {
                background: $accent-color;
            }

            &.offline .status-indicator {
                background: #768079;
            }

            .info {
                .name {
                    font-size: 14px;
                    font-weight: 500;
                }

                .status {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                    text-transform: capitalize;
                }

                .rank {
                    font-size: 11px;
                    color: $accent-color;
                }
            }
        }
    }
}
</style>
