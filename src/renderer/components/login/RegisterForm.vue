<template>
    <div>
        <Loader v-if="loading" />
        <form v-else class="flex-col gap-md" @submit.prevent="register">
            <p v-if="error" class="color--error">
                {{ error }}
            </p>
            <Textbox v-model="email" type="email" label="Email" required class="fullwidth" />
            <Textbox v-model="username" label="Username" required class="fullwidth" />
            <Textbox v-model="password" type="password" label="Password" required class="fullwidth" />
            <Textbox
                v-model="confirmPassword"
                type="password"
                label="Confirm Password"
                :validation="validatePassword"
                required
                class="fullwidth"
            />
            <Button type="submit" class="blue"> Register </Button>
        </form>
    </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import Loader from "@renderer/components/common/Loader.vue";
import Button from "@renderer/components/controls/Button.vue";
import Textbox from "@renderer/components/controls/Textbox.vue";

// const emit = defineEmits(["register-success"]);

const loading = ref(false);
const email = ref("");
const username = ref("");
const confirmPassword = ref("");
const password = ref("");
const error = ref("");

function validatePassword() {
    if (password.value && confirmPassword.value && password.value !== confirmPassword.value) {
        return "Passwords do not match";
    }
    return;
}

async function register() {
    loading.value = true;

    // const registerResponse = await api.comms.request("c.auth.register", {
    //     email: email.value,
    //     username: username.value,
    //     password: password.value,
    // });

    // if (registerResponse.result === "success") {
    //     error.value = "";
    //     api.account.model.email = email.value;
    //     emit("register-success");
    // } else {
    //     if (registerResponse.reason) {
    //         error.value = registerResponse.reason;
    //     }
    // }

    loading.value = false;
}
</script>

<style lang="scss" scoped></style>
