<template>
    <Modal ref="modal" title="Exit">
        <div class="flex-row gap-md">
            <Button @click="logout"> Logout </Button>
            <Button @click="quitToDesktop"> Quit to Desktop </Button>
        </div>
    </Modal>
</template>

<script lang="ts" setup>
import { Ref, ref } from "vue";
import { useRouter } from "vue-router";

import Modal from "@renderer/components/common/Modal.vue";
import Button from "@renderer/components/controls/Button.vue";

const router = useRouter();
const modal: Ref<InstanceType<typeof Modal> | null> = ref(null);

async function logout() {
    // api.account.token = "";
    // try {
    //     if (!api.session.offlineMode.value) {
    //         await api.comms.request("c.auth.disconnect"); // TODO: replace with logout https://github.com/beyond-all-reason/teiserver/issues/56
    //     }
    // } catch (err) {
    //     console.error(err);
    // }
    await router.push("/login");
    modal.value?.close();
}

async function quitToDesktop() {
    window.close();
}
</script>

<style lang="scss" scoped></style>
