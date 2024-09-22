import { TObject } from "@sinclair/typebox";
import { ipcRenderer } from "electron";
import path from "path";

import { AsbtractStoreAPI } from "@/api/abstract-store";

// TODO I don't really understant how this was supposed to work
export class StoreAPI<T extends TObject> extends AsbtractStoreAPI<T> {
    public override async init() {
        await super.init();

        const name = path.parse(this.filePath).name;

        // watch(this.model, () => {
        //     ipcRenderer.send(`store-update:${name}`, toRaw(this.model));
        // });

        return this;
    }
}
