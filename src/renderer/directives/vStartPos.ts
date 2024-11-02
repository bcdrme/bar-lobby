import { DirectiveBinding, Directive } from "vue";

const vStartBox: Directive = {
    // Called when the bound element is mounted to the DOM
    mounted(el: HTMLElement, binding: DirectiveBinding) {
        const { x, z } = binding.value[0] as { x: number; z: number };
        const mapWidthElmos = binding.value[1] as number;
        const mapHeightElmos = binding.value[2] as number;
        const left = x / mapWidthElmos;
        const top = z / mapHeightElmos;
        el.style.left = `${left * 100}%`;
        el.style.top = `${top * 100}%`;
        if (left < 0.2) {
            el.classList.add("left");
        }
        if (left > 0.8) {
            el.classList.add("right");
        }
        if (top < 0.2) {
            if (left < 0.5) {
                el.classList.add("left");
            } else {
                el.classList.add("right");
            }
        }
    },
};

export default vStartBox;
