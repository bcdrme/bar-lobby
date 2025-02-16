<!-- LobbyTopBar.vue -->
<template>
    <div class="lobby-top-bar">
        <div class="left-section">
            <div class="player-info">
                <div class="player-level">{{ playerLevel }}</div>
                <div class="xp-bar">
                    <div class="xp-progress" :style="{ width: xpPercentage + '%' }"></div>
                </div>
            </div>
            <div class="currency-section">
                <div class="valorant-points">
                    <span class="vp-icon">VP</span>
                    {{ valorantPoints }}
                </div>
                <div class="radianite">
                    <span class="rad-icon">R</span>
                    {{ radianitePoints }}
                </div>
            </div>
        </div>

        <div class="center-section">
            <div class="mode-selector">
                <div class="mode" :class="{ active: currentMode === 'unrated' }">UNRATED</div>
                <div class="mode" :class="{ active: currentMode === 'competitive' }">COMPETITIVE</div>
                <div class="mode" :class="{ active: currentMode === 'spike-rush' }">SPIKE RUSH</div>
                <div class="mode" :class="{ active: currentMode === 'deathmatch' }">DEATHMATCH</div>
            </div>
        </div>

        <div class="right-section">
            <div class="notifications">
                <span class="notification-icon">!</span>
            </div>
            <div class="settings">
                <span class="settings-icon">⚙</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            playerLevel: 47,
            xpProgress: 8750,
            xpRequired: 10000,
            valorantPoints: 2350,
            radianitePoints: 130,
            currentMode: "unrated",
        };
    },
    computed: {
        xpPercentage() {
            return (this.xpProgress / this.xpRequired) * 100;
        },
    },
};
</script>

<style lang="scss">
.lobby-top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
    background: #0f1923;
    padding: 0 20px;
    color: #f9f9f9;

    .left-section {
        display: flex;
        align-items: center;
        gap: 20px;

        .player-info {
            .player-level {
                font-size: 18px;
                font-weight: 600;
                color: #ff4655;
            }

            .xp-bar {
                width: 120px;
                height: 4px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 2px;
                overflow: hidden;

                .xp-progress {
                    height: 100%;
                    background: #ff4655;
                    transition: width 0.3s ease;
                }
            }
        }

        .currency-section {
            display: flex;
            gap: 15px;
            font-size: 14px;

            .valorant-points,
            .radianite {
                display: flex;
                align-items: center;
                gap: 5px;

                .vp-icon,
                .rad-icon {
                    width: 24px;
                    height: 24px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 600;
                }
            }
        }
    }

    .center-section {
        .mode-selector {
            display: flex;
            gap: 2px;

            .mode {
                padding: 8px 16px;
                font-size: 14px;
                font-weight: 600;
                letter-spacing: 1px;
                cursor: pointer;
                transition: all 0.2s ease;
                color: rgba(255, 255, 255, 0.5);

                &:hover {
                    color: #f9f9f9;
                    background: rgba(255, 255, 255, 0.05);
                }

                &.active {
                    color: #f9f9f9;
                    border-bottom: 2px solid #ff4655;
                }
            }
        }
    }

    .right-section {
        display: flex;
        gap: 15px;

        .notifications,
        .settings {
            width: 32px;
            height: 32px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.2s ease;

            &:hover {
                background: rgba(255, 255, 255, 0.2);
            }
        }
    }
}
</style>
