<template>
    <div class="friends-sidebar" :class="{ expanded: isExpanded || isUltraWideScreen }" @mouseenter="expand" @mouseleave="collapse">
        <div class="friends-users-container">
            <div class="party-section">
                <span class="main-text">
                    Party
                    <span class="section-count">{{ 1 }} / 5</span>
                </span>
                <div class="slots">
                    <User :user="me" />
                    <EmptyUserSlot v-for="i in 1" :key="i" />
                </div>
            </div>
            <div class="party-section">
                <span class="main-text">
                    Online
                    <span class="section-count">{{ onlineFriends?.length || 0 }}</span>
                </span>
                <div class="slots">
                    <User v-for="friend in onlineFriends" :key="friend.userId" :user="friend" />
                    <p class="slots-message" v-if="onlineFriends?.length === 0">No online friends</p>
                </div>
            </div>
            <div class="party-section">
                <span class="main-text">
                    Offline
                    <span class="section-count">{{ offlineFriends?.length || 0 }}</span>
                </span>
                <div class="slots">
                    <User v-for="friend in offlineFriends" :key="friend.userId" :user="friend" />
                </div>
            </div>
            <div class="party-section">
                <span class="main-text">
                    Recent players
                    <span class="section-count">{{ recentPlayers?.length || 0 }}</span>
                </span>
                <div class="slots">
                    <User v-for="friend in recentPlayers" :key="friend.userId" :user="friend" />
                </div>
            </div>
        </div>

        <div class="footer">
            <div class="party-invitations-carousel">
                <div class="invitation-counter">
                    <span class="invitation-count">1</span>
                    <Icon :icon="accountGroup" :height="16" color="#f97316" />
                </div>
                <div class="invitation">
                    <span class="invitation-text">Protar has invited you to party.</span>
                    <div class="buttons-row">
                        <button @click="acceptPartyInvitation">Accept</button>
                        <button @click="declinePartyInvitation">Decline</button>
                    </div>
                </div>
            </div>
            <div class="invitations-carousel">
                <div class="invitation-counter">
                    <span class="invitation-count">1</span>
                    <Icon :icon="accountPlus" :height="16" color="#22c55e" />
                </div>
                <div class="invitation">
                    <span class="invitation-text">Melon wants to add you.</span>
                    <div class="buttons-row">
                        <button @click="acceptFriendRequest">Accept</button>
                        <button @click="declineFriendRequest">Decline</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import accountPlus from "@iconify-icons/mdi/account-plus";
import accountGroup from "@iconify-icons/mdi/account-group";
import EmptyUserSlot from "@renderer/components/social/EmptyUserSlot.vue";
import User from "@renderer/components/social/User.vue";
import { useDexieLiveQuery } from "@renderer/composables/useDexieLiveQuery";
import { db } from "@renderer/store/db";
import { me } from "@renderer/store/me.store";
import { chatActions } from "@renderer/store/chat.store";
import { ref } from "vue";
import { useMediaQuery } from "@vueuse/core";

const isUltraWideScreen = useMediaQuery("(min-aspect-ratio: 16/9)");
const isExpanded = ref(false);

const expand = () => {
    isExpanded.value = true;
};

const collapse = () => {
    isExpanded.value = false;
};

const acceptPartyInvitation = () => {
    // Create party chat room when accepting party invitation
    console.log("Accepting party invitation and creating party chat...");
    chatActions.openPartyChatRoom();
};

const declinePartyInvitation = () => {
    console.log("Declining party invitation");
};

const acceptFriendRequest = () => {
    console.log("Accepting friend request");
};

const declineFriendRequest = () => {
    console.log("Declining friend request");
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
$background-color: rgb(11, 11, 11);
$accent-color: #22c55e;
$top-bar-height: 96px;
$friends-list-width: 300px;

.friends-sidebar {
    position: fixed;
    right: 0;
    top: $top-bar-height;
    height: calc(100vh - #{$top-bar-height});
    width: $friends-list-width;
    transform: translate(calc(#{$friends-list-width} - 58px), 0);
    transition: transform 0.3s ease;
    color: #f9f9f9;
    z-index: 3;

    .tag {
        position: absolute;
        transform: rotate(-90deg);
        top: 200px;
        left: -140px;
        width: 100%;
        height: 52px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9));
        backdrop-filter: blur(10px) brightness(0.8) saturate(2);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        border-bottom: 1px solid rgba(124, 124, 124, 0.2);
        box-shadow:
            -1px 0 0 rgba(0, 0, 0, 0.5),
            1px 0 0 rgba(0, 0, 0, 0.5),
            0 1px 0 rgba(0, 0, 0, 0.5),
            0 -1px 0 rgba(0, 0, 0, 0.5),
            inset 0 0 50px rgba(255, 255, 255, 0.08),
            inset 0 3px 8px rgba(255, 255, 255, 0.05),
            3px 3px 10px rgba(0, 0, 0, 0.9);
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-family: Rajdhani, sans-serif;
        font-weight: 600;
        &:after {
            @extend .fullsize;
            left: 0;
            top: 0;
            background-image: url("/src/renderer/assets/images/squares.png");
            background-size: auto;
            opacity: 0.3;
            mix-blend-mode: overlay;
            z-index: -1;
        }
    }

    .friends-users-container {
        overflow-y: auto;
        background: linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.9));
        backdrop-filter: blur(10px) brightness(0.7) saturate(2);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        border-bottom: 1px solid rgba(124, 124, 124, 0.2);
        box-shadow:
            -1px 0 0 rgba(0, 0, 0, 0.6),
            1px 0 0 rgba(0, 0, 0, 0.6),
            0 1px 0 rgba(0, 0, 0, 0.6),
            0 -1px 0 rgba(0, 0, 0, 0.6),
            inset 0 0 50px rgba(255, 255, 255, 0.08),
            inset 0 3px 8px rgba(255, 255, 255, 0.05),
            3px 3px 10px rgba(0, 0, 0, 0.9);
        height: 100vh;
        position: relative;
        &:after {
            @extend .fullsize;
            left: 0;
            top: 0;
            background-image: url("/src/renderer/assets/images/squares.png");
            background-size: auto;
            opacity: 0.2;
            mix-blend-mode: overlay;
            z-index: -1;
        }

        // Custom scrollbar to match app theme
        &::-webkit-scrollbar {
            width: 10px;
        }
        &::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
        }
        &::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            &:hover {
                background: rgba(255, 255, 255, 0.2);
            }
        }
    }

    .footer {
        background: linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.9));
        backdrop-filter: blur(10px) brightness(0.7) saturate(2);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        border-bottom: 1px solid rgba(124, 124, 124, 0.2);
        box-shadow:
            -1px 0 0 rgba(0, 0, 0, 0.6),
            1px 0 0 rgba(0, 0, 0, 0.6),
            0 1px 0 rgba(0, 0, 0, 0.6),
            0 -1px 0 rgba(0, 0, 0, 0.6),
            inset 0 0 50px rgba(255, 255, 255, 0.08),
            inset 0 3px 8px rgba(255, 255, 255, 0.05),
            3px 3px 10px rgba(0, 0, 0, 0.9);
        position: absolute;
        bottom: 0;
        width: 100%;

        .party-invitations-carousel {
            padding: 12px 8px;
            background: rgba(249, 115, 22, 0.05);
            border-bottom: 1px solid rgba(249, 115, 22, 0.1);
            border: 2px solid rgba(249, 115, 22, 0.4);
            font-size: 14px;
            text-align: left;
            position: relative;
            overflow: hidden;
            animation: pulse-outline 3s ease-in-out infinite;

            // Shining animation overlay
            &::before {
                content: "";
                position: absolute;
                top: -100%;
                left: -100%;
                width: 200%;
                height: 200%;
                background: linear-gradient(
                    135deg,
                    transparent,
                    transparent 48%,
                    rgba(255, 255, 255, 0.8) 49%,
                    rgba(255, 255, 255, 0.8) 50%,
                    rgba(255, 255, 255, 0.8) 51%,
                    transparent 52%,
                    transparent
                );
                animation: shine 4s ease-in-out infinite;
                pointer-events: none;
                z-index: 1;
            }

            .invitation-counter {
                position: absolute;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding-top: 8px;
                gap: 6px;
                width: 40px;

                .invitation-count {
                    font-size: 16px;
                    color: #f97316;
                    font-weight: 800;
                    font-family: Rajdhani, sans-serif;
                    text-shadow: 0 0 10px rgba(249, 115, 22, 0.9);
                }
            }

            .invitation {
                display: flex;
                flex-direction: column;
                gap: 4px;
                padding-left: 52px;
                .invitation-text {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.7);
                    margin-bottom: 5px;
                }

                .buttons-row {
                    display: flex;
                    gap: 8px;
                }
            }

            button {
                padding: 6px 12px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 3px;
                color: rgba(255, 255, 255, 0.8);
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-family: Rajdhani, sans-serif;
                font-weight: 500;
                flex: 1;
                text-align: center;

                &:hover {
                    background: rgba(255, 255, 255, 0.2);
                    border-color: rgba(255, 255, 255, 0.2);
                    color: #fff;
                }

                &:first-of-type {
                    background: rgba(249, 115, 22, 0.2);
                    border-color: rgba(249, 115, 22, 0.3);
                    color: #f97316;

                    &:hover {
                        background: rgba(249, 115, 22, 0.3);
                        border-color: #f97316;
                        color: #fff;
                    }
                }
            }
        }

        .invitations-carousel {
            padding: 12px 8px;
            background: rgba(255, 255, 255, 0.05);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 14px;
            text-align: left;

            position: relative;

            .invitation-counter {
                position: absolute;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding-top: 8px;
                gap: 6px;
                width: 40px;

                .invitation-count {
                    font-size: 16px;
                    color: $accent-color;
                    font-weight: 800;
                    font-family: Rajdhani, sans-serif;
                    text-shadow: 0 0 10px rgba($accent-color, 0.9);
                }
            }

            .invitation {
                display: flex;
                flex-direction: column;
                gap: 4px;
                padding-left: 52px;
                .invitation-text {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.7);
                    margin-bottom: 5px;
                }

                .buttons-row {
                    display: flex;
                    gap: 8px;
                }
            }

            button {
                padding: 6px 12px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 3px;
                color: rgba(255, 255, 255, 0.8);
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-family: Rajdhani, sans-serif;
                font-weight: 500;
                flex: 1;
                text-align: center;

                &:hover {
                    background: rgba(255, 255, 255, 0.2);
                    border-color: rgba(255, 255, 255, 0.2);
                    color: #fff;
                }

                &:first-of-type {
                    background: rgba($accent-color, 0.2);
                    border-color: rgba($accent-color, 0.3);
                    color: $accent-color;

                    &:hover {
                        background: rgba($accent-color, 0.3);
                        border-color: $accent-color;
                        color: #fff;
                    }
                }
            }
        }
    }

    &.expanded {
        transform: translate(0, 0);
    }

    .party-section {
        .main-text {
            display: flex;
            height: 40px;
            justify-content: center;
            align-items: center;
            width: 100%;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            background: rgba(255, 255, 255, 0.1);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            color: $accent-color;
            font-family: Rajdhani, sans-serif;
            font-weight: 600;
            text-shadow: 0 0 10px rgba($accent-color, 0.3);
            position: relative;

            .section-count {
                position: absolute;
                left: 8px;
                height: 100%;
                width: 40px;
                display: flex;
                justify-content: center;
                align-items: center;
                color: rgba(255, 255, 255, 0.7);
                font-size: 14px;
                font-weight: 700;
                font-family: Rajdhani, sans-serif;
                text-shadow: none;
            }
        }

        .slots {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 12px 8px;
        }

        .slots-message {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.5);
            text-align: center;
            font-style: italic;
            padding: 10px;
        }
    }
}

// Add utility class for fullsize
.fullsize {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    content: "";
}

// Shining animation keyframes
@keyframes shine {
    0% {
        left: -100%;
        top: -100%;
    }
    15% {
        left: 100%;
        top: 100%;
    }
    100% {
        left: 100%;
        top: 100%;
    }
}

// Pulsing outline animation
@keyframes pulse-outline {
    0%,
    100% {
        border-color: rgba(249, 115, 22, 0.4);
        // box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.3);
    }
    50% {
        border-color: rgba(249, 115, 22, 0.8);
        // box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1);
    }
}
</style>
