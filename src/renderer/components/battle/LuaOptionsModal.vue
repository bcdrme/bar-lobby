<template>
    <Modal ref="modal" :title="title" class="lua-options-modal" style="padding: 0" @open="open">
        <TabView class="lua-options-panel">
            <TabPanel v-for="section of sections.filter((section) => !section.hidden)" :key="section.key" :header="section.name">
                <h4>{{ section.description }}</h4>
                <div class="gridform">
                    <template v-for="option in section.options.filter((option) => !option.hidden)" :key="option.key">
                        <div>
                            <div v-tooltip.bottom="{ value: option.description }">{{ option.name }}</div>
                            <!-- <div v-if="option.description" class="description txt-sm flex-wrap">
                                {{ option.description }}
                            </div> -->
                        </div>
                        <Range
                            v-if="option.type === 'number'"
                            :modelValue="options[option.key] ?? option.default"
                            :min="option.min"
                            :max="option.max"
                            :step="option.step"
                            @update:model-value="(value: any) => setOptionValue(option, value)"
                            v-tooltip.bottom="{ value: option.description }"
                        />
                        <Checkbox
                            v-if="option.type === 'boolean'"
                            :modelValue="options[option.key] ?? option.default"
                            @update:model-value="(value) => setOptionValue(option, value)"
                            v-tooltip.bottom="{ value: option.description }"
                        />
                        <Textbox
                            v-if="option.type === 'string'"
                            :modelValue="options[option.key] ?? option.default"
                            @update:model-value="(value) => setOptionValue(option, value)"
                            v-tooltip.bottom="{ value: option.description }"
                        />
                        <Select
                            v-if="option.type === 'list'"
                            :modelValue="options[option.key] ?? option.default"
                            :options="option.options"
                            optionLabel="name"
                            optionValue="key"
                            @update:model-value="(value: any) => setOptionValue(option, value)"
                            v-tooltip.bottom="{ value: option.description }"
                        />
                    </template>
                </div>
            </TabPanel>
        </TabView>
        <template #footer>
            <div class="actions">
                <Button class="red fullwidth" @click="close">Cancel</Button>
                <Button class="yellow fullwidth" @click="reset">Reset all to default</Button>
                <Button class="green fullwidth" @click="save">Save</Button>
            </div>
        </template>
    </Modal>
</template>

<script lang="ts" setup>
/* eslint-disable @typescript-eslint/no-explicit-any */
import TabPanel from "primevue/tabpanel";
import { reactive, Ref, ref, toRaw } from "vue";
import Modal from "@renderer/components/common/Modal.vue";
import TabView from "@renderer/components/common/TabView.vue";
import Button from "@renderer/components/controls/Button.vue";
import Checkbox from "@renderer/components/controls/Checkbox.vue";
import Range from "@renderer/components/controls/Range.vue";
import Select from "@renderer/components/controls/Select.vue";
import Textbox from "@renderer/components/controls/Textbox.vue";
import { LuaOptionSection, LuaOptionNumber, LuaOptionBoolean, LuaOptionString, LuaOptionList } from "@main/content/game/lua-options";

const props = defineProps<{
    luaOptions: Record<string, any>;
    id: string;
    title: string;
    sections: LuaOptionSection[];
}>();

const modal: Ref<null | InstanceType<typeof Modal>> = ref(null);
const options: Record<string, any> = reactive({});

const emits = defineEmits<{
    (event: "setOptions", options: Record<string, any>): void;
}>();

function setOptionValue(option: LuaOptionNumber | LuaOptionBoolean | LuaOptionString | LuaOptionList, value: unknown) {
    if (value === option.default) {
        delete options[option.key];
    } else {
        options[option.key] = value;
    }
}

function open() {
    Object.assign(options, toRaw(props.luaOptions));
}

function close() {
    modal.value?.close();
}

function reset() {
    // Object.assign(options, {});
}

function save() {
    emits("setOptions", toRaw(options));
    modal.value?.close();
}
</script>

<style lang="scss" scoped>
.lua-options-panel {
    display: flex;
    flex-direction: column;
    width: 80vw;
    height: 80vh;
}
.description {
    white-space: pre;
}
.actions {
    display: flex;
    flex-direction: row;
    padding: 10px;
    gap: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
