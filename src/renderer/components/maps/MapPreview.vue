<template>
    <div ref="canvasContainerEl" class="canvas-container"></div>
</template>

<script lang="ts" setup>
import { useElementSize } from "@vueuse/core";
import { Application, Assets, Graphics, Sprite, Texture, Color } from "pixi.js";
import { onUnmounted, ref, toRaw, watch } from "vue";
import { CurrentUser } from "@main/model/user";
import { MapData } from "@main/cache/model/map-data";
import { StartBox, StartPosType } from "@main/game/battle/battle-types";
import { MIPMAP_SIZE } from "@main/config/map-parsing";

const props = defineProps<{
    map?: MapData;
    currentUser?: CurrentUser;
    startPosType?: StartPosType;
    startBoxes?: Record<number, StartBox | undefined>;
    startPositions?: Array<
        | {
              position: { x: number; z: number };
              rgbColor?: { r: number; g: number; b: number };
          }
        | undefined
    >;
}>();

const app: Application = new Application();
app.init({
    background: "#000",
    backgroundAlpha: 0.3,
    antialias: true,
});
// if (app.value.view && app.value.view instanceof HTMLCanvasElement) {
//     canvasContainerEl.value?.appendChild(app.value.view);
// }
const boxesGfx = new Graphics();
app.stage.addChild(boxesGfx);
const startPositionsGfx = new Graphics();
app.stage.addChild(startPositionsGfx);
let mapSprite: Sprite;
setMapImage();

const canvasContainerEl = ref<HTMLElement>();
const parentSize = useElementSize(canvasContainerEl);

onUnmounted(() => {
    // make sure pixi app is properly destroyed after out transition has finished
    setTimeout(() => {
        app.destroy(true);
    }, 150);
});

watch([parentSize.width, parentSize.height], ([width, height]) => {
    if (app && width && height) {
        const smallestDimension = Math.min(width, height);
        app.renderer.resize(smallestDimension, smallestDimension);
        app.render();
        onResize();
    }
});

watch(() => props.map, setMapImage);
watch(() => props.startBoxes, drawBoxes, { deep: true });
watch(() => props.startPositions, drawStartPositions);
watch(
    () => props.currentUser?.battleStatus.teamId,
    () => {
        drawBoxes();
        drawStartPositions();
    }
);
watch(() => props.currentUser?.battleStatus.isSpectator, drawBoxes);
watch(
    () => props.startPosType,
    () => {
        drawBoxes();
        drawStartPositions();
    }
);

function onResize() {
    // this is often 0 in modals, don't want to waste render time
    if (parentSize.width.value > 0 && parentSize.height.value > 0) {
        resizeMapImage();
        drawBoxes();
        drawStartPositions();
    }
}

async function setMapImage() {
    if (!props.map) {
        return;
    }
    if (mapSprite) {
        app.stage.removeChild(mapSprite);
    }
    const textureImage = (await window.maps.getMapImages(toRaw(props.map))).textureImagePath;
    console.log("Loading map image", textureImage);
    const texture = await Assets.load<Texture>(textureImage);
    console.log("Loaded map image", texture);
    mapSprite = Sprite.from(texture);
    mapSprite.setSize({
        width: props.map.width * MIPMAP_SIZE * 16,
        height: props.map.height * MIPMAP_SIZE * 16,
    });
    app.stage.addChildAt(mapSprite, 0);
    onResize();
}

function resizeMapImage() {
    if (!mapSprite) {
        return;
    }
    if (mapSprite.width > mapSprite.height) {
        mapSprite.width = app.view.width;
        mapSprite.scale.y = mapSprite.scale.x;
    } else {
        mapSprite.height = app.view.height;
        mapSprite.scale.x = mapSprite.scale.y;
    }
    mapSprite.x = app.view.width * 0.5 - mapSprite.width * 0.5;
    mapSprite.y = app.view.height * 0.5 - mapSprite.height * 0.5;
}

function drawBoxes() {
    if (!boxesGfx || !mapSprite) {
        return;
    }
    if (props.startPosType !== StartPosType.Boxes) {
        boxesGfx.visible = false;
        return;
    } else {
        boxesGfx.visible = true;
        boxesGfx.alpha = 0.2;
        boxesGfx.clear();
    }
    const isSpectator = props.currentUser?.battleStatus.isSpectator;
    const myTeamId = props.currentUser?.battleStatus.teamId;
    for (const teamIdStr in props.startBoxes) {
        const box = props.startBoxes[teamIdStr];
        if (!box) {
            continue;
        }
        const teamId = parseInt(teamIdStr);
        if (isSpectator) {
            boxesGfx?.beginFill(0xffffff);
        } else if (myTeamId === teamId) {
            boxesGfx?.beginFill(0x00ff00);
        } else {
            boxesGfx?.beginFill(0xff0000);
        }
        boxesGfx?.drawRect(
            box.xPercent * mapSprite.width + mapSprite.x,
            box.yPercent * mapSprite.height + mapSprite.y,
            box.widthPercent * mapSprite.width,
            box.heightPercent * mapSprite.height
        );
    }
}

function drawStartPositions() {
    if (!mapSprite || !startPositionsGfx || !props.map) {
        return;
    }
    if (props.startPosType === StartPosType.Boxes) {
        startPositionsGfx.visible = false;
        return;
    } else {
        startPositionsGfx.visible = true;
        startPositionsGfx.clear();
    }
    const startPositions =
        props.startPositions ??
        props.map.startPositions?.map((pos) => {
            return {
                position: pos,
                rgbColor: { r: 255, g: 255, b: 255 },
            };
        }) ??
        [];
    for (const startPos of startPositions) {
        if (!startPos) {
            continue;
        }
        let color = Color.shared.setValue(0xffffff);
        if (startPos.rgbColor) {
            color = new Color([startPos.rgbColor.r / 255, startPos.rgbColor.g / 255, startPos.rgbColor.b / 255]);
        }
        startPositionsGfx.beginFill(color);
        const x = (startPos.position.x / (props.map.width * 512)) * mapSprite.width + mapSprite.x;
        const y = (startPos.position.z / (props.map.height * 512)) * mapSprite.height + mapSprite.y;
        const radius = 5;
        startPositionsGfx.drawEllipse(x - radius * 0.5, y - radius * 0.5, radius, radius);
    }
}
</script>

<style lang="scss" scoped>
.canvas-container {
    overflow: hidden;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
