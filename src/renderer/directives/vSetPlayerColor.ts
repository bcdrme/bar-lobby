import { DirectiveBinding, Directive } from "vue";

const vStartBox: Directive = {
    // Called when the bound element is mounted to the DOM
    mounted(el: HTMLElement, binding: DirectiveBinding) {
        const { r, g, b } = binding.value as { r: number; g: number; b: number };
        const lightness = 0.299 * r + 0.587 * g + 0.114 * b; // https://stackoverflow.com/a/596243/1864403
        el.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 1)`;
        el.style.color = `rgba(${r}, ${g}, ${b}, 1)`;
        el.style.textShadow = lightness < 0.1 ? "0 0 3px #fff" : "1px 1px #000";
    },
};

export default vStartBox;
